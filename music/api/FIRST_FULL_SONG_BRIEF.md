# RUNLU MUSIC STUDIO — First Full Song Brief

Status: creative brief approved; **no paid generation performed, no MP3 produced**.
Project: RUNLU-MUSIC-STUDIO. Never place API keys in source control or chat.

## Song
- Title: 一路走来，所幸有你
- Language: Mandarin Chinese (simplified characters)
- Target: approximately 3 minutes; **provider-enforced maximum and actual duration must be verified**
- Voice: warm, natural mature male vocal, intelligible Mandarin, emotionally restrained
- Style: original acoustic folk-pop ballad, piano introduction, warm fingerpicked acoustic guitar, subtle strings in chorus, quiet piano/vocal ending
- Musical arc: intimate verse → gently rising pre-chorus → memorable lyrical chorus → reflective bridge → restrained final chorus/outro
- Avoid: imitating identifiable singers or copyrighted melodies; theatrical vibrato; robotic pronunciation; excessive chorus repetition; abrupt cutoff; exaggerated orchestration
- Tempo suggestion: ~74–82 BPM, 4/4, comfortable mid-range vocal. These are creative targets, not guarantees.

## Original lyric draft (pending musical scansion review)
[Verse 1]
那年背起简单的行囊
以为远方会有不一样的光
一路跌跌撞撞，走过风霜
才懂得平凡日子也值得珍藏

[Verse 2]
后来岁月悄悄染白了鬓角
有些梦想还在路上奔跑
多少没说出口的辛苦和煎熬
都被你一句“回来了”轻轻化掉

[Chorus]
一路走来，所幸有你
陪我走过风，也走过雨
那些曾经难熬的日子
回头看，竟成了最暖的回忆

一路走来，所幸有你
让漂泊的心有地方安定
如果岁月还能重新写起
我仍愿，与你一路同行

[Bridge]
我们都曾年轻，都曾倔强
也曾把眼泪藏在笑容后方
如今才明白，最好的时光
不是远方，是有人守在身旁

[Outro]
一路走来，所幸有你
千言万语，化作这一句
等到夕阳慢慢落下去
愿我身边，依然有你

## Provider prompt (candidate, not yet validated against live schema)
Create an **entirely original** Mandarin Chinese folk-pop ballad, approximately 3 minutes if the selected model supports it. Natural expressive mature male singing; memorable graceful melody; acoustic piano and fingerpicked guitar, restrained strings swelling gently in the chorus, intimate ending. Clear accurate Mandarin pronunciation. Sing the provided original lyrics in order; preserve the emotional meaning and avoid padding, excessive repetition, and abrupt cutoff. No imitation of existing songs or artists.

## Release gate
1. Confirm exact current full-song Lyria model ID and request/response schema from official documentation. Do not assume `lyria-3.5` and `lyria-3-pro-preview` are interchangeable.
2. Verify supported lyric control, duration, Mandarin vocals, output format and license/usage terms.
3. Use server-side secret `GEMINI_API_KEY` only, with explicit one-shot live approval; no automatic retry; no public generate endpoint.
4. Test with a single paid full-song request, inspect audio playback, actual duration, pronunciation, ending and billed usage. Do not claim success without an actual MP3.
5. Preserve source audio privately, then decide whether to publish or revise.

## Acceptance criteria
- Actual playable file exists, verified audio MIME/container.
- Track is complete (no abrupt cutoff), clear Mandarin, compelling natural melody, vocals not synthetic-sounding.
- Target duration around 3 minutes, acknowledging model limitations.
- Explicit per-call cost logged without exposing credentials.
