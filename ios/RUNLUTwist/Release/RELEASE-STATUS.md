# RUNLU TWIST — 发布状态

**状态：工程和上架材料已准备；尚未上传TestFlight，尚未提交审核或公开发布。**

- 产品：RUNLU TWIST，iPhone，最低 iOS 17.0。
- Bundle ID：`ca.runlu.twist`。版本1.0.0，构建1。
- 开发团队：F2J2Z8H2L4（由本机Apple Development证书核对）。已生成开发签名Archive；App Store Bundle ID注册归属及分发profile仍需账号确认。
- 工程：`RUNLUTwist.xcodeproj`；XcodeGen源：`project.yml`。无第三方运行依赖。
- Archive：`RUNLUTwist-signed.xcarchive`（开发签名，非可直接上传的App Store IPA）。
- 图标：1024×1024 RGB不透明PNG，附SVG源。App Store中英文字段、关键词、审核备注、更新说明见 `app-store-metadata.json`。
- 隐私：当前代码无收集/广告/追踪SDK，拟选 Data Not Collected。已声明UserDefaults required-reason CA92.1。本机存档、用户主动分享和重置行为在应用内隐私页面披露。
- 支持：https://runlu.ca/support.html 已HTTP 200。专用隐私公开URL拟为 https://runlu.ca/twist-privacy.html，网页源已备好，但没有部署到生产网站。

最终源码：`104710b28c62c3d6bcd74dc3d96c9c35e807e5fb`；iOS package CI及浏览器CI通过。iPhone 18 Pro、Pro Max、17e均有真实模拟器验证；最后17e的4项UI测试全部通过。

Archive与真实截图作为本地交付文件提供；仓库保留源码与报告。

## 实际阻塞

App Store分发导出已尝试，失败日志见 `Reports/distribution-export.log`：
1. `Invalid credentials in keychain ... missing Xcode-Username`。
2. `exportArchive No Accounts`。
3. `No profiles for 'ca.runlu.twist' were found`（缺少iOS App Store分发profile）。

Safari的App Store Connect访问转到登录页（authResult=FAILED），未获得可用登录会话。因此没有创建/修改线上App记录、上传构建或填写未验证的账号信息。

## 继续发布所需

账号所有者在Xcode重新登录Apple Developer，并在App Store Connect完成登录；核对Bundle ID和开发团队，准备App Store分发证书/profile及App记录。补齐审核联系人、权利信息、年龄分级、价格和地区；确认并发布专用隐私网址。真机测试需设备连接可用、解锁且信任开发环境。

这些条件就绪后，可用附带 `ExportOptions.plist` 重新导出、验证并上传TestFlight。TestFlight上传和处理成功后再填写实际构建ID。正式提交审核前，向用户报告最终构建、最终截图、隐私标签和测试状态，取得明确确认；本轮没有执行提交或发布。
