#!/usr/bin/env node
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const x=JSON.parse(execFileSync(process.execPath,[path.join(dir,"memory_horizon.mjs")],{encoding:"utf8"}));
if(x.models.cumulative_session.corrective_preference!=="B") throw new Error("bad cumulative result");
if(x.models.rolling_10.corrective_preference!=="A") throw new Error("bad short rolling result");
if(x.models.rolling_60.corrective_preference!=="B") throw new Error("bad long rolling result");
if(x.models.exponential_half_life_5.corrective_preference!=="A") throw new Error("bad short decay result");
if(x.models.exponential_half_life_100.corrective_preference!=="B") throw new Error("bad long decay result");
if(x.session_lifecycle.post_reset_debt!==0) throw new Error("reset result wrong");
console.log("E053 selftest PASS");
