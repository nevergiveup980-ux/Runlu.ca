# 实际生成结果 · 2026-11-14

用户后续明确授权 Gemini API 直接付费及自动生成，因此执行 A/B/C 各一次的单批次。没有自动重试。

- 运行：https://github.com/nevergiveup980-ux/Runlu.ca/actions/runs/43651000556
- 执行提交：27ca0ddeb1b71b79d181b4c48668777b0dc512b6；独立V3分支。
- A：真实MP3，172.669333秒，4,151,782 bytes，44.1kHz立体声；SHA-256 `f546660223180d5960efa861dc354fbe9a8afd66ebbfe777e93b9118ec4284b8`。
- B：真实MP3，171.650542秒，4,127,331 bytes，44.1kHz立体声；SHA-256 `11404e134d3910b65e739c2f7638b59ab344def655b3fbb581ceab27d6b79474`。
- C：HTTP 400；没有取得音频，不能试听。未记录响应体，故具体拒绝原因未确定；不能凭状态码推定为额度、模型或歌词问题。
- 整个workflow因C失败标为failure，不等于A/B生成失败。A/B由always上传步骤保留，artifact ID 14136231399，保留期14天。
- 已下载A/B与results.json到被git忽略的本机媒体目录，逐个核对字节数及SHA-256与远端清单一致；Mac afinfo也识别为MP3、44.1kHz双声道。

测试：收费前谱面校验与dry run通过；远端ffprobe检查并用ffmpeg完整解码A/B，均成功。本机下载哈希核对通过。没有完成实际听感、中文逐字对照、男女声分配、旋律与吉他品质验收，不能宣称这些要求已满足。没有C音频，三版音频任务尚未全部完成。

费用：当次官方标价0.08美元/首（https://ai.google.dev/gemini-api/docs/pricing）；三次请求标价估算0.24美元，不是实际账单。A/B及失败C的实际收费均未核实。

没有修改main、合并、部署、覆盖旧歌或写入云端歌曲库。音频未提交到公开源码。使用已注册工作流路径的V3分支版本执行，不改默认分支；该路径在其他分支仍是旧工作流，不能把其他分支的运行当作V3。

停止进一步收费调用，等待用户试听A/B及批准后续处理。不要重跑本批次。初始score.json保持作曲输入状态，实际结果以本记录和产物清单为准。

## 后续用户授权：仅C单次生成成功并下载本地

用户明确要求“继续制作C，然后下载到本地”。在同一V3分支将工作流限定为C一次，未重做A/B，未自动重跑上批次。保持原C提示词，SHA-256 `3d8cb783b13c7237b0fe1cc2b6d51cf3b6dfacdf096fffe011fe9c416da5a449`；没有证据确定首次HTTP 400的原因，后次成功也不能倒推出首次原因。

- 成功运行：https://github.com/nevergiveup980-ux/Runlu.ca/actions/runs/43651493379
- 生成执行提交：068c901；artifact ID 14136411650，保留14天。
- C真实MP3：174.027708秒，4,184,383 bytes，44.1kHz立体声，约192kbps。
- SHA-256：`a490d118fca7f4a00ae35855a9384c0c02733f4644193f36bb19b3851023a86b`。
- 远端ffprobe及ffmpeg完整解码通过；本机下载后字节数、SHA-256与产物清单一致；afinfo识别格式/时长一致。
- 本地文件：`media-local/beyond-city-lights-v3-C-43651493379/beyond-city-lights-v3-C.mp3`（git忽略，不提交音频）。

现在A/B/C都有真实音频；未完成听感、逐字歌词/双声部分配/旋律品质验收。该额外单次请求标价0.08美元，实际账单未核实。未合并main、未部署、未覆盖旧歌。上述“C无音频”是首次批次历史，最新状态以本节为准。

## C 英文版 — 新增单次生成与本地下载

用户要求给C制作英文版。新写完整可唱英文歌词及C-EN.prompt.txt；保留原曲意象、男女对唱、70 BPM/G小调与吉他呼应方向。按英文重音重新演绎，不承诺逐音复制中文录音。

- 运行：https://github.com/nevergiveup980-ux/Runlu.ca/actions/runs/43653727553 ，生成提交08963ef；只发送一次C-EN请求，无自动重试，未重做A/B/中文C。
- C-EN真实MP3：171.441583秒、4,122,316 bytes、44.1kHz立体声、约192kbps。
- SHA-256：`e98a7619e242ecb1a4025bc13c45a4b7a2a8740708cd59c74412f93e6445923b`。
- 远端ffprobe/ffmpeg完整解码通过；本地下载字节数/哈希通过，afinfo识别时长与格式一致。
- 本地：`media-local/beyond-city-lights-v3-C-EN-43653727553/beyond-city-lights-v3-C-EN.mp3`，未提交音频到公开源码。
- dry run验证仅选择C-EN，ABC原选项仍正确选择A/B/C；提交空白检查通过。工作流artifact保留14天。
- 英文发音、逐字歌词、男女声分配、旋律/吉他听感尚待验收。单次官方标价0.08美元，实际账单未核实；无合并main或部署。
