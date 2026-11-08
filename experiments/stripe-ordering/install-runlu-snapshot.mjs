import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

// Executes only on the already isolated database supplied by the lab runner.
// Definitions and subscription-path triggers are copied verbatim from catalogs.
export async function installRunluSnapshot(exec) {
  const read = name=>readFile(new URL(name,import.meta.url),'utf8');
  const manifest=JSON.parse(await read('snapshot-manifest.json'));
  for(const [name,expected] of Object.entries(manifest.sha256)) {
    if(createHash('sha256').update(await read(name)).digest('hex')!==expected) throw new Error(`snapshot hash mismatch: ${name}`);
  }
  const base=JSON.parse(await read('runlu-schema-snapshot.json'));
  const extra=JSON.parse(await read('runlu-schema-extra.json'));
  const tables=[...base.tables,...extra.tables];
  const quote=value=>'"'+value.replaceAll('"','""')+'"';
  await exec('CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);');
  for(const table of tables) {
    const columns=table.columns.map(c=>`${quote(c.name)} ${c.type}${c.default?' DEFAULT '+c.default:''}${c.notnull?' NOT NULL':''}`);
    const constraints=(table.constraints||[]).filter(c=>c.type!=='f').map(c=>`CONSTRAINT ${quote(c.name)} ${c.definition}`);
    await exec(`CREATE TABLE public.${quote(table.name)} (${[...columns,...constraints].join(',')});`);
  }
  const omitted=[];
  for(const table of tables) for(const c of table.constraints||[]) if(c.type==='f') {
    if(c.definition.includes('REFERENCES runlu_checkout_contracts(')) { omitted.push(c.name); continue; }
    await exec(`ALTER TABLE public.${quote(table.name)} ADD CONSTRAINT ${quote(c.name)} ${c.definition};`);
  }
  for(const index of extra.indexes) await exec(index.definition+';');
  const source=await read('runlu-rpc-snapshot.sql');
  await exec(source); await exec(await read('runlu-trigger-snapshot.sql'));
  const included=['runlu_subscriptions','runlu_commerce_events','runlu_entitlements','runlu_product_catalog','runlu_product_plans'];
  for(const table of tables.filter(t=>included.includes(t.name))) for(const trigger of table.triggers||[]) await exec(trigger+';');
  await exec(await read('runlu-integration.sql'));
  // Preserve sourced legacy behavior for all other events. Add only the fenced
  // authoritative reconciliation path to the two existing ordering functions.
  for(const [name,result] of [['runlu_assess_commerce_event_ordering',"'accepted'"],['runlu_apply_commerce_event_order_guard','true']]) {
    const definitions=source.split(/(?=CREATE OR REPLACE FUNCTION public\.)/);
    const definition=definitions.find(x=>x.startsWith(`CREATE OR REPLACE FUNCTION public.${name}(`));
    if(!definition) throw new Error(`missing snapshot ${name}`);
    if(!definition.includes('begin\n')) throw new Error(`missing function entry point: ${name}`);
    const guard=`begin\n if public.runlu_lab_authoritative_event(p_event_id) then\n update public.runlu_commerce_events set ordering_status='accepted',ordering_note='Fenced authoritative subscription reconciliation' where id=p_event_id;\n return ${result};\n end if;\n`;
    await exec(definition.replace('begin\n',guard));
  }
  // Sourced functions include production SECURITY DEFINER declarations; their
  // original PUBLIC defaults must never be exposed in this local test schema.
  await exec('REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC; GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO runlu_lab_service;');
  for(const table of tables) await exec(`ALTER TABLE public.${quote(table.name)} ENABLE ROW LEVEL SECURITY;`);
  console.log(`Loaded ${tables.length} RUNLU table definitions, sourced RPCs, subscription-path triggers; omitted external checkout FK: ${omitted.join(',')}`);
}
