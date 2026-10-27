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
 await expect(page.locator("#results .warning")).toContainText("Unplaced pieces");
});

test("invalid width shows a validation error",async({page})=>{
 await page.goto(pageUrl);
 await page.locator("#rollRows input[data-field='w']").first().fill("-1");
 await page.locator("#calculate").click();
 await expect(page.locator("#results .warning")).toContainText("Invalid roll");
});
