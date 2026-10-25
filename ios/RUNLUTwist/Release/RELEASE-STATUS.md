# RUNLU TWIST — 发布状态

更新：2026-10-24，America/Edmonton。**TestFlight 1.0.0（1）已上传并处理完成，内部测试状态 Ready to Test。未提交正式审核，未公开发布。**

- 沿用 PR #339、开发分支 feature/runlu-twist-node-001 和既有 Xcode 工程。
- Bundle ID ca.runlu.twist 已在团队 F2J2Z8H2L4 注册。Apple ID 6826695667，SKU RUNLU-TWIST-IOS-001。
- Xcode Organizer 使用 Cloud Managed Apple Distribution 和 iOS Team Store Provisioning Profile 成功上传；get-task-allow=false，beta-reports-active=true。
- 正确归档：Release/RUNLUTwist-iPhone.xcarchive。导出的实际分发 IPA：Release/TestFlight-1.0.0-1/RUNLUTwist.ipa。SHA256 c1f73ddceb50880e7cdfa425154f978478e1d8be2e0509650e199145852e0ce6。
- ExportOptions.plist 用于本地导出；UploadOptions.plist 来自此次成功的上传配置。原 RUNLUTwist-signed.xcarchive 是失败前的旧构建，不应用于发布。
- 首次上传被 Apple 拒绝：XcodeGen 目标级默认设置把项目级 iPhone 限制覆盖成 UIDeviceFamily=[1,2]。已将两个目标均明确设为 iPhone，重新生成工程、归档并核实实际 UIDeviceFamily=[1]。没有通过虚增 iPad 支持回避验证。
- App Store Connect 已保存英文和简体中文名称、副标题、推广文字、简介、关键词、支持 URL 和审核操作说明。版本1.0.0，手动发布，免登录。
- 已完成年龄问卷：4+，部分地区有例外；非 Made for Kids，无社交、无限网页浏览、广告、赌博或内购。
- App Privacy 已保存 Data Not Collected 草稿；未点击 Publish。无追踪或数据收集 SDK，UserDefaults required reason CA92.1。
- 支持 URL https://runlu.ca/support.html。专用隐私政策拟为 https://runlu.ca/twist-privacy.html，源已备好，尚未确认公开部署；商店隐私 URL 保持未填，不把未上线网页当作有效政策。
- 内部组 RUNLU TWIST Internal QA：最新页面显示 1 Tester / 1 Build，构建 Ready to Test。账号所有者邀请状态 Invited，尚无安装、会话、崩溃或反馈记录。该已存在邀请是在恢复工作后观察到的，未额外邀请其他人。

## 剩余验收与账号事项

在 iPhone 安装 TestFlight 并接受已有邀请，安装构建1，完成真机离线、进度恢复、语言、分享、重置和外观验收。此前直连真机测试没有启动成功，不计作通过。

发布前仍需确认并部署隐私政策、核对内容权利、审核联系人、价格/地区及其他商店合规信息。App Store Connect 有更新协议提示；协议由账号持有人自行审阅接受，本次 TestFlight 上传没有被该提示阻断。不得未经用户确认提交 App Store 审核或公开发布。

截图见 Screenshots/README.md，真实测试结果见 Reports/TEST-REPORT.md。所有签名归档和 IPA 留在本地交付包；GitHub 同步源工程、图标、真实截图、元数据及报告，避免提交签名产物和 provisioning profile。
