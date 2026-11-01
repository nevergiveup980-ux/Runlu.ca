# RUNLU TWIST — Apple Review Evidence Audit

审计日期：2026-11-01，America/Edmonton。分支：`feature/twist-apple-review-remediation`，审计起点 `cd9380e`，PR #375。**总体风险 HIGH；当前 NO-GO 重新送审。** 本文是内部证据报告和英文回复草稿，未向 Apple 发送。没有修改已验收游戏、上传构建、提交审核或接受协议。

## 范围、证据等级与本轮复核

- **直接复核**：当前代码、Git 历史、既有 Build 3/4 Archive 的 plist/HTML、实际 iOS 工程与仓库文件逐字比较、现存测试 JSON、App Store Connect 只读页面。
- **历史实测记录**：同一工程已有日志/报告；本轮没有重新执行 UI 测试。用户/开发者陈述不等于独立 Beta 证据。
- **NEEDS CONFIRMATION**：账号全部历史/转移应用、WORDSHIFT 身份、法律权利与委托关系、外部 Beta、完整历史代码来源。无法据“没有搜到”断言“从未存在”。
- 九项问题采用 [TWIST-APPLE-NINE-QUESTIONS.md](TWIST-APPLE-NINE-QUESTIONS.md) 的完整转录（用户截图来源，提交 `cd9380e`）。本轮 ASC 直接确认原消息标题、Build 3 拒审与后续指示；AX 文本的问卷正文在 Q1 处截断，因此没有声称从实时页面逐字重验全部九问。
- 当前 ASC：TWIST `1.0.0 (3)` **Rejected / 4.3.0 Design: Spam**，iOS Submission 为 **Unresolved Issues**。Apple 消息日期页面显示 2026-10-26 10:35 AM，标题同时引用 4.3 与 4.2.6。只有一条 Apple 消息；本轮未点击 Reply/Resubmit。
- ASC 账号显示 `john zhang / Jizhu Zhang`；应用列表见 Q5。页面新增 **Apple Developer Program License Agreement Updated** 提示，要求 Account Holder 接受后才能更新/提交。代理没有接受；这是当前明确的人工发布门槛，不沿用此前“本地账户会话过期”的旧结论。
- 纠正文档：`TWIST-BUILD4-REVIEW-EVIDENCE.md` 写的 `62f1103e` 是错误提交号，实际为 `62f103e`；其“Q1/Q2 缺失”及 QA checklist 的“未真机测试/无构建”等旧状态已被后续文档取代。旧文件未删除或改写测试历史。

### 本地证据路径索引

为兼顾仓库链接与本机复现，后文 E1–E6 使用以下绝对路径。仓库内链接为相对路径；本机文件不上传个人设备标识、账户凭据、证书或 IPA。

| ID | 实际位置 |
|---|---|
| E1 仓库 | `/Users/zhangjohn/Documents/Codex/2026-10-25/runlu-twist-app-store-xcode-testflight/work/twist11-repo` |
| E2 现有 iOS 工程 | `/Users/zhangjohn/Documents/Codex/2026-10-09/l/outputs/RUNLU-TWIST-iOS/RUNLUTwist.xcodeproj` |
| E3 实际 Bundle HTML | `/Users/zhangjohn/Documents/Codex/2026-10-09/l/outputs/RUNLU-TWIST-iOS/RUNLUTwist/Web/twist.html` |
| E4 构建目录 | `/Users/zhangjohn/Documents/Codex/2026-10-25/runlu-twist-app-store-xcode-testflight/outputs` |
| E5 SHIFT 对照源码目录 | `/Users/zhangjohn/Documents/Codex/2026-10-09/referenced-chatgpt-conversation-this-is-an-2/outputs/RUNLU_SHIFT_V1_0_Build9_Release_Archive 2` |
| E6 图标生成脚本 | `/Users/zhangjohn/Documents/Codex/2026-10-09/l/work/make-twist-icon.swift` |

本轮 `verify-candidate.py` 对 E4 的 `Build4Candidate-2026-10-29/RUNLUTwist-1.1-4.xcarchive` 复验 **PASS**：`ca.runlu.twist`、1.1/4、iPhone `[1]`、iOS 17.0、四个 Web 资源逐字匹配、图标/隐私清单和 Release 测试入口排除。E2 的 WebView、App 入口、HTML、图标与 project.yml 均与 E1 对应文件逐字相同。此项是静态包复验，不是新增玩法验收。

