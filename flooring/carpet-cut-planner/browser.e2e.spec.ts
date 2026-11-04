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
 await expect(page.locator("#rollRows")).toContainText("RESTORED-ROLL");
 await expect(page.locator("#pieceRows")).toContainText("Restored cut");
 await page.locator("#print").click();
 await expect(page.locator("#printAudit")).toContainText("RESTORED-JOB");
 await expect(page.locator("#printAudit")).toContainText("0 / 5 confirmed");
 await expect(page.locator("#printAudit")).toContainText("NOT CONFIRMED");
});
