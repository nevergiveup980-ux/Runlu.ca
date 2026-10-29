# RUNLU TWIST 1.1 — iOS 整改验收记录

日期：2026-10-28（America/Edmonton）。范围：代码整合、构建、自动化和模拟器验收；没有上传、提交 App Review 或公开发布。

## 工程与版本

- 实际现有工程：`/Users/zhangjohn/Documents/Codex/2026-10-09/l/outputs/RUNLU-TWIST-iOS/RUNLUTwist.xcodeproj`。
- 实际加载资源：同目录 `RUNLUTwist/Web/twist.html`。`Bundle.main.url(...subdirectory: "Web")` → canonical URL → `loadFileURL`，读取范围限定 Web 目录。保留 Build 2 的 symlink/canonical 路径修复、启动诊断和进程恢复逻辑。
- 网站旧工作副本：`/Users/zhangjohn/Documents/Codex/2026-10-25/runlu-twist-app-store-xcode-testflight/work/repo`，已有未提交工作，未覆盖。
- 隔离整改副本：同任务目录 `work/twist11-repo`；分支 `feature/twist-apple-review-remediation`，获取的远端起点 `32ce261b49660d37272781271d175917bc1c014d`。本报告随整改提交进入 PR #375；最终提交 SHA 见 PR 提交记录。
- 实际工程与分支基线的五个待改代码/配置文件先逐字比较，原件备份至任务目录 `work/twist11-backup/`，再同步修改。旧报告、商店资料和图标未覆盖。
- 原 Bundle ID `ca.runlu.twist`、Team `F2J2Z8H2L4`、iPhone-only、iOS 17+、横竖屏及图标保留。当前工程候选配置 **1.1 (4)**。签名配置保留；本次使用 `CODE_SIGNING_ALLOWED=NO` 编译，未验证发行证书/描述文件可用性。
- 图标 SHA256：`a21480a7e22a5107f50cd54cc1e38fde3acd3450f693c5bef9e15e1888f4ac21`，分支与实际工程相同。

## 发现及修复

1. **资源不同步**：根目录游戏已有 Reasoning Lab、Reflection、十道 Studio，但 iOS Bundle 仍是旧版。新增 `Scripts/sync-game.py`，将根游戏整合为离线 Bundle 资源，保留原生样式、隐私/支持页、CSP 和纯文字分享。今后重复同步结果一致。
2. **新增记录未进入原生恢复范围**：旧桥接仅保存经典进度和语言。扩展为五个白名单键，包含 reasoning/reflection/studio；本地缓存允许 WebKit 存储被拒绝时继续运行，并由 UserDefaults 快照恢复。
3. **损坏数据类型**：合法 JSON 原始值、数组等原先可能被当作可写选择对象。现在只接受对象、有效题号及 0–2 整数选择；Studio 拒绝数组并校验题号/答案范围。异常数据回退为空状态。
4. **文案/解释**：第二道英语解释明确先得到周二/周三再排除周三；第三道解释明确条件矛盾；Studio 英语标题改为 Deduction Challenges，避免声称每题都是三条线索；重置提示说明经典记录和 Studio 的不同范围；中文原生确认框识别、区域无障碍名称随语言切换。
5. 原有 20 题、提示/揭晓、自评、计分、分享等保留，未增加答案输入框。
6. 第一轮新增 UI 用例错误地把 `aria-pressed` 控件当普通按钮，且测试注入脚本返回不可桥接的值而触发测试诊断。改用 XCTest Switch 查询、明确返回 `true`；这些是测试工具问题，保留首轮失败记录，重跑验证。追加 iOS 26.5 发现语言选择器为 Other（iOS 27 为 Button），测试改为按无障碍名称跨类型查询；日志证明对应重开实际已在约3秒完成渲染。横屏测试增加旋转后实际下一关操作，避免把旋转动画截图当成稳定布局证据。

## 自动化与实际运行