## Q1 — App 做什么、解决什么问题

### Verified Facts

Build 3 是本地离线双语经典谜题游戏：20题、提示、揭晓答案与解释、上一题/下一题、自评、积分、复习、保存及系统分享；没有答案输入框、自动校验经典谜题答案、账号或在线服务。积分记录揭晓/提示行为，自评正确率不是测量出来的能力分数。

Build 4 保留以上功能，新增：Reasoning Lab（三个思考方向、固定反馈并保存）；Reflection（揭晓后选择一种思考习惯、保存复盘计数）；Logic Studio（10个双语静态推理题、选择判分、解释、答案锁定、前后导航及独立进度/重置）。Studio 可在经典题未完成时操作，是独立的题组/交互循环；前两项依附经典题，并非三个独立游戏引擎。没有证据表明它是自适应导师、动态题库或独特推理机制。

### Evidence / File Paths

- [Build 3 报告](../ios/RUNLUTwist/Reports/BUILD-3-REPORT.md)；E4 `RUNLUTwist-1.0.0-3.xcarchive/Products/Applications/RUNLUTwist.app/Web/twist.html`，SHA256 `3719ce80d0f07f8389c6091cb66b176e67f3a2b8cf50c09247c90c917af79d7f`，不含上述新增模块。
- [twist.html](../twist.html)：`renderReasoning`、`renderReflection`、`studioCases`、`renderStudio`；E3 和 Build 4 Archive HTML SHA256 均为 `b92e441c13b009f899be271a687f6bc19c277ae73245b806ca4dc489b6315482`。
- Git：`dd39252` Reasoning、`cb49f96` Reflection、`34c7dd6` Studio、`5f4de30` 扩展十题、`849f53f` 真正同步 iOS。

### Remaining Questions

NEEDS CONFIRMATION：用户实际需要/长期重玩价值的研究证据；新流程是否足以满足 Apple 对实质改进的判断。不能把 Build 4 功能写成被拒 Build 3 已有功能。

### Suggested Apple Response

Draft: “The reviewed 1.0.0 (3) is an offline English/Simplified Chinese riddle game with 20 curated puzzles. Players think, optionally request a hint, reveal an explanation, and record whether they thought of the answer. Classic scores do not verify a typed answer. A later, not-yet-submitted 1.1 (4) candidate adds saved reasoning choices, post-reveal reflection, and a separate ten-case deduction section with checked choices and explanations. These additions were not in the reviewed binary. The intended benefit is a short session of reading, considering alternatives and reviewing an explanation.”

### Confidence Level

**HIGH**：功能及二进制版本区分。用户问题被有效解决的程度：**LOW / NEEDS CONFIRMATION**。

## Q2 — 具体目标用户

### Verified Facts

界面支持英文/简体中文，单人、无时间压力、无需注册，内容依赖阅读和词义理解，适合希望短时解谜、查看解释的休闲读者。该受众描述是由产品流程推导的设计定位，非用户画像调查。4+ 年龄标签不能证明幼儿可独立阅读，也不能据此称为儿童教育、临床认知或语言教学产品。

### Evidence / File Paths

[twist.html](../twist.html) 双语题干/解释、语言菜单、自评流程；[原发布检查](../ios/RUNLUTwist/Reports/FINAL-RELEASE-CHECK.md)；[真机冒烟报告](TWIST-BUILD4-IPHONE-SMOKE-2026-11-01.md)。

### Remaining Questions

NEEDS CONFIRMATION：所有者明确的目标年龄/使用场景、实际使用者范围、可访问性需求；没有调查样本或学习效果数据。

### Suggested Apple Response

Draft: “The design is aimed at individual casual players who can read English or Simplified Chinese and prefer short, untimed text puzzles with explanations. It does not require an account or competition with other players. This is a design audience, not a demographic established by beta research. We make no measured educational or cognitive-improvement claim.”

### Confidence Level

**MEDIUM**：界面证据强，目标人群为推断，待所有者确认。

## Q3 — 市场缺口与实质差异

### Verified Facts

新增操作产生状态、反馈、判分或持久化，非装饰性界面。Studio 具有“读条件→选答案→自动判定→解释→下一关”的独立循环；Reasoning/Reflection 将“先选择思路、再揭晓并记录反思”加入经典流程。

