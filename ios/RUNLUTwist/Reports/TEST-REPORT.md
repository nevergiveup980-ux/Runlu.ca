# RUNLU TWIST iOS — 实测报告

日期：2026-10-24（America/Edmonton）。Xcode 27.1。网站原始代码基线：`c83ddabb024f629321df80f43ead17253c48bc2d`。

## 已验证

- iPhone 真机 SDK Release 编译成功；带 Apple Development 签名的 Archive 成功；`codesign --verify --deep --strict` 通过。开发签名不等于 App Store 分发验证。
- 独立 Node VM 游戏逻辑检查 7/7：20道完整双语题、20题完成/195分/回顾/重置、原生备份消息与纯文字分享、语言保存、重开恢复及自评更改、异常存档过滤、取消重置。此项使用 DOM stub，不代替浏览器或真机。
- 最终源码提交 `104710b28c62c3d6bcd74dc3d96c9c35e807e5fb` 的 GitHub Actions `40136637716`（初次完整记录：`40136038016`）：打包页面 Chromium 15/15、WebKit 15/15，通过；云端 iOS 编译通过。包含320px/375px宽度溢出、触摸流程、20题积分、存档、焦点、异常数据。
- iPhone 18 Pro / iOS 27.0 Simulator：中文切换与重开保留、提示/自评、原生重置确认及取消、横屏、揭晓、退出重开后的恢复、原生分享面板通过（2项 XCTest，`15-41-10` result bundle）。
- iPhone 18 Pro Max / iOS 27.0 Simulator：4项 UI 测试通过（`15-47-02` result bundle）：外观截图、双语与重置、重开/分享、离线隐私页返回存档。最初的“深色截图”只验证启动，人工看图发现仍是浅色，因此该轮不能作为深色外观证据；随后增加原生外观同步及截图像素断言，修复后的 `15-56-30` result bundle 4/4通过，包含对实际截图背景像素的暗色断言；人工复核已确认深色页面。最终结果见 `final-max-ui-summary.json`。
- 游戏通过本地 file URL 加载，20题/样式/隐私/支持全部打包。游戏 CSP 的 default-src 为 none，未引用远程脚本/字体/图片；模拟器实际运行无需游戏服务器。未做物理断网/飞行模式实验。
- 截图由实际 XCTest 附件导出，Pro Max竖图1320×2868、横图2868×1320，无透明通道。没有生成概念截图或拉伸小图。

- 最终源码 `104710b` 在 iPhone 17e / iOS 27.0 Simulator 完成4/4项XCTest，涵盖真实深色截图像素、确定的中英文切换及截图、重置/提示/自评、重开与原生分享、隐私页往返。见 `final-compact-ui-summary.json`。

## 失败、修复与限制

- 最初自评控件被测试错误定位为 Button；实际 WebKit 无障碍类型是 Switch（aria-pressed）。修正后通过。
- 首次语言测试在页面加载前选择了控件定位，导致查询错误；增加等待后通过。
- App内隐私/支持导航可能使用启动时的旧原生快照：已在每次保存时刷新后续页面注入脚本，隐私页往返测试通过。
- 本地 Playwright 的30项浏览器运行因沙盒无法启动浏览器进程而中断，不能记作产品回归失败或通过；相同打包页面在GitHub Actions完成上述实际浏览器测试。
- CoreSimulator命令行服务连接失败；改用Xcode图形界面执行真实模拟器XCTest，结果与附件通过xcresulttool读取。
- Xcode列出 JohnZ’s iPhone，但真机测试停留在启动阶段，没有完成结果，已取消等待。真机测试未通过、也未声称通过。
- VoiceOver真人朗读顺序、最大辅助文字级别、系统深色切换全过程、物理断网、全20题真人双语编辑验收仍待完成；不宣称已取得无障碍支持认证。

## 网站 CI 与隔离

只新增 `ios/RUNLUTwist/` 独立工程及其CI；网站根 `twist.html` 和其他业务页面未修改。通用四语言网站检查会误扫iOS包内的双语HTML，因此仅将 `ios/RUNLUTwist/` 加入其既有应用目录排除列表。对比验证：新增iOS目录产生的10条误报被移除，113条原有网站问题保持完全一致，不隐藏其他网站错误。Site integrity 仍失败，不与TWIST测试混淆。

Apple截图规格与隐私信息依据：
- https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/
- https://developer.apple.com/app-store/app-privacy-details/

## 最终源码 CI

- [iOS package / browser suites + iOS build](https://github.com/nevergiveup980-ux/Runlu.ca/actions/runs/40136637716)：success。
- [Original TWIST browser suite](https://github.com/nevergiveup980-ux/Runlu.ca/actions/runs/40136637720)：success。
- [Site integrity](https://github.com/nevergiveup980-ux/Runlu.ca/actions/runs/40136637731)：failure，原有网站四语言问题，不作为iOS通过结果。
