# RUNLU TWIST 1.1 / Build 4 — 最终工程验收与真机候选交付

报告日期：2026-10-29（America/Edmonton）。本轮保留既有项目，不上传、不提交审核、不公开发布。

## 结论

**本地工程自动化验收通过，Release 签名 Archive 与开发测试 IPA 构建成功。真实 iPhone 完整验收尚未完成，不能据此声明已经具备 App Store 上传/送审条件。**

最终同一次 XCTest：**9 PASS / 0 FAIL / 0 SKIP**。新增无障碍审计的中途失败均保留，未改写为 PASS。真实设备当前提示需要开启 Developer Mode，这是继续真机安装验收的人工步骤。

## 工程、代码与版本

- 现有工程：`/Users/zhangjohn/Documents/Codex/2026-10-09/l/outputs/RUNLU-TWIST-iOS/RUNLUTwist.xcodeproj`。
- 实际资源：同目录 `RUNLUTwist/Web/twist.html`，仍由 canonical bundle URL + `loadFileURL` 加载；保留 Build 2 白屏修复、启动诊断、恢复逻辑、图标、签名 Team 和原生配置。
- Git 工作副本：`/Users/zhangjohn/Documents/Codex/2026-10-25/runlu-twist-app-store-xcode-testflight/work/twist11-repo`。
- 分支：`feature/twist-apple-review-remediation`；本轮开始时 HEAD 与远端均为 `849f53f4aa50c1f26e0b8827ecfdea7f09c51bfa`。
- 本轮实现提交：**`c61b2370bc3e10f062a14acaec33056a739d6717`**（测试隔离、无障碍目标修复、最大字号实测和候选包校验工具）；**`107ec9dd29b48a261b66e95988d27eedb7182f79`**（语言下拉框继承动态字体并增加控件字号断言，最终候选源代码）。本报告及原始证据另随交付提交记录保存。
- 版本 **1.1 (4)**，Bundle ID **ca.runlu.twist**，Team **F2J2Z8H2L4**，iPhone-only，最低 iOS 17.0。没有更改 App Store Connect 应用配置。
- 旧 `work/repo` 与无关 `flooring/index-v094-FASTBOOT.HTML` 的本地变更未覆盖、未纳入本轮提交。

## 唯一旧 FAIL 的调查与修复

旧结果 `Reports/remediation-compact-full-summary.json` 是 iPhone 17e / iOS 26.5 的 6 PASS / 1 FAIL。失败为旋转后查询 `Next challenge →` 的 hittability 时，XCTest 报告：`Activation point invalid and no suggested hit points based on element frame`。

这是 **XCTest/WebKit 无障碍几何定位兼容性问题**，不是已经证实的游戏关卡逻辑错误。旧日志有 `Game ready`，按实际 frame 点击后确实进入第2关。此前修正已经保留真实导航断言。本轮增加每项测试前/后的方向恢复，以及断言失败后停止当前用例，避免失败后的方向/状态污染后续测试。最终同一套九项完整运行中，该用例 PASS。

另有历史 iOS 26.5 语言选择器是 `Other`、iOS 27 为 `Button` 的测试查询差异，已在 `849f53f` 改成按可访问名称跨类型查询，本轮通过。没有把旧失败结果删除或重命名为成功。

## 新发现并修复的无障碍问题

Apple 自动审计实际指出：装饰性副标、宣传眉题、单独的 ™、题号小字号、8点高进度条、页脚单独“·”等目标的可访问区域过小。

- 装饰副标、眉题、™ 和分隔符从辅助技术树中排除；主标题、题干、说明、反馈、状态和所有操作保留。
- iOS 状态/统计及页脚文字提高到正文尺寸。
- 进度条可访问区域改为44点，视觉轨道保持8点；隐私/支持链接最小点击区域44点。
- 审计检查对比度、点击区域、充分描述、Dynamic Type、裁切与 traits。issue handler 对发现均返回 false，没有抑制审计问题来获得 PASS。
- 修复了语言下拉框未继承正文动态字号的问题。DEBUG-only 测量确认正文和该控件均为 **53点**、文档宽 **390点**、横向溢出 **0**；Release 二进制已验证不含测试启动参数字符串。