| 检查 | 结果 | 证据/边界 |
|---|---|---|
| Release iOS Simulator 编译 | PASS | `work/twist11-build-final.log`：BUILD SUCCEEDED |
| Release arm64 iPhone 编译 | PASS | `work/twist11-device-build.log`：BUILD SUCCEEDED；成品 Info.plist 为 1.1 / 4 |
| Bundle 离线依赖、plist、原图标、历史资料长度 | PASS | `python3 .../Scripts/verify-package.py`；未用旧商店 metadata 认证 1.1 发行包 |
| Node VM | PASS | `ios/RUNLUTwist/Reports/remediation-vm-results.json`：17 PASS / 0 FAIL；DOM stub，不是浏览器布局测试 |
| 实际 WKWebView 全玩法 | PASS | Xcode 内运行同一 QA 脚本：8 / 8；包括双语各 20 题及各 10 Studio、反馈/解释、错误选择锁定、切换保留记录 |
| 完整 XCTest UI 重测 | PASS | iPhone 18 Pro / iOS 27.0：7 PASS、0 FAIL，详见 `Reports/remediation-ui-summary.json`；较小设备追加结果见末尾 |
| 首轮 XCTest | FAIL（已定位） | 4 旧测试通过、2 新测试失败；4 个断言失败，原因为上文测试注入/控件查询；不是最终验收结果 |
| 较小 iPhone 17e / iOS 26.5 全套 | FAIL（6通过/1失败，单项复测见下） | 6 PASS / 1 FAIL，失败为旋转中询问 hittability；`Reports/remediation-compact-full-summary.json`，没有把该全套标成通过 |
| 小屏响应式浏览器 | PASS（限定） | 本机 Bundle HTML 经 localhost，320×568，英文选择/揭晓/复盘、切中文、刷新恢复；DOM scrollWidth=clientWidth=320，所有按钮未横溢出，无 warn/error |
| 横屏响应式浏览器 | PASS（限定） | 844×390，中文 Studio 点蓝抽屉得到正确解释，scrollWidth=clientWidth=844 |
| 基本键盘/语义 | PASS（限定） | 可见语言 combobox、button、progressbar 和区域名称；Tab 从 Studio 下一项到重置；不代表完整 VoiceOver 验收 |
| 独立 Playwright Chromium/WebKit 全套 | NOT TESTED | Chromium 启动被当前执行环境 Mach/bootstrap 权限拒绝，页面测试未开始；WebKit 未执行。已保存可复跑脚本，改用实际 Xcode WK 及受控浏览器验证 |
| 物理 iPhone 1.1 | NOT TESTED | 本轮没有新真机验收；旧 Build 3 验收不适用于新增内容 |
| 真机小屏/横屏、飞行模式冷启、VoiceOver、最大字号、升级迁移、内存终止 | NOT TESTED | 发布前仍需实机专项记录；本轮离线证据是本地 Bundle + CSP 无远程游戏依赖及模拟器运行，不冒充切断真实网络后的真机测试 |

Node 覆盖：双语完整内容；经典提示后总分195、上一题/下一题/回顾；全部选择和解释；记录跨重开及原生快照恢复（模拟 WebKit 存储拒绝）；六类坏数据；取消/确认重置及分区范围；分享不含 file URL。实际 UI 用例补充原生确认、语言菜单、系统分享页、隐私页往返、冷重开恢复及横屏截图。测试不代表每种 iOS 版本或所有无障碍组合均已验证。

## 十道 Studio 的答案/解释复核

| 题 | 正确项（0 起索引） | 推理核对 |
|---|---:|---|
| 1 | BLUE（1） | 排除红、绿，仅蓝 |
| 2 | Tuesday（1） | 周一之后周四之前，排除周三 |
| 3 | No valid arrangement（3） | B在中间使A/C不能紧邻，矛盾 |
| 4 | 234（0） | 首2、末4、中3 |
| 5 | 10:00（1） | 唯一整点，10:30结束早于10:45 |
| 6 | 2（1） | 偶数2/4排除4 |
| 7 | Turn B on（1） | A已开，且条件要求A与B皆开 |
| 8 | Oak–Lake–Pine（0） | Oak < Lake < Pine |
| 9 | It is red（0） | 恰一个红或蓝，非蓝即红 |
| 10 | 63（1） | 个位3、十位6，和9且差3 |

中英文题干、选项及解释逐项对照；自动化也校验题目键和选后解释。不能把此表作为独立外部测试者反馈或原创性证明。

## Apple 4.3 / 4.2.6 审核风险

依据：[Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)。4.2 要求足够的实用/娱乐价值；4.2.6 涉及商业模板或应用生成服务；4.3 关注重复、同质应用。增加功能或改版本号本身不能证明合规。