局限同样明确：Reasoning 以 `i % 4` 分组使用固定反馈；Reflection 是自报，不诊断真正错误原因；Studio 只有10道固定短题，排除法、排序、时间和数字约束均是常见题型。没有市场竞品研究、独家内容证明、生成关卡或可验证的独有分支系统。**功能变化真实，但不等于已证明独立产品的市场必要性。**

### Evidence / File Paths

[twist.html](../twist.html) 中 `reasoningLenses`、`reasoningIndex`、`reasoningWhy`、`renderReflection`、`studioCases`；[十题答案表](TWIST-11-IOS-ACCEPTANCE.md)；[最终测试](TWIST-BUILD4-FINAL-ACCEPTANCE.md)。

### Remaining Questions

NEEDS CONFIRMATION：与实际同类产品的体验比较；外测是否认为此组合有独立价值；4.3 剩余同质化及4.2娱乐深度风险。没有证据支持“现有 App 无法做到”或“首创/独家”。

### Suggested Apple Response

Draft: “The candidate combines a pre-reveal reasoning choice, post-reveal self-reflection and a separate checked deduction section, with bilingual explanations and device-local records. We can demonstrate those interactions, but do not claim that classic riddles, multiple-choice deduction or reflection are exclusive inventions. We have not established that no existing app serves this need, and cannot substantiate an exclusive market-gap claim.”

### Confidence Level

**HIGH**：交互与局限；**LOW**：市场缺口，4.3 风险 **HIGH**。

## Q4 — Build 1–4 测试与 Beta 反馈

### Verified Facts

| Build / 时间 | 开发者 QA 与自动化 | 真实 iPhone / Beta 边界 |
|---|---|---|
| 1.0.0 (1)，10月24日 | Node 7/7；历史 CI Chromium 15/15、WebKit 15/15及 iOS 编译成功记录；iOS27.0 的18 Pro/Pro Max/17e多轮最终4/4 UI，早期控件/深色测试失败保留 | TestFlight 内部组1人，记录 Installed；用户随后报告白屏，故不能称真机功能验收通过。没有外部Beta反馈证据 |
| 1.0.0 (2)，10月25日 | canonical文件路径修复、启动/JS诊断；iPhone18 Pro/iOS27.0 UI 4/4；Node7项、Foundation路径fixture、签名Archive通过；历史报告确认上传/处理 | 该轮报告写真机安装/玩法待验收；未找到单独Build2完整真机结果。不能将路径fixture当作失败手机会话的直接日志 |
| 1.0.0 (3)，10月25日 | 同步玩法说明、保留Build2修复；18 Pro/iOS27.0 UI4/4、Node7项、路径回归及签名包检查通过 | 所有者明确报告本人iPhone体验验收通过；报告/聊天未提供独立测试者、逐条反馈和Beta问题闭环。这是所有者验收，不是独立Beta |
| 1.1 (4)，10月28–29日 | 真实WK QA 8/8（双语各20经典/10Studio）；Node VM17/17；最终iPhone17e/iOS26.5(23F77)同次UI9/9；双语六类无障碍审计与53点正文/语言控件、overflow0；Release签名Archive/开发IPA | 11月1日安装现有开发IPA，iPhone16 Pro Max/iOS27.2限定冒烟PASS；详见补充报告。尚非全20/10人工、飞行模式、横屏、完整VoiceOver、最大字号、冷终止/升级迁移验收；未上传TestFlight |

旧 iOS26.5 全套6/1 FAIL为旋转后的 XCTest activation-point 几何查询；后续修复测试隔离和实际frame点击断言，最终9/0通过。新增无障碍审计曾失败并促成点击区/装饰语义/字体修复，失败轮次保留。横屏导出PNG黑区/裁切仍是视觉证据限制，不能冒充PASS。上述是开发者/代理QA，不是外部参与者反馈。

可追溯修改：用户白屏报告→Build2路径策略/诊断；审计发现→`c61b237` 点击区域与测试隔离、`107ec9d` 下拉框动态字体。这些均不能写成“独立Beta反馈应用到生产”。修复前手机日志缺失，历史故障触发机制仍有证据限度。

### Evidence / File Paths

