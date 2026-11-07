# RUNLU TWIST 1.1 (4) — 本地真机测试

候选代码：107ec9dd29b48a261b66e95988d27eedb7182f79。没有上传TestFlight或提交审核。

已生成签名Release Archive与DevelopmentExport/RUNLUTwist.ipa，签名为原Team F2J2Z8H2L4 / ca.runlu.twist。开发描述文件仅覆盖现有1台注册设备；其他iPhone可能需要开发者更新设备注册/描述文件，不能直接假定可安装。

当前 Device Hub 对 JohnZ’s iPhone（iPhone16 Pro Max / iOS27.2）显示需要 Developer Mode。请在iPhone上自行打开“设置 → 隐私与安全性 → 开发者模式”，按系统指引重启并确认，解锁设备并信任这台Mac。这是设备安全设置，代理未代为更改。

随后在 Xcode / Device Hub 的设备应用安装入口选择本目录 DevelopmentExport/RUNLUTwist.ipa，或从现有工程选择真实iPhone运行。若使用工程运行以验证此Release候选，请将Run配置设为Release，并确保无 -twist-qa-* 测试参数。不要在真实手机上执行会重置测试数据的自动QA入口。

安装前保留现有游戏进度；如系统提示必须删除现有应用，请先停止，避免丢失本机数据。开发签名覆盖安装/升级能否保留TestFlight数据必须在手机上实测，未预先标PASS。

请记录以下每项 PASS / FAIL：

- 冷启动无持续白屏；英文/简中切换、重开恢复。
- 20经典题及10逻辑挑战，选择反馈/解释一致。
- Reasoning Lab与揭晓后的Reflection可选择并保存。
- 前后导航、取消与确认重置、分享、隐私/支持往返。
- 杀掉App重开、升级保存、飞行模式冷启和完整玩法。
- 横屏/竖屏、较小屏幕、最大字号。
- VoiceOver连续焦点顺序、题干/选项朗读、选择/揭晓/反馈播报、双语发音及退出/重开。

发现失败请保留截图、设备/系统版本、复现步骤及实际结果。当前只是内部真机候选，不代表通过正式发布验收。
