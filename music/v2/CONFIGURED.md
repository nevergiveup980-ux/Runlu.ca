# V2 批准后实施记录 — 2026-11-13

> 本文为第二阶段历史记录；V1 已真实归档，最新证据与验收边界见 [LAST_MILE.md](LAST_MILE.md)。

## 已在现有 Supabase 项目应用

用户批准后新增了两项迁移：
- `runlu_music_v2_private_library`：独立歌曲表、版本表、私人桶与 owner RLS。
- `runlu_music_v2_immutable_publish`：保存后不可更新保护、仅 service_role 可调用的原子入库 RPC。

对应可审查 SQL 在 `db/private-library.sql`、`db/immutable-publish.sql`。已应用，不应再次运行这些 CREATE 语句。没有改积分、Stripe、其他业务表或原有存储桶。

私人桶 `runlu-music-private` 非公开，仅 audio/mpeg，单文件最大 50 MiB。客户端只能读取自己的已就绪版本及匹配音频，不允许直接写入或改状态。读取与签名采用当前用户 JWT，再次受到 RLS 检查，不使用服务端密钥。签名有效期 60 秒，链接持有者在期限内可使用；不承诺签名链接即时撤销。

当前数据库音乐表仍为空；没有假成功记录。事务测试的合成用户、版本与对象元数据已全部回滚。现有 V1 目标账号已根据用户提供的邮箱核实为已确认、非匿名账号；账号邮箱及 UUID 不写入公开仓库。

## 本机 API 与页面

运行：

```sh
node music/v2/server/dev.mjs
```

打开 `http://127.0.0.1:4173/music-studio-v2.html`。服务仅绑定 loopback，只提供明确允许的页面文件，不提供 .git、环境文件或服务器源码。

账号登录后调用：
- `GET /api/music/library?limit=20&before=...`
- `GET /api/music/songs/:versionId`
- `GET /api/music/songs/:versionId/access?download=1`
- `GET /api/music/songs/:versionId/audio`（鉴权代理，支持 Range/206）

所有接口服务器验证 Supabase 用户，限制为本人，错误脱敏，no-store。没有收费生成路由；POST 被拒绝。登录令牌仅在页面内存中，刷新后重新登录；退出清空播放器。当前简易验收登录尚不支持 MFA/SSO，需要这些流程的账号不能使用此验收登录。

**本机 API 和页面未部署；没有发布任何新 Edge Function，没有合并 main。** 原主站仍保持现状。

## 可信入库工具

`server/publish_audio.py` 默认只做离线完整 MP3 解码及 SHA-256，不联网。依赖固定为 `miniaudio==1.61`（见 requirements.txt）。

正式写入必须使用 --commit，显式给出 owner/song-id/version-id，并在可信服务器环境中已有 `SUPABASE_SERVICE_ROLE_KEY`。不得在聊天、公开仓库或浏览器中填入该密钥。

执行顺序：完整解码 → 哈希 → 核对 owner 与已有歌曲归属 → 拒绝已存在版本 → upsert=false 上传 → 读回核对哈希 → 原子发布版本。状态为 imported 或 completed，失败没有成功版本；模糊结果需要人工核对，不自动重试。RPC 失败遗留对象仍不可被用户读取，因为对象 RLS 要求匹配的已就绪版本。

当前执行环境没有服务器凭据，因此未上传现有 V1，也没有生成歌曲。不通过数据库伪造 Storage 对象来冒充真实上传。还需在可信运行环境安全配置现有服务器凭据，或另行明确批准受限测试后端的发布；不要求新增付费服务或在聊天提供密钥。

## 实际验证

- Node：67/67，通过原有 61 项及新增 6 项 API 边界测试。
- Python 原有离线测试：17/17；入库故障路径测试：4/4。
- 真实 V1 完整离线解码：182.465 秒，4,386,884 bytes；未上传、未生成收费歌曲。
- 真实数据库 `db/test-private-library.sql`：本人读取、其他账号拒绝、未登录拒绝、匿名账号拒绝、普通账号写入/RPC 拒绝、V1/V2 并存、不可修改已保存版本、无元数据不可假成功；事务整体回滚。
- 本机服务器真实 HTTP：页面/模块 200；无登录/伪造 token 401；.git 和服务器源码 404。伪造 token 由实际 Supabase Auth 校验拒绝。
- 更新后 Chromium 本机 MP3 全流程回归通过：解码、播放/暂停/拖动、刷新、下载哈希一致、双版本、坏文件、独立浏览器隔离与手机宽度布局。
- 账号库浏览器模拟集成通过：登录前无账号请求，登录后读取、未就绪错误、刷新播放链接、实际 MP3 播放及下载哈希、令牌不持久保存、401 清空音频并显示提示。不是实际账号正向联调。
- Supabase 安全 Advisor 检查完成；未返回音乐表/函数告警。其他业务已有告警未作修改，不声称整个项目无告警。

## 待完成

- 安全服务器凭据配置后，将既有 V1 真实上传到已核实账号，并进行真实 JWT、Storage 签名、Range、过期链接和跨账号 HTTP 联调。
- 本机之外的受保护测试 API 发布及 HTTPS 测试地址，需要明确发布范围；不自动生产部署。
- Generate → Play 的生成结果入库连接，以及 V2 新音频品质验收；收费调用仍禁止。
- 真实 iPhone Safari：播放、拖动、下载/分享保存到“文件”、文件名与离线重播、刷新歌曲库。Chromium 手机尺寸不能替代真机。

当前状态：配置已实施，代码可审查；**完整产品尚不可部署验收**。