[Build1实测](../ios/RUNLUTwist/Reports/TEST-REPORT.md)、[TestFlight历史状态](../ios/RUNLUTwist/Reports/testflight-status.json)、[Build2](../ios/RUNLUTwist/Reports/BUILD-2-WHITE-SCREEN.md)、[Build3](../ios/RUNLUTwist/Reports/BUILD-3-REPORT.md)、[Build4最终验收](TWIST-BUILD4-FINAL-ACCEPTANCE.md)、[11月1日真机](TWIST-BUILD4-IPHONE-SMOKE-2026-11-01.md)、[最终UI原始JSON](../ios/RUNLUTwist/Reports/build4/final-full-summary.json)、[失败轮次](../ios/RUNLUTwist/Reports/build4/rounds/)。CI记录是历史导出，本轮没有重新运行/重新验证服务器作业。

### Remaining Questions

NEEDS CONFIRMATION：是否实际存在独立外部Beta、人数/日期/构建/反馈原件/修复对应；Build2真机结果；Build3所有者具体设备和问题清单。不能把内部组人数当完成测试人数或把Build4后测写成Build3提交前Beta。

### Suggested Apple Response

Draft: “Before the original submission we performed developer simulator, browser and logic checks, and the owner reported accepting Build 3 on an iPhone. We do not currently have documented independent beta-user feedback to cite. An earlier owner-reported blank screen prompted a local-file navigation-policy fix and diagnostics; simulator regression and a path-alias fixture passed, but no console from that failed phone session was captured. Later Build 4 developer QA passed nine simulator UI tests and seventeen VM tests, followed by a scoped physical-device smoke test. Those later results were not pre-submission beta testing for Build 3.”

### Confidence Level

**HIGH**：现存QA数量/范围；**MEDIUM**：历史分发/所有者陈述；独立Beta **NEEDS CONFIRMATION**。

## Q5 — 独立产品还是 RUNLU 产品套件

### Verified Facts

TWIST 技术上独立启动/保存，不依赖另一App、共享登录或跨App解锁；与RUNLU有共同品牌。不能把品牌相同等同同一玩法，也不能宣称账号没有其他谜题App。

本轮登录ASC的 All Statuses目录实际显示以下九款；除TWIST Rejected，另外八款均显示1.0 Ready for Distribution（此状态不等于每个地区均公开可下载）：

| 账号应用 | 核心范围 / 用户 | 证据强度与边界 |
|---|---|---|
| RUNLU TWIST | 双语文字谜题、思路复盘与短推理题；休闲阅读解谜者 | 实际源代码、包及测试 |
| RUNLU Shift | 原生棋盘方块、方向/出口、Commit/Trail/Echo/Resonance、40关两世界；空间规划解谜者 | E5 GameEngine/GameModels实际源码，Team相同；ASC选Build9。没有重装测试当前商店二进制 |
| Just Fit by RUNLU | 数字方块依次从顶部移出，先规划空间；数字/空间解谜者 | `just-fit.html`具体规则和关卡解锁文案；本轮未读取其二进制 |
| RUNLU INVEST | 投资观察、研究与决策笔记；个人研究记录者 | `runlu-invest.html`，网站材料，未实测账号二进制 |
| RUNLU Ledger | 收支记录、统计；个人账本用户 | `runlu-ledger.html`，同上 |
| RUNLU LIST | 列表、Memory/Quick Picks、去重与数量；日常清单用户 | `runlu-list.html`，同上 |
| RUNLU Field Calculator | 地材数量/裁切/估量；现场地材工作者 | `field-calculator-app.html`，同上 |
| RUNLU Warehouse OS - Flooring | 库存、收发货、扫描和仓库作业；地材仓库人员 | `warehouse.html`，同上 |
| RUNLU Universal Invoice | 开票/导出/分享；日常业务开票者 | `invoice.html`，同上 |

**WORDSHIFT：NEEDS CONFIRMATION。** 本次ASC列表无独立同名记录，当前分支及可读Codex工作目录文件名搜索也未找到WORDSHIFT工程。不能据此排除历史改名/其他Team/未发布项目。尤其ASC RUNLU Shift（Apple ID6821770917）的推广/描述开头出现“Move words. Change the rules.”，但关键词是block/sliding/spatial，review notes为40关，E5是方块引擎。此为来源冲突，不能按名称推断文字规则游戏，也不能自行认定WORDSHIFT=SHIFT。

### Evidence / File Paths

