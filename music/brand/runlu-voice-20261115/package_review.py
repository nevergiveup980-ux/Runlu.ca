"""Package existing, hash-verified audio only. No API, secrets, or overwrite."""
import argparse
import hashlib
import json
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parent
TRACKS = [
    ('runlu-voice-instrumental', '01-润庐之声（纯音乐）.mp3',
     '71b3a7ce419aaa208b244c3e5b65c4c68946f285dc56076c7c80da0fa0b53947'),
    ('where-the-light-is-home', '02-有光的地方，就是家（中文对唱）.mp3',
     '7e92da5e54a598d8c923df125248b11b80497479a183b2836d84dd43431445d6'),
]
README = '''润庐之声 · 首版试听包 · 2026-11-15

01 润庐之声（纯音乐）——实际2分50秒。
02 有光的地方，就是家（中文男女对唱）——实际2分55秒。

两首都是已经生成的真实MP3，44.1kHz立体声。文件与首次生成原件字节完全一致，没有重新编码、拉伸、补静音或重新调用音乐生成API。

第一次：完整听完两首，先感受是否想再听一次。
第二次：查看“试听记录表.txt”，记录最喜欢和最想改的时间点。生成器的声部分配、无声乐纯音乐、主题呼应都是创作目标，仍需实际试听确认。

附有完整歌词、研究与创作说明、验证记录及SHA256SUMS.txt。
歌词文件是创作稿，不是逐字听写或带时间轴字幕。
技术检查通过不等于音质、演唱及审美验收通过。原件峰值接近满幅，尚未完成母带/真峰值验收；本包不声称是已母带化的发行音源。

本次只整理现有文件，没有新增Gemini生成费用。没有合并或部署网站，没有公开发布音频。
'''
LISTENING = '''润庐之声 · 试听记录（待用户填写）

请先听，再记录；没有预先打分，也没有多数人一定喜欢的结论。

一、《润庐之声》纯音乐
1. 听完能否哼出一个主题？最有记忆点的时间：
2. 钢琴和电吉他是否有来有往，独奏是否仍围绕主题？
3. 全曲是否真正没有歌声、哼唱或说白？
4. 情绪是否逐步展开，结尾是否自然？
5. 听起来是否温暖、耐心、有滋养感？

二、《有光的地方，就是家》中文对唱
1. 男声、女声及合唱是否准确自然？
2. 是否听清“有光的地方就是家”和“润庐”？
3. 歌词是否有漏字、加字、吞字或不自然重音？
4. 副歌是否好记，吉他是否给人声留出空间？
5. 品牌感是否自然，是否愿意完整再听一次？

共同检查：
最喜欢的时间点：
最想改的时间点及原因：
是否听到刺耳、过响、失真或音量不舒服：
优先选择：保留首版 / 免费整理剪辑 / 提出具体创作修改（新生成需另行明确）

两首是否听得出共同的短旋律？若听不出，请如实记录，不因书面提示词说有就判定已经实现。
'''

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args=parser.parse_args()
    ledger=json.loads((args.source/'results.json').read_text())
    entries={x['variant']:x for x in ledger['results']}
    files={};manifest=[]
    for ident,name,expected in TRACKS:
        entry=entries[ident]
        if entry['filename']!=ident+'.mp3':raise ValueError('Unexpected source name')
        data=(args.source/(ident+'.mp3')).read_bytes()
        digest=hashlib.sha256(data).hexdigest()
        if digest!=expected or entry['sha256']!=expected or len(data)!=entry['bytes']:
            raise ValueError('Source hash or size mismatch; no package written')
        if entry['state']!='generated_decode_verified_not_listening_approved':
            raise ValueError('Source has no verified audio result')
        files[name]=data
        manifest.append({'file':name,'bytes':len(data),'sha256':digest,
                         'duration_seconds':float(entry['probe']['format']['duration'])})
    files['开始阅读.txt']=README.encode('utf-8')
    files['试听记录表.txt']=LISTENING.encode('utf-8')
    files['有光的地方，就是家-完整歌词.txt']=(ROOT/'LYRICS.md').read_bytes()
    for source,name in [('RESEARCH.md','研究与创作标准.md'),('RESULTS.md','实际生成与验证记录.md')]:
        files[name]=(ROOT/source).read_bytes()
    files['曲目清单.json']=(json.dumps({'collection':'润庐之声','version':'first-listening-v1',
        'source_run_id':ledger['run_id'],'new_generation_requests':0,
        'human_listening_approved':False,'tracks':manifest},ensure_ascii=False,indent=2)+'\n').encode()
    files['SHA256SUMS.txt']=''.join(hashlib.sha256(b).hexdigest()+'  '+name+'\n' for name,b in files.items()).encode()
    # Refuse an existing directory before creating any delivery files.
    args.output.mkdir(parents=True,exist_ok=False)
    archive=args.output/'RUNLU-Voice-Listening-Pack-v1.zip'
    with zipfile.ZipFile(archive,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for name,data in files.items():
            info=zipfile.ZipInfo(name,date_time=(2026,11,15,0,0,0))
            info.compress_type=zipfile.ZIP_DEFLATED
            z.writestr(info,data)
    with zipfile.ZipFile(archive) as z:
        if z.testzip() is not None:raise ValueError('ZIP integrity failed')
        for name,data in files.items():
            if z.read(name)!=data:raise ValueError('ZIP readback mismatch')
    print('PASS: both source hashes and sizes, ZIP CRC and byte-identical readback')
    print('Audio files: 2; new provider calls: 0; archive bytes:',archive.stat().st_size)
    print('Archive SHA256:',hashlib.sha256(archive.read_bytes()).hexdigest())
    print(archive.resolve())

if __name__=='__main__':main()
