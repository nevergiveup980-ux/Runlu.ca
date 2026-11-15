# 润庐之声 · 两首专属作品

2026-11-15 · 独立创作任务 · 用户授权自动制作，保持各一次、无自动重试。

1. **《润庐之声》 / The Voice of RUNLU**：完整纯音乐，温暖钢琴与抒情电吉他对话，弦乐、旋律贝斯与克制现场鼓渐入。54小节、74 BPM、D大调带B小调色彩，目标约2:55。没有哼唱、合唱或说白。
2. **《有光的地方，就是家》 / Where the Light Is, There Is Home**：完整原创中文男女对唱，成熟温暖男声、清澈深情女声，歌词写耐心陪伴与自然成长；“润庐”只在两段副歌自然出现。目标同样约2:55。

共用两小节主题 `D–E–F#–G–A | F#–E–D`，以乐句回归建立认同感。其音高、节奏与段落见 project.json；主题是书面创作目标，不保证两次独立生成逐音一致。不是把旧歌曲换名或覆盖。

- RESEARCH.md：研究原文、边界和创作推论；没有“人人都会喜欢”的承诺。
- LYRICS.md：完整中文歌词与声部分配。
- project.json：两首段落与时长、书面品牌主题。
- 两份 .prompt.txt：独立完整提示词。
- generate_once.py：从之前已实际使用的V3脚本移植的单次传输，固定两首、不重试、不覆盖。
- verify.py 与 test_generate_once.py：离线检查，不发真实请求。

## 接口核验和成本

2026-11-15读取[官方音乐文档](https://ai.google.dev/gemini-api/docs/music-generation)及[价格](https://ai.google.dev/gemini-api/docs/pricing)：使用 `lyria-3.5`，`POST /v1beta/interactions`，字段model/input，Api-Revision为2026-05-20，默认MP3。时长、BPM、调性、主题音符、独奏和声部分配为input软要求，不是硬控制字段。[模型产品页](https://deepmind.google/models/lyria/)说明最长约3分钟；输出必须实际核查。官方标价0.08美元/首，两次预计0.16美元，实际账单未验证，失败也不能自动认定未收费。

## 隔离和保存

分支 feature/runlu-voice-brand-music-20261115 从V3共同基础 f1dda51 建立。仅新增本目录及分支版 `.github/workflows/music-first-full-song.yml`；该工作流路径在默认分支已注册，通过 --ref 指定本开发分支执行，默认分支原流程不变。没有改V3的工作流或旧歌词。

工作流仅手动触发、限制当前分支和首个attempt，不在push/PR事件运行，不merge main、不部署、不写云端歌曲库。遇到首个生成失败即停止，保留已有产物，不自动补单或退款。音频放在git忽略的media-local，不提交公开源码；Actions artifact保留14天。结果单独记录，不将文字方案标成音频。
