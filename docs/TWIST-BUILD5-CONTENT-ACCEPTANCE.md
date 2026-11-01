# TWIST 1.1 (5) — 第一题同步、内容核查与构建验收

日期：2026-11-01（America/Edmonton）。实现/证据提交：`cacfb81`；上游基线 `ed366ba`，第一题替换源 `536199c3cc9c53d86477eca4502f11e90ec50322`。本轮保留原项目，不增加玩法；没有上传App Store Connect、回复Apple或提交审核。

## 实际结果

**新第一题已真正进入1.1 Build5的签名Archive和导出开发IPA，模拟器实际WKWebView双语断言通过。不是只改网站。** 现有Build4归档/IPA保留，不能声称历史Build4已更换第一题。Build5本轮未装入真实iPhone，原因见设备阻挡。

| 验收项 | 结果 | 证据/范围 |
|---|---|---|
| 最新分支获取、未提交工作保护 | PASS | fast-forward至ed366ba后工作；无关flooring文件保留未提交 |
| 实际iOS资源同步 | PASS | 根twist.html经sync-game.py整合到现有工程RUNLUTwist/Web；canonical文件加载/签名/Bundle ID/图标保留 |
| 英文第一题、提示、答案、独立解释 | PASS | Node及真实WK新断言：A conversation；说明open/close/share的比喻，而非钥匙/锁/切分物体 |
| 中文第一题、提示、答案、独立解释 | PASS | 同上：一段对话；模拟器中文新题截图人工核对 |
| 原1975题不再作为候选游戏内容出现 | PASS | 新候选四个Web文件扫描，无1975题/答案；游戏HTML无1975/房间号。QA中有“房间号”否定断言，不是游戏题目；如实记录该命中 |
| 原Facebook图片 | PASS（当前资源范围） | 游戏没有图片/远程图片引用；保留同一AppIcon，当前目标没有Facebook截图资源。历史溯源文档和旧Archive未删 |
| Node VM自动化 | PASS | 18/18，0失败；双语20经典/10Studio、保存/坏数据/重置/分享与第一题新断言。DOM stub不验证布局 |
| 完整XCTest | PASS | iPhone17e Simulator，iOS26.5(23F77)，arm64：9/9，0失败/跳过；10:40–10:45，同一次运行约294秒 |
| 真实WK内全玩法QA | PASS | 9/9，新增第一题render/hint/reveal/解释断言；原生恢复、语言、触摸、分享、隐私往返等外层UI也通过 |
| 双语无障碍审计、最大字号 | PASS（模拟器） | 现有六类审计和字号/横向溢出断言本轮重跑；不等于完整真人VoiceOver |
| Release签名Archive | PASS（重试后） | 首次因文件/临时目录写权限失败，授权补齐后ARCHIVE SUCCEEDED；原失败日志保留 |
| 开发IPA导出、资源及签名 | PASS | EXPORT SUCCEEDED；Archive/IPA资源逐字验证，二者严格codesign通过 |
| Build5真机安装/新第一题验收 | NOT TESTED | iPhone16 Pro Max/iOS27.2在Device Hub当前重新显示Enable Developer Mode；未安装、未删除/重置原App |
| 真机完整20/10、飞行模式、横屏、VoiceOver、最大字、冷终止/升级保存 | NOT TESTED | 历史Build4冒烟不转作新内容真机证据；仍需后续验收 |
| 剩余19题来源/版权清单 | PASS（清单完成） | 英文/中文/提示/答案/独立解释逐题登记，**19题权利均UNKNOWN，清权未通过** |

截图附件沿用了测试里的“Build4”或“Actual-iPhone”命名，但本轮来源是Build5/iPhone17e模拟器，不应按附件名字称为旧Build4或真机截图。原始结果JSON记录设备/系统；导出图片含中文新题。横屏既有XCTest图像链路限制不在本轮重新声明为完整视觉通过。

## 修复的内容问题

上游536199c只替换 `puzzles[0]` 与 `zh[0]` 三元组，独立解释仍残留“1975/房间号”。本轮修复 `explanations.en[0]` 和 `explanations.zh[0]`，加入双语第一题实际渲染的题干、提示、答案、解释断言，并将UI预期WK计数从8/8更新为9/9。没有改变游戏规则、答案输入方式、Studio题目或存档键。