只读 [ASC应用目录](https://appstoreconnect.apple.com/apps)、[Shift已发布版本](https://appstoreconnect.apple.com/apps/6821770917/distribution/ios/version/deliverable)；E5 `RUNLUShift/Engine/GameEngine.swift`、`Models/GameModels.swift`、`Views/GameBoardView.swift`、项目签名 `ca.runlu.shift / F2J2Z8H2L4`；E1 上表网站文件。网站状态可能滞后，账号状态以本轮页面为准。

### Remaining Questions

NEEDS CONFIRMATION：WORDSHIFT实际身份/别名/App ID、是否其他Team；SHIFT文案与真实玩法冲突的原因；完整账号历史和所有在售App的实际功能验收；商业上是否定位为套件。不能把网站目录当账号完整历史。

### Suggested Apple Response

Draft, incomplete: “TWIST runs as a standalone text-puzzle product under the RUNLU brand. The same account also lists Shift, Just Fit and six non-game products. The inspected Shift source is a spatial block-movement engine; TWIST uses textual clues, explanations and recorded reasoning choices. Just Fit is described as an ordered-number exit puzzle. We must reconcile Shift's inconsistent store wording and the referenced WORDSHIFT identity before providing an unqualified account-wide comparison.”

### Confidence Level

**HIGH**：当前可见九款/状态；**MEDIUM**：SHIFT源码差异；其他玩法网页证据及账号完整性 **LOW–MEDIUM**。

## Q6 — 能否整合为其他 App 的内容/内购

### Verified Facts

TWIST 与 E5 的原生空间引擎在输入、规则与状态上不同，不只是替换同一关卡JSON。它也不属于发票/仓库/账本功能。但工程上完全可以在一款游戏内加入文字谜题/推理模式，并非技术上无法整合；现有独立Bundle、不同代码语言、免费或无内购均不能证明必须分发为独立App。用户群有休闲解谜交集。

### Evidence / File Paths

E5 `GameEngine.swift` 中 `performMove`、`performDrag`、`committed`、`trail`、`echoForbidden`；[TWIST流程](../twist.html)；Q5矩阵。未掌握所有产品路线决策文件。

### Remaining Questions

NEEDS CONFIRMATION：所有者为何不合并、是否曾讨论/测试统一游戏、WORDSHIFT相似度、独立用户使用价值。不得编造“合并会损害用户”或“不可能通过IAP实现”。

### Suggested Apple Response

Draft, not ready: “The inspected products have different current interaction models: spatial board manipulation in Shift and text-based reasoning in TWIST. Integration as a new mode is technically possible. Separate implementations alone do not establish a need for separate distribution. The product owner's evidence-based consolidation rationale and the WORDSHIFT comparison are still required before we can answer this fully.”

### Confidence Level

**MEDIUM**：技术可行性；独立发行必要性 **LOW / NEEDS CONFIRMATION**。

## Q7 — 与账号内其他 App 的共享代码/框架/素材

### Verified Facts

TWIST原生代码使用SwiftUI、WebKit、UIKit、OSLog；canonical本地HTML加载、白名单保存桥接、原生分享、失败诊断/恢复是其已检查实现。E5 SHIFT是原生Swift棋盘/关卡引擎，不是同一WKWebView壳。逐文件SHA256对比TWIST应用源目录和E5应用源目录，**无逐字相同文件**；这只排除该范围内整文件完全复制，不证明没有片段复用、改写或共同开发来源。

共同可证实部分包括RUNLU品牌/文本身份、Apple系统框架、同一签名Team。TWIST网站首页/页脚视觉属于RUNLU站点体系；游戏源与公开网站 `twist.html` 有直接共享。其他八款的全部源码和历史未完成语义克隆审计，不能回答“无显著共享代码”这一全账号绝对命题。

### Evidence / File Paths

[GameWebView.swift](../ios/RUNLUTwist/RUNLUTwist/GameWebView.swift)、[App入口](../ios/RUNLUTwist/RUNLUTwist/RUNLUTwistApp.swift)、[同步脚本](../ios/RUNLUTwist/Scripts/sync-game.py)、E5引擎；原生引入历史 `d04aee1`，路径修复 `8c28602`，整改 `849f53f`。

### Remaining Questions

NEEDS CONFIRMATION：其他App共享原生工具/HTML壳/图标/样式片段清单、是否由共同内部起始项目派生及授权链。相同品牌/框架本身不构成完整共享组件答复。

### Suggested Apple Response

Draft, scoped: “The inspected TWIST target uses Apple's SwiftUI, WebKit, UIKit and logging facilities. Its gameplay is bundled HTML/JavaScript with native local-save and sharing bridges. The inspected Shift project uses a different native spatial engine; no byte-identical source/resource files were found between those two inspected app-source directories. Both use RUNLU branding and the same development team. We have not completed a component-level comparison of every app in the account and cannot yet make a blanket no-sharing declaration.”

### Confidence Level

**HIGH**：TWIST结构；账号全范围共享结论 **LOW / NEEDS CONFIRMATION**。

## Q8 — 第三方代码、SDK、内容库和模板

### Verified Facts

- 当前TWIST target没有Pods、SwiftPM package引用或Carthage清单；Xcode项目packageProductDependencies为空。构建工具XcodeGen生成工程结构，不负责生成游戏关卡；不能把其使用直接等同商业App模板服务。
- Bundle只有App入口/WebView、plist/隐私清单、一个AppIcon和Web四文件；未发现音频、视频、外部字体文件或游戏图片。CSS使用系统字体栈，游戏形状/布局来自CSS；隐私/支持是本地HTML。没有发现广告/分析SDK或远程游戏运行依赖。
- 对候选二进制的`otool -L`实际输出仅为Apple系统框架和Swift运行库；命令同时有缓存写入权限警告，非干净成功退出，因此它是有限补充证据，不单独认证全二进制。没有发现打包第三方动态Framework；静态复制代码不能由动态链接清单排除。
- E6可读AppKit脚本画两条贝塞尔彩带并以系统字体写TWIST，支持图标本地程序绘制来源；当前图标SHA256 `a21480a7e22a5107f50cd54cc1e38fde3acd3450f693c5bef9e15e1888f4ac21`与工程/仓库一致。未重新执行绘图做字节级复现，无法据此保证排他设计权或所有历史来源。
- Git最早已检查TWIST网页提交 `166fe24`（2026-10-20），后续双语/功能修改和新模块提交清晰可追溯；Git作者字段不是人类手写或法律著作权证明。本聊天直接记录Codex辅助整合、修复、测试和报告；并未取得全项目所有生成提示/外部源记录。
- 20经典题是共享文化/常见谜题的选编；存在第三方内容风险。未建立逐题出处、英文表述/中文译文权利表。十道Studio在Git新增，但标签“RUNLU ORIGINAL”不构成原创/授权证明。先前所有者确认获准使用属于陈述，不能补齐具体许可。

### Evidence / File Paths

[工程配置](../ios/RUNLUTwist/project.yml)、[Xcode项目](../ios/RUNLUTwist/RUNLUTwist.xcodeproj/project.pbxproj)、[native-style.css](../ios/RUNLUTwist/Scripts/native-style.css)、[native-storage.js](../ios/RUNLUTwist/Scripts/native-storage.js)、[隐私清单](../ios/RUNLUTwist/RUNLUTwist/PrivacyInfo.xcprivacy)、E6、[图标SVG](../ios/RUNLUTwist/Release/AppIcon.svg)、Git上述提交；E4候选App文件清单及资源校验。

### Remaining Questions

NEEDS CONFIRMATION：是否曾购买/使用商业模板、外包片段或外部题库；逐题原文/译文/解释的作者与使用依据；图标脚本和概念的权利；开发工具依赖的许可证。搜索未发现不等于保证从未使用。仓库其他业务的第三方服务不应无证据归入TWIST二进制。

### Suggested Apple Response

Draft, incomplete: “The inspected target has no declared third-party runtime SDK or package dependency. It bundles local HTML, JavaScript and CSS inside an Apple-framework native host. The inspected assets use system fonts, CSS and a locally generated icon. Codex assisted implementation, debugging and testing. We have not established a complete historical no-template declaration or completed item-level rights documentation for the curated riddles and translations; those confirmations are required before making a categorical provenance statement.”

### Confidence Level

**HIGH**：当前清单与Git变更；商业模板历史/内容权利 **LOW / NEEDS CONFIRMATION**。

## Q9 — 客户/合作方、品牌内容提供者与提交账号关系

### Verified Facts

ASC页面显示Jizhu Zhang账号上下文；TWIST原签名Team `F2J2Z8H2L4`、Bundle ID `ca.runlu.twist`保留；Git含John Zhang及nevergiveup980-ux提交者，网站/应用使用RUNLU品牌。历史对话所有者称“2026 RUNLU，自主开发”，并确认经典内容获准使用。这些支持关联，但不单独证明商标登记、法律实体、雇佣/委托、版权转让或Account Holder法律身份。

本轮和先前聊天可直接证实AI/Codex参与代码整合、缺陷修复、测试自动化与文档；没有运行时AI模型调用/AI生成关卡服务。通用AI辅助编程与商业模板/App生成服务不是同一事实，是否适用4.2.6仍取决于真实来源、内容提供者与提交关系，不能据“用了AI”或“没SDK”作合规结论。

### Evidence / File Paths

[原发布资料](../ios/RUNLUTwist/Reports/FINAL-RELEASE-CHECK.md)、[构建manifest](../ios/RUNLUTwist/Reports/build4/candidate-manifest.json)、E2签名配置、Git作者历史和当前人机开发记录；ASC只读账号名称。未访问或发布个人证件、税务或私钥。

### Remaining Questions

NEEDS CONFIRMATION：RUNLU品牌/图标/游戏代码与译文法律所有者是谁；账号持有人与内容提供者是否同一主体或有效授权；是否为任何客户/合作方制作；是否外包/模板服务代提交。没有第三方委托文件被发现不等于没有客户。

### Suggested Apple Response

Draft, not ready: “The app uses RUNLU branding and is developed through the repository associated with the submitter. Codex was used to assist programming, debugging and testing; it is not a runtime content service in this app. Before stating that this is our own product rather than work for a client, the account holder must confirm the legal content/brand owner, any commissioning party, any template-service involvement and their relationship to the submitting account.”

### Confidence Level

**MEDIUM**：技术账号/品牌关联及已观察AI参与；法律所有权/无客户声明 **LOW / NEEDS CONFIRMATION**。

## 总体风险与 Build 4 提交前必须完成项

| 风险 | 评级 | 依据 |
|---|---|---|
| 4.3同质化/4.2持续娱乐价值 | HIGH | 新交互真实，但经典题占比高、仅十道静态推理；缺少用户价值/竞品证据 |
| 4.2.6来源与内容提供者关系 | HIGH（证据缺口） | 当前未发现商业SDK/模板包，但历史来源、权利与委托关系未闭环；不是确认违规 |
| 账号内产品重复/整合理由 | HIGH | WORDSHIFT身份与SHIFT文案冲突，完整组件矩阵和整合决策缺失 |
| 测试/发布 | MEDIUM | 开发者QA/签名包和真机冒烟通过，完整真机/独立Beta证据及发行验证不足 |
| 账户发布门槛 | BLOCKED | ASC明确要求Account Holder处理新版开发者协议；未代接受 |

1. **人工确认权属与来源**：内容/品牌/代码所有者、账号持有人关系、有无客户/外包/商业模板；为20经典题和10Studio、译文/解释、图标建立来源及许可记录。不能对常见题型主张独占。
2. **完成产品矩阵**：确认WORDSHIFT身份；核对已发布SHIFT真实二进制与矛盾文案；补齐账号各App共享组件与整合理由。只凭代码不同不够。
3. **补真实用户证据**：若开展Beta，记录构建/日期/测试者角色/具体反馈/应用的修复，不把开发者自动化或所有者验收改称独立Beta。缺失也必须如实回答。
4. **完成真机验收**：全20/10人工流程、飞行模式冷启、横屏视觉、VoiceOver、动态字体、小屏、冷终止及升级保存；保留FAIL/NOT TESTED。既有9/9模拟器与17/17 VM不扩大解释。
5. **选择审核路径**：如果依赖新增功能，明确Build3没有这些内容，完成Build4及发行准备后再单独授权上传/提交；若认为Build3原本合规，按Apple消息先逐项完整回复而非原样重投。当前草稿Q5–Q9不够作最终声明。
6. **账户持有人处理协议**：自行阅读并接受新版Developer Program协议；未来另核实发行签名、Apple服务器验证、1.1截图/文案/隐私与构建一致性。这轮不执行。

**结论：九项审计已完成，九项事实并非都已证实。建议保留Build4内部候选，暂不上传或重新送审。** 功能改进与测试通过不能替代版权、来源、账号关系及独立价值证据。

政策依据：本轮只读核对 [Apple App Review Guidelines 4.2/4.2.6/4.3](https://developer.apple.com/app-store/review/guidelines/#design)：Apple关注足够的实际价值、商业模板/生成服务的内容提供者提交关系及重复/同质应用。本文不是法律意见，也不保证Apple的个案判断。
