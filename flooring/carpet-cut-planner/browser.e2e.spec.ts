import {test,expect} from "@playwright/test";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
const pageUrl=pathToFileURL(resolve("index.html")).href;

test("initial project calculates and shows roll layout",async({page})=>{
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto(pageUrl);
 await expect(page.locator("#results .stat")).toHaveCount(4);
 await expect(page.locator("#results svg")).toHaveCount(1);
 await expect(page.locator("#results")).toContainText("Candidate plans");
 expect(errors).toEqual([]);
});

test("changing scenario keeps the diagram and numbers consistent",async({page})=>{
 await page.goto(pageUrl);
 await page.locator("#addPiece").click();
 await page.locator("#pieceRows input[data-field='w']").last().fill("4");
 await page.locator("#pieceRows input[data-field='l']").last().fill("18");
 await page.locator("#calculate").click();
 const options=await page.locator("#scenarioPicker option").count();
 expect(options).toBeGreaterThan(0);
 for(let i=0;i<options;i++){
  await page.locator("#scenarioPicker").selectOption(String(i));
  await expect(page.locator("#results svg")).toHaveCount(1);
  await expect(page.locator("#results .stat")).toHaveCount(4);
 }
});

test("dye-lot mismatch warns about incomplete planning",async({page})=>{
 await page.goto(pageUrl);
 await page.locator("#pieceRows input[data-field='lot']").first().fill("B");
 await page.locator("#calculate").click();
 await expect(page.locator("#results .warning").filter({hasText:"Unplaced pieces"})).toContainText("Unplaced pieces");
});

test("invalid width shows a validation error",async({page})=>{
 await page.goto(pageUrl);
 await page.locator("#rollRows input[data-field='w']").first().fill("-1");
 await page.locator("#calculate").click();
 await expect(page.locator("#results .warning")).toContainText("Invalid roll");
});

test("pre-cut checklist shows progress but does not imply approval",async({page})=>{
 await page.goto(pageUrl);
 await expect(page.locator("#reviewStatus")).toContainText("0 / 5");
 await page.locator("#reviewChecklist input").first().check();
 await expect(page.locator("#reviewStatus")).toContainText("1 / 5");
 await page.locator("#reviewChecklist input").nth(1).check();
 await page.locator("#reviewChecklist input").nth(2).check();
 await page.locator("#reviewChecklist input").nth(3).check();
 await page.locator("#reviewChecklist input").nth(4).check();
 await expect(page.locator("#reviewStatus")).toContainText("installer approval remains a separate decision");
});

test("changing a roll invalidates previously checked review items",async({page})=>{
 await page.goto(pageUrl);
 await page.locator("#reviewChecklist input").first().check();
 await expect(page.locator("#reviewStatus")).toContainText("1 / 5");
 await page.locator("#rollRows input[data-field='l']").first().fill("31");
 await expect(page.locator("#reviewStatus")).toContainText("0 / 5");
 await expect(page.locator("#reviewChecklist input").first()).not.toBeChecked();
});

test("job reference is shown and changing it clears review confirmations",async({page})=>{
 await page.goto(pageUrl);
 await page.locator("#jobId").fill("JOB-1042");
 await page.locator("#calculate").click();
 await expect(page.locator("#results")).toContainText("JOB-1042");
 await page.locator("#reviewChecklist input").first().check();
 await page.locator("#jobId").fill("JOB-1043");
 await expect(page.locator("#reviewStatus")).toContainText("0 / 5");
 await page.locator("#calculate").click();
 await expect(page.locator("#results")).toContainText("JOB-1043");
});

test("review timestamps are bound to revision and cleared when order changes",async({page})=>{
 await page.goto(pageUrl);
 await page.locator("#reviewChecklist input").first().check();
 await expect(page.locator("#reviewEvidence")).toContainText("measurements:");
 await expect(page.locator("#reviewEvidence")).toContainText("revision 0");
 await page.locator("#jobId").fill("JOB-200");
 await expect(page.locator("#reviewEvidence")).toContainText("No review confirmations recorded.");
 await expect(page.locator("#reviewChecklist input").first()).not.toBeChecked();
});