旧索引式存档保持：此前已揭晓第1题的记录仍按索引显示第1题完成，因此替换后可能看到新题已揭晓；没有强制清空进度。这是内容替换沿用既有存档的结果，不能声称做过完整真机升级迁移测试。既有Reasoning Lab反馈是通用固定策略，本轮未新增/改造功能。

## 工程与安装包身份

- 实际工程：`/Users/zhangjohn/Documents/Codex/2026-10-09/l/outputs/RUNLU-TWIST-iOS/RUNLUTwist.xcodeproj`。
- 实际游戏资源：`/Users/zhangjohn/Documents/Codex/2026-10-09/l/outputs/RUNLU-TWIST-iOS/RUNLUTwist/Web/twist.html`。
- 标识：`ca.runlu.twist`、Team `F2J2Z8H2L4`、Version1.1、Build5、iPhone-only、iOS17+；没有更换开发者身份、图标或ASC配置。
- Build编号核对：原本地候选4保留；本轮只读ASC TestFlight及All Statuses Build Uploads实际显示1.0.0的1/2/3，未见4/5或1.1上传，使用5区分既有4。未执行上传。
- 签名Archive：`/Users/zhangjohn/Documents/Codex/2026-10-25/runlu-twist-app-store-xcode-testflight/outputs/Build5Content-2026-11-01/RUNLUTwist-1.1-5.xcarchive`。
- 开发包：同目录 `DevelopmentExport/RUNLUTwist.ipa`。供已注册设备本地测试；不是App Store发行验证。
- 打包HTML SHA256：`4aff2be687bfd13d7c8daab592bc34501142f3bf60eabfa0c73e559e7761cadf`。
- IPA SHA256：`dbd605a04aa3edf2355de506383e762b9b7706b1ae66d1e9f8652c31b6eee443`。
- 本轮将 `verify-candidate.py` 增加可选Build参数：历史调用仍默认4，本轮显式传5，避免改写旧Build4验证结果。

## 原始证据

- [逐题内容与权利CSV](../ios/RUNLUTwist/Reports/build5/classic-content-register.csv)：20题完整当前双语文本，包含独立解释；第一题另标替换来源，其余19题UNKNOWN。
- [逐题风险及公开发表对照](TWIST-CLASSIC-CONTENT-RISK-REGISTER.md)。公开相似题页面不是本项目授权书或原作者证据。
- [Node结果](../ios/RUNLUTwist/Reports/build5/vm-results.json)、[UI结果](../ios/RUNLUTwist/Reports/build5/ui-summary.json)、[Archive验证](../ios/RUNLUTwist/Reports/build5/archive-validation.json)、[IPA验证](../ios/RUNLUTwist/Reports/build5/ipa-validation.json)、[包内容扫描](../ios/RUNLUTwist/Reports/build5/packaged-content-scan.json)、[候选manifest](../ios/RUNLUTwist/Reports/build5/candidate-manifest.json)。
- [中文新题实际模拟器截图](../ios/RUNLUTwist/Reports/build5/screenshots/Chinese-first-puzzle.png)。
- xcresult：`/Users/zhangjohn/Library/Developer/Xcode/DerivedData/RUNLUTwist-dinfacskxenkwxaclnwovmfhmyod/Logs/Test/Test-RUNLUTwist-2026.11.01_10-40-14--0600.xcresult`。
- 输出目录保存 `archive.log`（权限失败）、`archive-retry.log`、`export.log`、`content-scan.log`、`SimulatorAttachments/manifest.json` 及旧原生文件备份。首次内容扫描把QA否定断言也当成游戏命中，调整为明确分类后输出；没有删除或忽略游戏实际命中。

## 能否进入最终审核准备

**可以继续准备材料，但不能宣布已具备上传/重新送审条件。** 工程内容同步已通过，新第一题在安装包中；剩余19题原始获取渠道、题文/译文/解释使用依据仍UNKNOWN，第一题“新写”也不等于法律独创性确认。Studio、品牌与素材的未决权属、WORDSHIFT/SHIFT关系、账号共享组件与合并理由、独立Beta证据、4.3/4.2.6风险继续以 [九问审计](TWIST-APPLE-REVIEW-EVIDENCE-AUDIT.md) 为准。

下一步：开发者处理手机当前Developer Mode提示、解锁/信任后安装本地Build5；完成新内容及专项真机验收；逐题补证或另行决定替换内容；确认账户协议与发行资料。全部完成后再单独授权上传/回复/送审，本轮均未执行。
