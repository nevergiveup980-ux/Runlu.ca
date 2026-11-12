# RUNLU MUSIC STUDIO V2 — 开发交付与配置审批

本次是独立免费验收版本，入口 `music-studio-v2.html`。未上线、未合并、未调用收费生成。

## 已实现
- 已有 MP3 导入 → 浏览器原生播放器（播放、暂停、拖动、时长）→ Download MP3 → IndexedDB 保存 → 刷新重播。
- 每次导入创建 UUID；保存 title/version/createdAt/generationStatus/audioReference/duration/downloadStatus，使用 add 防止覆盖。导入状态为 imported，不伪称生成成功。
- 音频格式头及可播放时长校验，50 MB 上限；坏文件不保存，存储及下载异常可见。
- 文件名包含歌曲名称和版本；下载状态仅记录 requested，不宣称系统已保存。
- 本机音频没有公开 URL，也不会上传。共享浏览器可访问，不是账号访问控制，清理网站数据可能删除。
- 服务器歌曲库增加版本、时长、下载可用状态；私人签名下载支持歌曲标题，旧调用保留兼容。
- 独立 V2 JSON，保留原 V1 配置和主题核心句。180–210 秒、72 BPM、E minor、声部为提示词目标，不保证精确控制。既有 Interactions 请求仅发送 model/input，没有杜撰参数。

## 未完成及上线阻塞
- Generate → Play 的线上集成、后台持久化与账号库、真实 RLS/存储鉴权验收。
- 新 V2 音频生成及完整听感验收（禁止自动收费）。已有 V1 不是 V2 成品。
- 真实 iPhone Safari 验收。本机 Chromium 手机尺寸检查不能代替真机。
- 浏览器校验不是完整解码器；服务器入库应完整解码并核对文件哈希，随后才标记 completed。

## 待批准方案（未执行）
优先复用现有 Supabase Auth、数据库及 Storage。仓库历史审查记录指出音乐表与私人桶尚未配置；本轮没有查询线上状态或执行迁移。R2 文件策略是公开媒体规划，不用于私人歌曲。

1. 先只读核对现有项目、配额、Auth 与音乐表，避免重复配置。创建私人桶 `runlu-music-private`，关闭 public，不连接公开媒体域名。
2. 新建 owner-scoped 歌曲及版本表：song_id、version_id(UUID)、owner_id、title、version、created_at、generation_status、object_key、duration、sha256。唯一约束禁止旧版本覆盖。对象路径复用 `owner_id/version_id.mp3`，upsert=false。
3. 表和 storage.objects 均启用 RLS，限定 auth.uid()=owner_id（对象按 owner 文件夹）。用户不能直接把 pending 改为 completed；仅可信服务在完整验证和持久上传后完成状态。
4. 同源 API 校验会话和所有权：GET library、GET song、GET audio access。生成完成只返回已入库版本；失败无音频引用，超时 needs_review，不自动重试。短期签名 60–120 秒，过期时重新鉴权，不生成新歌。签名 URL 是临时 bearer 权限，持有者在有效期内可使用，不声称不可转发。
5. MP3 流支持 Range/206/Content-Type audio/mpeg；下载带安全文件名，响应 no-store；严格需要即时撤权时通过鉴权代理流转，不直接签名。服务端密钥只放服务器环境，不放浏览器。
6. 不新增信用钱包，不改已有 Stripe/积分；收费生成保持关闭。后续逐次明确批准付费请求。

需要批准：音乐表迁移、私人桶/RLS 配置、受保护 API 接入、相应服务器配置。优先现有额度；存储、流量或函数超额可能收费，须先核对用量，不保证永久免费。暂不需要提供任何新密钥；如实施时确需密钥，仅通过安全配置。

依据：
- https://supabase.com/docs/guides/storage/security/access-control
- https://supabase.com/changelog.md
- https://aistudio.google.com/docs/music-generation

## iPhone 待用户验收
在经批准的测试地址（HTTPS）用真实 iPhone Safari：
1. 导入已有 V1 MP3，保存后播放、暂停、拖到中间，检查时长和音量。
2. 点击 Download MP3；若出现预览/分享，选择存储到“文件”，在“文件”中检查歌曲名与 V1 后缀，并离线播放。
3. 同一 MP3 另存 V2 测试版本，确认 V1 仍在；刷新、关页重开后分别试听下载。此 V2 标签不代表已生成新编曲。
4. 导入伪装 MP3 和无效文件，确认提示且不增加歌曲。
5. 核对竖屏按钮、文字、播放器，确认没有横向溢出。
6. 正式账号 API 接入后，另验未登录/另一账号拒绝访问、签名过期可重新鉴权、网络失败可见、刷新账号库可重播。

## 免费测试命令
`node --test music/*.test.mjs music/v2/*.test.mjs`

`python3 music-studio-tools/test_golden_echoes_offline.py`

`python3 music-studio-tools/generate_full_song.py --project music-studio-tools/when-the-lights-go-down-v2.json --output /private/tmp/when-the-lights-go-down-v2.mp3`（无 --confirm-paid）

浏览器：安装 Playwright/Chromium，设置 RUNLU_TEST_MP3 指向仓库外已有私人 MP3，运行 `python music-studio-tools/test_v2_browser.py`。不将音频上传到 CI。

## 本轮实际测试结果（2026-11-11）
- Node：61/61 通过（含所有权、失效链接、失败不成功、并发不重复收费模拟；不代表线上 RLS）。
- Python：使用临时 Playwright 环境运行 unittest，17/17 通过。系统 Python 初次因缺 Playwright 导入失败，已在临时环境解决。
- V2 dry run：4144 字符提示词，明确 DRY RUN ONLY；未创建 V2 音频、未调用提供商。
- 现有 V1（Actions run 43129133270）读取为真实 MP3，44.1 kHz、双声道、约 182.5 秒、192 kbps；仅存于仓库外临时目录。
- 桌面 Chromium 148 实际测试：播放时间前进、暂停/跳转到 30 秒、刷新重播、下载文件 SHA-256 与源文件一致、标题-V1 文件名、V1/V2 同时保存、假 MP3 不入库、独立浏览器上下文无本机歌曲。
- 390×844 页面截图已视觉检查，无横向溢出，下载按钮至少 44px；不是 iPhone Safari 测试。
- 初次浏览器测试等待条件被 CSP 拦截，修复测试为函数条件，未放宽 CSP。
- 最终浏览器脚本使用 AudioContext.decodeAudioData 完整解码 V1 文件，确认双声道且时长超过 180 秒，通过。系统 afconvert 转码未成功，不列入通过证据。
- 未修改主站入口、V1 页面和 V1 配置；未提交克隆产生的 flooring 大小写冲突差异。
