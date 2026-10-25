# RUNLU TWIST 1.0.0 (3) 最终上架准备检查

检查日期：2026-10-25，America/Edmonton。沿用 Apple ID 6826695667、Bundle ID ca.runlu.twist、现有 Xcode 工程及 PR #339。没有增加功能或重新构建替换候选版本。

## 结论

Apple 的 Add for Review 校验已通过，并创建草稿审核清单：**Item Ready to Submit → iOS App 1.0.0 (3)**，草稿于当日 11:51 创建。最终 Submit for Review 未点击，应用未提交审核、未公开发布。发布方式保持 Manually release this version。

应用级必填项已完成，当前校验未报告缺项。账户级 Part XX 税务合规与新版付费协议仍需账户持有人核对，详见下方；本报告不保证后续最终提交或苹果内容审核一定通过。

## 已通过及已完成

| 项目 | 检查结果 |
|---|---|
| 发布候选 | 正式版本关联由 Build 1 改为 **1.0.0 Build 3**，已保存；草稿审核清单明确显示 1.0.0 (3) |
| 真机验收 | 用户在本聊天明确确认 Build 3 已通过其 iPhone 体验验收；记录为用户验收，未虚构机型、iOS 版本或额外测量数据 |
| TestFlight | Build 3 完成处理，在现有 RUNLU TWIST Internal QA 中显示 Testing；1 tester、3 builds |
| 英文商店资料 | RUNLU TWIST；副标题 20 riddles. Think differently.；描述和关键词已核对，说明离线、20题、双语、自评、探索积分，不宣称自动判断答案 |
| 中文商店资料 | RUNLU TWIST 润庐脑洞；副标题 20道经典脑筋急转弯，中英双语；描述和关键词完整，与玩法一致 |
| 截图 | 旧首页说明已替换。英文 medium iPhone 1张：build-3-English.png；中文 medium iPhone 3张：build-3-Chinese-answer.png、build-3-Chinese.png、build-3-dark.png。均来自本次 Build 3 XCTest 的真实模拟器截图，1206×2622。大屏 iPhone 配置显示 Using Existing Assets，复用当前资产 |
| 隐私政策 | https://runlu.ca/twist-privacy.html 在线可访问，中英文内容核对通过；两种商店语言均保存此链接 |
| 支持网址 | https://runlu.ca/support.html 可访问，提供产品/版本/机型问题说明及 support@runlu.ca 联系入口 |
| App Privacy | Data Not Collected；用户确认 Apple 发布承诺后已发布，页面显示 Published ... by john zhang |
| 隐私实现 | 无账户、广告或分析/追踪 SDK；进度和语言偏好本机保存；原生分享由用户选择目标。隐私清单 NSPrivacyTracking=false、无收集类型，UserDefaults 原因 CA92.1 |
| 内容权利 | 用户明确确认“含经典内容且获准使用”；Apple 保存为 Yes, this app has the necessary rights to its third-party content。版权 2026 RUNLU |
| 年龄分级 | 已保存 4+（172个国家/地区），巴西 General Audiences、韩国 ALL、越南 00+；较早系统为4+并有地区例外 |
| 出口合规 | 候选归档 ITSAppUsesNonExemptEncryption=false；使用 Apple 系统框架，无自定义非豁免加密。Build 3 已处理并通过当前提交前校验，未出现出口资料缺项 |
| 审核资料 | 用户提供的审核联系人已填写并保存；无登录要求；审核说明已保存。联系方式不写入公共 GitHub 报告 |
| 价格 | 依据既有免费定位设为 $0.00，价格确认完成 |
| 地区 | 按用户选择保存为174个国家/地区，China mainland 未勾选；实际界面显示 Availability (174 Countries or Regions)，Available on App Release；未设置预购 |
| 设备分发 | iPhone 首发；关闭 Mac App Store / Apple Vision Pro 兼容分发选项并保存；公共 App Store 分发方式不变 |
| 发布控制 | 手动发布，最终 Submit for Review 未点击 |

## 工程与测试依据

- 现有归档：RUNLUTwist-1.0.0-3.xcarchive。Bundle ID ca.runlu.twist；version 1.0.0；build 3；Team F2J2Z8H2L4；arm64；UIDeviceFamily=[1]；最低 iOS 17.0；en / zh-Hans。
- Xcode 和 XcodeGen 均为 Build 3。Build 2 的 GameWebView.swift 白屏修复保持不变：规范化 Bundle 路径、限定 Web 目录读取权限、导航/JavaScript 错误诊断及题目渲染检查。
- 已有 Release 编译、签名归档及包校验通过；4/4 XCTest UI 回归（iPhone 18 Pro / iOS 27.0 模拟器）、7项游戏逻辑检查、符号链接路径回归通过。本轮候选内容未改动，因此未重复无必要的编译或制造新构建。
- HTML SHA256：3719ce80d0f07f8389c6091cb66b176e67f3a2b8cf50c09247c90c917af79d7f。
- 本轮命令行额外执行的严格证书信任校验在当前环境返回 CSSMERR_TP_NOT_TRUSTED；没有据此宣称本地证书链验证成功。发布签名可用性以已成功上传、Apple 处理完成、TestFlight Testing 和本轮候选校验为依据。
- 证据界限：Build 1 原始真机白屏触发日志仍未获得；用户对 Build 3 的真机验收已通过，不将先前推断追溯描述为已证实的 Build 1 根因。

## 仍需账户持有人处理或确认

1. **Business → Compliance → Part XX of the Income Tax Act：Missing Info。** 表单问的是“你的任何应用是否在任意国家/地区提供 personal services”，覆盖整个开发者账户，不能只依据本游戏代答。请账户持有人自行按实际业务填写；不要在聊天中提供税号等敏感税务信息。当前 Add for Review 校验没有将它列为应用资料错误，最终 Submit 是否另有账户门槛尚未执行验证。
2. **Paid Apps Agreement：Active (New Agreement Available)。** Free Apps Agreement 为 Active；欧盟 DSA 为 Active。新版付费协议属于账户级法律条款，未代为接受；请账户持有人查看并按需处理。本游戏免费且无内购，不能仅据新版提示断言它必然阻止本次免费应用提交。
3. **正式审核提交仍未获本次授权。** 当前草稿已就绪；你确认账户事项并另行授权后，才可点击 Submit for Review。苹果审核通过后仍须你另行授权手动公开发布。

## 非提交阻塞的工程事项

PR #339 仍为 draft/open，GitHub 元数据 mergeable=false。修复和最终准备报告在该 PR 分支上；本次没有合并 PR、解决与主分支的既有冲突或改动其他产品。该 Git 状态与 Apple 已上传的 Build 3 候选相互独立。
