import {defineConfig,devices} from "@playwright/test";
export default defineConfig({testDir:'.',testMatch:'*.e2e.spec.ts',reporter:'list',workers:1,projects:[
 {name:'chromium',testMatch:'browser.e2e.spec.ts',use:{browserName:'chromium',headless:true}},
 {name:'iphone-webkit',testMatch:'demo.e2e.spec.ts',use:{...devices['iPhone 13'],browserName:'webkit',headless:true}}
]});
