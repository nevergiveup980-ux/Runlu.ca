import {defineConfig} from "@playwright/test";
export default defineConfig({testDir:".",testMatch:"browser.e2e.spec.ts",use:{browserName:"chromium",headless:true},reporter:"list",workers:1});