test("loading a saved job does not restore previous review evidence",async({page})=>{
 await page.goto(pageUrl);
 await page.locator("#jobId").fill("JOB-777");
 await page.locator("#reviewChecklist input").first().check();
 await expect(page.locator("#reviewEvidence")).toContainText("measurements:");
 const project={version:1,jobId:"JOB-888",reviewer:"Test reviewer",planRevision:4,rolls:[{id:"R1",w:12,l:30,lot:"A",stockType:"FULL"}],pieces:[{id:"Room 1",w:10,l:12,lot:"A",rotate:false}],settings:{shortRollFirst:false,widthAllowance:0,lengthAllowance:0,patternRepeat:0}};
 await page.locator("#load").setInputFiles({name:"job.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(project))});
 await expect(page.locator("#jobId")).toHaveValue("JOB-888");
 await expect(page.locator("#reviewStatus")).toContainText("0 / 5");
 await expect(page.locator("#reviewEvidence")).toContainText("No review confirmations recorded.");
 await expect(page.locator("#results")).toContainText("revision: 5");
});

test("printed report lists confirmed and missing reviews without claiming approval",async({page})=>{
 await page.goto(pageUrl);
 await page.locator("#jobId").fill("JOB-PRINT");
 await page.locator("#reviewer").fill("Alex");
 await page.locator("#reviewChecklist input").first().check();
 await page.locator("#print").click();
 await expect(page.locator("#printAudit")).toContainText("JOB-PRINT");
 await expect(page.locator("#printAudit")).toContainText("1 / 5 confirmed");
 await expect(page.locator("#printAudit")).toContainText("NOT CONFIRMED");
 await expect(page.locator("#printAudit")).toContainText("not authenticated signatures");
});

test("reprinting replaces the audit and plan changes discard stale audit",async({page})=>{
 await page.goto(pageUrl);
 await page.locator("#jobId").fill("JOB-OLD");
 await page.locator("#print").click();
 await expect(page.locator("#printAudit")).toHaveCount(1);
 await expect(page.locator("#printAudit")).toContainText("JOB-OLD");
 await page.locator("#print").click();
 await expect(page.locator("#printAudit")).toHaveCount(1);
 await page.locator("#jobId").fill("JOB-NEW");
 await expect(page.locator("#printAudit")).toHaveCount(0);
 await page.locator("#print").click();
 await expect(page.locator("#printAudit")).toHaveCount(1);
 await expect(page.locator("#printAudit")).toContainText("JOB-NEW");
 await expect(page.locator("#printAudit")).not.toContainText("JOB-OLD");
});

test("mobile viewport keeps document width contained while showing cutting results",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto(pageUrl);
 await expect(page.locator("#results .stat")).toHaveCount(4);
 const widths=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:window.innerWidth}));
 expect(widths.document).toBeLessThanOrEqual(widths.viewport+2);
 await expect(page.locator("#results svg").first()).toBeVisible();
});

test("printed audit explicitly blocks cutting when a piece cannot be placed",async({page})=>{
 await page.goto(pageUrl);
 await page.locator("#pieceRows input[data-field='lot']").first().fill("UNMATCHED");
 await page.locator("#calculate").click();
 await expect(page.locator("#results")).toContainText("Unplaced pieces");
 await page.locator("#print").click();
 await expect(page.locator("#printAudit")).toContainText("INCOMPLETE");
 await expect(page.locator("#printAudit")).toContainText("DO NOT CUT FROM THIS PLAN");
});

test("changing a cut after review invalidates confirmation on printed audit",async({page})=>{
 await page.goto(pageUrl);
 await page.locator("#reviewChecklist input").first().check();
 await expect(page.locator("#reviewStatus")).toContainText("1 / 5 confirmed");
 await page.locator("#pieceRows input[data-field='l']").first().fill("9");
 await page.locator("#calculate").click();
 await expect(page.locator("#reviewStatus")).toContainText("0 / 5 confirmed");
 await page.locator("#print").click();
 await expect(page.locator("#printAudit")).toContainText("0 / 5 confirmed");
 await expect(page.locator("#printAudit")).toContainText("NOT CONFIRMED");
});

