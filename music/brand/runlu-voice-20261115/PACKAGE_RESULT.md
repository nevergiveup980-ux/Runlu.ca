# 首版试听包 · 2026-11-15

用户要求继续后，完成免费离线复核和现有音频整理，没有新增音乐生成。

## 交付

- 本地压缩包：`media-local/runlu-voice-listening-pack-v1/RUNLU-Voice-Listening-Pack-v1.zip`
- 手机下载运行：https://github.com/nevergiveup980-ux/Runlu.ca/actions/runs/43754307121
- Artifact：runlu-voice-listening-pack-v1-43754307121，ID14176903918，保留14天。
- 压缩包8,237,143 bytes，SHA-256 `c9d524c747fcd43adb755467e562a852ae76d90e503a74ab80ff7afee6c30003`。
- 内容：两首原始MP3、中文歌词、研究与创作标准、实际生成记录、试听记录表、曲目清单、文件校验值及阅读说明。未把分析WAV当作高品质原生母带交付。

## 验证

- 两首源文件再次核对原始字节数与固定SHA-256，通过；打包不改变MP3。
- 本地ZIP CRC与逐文件读回通过。
- 远端离线打包成功，下载后ZIP SHA-256与本地完全一致；内部所有文件校验值和CRC再次通过。
- 运行明确传入execute_paid_generation=NO：package-existing-audio成功，runlu-voice付费生成作业为skipped。新增provider请求0次，打包作业不使用Gemini Secret。GitHub托管本身可能受账号Actions用量规则影响，不将其称为平台费用已核实为零。

## 峰值复查的范围

Mac afconvert浮点32位解码：两首样本峰值均0 dBFS，无超过1.0幅度的样本，格式44.1kHz双声道；本地记录见float-peak-review.json。该解码器的输出不代表原始未压缩源，样本峰值不是重建真峰值；不能据此证明无源削波、无可闻失真或母带合格。保留原始MP3，未做增益、限制器、重编码或重新生成。

审美、无声乐纯音乐、男女声分配、中文实际发音、共同主题与吉他呼应仍需实际试听。记录表没有预填通过或分数。保持草稿PR；没有合并main、部署、公开发行、覆盖旧歌或写入云端歌曲库。