- **确有互动**：Reasoning Lab 三方向选择会产生反馈并保存；Reflection 揭晓后才出现并保存自评；Studio 有条件约束、自动判分、解释、锁定、十关进度及重置。不是纯静态装饰。
- **差异仍有限**：经典模式仍以揭晓答案为主。Reasoning 的反馈按固定组轮换，Reflection 是自述，不是自适应诊断。Studio 仅十道短静态挑战、无可验证的独特生成/分支机制，题型常见。对 4.3 和“功能单薄”仍有明显剩余风险。
- **经典内容来源**：20题已明确为选编经典而非 RUNLU 原创，但没有逐题出处、译文作者、许可/公版依据表。用户此前的使用权确认不是逐题许可证据。本轮未取得外部权利文件，版权问题不能标 PASS。
- **Studio 原创标注**：Git 可证明这些文字在整改提交中新增，不能证明世界范围独创或权利归属；常见基础逻辑题型不应被宣传为独占发明。保留既有标注但将证明列为发布门槛，不能在回复 Apple 时作无证据原创承诺。
- **模板/共享代码**：检查当前 iOS target 使用 Apple 系统框架，没有发现第三方运行依赖、Pods/SwiftPM 商业模板包。XcodeGen 只是工程配置工具。仓库存在共享站点/原生壳逻辑及 AI/Codex 辅助开发；不能声称“完全手写、从未使用 AI/模板”或据此证明历史来源已穷尽。图标未变，不等于已核实其授权链。
- **其他 RUNLU 产品**：仓库 `digital.html` / `runlu-shift.html` 的 SHIFT 是移动方块/出口和 Commit/Trail/Echo；`just-fit.html` 是数字排序及后续关卡购买，与本版本的语言推理/复盘不同。但未测试这些 App 实际二进制，也未核对账号全部应用；WORDSHIFT 资料未取得，完整差异矩阵仍缺失。
- **审核原文**：工程文档记录 Build 3 因4.3并引用4.2.6被拒。App Store Connect 当前登录已过期，未读取完整新审核消息（尤其问题1–2）；九项逐条回复不能凭猜测完成。
- **外测证据**：本轮是开发者自动化/模拟器 QA，没有新增外部 beta 体验或真机反馈，不能伪造。

## Build 4 建议与剩余门槛

可以继续准备 **1.1 (4) 的内部真机候选**，但当前不建议把它视作可直接重新送审的最终版本。先完成：新版本真机冷启动/离线/小屏/横屏/升级保存/无障碍；逐题来源与译文/图标权利记录；账号内应用实际差异；完整审核问题逐条真实回应；重新评估十个静态逻辑挑战是否足够解决重复性问题。之后再单独进行签名发行校验、更新 1.1 商店截图/文案/隐私准确性和发行资料。旧 Release 目录是历史记录，未冒充 1.1 完成状态。

本轮禁止的上传、App Review 提交和公开发布均未执行。没有更改开发者身份或 Bundle ID，没有覆盖旧工作副本未提交资料。隔离克隆中 `flooring/index-v094-FASTBOOT.HTML` 的大小写文件冲突未纳入本次提交。

## 原始证据位置

- iPhone 18 Pro / iOS 27.0 完整通过：`/Users/zhangjohn/Library/Developer/Xcode/DerivedData/RUNLUTwist-dinfacskxenkwxaclnwovmfhmyod/Logs/Test/Test-RUNLUTwist-2026.10.28_21-05-50--0600.xcresult`。
- 追加 iPhone 17e / iOS 26.5 首轮：`Reports/remediation-compact-incomplete.json`（一个查询失败、下一用例由开发者取消，不等于完成全套），启动摘要 `Reports/remediation-compact-startup.log`。日志包含首次8/8 QA、重开 Game ready、隐私往返 Game ready；不能将该查询失败叙述成已经证实的持续白屏。
- 英文/中文实际模拟器附件：`ios/RUNLUTwist/Reports/remediation-screenshots/`。

## 最终小屏/横屏复测结论

- iPhone 17e / iOS 26.5 全套记录：6 PASS / 1 FAIL；原生恢复、损坏数据、双语/重置、暗色、分享、隐私往返均通过。
- 修正后的横屏单项：**PASS，1测试/0失败**，`Reports/remediation-landscape-final-summary.json`；实际选择 Reasoning/Reflection、重置 Studio、选 BLUE、旋转、点击进入 Challenge 2 / 10。原完整运行仍如实记为失败，不改写为“同一次7/7”。
- XCTest 对 iOS 26.5 旋转后控件的 activation point/可见边界判断不可靠；测试按实际 frame 定位点击，以关卡确实变化作为验收断言。保留前后截图。
- **横屏截图视觉证据受限**：导出的 XCTest PNG 有明显黑区/方向及裁切异常（原始 PNG 2532×1170），不能把这个附件当成“完整横屏布局正常”的证明。浏览器横屏布局通过，模拟器横屏功能导航通过；实际 iPhone 横屏显示仍 NOT TESTED。随后以 Xcode 正常 Run（非测试）在 Device Hub 直接旋转并滚动，已观察到横屏首页与底部内容全宽显示、无该黑区；这支持截图链路异常的判断，但不替代真机横屏验收。
- 最终单项 xcresult：`/Users/zhangjohn/Library/Developer/Xcode/DerivedData/RUNLUTwist-dinfacskxenkwxaclnwovmfhmyod/Logs/Test/Test-RUNLUTwist-2026.10.28_21-29-42--0600.xcresult`。

工程功能候选可继续进行内部真机验收；**尚不具备直接上传/重新送审的最终验收条件**。尤其不能略过横屏视觉核验、版权/来源证据及4.3差异化门槛。

补充：直接运行 iPhone 17e / iOS 26.5 再次记录 Game ready，横屏首页/底部人工目视通过；中间区域的完整视觉与 VoiceOver/最大字号仍留作真机验收。当前运行保留在该模拟器，未产生发行上传。