原始失败轮次保存在 `ios/RUNLUTwist/Reports/build4/rounds/`，首个完整运行保存在 `initial-full-summary.json`（7 PASS / 1 FAIL，新审计失败），最终为 `final-full-summary.json`（9 PASS / 0 FAIL）。

## 实际测试矩阵

| 项目 | 结果 | 实际证据及范围 |
|---|---|---|
| 启动、白屏回归 | PASS | iPhone 17e 模拟器 / iOS 26.5，真实 WKWebView 与启动错误断言 |
| 中英文切换 | PASS | 原生语言菜单、说明/内容、重新打开后恢复；双语无障碍审计 |
| 20道经典谜题完整流程 | PASS | 实际 WK QA 双语各20题；提示/揭晓/自评/计分/上一题/下一题/回顾 |
| 10道 Logic Studio 答案与解释 | PASS | 实际 WK QA 双语各10题，正确键、解释、错误选择锁定、前后导航及重置 |
| Reasoning Lab / Reflection | PASS | 双语选择、反馈、揭晓后出现、记录保存；原生触摸复测 |
| 本机保存与恢复 | PASS | 冷重开、隐私页往返、五键原生备份；Node 覆盖 WebKit 存储拒绝与六类坏数据 |
| 页面导航、原生重置、系统分享 | PASS | 实际 UI；分享内容不含本地 file URL |
| 本地离线资源运行 | PASS（限定） | Bundle HTML/CSS/JS、CSP无远程游戏依赖、实际 loadFileURL 运行；不是物理手机飞行模式测试 |
| 较小现有模拟器布局 | PASS（限定） | iPhone 17e 390×844；最大字号53点无横向溢出。没有冒充4.7英寸SE实机测试 |
| 横屏真实下一关操作 | PASS | 旋转后通过实际点击进入 Challenge 2 / 10，最终完整运行也通过 |
| 横屏 XCTest 图片质量 | FAIL（证据链限制） | 导出PNG仍有方向/黑区/裁切异常；此前正常 Run 的 Device Hub 全宽显示支持截图链路问题判断，不能以该PNG证明完整视觉验收 |
| Apple 基本无障碍审计 | PASS | 英文首页、复盘区域、Studio、中文页面，六类审计；最终同一次运行通过 |
| 最大辅助字号 | PASS | iOS 26.5 正文及语言控件均53点、width390、overflow0；截图与日志随报告 |
| Simulator VoiceOver 启用/初始焦点 | PASS（冒烟） | Device Hub 可启用，出现系统首次手势提示，关闭提示后焦点位于 RUNLU 品牌；检查后恢复开关与键盘设置 |
| VoiceOver 连续导航、完整朗读/手势、语音质量 | NOT TESTED | 未完成可靠完整操作序列；不以自动审计或初始焦点冒充真实 VoiceOver 验收 |
| Node VM 自动化 | PASS | 17 PASS / 0 FAIL，DOM stub，不验证布局 |
| 最终完整 XCTest | PASS | iPhone 17e / iOS 26.5（23F77）、arm64：9 PASS / 0 FAIL / 0 SKIP |
| iOS 27.0 对照 | PASS（此前结果） | iPhone 18 Pro此前7/7，不冒充本轮新增无障碍修改后的重新运行 |
| iOS 17及其他未覆盖版本、375×667 SE | NOT TESTED | 本轮无相应运行记录；最低系统声明来自构建配置，不等于全系统覆盖 |
| 真机安装与完整验收 | NOT TESTED | JohnZ’s iPhone / iPhone16 Pro Max / iOS27.2 当前要求 Developer Mode；没有安装此候选或执行完整验收 |
| 真机飞行模式、升级保留数据、内存终止恢复 | NOT TESTED | 仍需开发者使用本地候选完成 |

