# API 参数核验 · 2026-11-14

核验方式：读取仓库实际发送请求的代码，并浏览官方文档。**没有调用生成端点、读取密钥、触发workflow或验证账户可用性。** “官方支持”不等于本账号请求已成功。

官方来源：
- https://ai.google.dev/gemini-api/docs/music-generation （实际跳转 https://aistudio.google.com/docs/music-generation ）
- https://ai.google.dev/gemini-api/docs/models/lyria-3.5 （实际跳转 https://aistudio.google.com/docs/models/lyria-3.5 ）
- https://deepmind.google/models/lyria/ （时长上限说明）

| 项目 | 核验结论 | V3处理 |
| --- | --- | --- |
| 模型/入口 | 官方支持 `lyria-3.5` 经 Interactions；现有 generate_full_song.py 使用 v1beta/interactions | 仅保存提示词，不发请求 |
| 请求字段 | 官方REST示例 `model`、`input`；Content-Type、Api-Revision: 2026-05-20、x-goog-api-key，与脚本一致 | 不编造歌手/BPM专用字段 |
| 短预览 | `lyria-3-clip-preview`为30秒，不能代表整曲 | 不生成，也不以片段冒充全曲 |
| 时长 | 以文本或时间戳描述；产品说明最多3分钟 | 50小节约171.43秒为目标；输出长度必须实际检查 |
| BPM/调性/歌词/双声部/精确音符 | 本次核对的Lyria 3.5文档未给这些内容的独立硬控制字段 | 放在input，属于软要求；逐字逐音遵循和男女准确分配未获实测保证 |
| 格式 | 默认MP3；文档另述response_format支持WAV | 本轮无格式请求，不将扩展名视为音频验证 |
| 响应 | 官方steps内model_output/content/audio/data及SDK output_audio | 现有full_song提取首个内联audio；多块输出是否完整需后续集成测试 |
| 账户/计费 | 不读密钥，不访问账户/额度，不发生成POST | 权限、实时价格、实际收费均未验证，不声明免费 |

仓库限制：`generate_preview.py` 的voice含duet、style含blues_pop，但没有romantic_rock；其duet默认女声描述为alto，与本曲清澈女声也不完全一致。`music-studio-tools/job-contract.mjs` 的实际校验仅允许female/male/instrumental及nostalgic/folk/piano/cinematic，故现有job接口不能原样接纳本曲。`docs/RUNLU_MUSIC_MVP_API_CONTRACT_V01.md` 是旧提案，不是可调用后端证明。

V3谱面schema与旧生成项目schema分开，三份prompt是人工审阅文本，没有一键生成入口。没有借用Lyria RealTime配置字段；不得把其他模型的bpm、scale等参数套进此请求。后续若获批准，先完成适配与单次预算确认，再人工启动一次；不自动重试，不自动分段续写，不宣称能精确复刻谱面。
