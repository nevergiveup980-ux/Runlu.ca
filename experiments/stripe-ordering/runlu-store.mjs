import {PostgresStore} from './postgres-store.mjs';

// Isolated actual-RPC adapter. Only a fully completed RUNLU receipt counts as
// duplicate success, even if a clock receipt exists. No credentials are embedded.
export class RunluStore extends PostgresStore {
  async receipt(id) {
    const clockReceipt=await super.receipt(id); if(!clockReceipt) return null;
    const {rows}=await this.query("SELECT payload_sha256,status FROM public.runlu_webhook_receipts WHERE provider='stripe' AND provider_event_id=$1",[id]);
    return rows[0]?.status==='processed' ? {...clockReceipt,payloadHash:rows[0].payload_sha256} : null;
  }
  async commit({event,expectedRevision,next}) {
    const {rows}=await this.query('SELECT runlu_stripe_lab.commit_runlu_subscription($1,$2,$3) AS outcome',[
      JSON.stringify(event),expectedRevision,next?JSON.stringify(next):null]);
    return rows[0].outcome;
  }
}