test("loading a saved project resets review evidence and updates the printed job",async({page})=>{
 await page.goto(pageUrl);
 await page.locator("#reviewChecklist input").first().check();
 await expect(page.locator("#reviewStatus")).toContainText("1 / 5 confirmed");
 const saved={version:1,jobId:"RESTORED-JOB",reviewer:"Previous reviewer",planRevision:12,rolls:[{id:"RESTORED-ROLL",w:12,l:30,lot:"A",stockType:"FULL"}],pieces:[{id:"Restored cut",w:10,l:12,lot:"A",rotate:false}],settings:{shortRollFirst:false,widthAllowance:0,lengthAllowance:0,patternRepeat:0}};
 await page.locator("#load").setInputFiles({name:"saved-project.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(saved))});
 await expect(page.locator("#reviewStatus")).toContainText("0 / 5 confirmed");
 await expect(page.locator("#reviewEvidence")).toContainText("No review confirmations recorded");
 await expect(page.locator("#rollRows input[data-field='id']").first()).toHaveValue("RESTORED-ROLL");
 await expect(page.locator("#pieceRows input[data-field='id']").first()).toHaveValue("Restored cut");
 await page.locator("#print").click();
 await expect(page.locator("#printAudit")).toContainText("RESTORED-JOB");
 await expect(page.locator("#printAudit")).toContainText("0 / 5 confirmed");
 await expect(page.locator("#printAudit")).toContainText("NOT CONFIRMED");
});


test("printing after editing a cut refreshes the diagram and discards old review",async({page})=>{
 await page.goto(pageUrl);
 await page.locator("#reviewChecklist input").first().check();
 await expect(page.locator("#reviewStatus")).toContainText("1 / 5 confirmed");
 const oldDiagram=await page.locator("#results svg").first().evaluate(el=>el.outerHTML);
 await page.locator("#pieceRows input[data-field='l']").first().fill("8");
 await expect(page.locator("#reviewStatus")).toContainText("0 / 5 confirmed");
 await page.locator("#print").click();
 await expect(page.locator("#printAudit")).toContainText("0 / 5 confirmed");
 await expect(page.locator("#printAudit")).toContainText("NOT CONFIRMED");
 const newDiagram=await page.locator("#results svg").first().evaluate(el=>el.outerHTML);
 expect(newDiagram).not.toBe(oldDiagram);
 await expect(page.locator("#pieceRows input[data-field='l']").first()).toHaveValue("8");
});


test("switching candidate plans clears confirmations from the previous layout",async({page})=>{
 await page.goto(pageUrl);
 await page.locator("#addPiece").click();
 await page.locator("#pieceRows input[data-field='w']").last().fill("4");
 await page.locator("#pieceRows input[data-field='l']").last().fill("18");
 await page.locator("#calculate").click();
 const options=await page.locator("#scenarioPicker option").count();
 expect(options).toBeGreaterThan(1);
 await page.locator("#reviewChecklist input").first().check();
 await expect(page.locator("#reviewStatus")).toContainText("1 / 5 confirmed");
 await page.locator("#scenarioPicker").selectOption("1");
 await expect(page.locator("#reviewStatus")).toContainText("0 / 5 confirmed");
 await expect(page.locator("#reviewChecklist input").first()).not.toBeChecked();
 await page.locator("#print").click();
 await expect(page.locator("#printAudit")).toContainText("0 / 5 confirmed");
 await expect(page.locator("#printAudit")).toContainText("NOT CONFIRMED");
});

test("reproducible material example shows SF, SYD and waste for each candidate",async({page})=>{
 await page.goto(pageUrl);
 await page.locator('#load').setInputFiles(resolve('examples/small-first-win.json'));
 const table=page.locator('#results table').first();
 await expect(table).toContainText('Allocated SYD');
 const small=table.locator('tbody tr').filter({hasText:'Smallest area first'});
 await expect(small.locator('td')).toHaveText(['Smallest area first','Complete','0.00','576.00','64.00','134.00','1','14.89','0.00']);
 const large=table.locator('tbody tr').filter({hasText:'Largest area first'});
 await expect(large.locator('td')).toHaveText(['Largest area first','Complete','0.00','624.00','69.33','182.00','1','20.22','-48.00']);
 await expect(page.locator('#scenarioPicker option:checked')).toContainText('Smallest area first');
 await expect(page.locator('#results .stat').nth(1)).toContainText('576.00');
});

test('savings comparison excludes incomplete plans and printing follows selected layout',async({page})=>{
 await page.goto(pageUrl);
 await page.locator('#load').setInputFiles(resolve('examples/small-first-win.json'));
 await expect(page.locator('#results')).toContainText('Material Savings Comparison');
 await page.locator('#reviewChecklist input').first().check();
 await page.locator('#scenarioPicker').selectOption({label:'Largest area first · Complete'});
 await expect(page.locator('#reviewChecklist input').first()).not.toBeChecked();
 await page.locator('#print').click();
 await expect(page.locator('#results .stat').nth(1)).toContainText('624.00');
 await expect(page.locator('#results tr[aria-current="true"]')).toContainText('Largest area first');
 await page.locator('#pieceRows input[data-field="lot"]').first().fill('MISSING');
 await page.locator('#calculate').click();
 await expect(page.locator('#results table').first()).toContainText('Not comparable');
});

const rollCSV='roll_id,stock_type,width_ft,available_length_ft,dye_lot,notes\r\nCSV-R,FULL,12,30,A,"synthetic, stock"';
const pieceCSV='piece_id,width_ft,length_ft,dye_lot,allow_rotate,notes\n"CSV <Room>",6,10,A,false,\nCSV-2,6,10,A,false,';
async function previewCSV(page:import('@playwright/test').Page,pieceText=pieceCSV){
 await page.locator('#csvRolls').setInputFiles({name:'rolls.csv',mimeType:'text/csv',buffer:Buffer.from(rollCSV)});
 await page.locator('#csvPieces').setInputFiles({name:'pieces.csv',mimeType:'text/csv',buffer:Buffer.from(pieceText)});
 await page.locator('#previewCSV').click();
}
test('CSV preview preserves current order until apply and recalculates safe numbered layouts',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto(pageUrl);
 await page.locator('#reviewChecklist input').first().check();
 await previewCSV(page);
 await expect(page.locator('#csvPreview')).toContainText('1 rolls, 2 pieces');
 await expect(page.locator('#rollRows input[data-field="id"]').first()).toHaveValue('R1');
 await page.locator('#applyCSV').click();
 await expect(page.locator('#rollRows input[data-field="id"]').first()).toHaveValue('CSV-R');
 await expect(page.locator('#reviewChecklist input').first()).not.toBeChecked();
 await expect(page.locator('.cutLegend')).toContainText('CSV <Room>');
 await expect(page.locator('.cutLegend')).toContainText('6.00 × 10.00');
 await expect(page.locator('#results svg title').first()).toContainText('width 12.00 ft');
 await expect(page.locator('#results .stat').nth(1)).toContainText('120.00');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2)).toBe(true);
 await page.locator('#print').click();await expect(page.locator('.cutLegend')).toContainText('CSV <Room>');
});
test('invalid CSV shows row error and leaves the previous order untouched',async({page})=>{
 await page.goto(pageUrl);await previewCSV(page,pieceCSV.replace('6,10,A,false','6,10,A,maybe'));
 await expect(page.locator('#csvPreview')).toContainText('line 2');
 await expect(page.locator('#applyCSV')).toBeDisabled();
 await expect(page.locator('#rollRows input[data-field="id"]').first()).toHaveValue('R1');
 await previewCSV(page);await expect(page.locator('#applyCSV')).toBeEnabled();
 await page.locator('#csvPieces').setInputFiles([]);await expect(page.locator('#applyCSV')).toBeDisabled();
});
async function prepareTrial(page:import('@playwright/test').Page){
 await page.goto(pageUrl);await previewCSV(page,pieceCSV.replace('CSV-2,6,10','CSV-2,6,5'));await page.locator('#applyCSV').click();
 await page.locator('#jobId').fill('TRIAL-SYNTHETIC');await page.locator('#reviewer').fill('Test reviewer');await page.locator('#calculate').click();
 for(const box of await page.locator('#reviewChecklist input').all())await box.check();
 await page.locator('[data-reading="expected"]').fill('10');await page.locator('[data-reading="actual"]').fill('10');await page.locator('#fieldVerified').check();
}
test('field comparison exports the selected plan and invalidates on changed inputs',async({page})=>{
 await prepareTrial(page);await page.locator('#evaluateField').click();
 await expect(page.locator('#fieldResult')).toContainText('PASS');
 const downloadPromise=page.waitForEvent('download');await page.locator('#exportField').click();
 const download=await downloadPromise;const stream=await download.createReadStream();const buffers=[];for await(const chunk of stream!)buffers.push(chunk);
 const record=JSON.parse(Buffer.concat(buffers).toString());
 expect(record).toMatchObject({jobId:'TRIAL-SYNTHETIC',comparison:{status:'PASS'},plan:{allocated:120},inputs:{rolls:[{id:'CSV-R'}]}});
 expect(record.selectedStrategy).toBeTruthy();
 await page.locator('#print').click();await expect(page.locator('#printAudit')).toContainText('Trial comparison: PASS');
 await page.locator('#pieceRows input[data-field="l"]').first().fill('9');
 await expect(page.locator('#exportField')).toBeDisabled();await expect(page.locator('#fieldResult')).toContainText('invalidated');
});
test('field comparison blocks unchecked trials and fails differences without hiding them',async({page})=>{
 await prepareTrial(page);await page.locator('#fieldVerified').uncheck();await page.locator('#evaluateField').click();
 await expect(page.locator('#fieldResult')).toContainText('BLOCKED');
 await page.locator('#fieldVerified').check();await page.locator('[data-reading="actual"]').fill('11');await page.locator('#evaluateField').click();
 await expect(page.locator('#fieldResult')).toContainText('FAIL');await expect(page.locator('#fieldResult')).toContainText('actual − plan 1.00 LF');
 await page.locator('#scenarioPicker').selectOption('1');await expect(page.locator('#exportField')).toBeDisabled();
 await expect(page.locator('[data-reading="actual"]').first()).toHaveValue('');
});