最终结果包：`/Users/zhangjohn/Library/Developer/Xcode/DerivedData/RUNLUTwist-dinfacskxenkwxaclnwovmfhmyod/Logs/Test/Test-RUNLUTwist-2026.10.29_06-13-12--0600.xcresult`。

最终这次完整运行约291秒。另保留了10月28日约1804秒的早期通过轮次，其部分用例有很长墙钟间隔，不作为性能基准。报告日期和最终测试日期均为2026-10-29，历史记录保留原始时间戳。

## 本地构建与候选包校验

- Release arm64 编译：PASS。签名 Archive：**ARCHIVE SUCCEEDED**。本地开发导出：**EXPORT SUCCEEDED**。
- Archive：`/Users/zhangjohn/Documents/Codex/2026-10-25/runlu-twist-app-store-xcode-testflight/outputs/Build4Candidate-2026-10-29/RUNLUTwist-1.1-4.xcarchive`。
- IPA：上述目录 `DevelopmentExport/RUNLUTwist.ipa`；Apple Development 签名，沿用原Team。**这是供已注册设备测试的开发包，不是App Store发行IPA。**
- 开发描述文件有效期至2027-08-29 18:35:59 UTC，包含1台已注册设备；没有在本报告公开设备标识，也没有新增注册设备。
- IPA SHA256：`64a25c5f080d9040bdac317d43c9f2d4593d0e111b5c2eaa22e2f2bc2009b91f`。
- Archive 与导出IPA均通过严格签名验证；版本、Bundle ID、iPhone设备族、最低系统、图标引用和隐私plist均校验通过。
- 实际打包 `Web/twist.html` SHA256：`b92e441c13b009f899be271a687f6bc19c277ae73245b806ca4dc489b6315482`，与当前工程资源逐字相同；隐私、支持及QA资源同样逐字比对。
- Release 二进制不含 `-twist-qa-suite`、`-twist-qa-corrupt`、`-twist-qa-large-type`、`-twist-dark` DEBUG启动入口。打包的QA脚本不会在Release自动执行。
- 导出选项明确是 `method=debugging`、`destination=export`、不自动改版本号；没有调用 upload 选项或 App Store 上传命令。

## 阻断与下一步

1. **真机步骤被 Developer Mode 阻断**：Device Hub 对现有真实iPhone明确显示 Enable Developer Mode。需开发者在手机“设置 → 隐私与安全性 → 开发者模式”自行处理并完成系统要求的重启/确认，解锁并信任Mac。此设备安全设置没有被代理改动。
2. 自动化工程检查没有留下已知的构建/资源/玩法断言失败；但真实iPhone完整验收、VoiceOver连续操作、横屏视觉、飞行模式与升级迁移尚未完成，因此发布验收仍未闭环。
3. 本地开发签名不代表App Store发行签名/Apple服务器验证通过。CLI导出有 Xcode 账户凭据缺失警告（missing Xcode-Username），虽未阻止使用现有资料本地导出，未来上传前仍需开发者在Xcode核实/重新登录。App Store发行导出与上传均 NOT TESTED，不能声明“没有任何阻止上传的问题”。
4. 尚未解决的Apple风险沿用 `TWIST-11-IOS-ACCEPTANCE.md`：4.3下固定经典谜题/短静态逻辑挑战仍有同质化、功能深度不足风险；逐题来源、译文与素材权利证据不足；“原创”标注未获独立证明；账号内全部App和WORDSHIFT实际差异矩阵不完整；4.2.6商业模板/生成服务来源及完整审核问题需要真实材料。自动测试不构成原创性或合规保证。

本轮没有修改游戏功能、Bundle ID、Team或App Store Connect配置；没有上传、提交审核或公开发布。先完成开发者真机安装验收，再决定后续发行准备。

参考：[Apple Accessibility Inspector](https://developer.apple.com/documentation/accessibility/accessibility-inspector)、[Apple XCTest Accessibility Audit types](https://developer.apple.com/documentation/xcuiautomation/xcuiaccessibilityaudittype)。这些工具检查不能替代使用辅助技术的完整用户验收。
