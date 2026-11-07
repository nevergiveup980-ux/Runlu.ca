# TWIST 内容来源与风险逐题清单

日期：2026-11-01。适用于本轮 **1.1 (5) 本地候选**，不是对历史Build3/4的内容声明。原始替换提交 `536199c3cc9c53d86477eca4502f11e90ec50322`；本轮还修正了其遗漏的独立解释数组。

> **2026-11-03 最新状态补充（优先于下文历史统计）：** 本文件最初记录的是替换第1题后、尚有19道经典题的阶段。随后第2–6题已在 `twist.html` 中换为新编应用推理练习。当前20题由**6道新编题（第1–6题）和14道仍待溯源的经典题（第7–20题）**构成。下文第2–6题的公开对照与UNKNOWN结论属于**已撤下旧版本的历史风险记录**，不能误读为当前仍在发布的题目。第7–20题来源与授权状态仍为 **UNKNOWN**；新编不等于已完成作者/权利证明。Build 6 尚未打包或通过真机验收。

## 当前版本内容审核清单（2026-11-03）

| 当前题号 | 题型 | 当前来源状态 | 发布前动作 |
|---|---|---|---|
| 1 | 对话的开启与分享 | 新编；作者/权利链待确认 | 保留创作及人工审阅证据 |
| 2–6 | 箱重、慢钟、排序、地毯、重复扫描 | 新编应用推理；作者/权利链待确认 | 保存题文、计算验证和审阅记录 |
| 7–10 | 名字、针、洞、梳子 | 经典题；UNKNOWN | 逐题补来源与使用依据，无法澄清则替换 |
| 11–14 | 感冒、海绵、地图、年龄 | 经典题；UNKNOWN | 同上 |
| 15–17 | 光、书、河流 | 经典题；UNKNOWN | 同上 |
| 18–20 | 安静、手套、月份 | 经典题；UNKNOWN | 同上 |

**审核口径：** 不把流传广泛当成公版，不把重写措辞当成自动取得授权；本表也不构成法律判断。下一轮优先核实第7–20题，或者将其替换为可记录创作过程的独立推理题，并在发布前同步检查中英文提示、答案、解释与进度迁移。

---

## 下一批原创替换草案：第7–9题（尚未进入游戏，2026-11-04）

以下是待人工编辑审阅的中英文新题草案，**不声称已部署、已验收或完成权利清查**。三题均设计为条件明确、可计算或可枚举的应用推理，而非经典双关谜语。

| 题号 | English question / hint / answer | 中文题干 / 提示 / 答案 | 独立核验 |
|---|---|---|---|
| 7 | A warehouse shelf has 24 identical cartons. Six are moved to packing, then half of those remaining are shipped. How many cartons stay on the shelf? / Subtract the first six before halving. / **9 cartons.** | 货架上原有24箱相同货物。先取走6箱送去包装，再把货架上剩余箱数的一半发走。货架最后还剩多少箱？ / 先扣除送去包装的6箱，再计算剩余的一半。 / **9箱。** | 24−6=18；18÷2=9 |
| 8 | A delivery van must visit A, B and C exactly once. B must be visited after A, and C must be visited before B. Which stop must be last? / Both other stops precede B. / **B.** | 送货车必须恰好访问A、B、C三个站点各一次。B必须在A之后，C也必须在B之前。最后到达哪一站？ / 另外两站都要排在B前面。 / **B站。** | 有效顺序只有A-C-B、C-A-B；末站均为B |
| 9 | A flooring order needs 27 square metres of material. Each unopened pack covers exactly 4 square metres, and packs cannot be split when purchased. What is the minimum number of packs? / Six packs cover only 24 square metres. / **7 packs.** | 一份地板订单需要覆盖27平方米。每包未开封材料恰好可覆盖4平方米，购买时只能按整包计数。最少买几包？ / 6包只能覆盖24平方米。 / **7包。** | ⌈27÷4⌉=7；不含裁切损耗与安装余量 |

**解释草案（需与题目一起写入两种语言的独立 explanation 数组）：** 7: Work from the remaining shelf stock after each operation / 按顺序计算货架库存；8: The two precedence constraints both point to B as last / 两条先后约束均要求B最后；9: Round up whole packs, not down / 整包采购必须向上取整。

**实施前置条件：** 替换 `twist.html` 的 puzzles、zh、explanations 两种语言对应索引6–8；逐题校对；迁移存档时仅清除被替换题目的完成、提示、自评、推理和复盘记录，保留其余题目及 Logic Studio 数据；执行模拟交互及真机回归。当前存档键为 v2，不能直接扩大旧版迁移索引集合而不处理已有 v2 用户。

---

## 核查方式与边界

逐题读取根目录 `twist.html` 的英文/中文题干、提示、答案及独立解释，检查Git初始题集与后续编辑记录，搜索公开相同/类似谜题。完整当前内容冻结于 [CSV登记表](../ios/RUNLUTwist/Reports/build5/classic-content-register.csv)，可用 `Scripts/audit-content.py` 重建。Git能证明本项目何时加入和修改文字，不能证明外部最早作者、合法授权或公版。

下表“公开对照”仅为本轮检索发现的相同/类似题型发表实例，**不是确认RUNLU实际从该页面获取，不是原作者认定，也不是许可证**。没有找到任何逐题授权文件、可核实的原始采集记录、译者/解释作者权利文件，因此19题的英文、中文译写、提示及解释权利均为 **UNKNOWN**。网上常见、教育机构发表或文字短，均不据此标记为公版/已授权。本轮不作侵权或不侵权的法律裁定。

## 新第一题（另列，不算19题清权）

- 当前答案：`A conversation.` / `一段对话。`。题干的开启/结束/分享均按交流的比喻解释，提示引向两人一起开始的事。
- 发现问题：`536199c`更换了双语三元组，独立 `explanations.en[0]` / `zh[0]`仍说年份/房间号。本轮改为解释对话的开启、结束和共同参与，添加实际render/hint/reveal双语断言。
- 来源状态：Git记录本次新写，但完整作者/工具输入与权利关系 **UNKNOWN**；不能将“新写”扩大为“独家原创、绝无相似谜题”。
- 历史Facebook图片是初始灵感披露，不代表其发帖者拥有/许可该经典题。当前候选未打包该图片或旧题；历史档案/报告仍保留溯源，不删除历史证据。

## 剩余19题逐项记录

共同内部证据：初始网页题集 `166fe24`（2026-10-20）及后续双语/解释编辑；每行当前确切文本见CSV对应编号，来源链到此前的外部采集过程仍未知。各行提示和双语解释已阅读核对；本轮未擅自改写这19题。

| 题号 | 题型 / 当前答案 | 公开对照（非授权） | 具体文本/翻译风险及下一步 | 来源/权利结论 |
|---|---|---|---|---|
| 2 | 擦干却变湿 / 毛巾 | [出版社教师资料](https://data.cjfallon.ie/resources/23982-GowiththeFlow-TRB.pdf) | 英语dry的施受关系；当前中文提示/解释需保留具体作者记录，不能据流传时间清权 | UNKNOWN |
| 3 | 键与锁 / 钢琴 | [语言学期刊例题](https://buxdu.uz/media/jurnallar/ilmiy_axborot/2._Tilshunoslik_Ilmiy_axboroti__11_2025_PDF_compressed.pdf) | keys双义；中文“键”是译写，不是原创证明，需说明原始采集与译者 | UNKNOWN |
| 4 | 角落旅行 / 邮票 | [社区刊物题页](https://www.wagincrc.com/uploads/2/4/5/1/24511671/edition_91_final.pdf) | 原题/变体广泛流传；当前提示和信封解释仍需来源记录 | UNKNOWN |
| 5 | 脖子无头 / 瓶子 | [学校刊物](https://cdnbbsr.s3waas.gov.in/s3kv060b4d21a7c5ea813cf371ba2ab7d0/uploads/2024/09/2024092939.pdf) | neck/瓶颈的译写、餐桌提示不能据常见而称已授权 | UNKNOWN |
| 6 | 手不拍手 / 钟表 | [报刊谜题页](https://theglobaltimes.in/archives/December14_2020.pdf) | hands=指针只在英文自然成立；中文引号/解释说明联想，需核查具体措辞作者 | UNKNOWN |
| 7 | 自己拥有别人常用 / 名字 | [科大刊物](https://offcamphouse.hkust.edu.hk/uploads/newsletters_pdf/8dc294c9805d9125cf85677c98c9b567.pdf) | 题干相似公开表达；提示和中文译文无许可凭据 | UNKNOWN |
| 8 | 一眼不见 / 针 | [报刊谜题页](https://theglobaltimes.in/archives/December14_2020.pdf) | eye/针眼双义自然对应；不能据词义常见推断具体文本授权 | UNKNOWN |
| 9 | 取走反变大 / 洞 | [出版社教材](https://www.stanfordhouse.com.hk/uploads/Traditional%20Folk%20Songs.pdf) | 取走的是土而非洞本身，解释一致；教材发表不是本项目许可 | UNKNOWN |
| 10 | 有齿不咬 / 梳子 | [青年组织活动资料](https://boys-brigade.org.uk/wp-content/uploads/2021/07/seniors-sherlock_holmes-themed_programme-web.pdf) | teeth/齿的物体隐喻；提示和双语解释的实际来源待登记 | UNKNOWN |
| 11 | 能catch不能throw / 感冒 | [USC民俗档案](https://folklore.usc.edu/catch-but-not-throw/) | 民俗档案证明流传实例，不证明RUNLU许可；中文改为“染上”并说明英文双义，须核查译写来源 | UNKNOWN |
| 12 | 满孔留水 / 海绵 | [教育部门学习资料](https://www.carm.es/edu/pub/EnglishOutsideTheClassroom/libropdf/EnglishOutsideTheClassroom_03-2022_02.pdf) | 吸水解释与谜面一致；机构资料不自动授权商用题文/译文 | UNKNOWN |
| 13 | 城市河路非实物 / 地图 | [学校练习资料的相似版本](https://cdnsm5-ss5.sharpschool.com/UserFiles/Servers/Server_70111961/File/For%20Students/summer/Writing%20practice%20packet.pdf) | 只确认相似题型，当前完整措辞的最早来源未确定；逐项原文/改编关系需说明 | UNKNOWN |
| 14 | 只升不降 / 年龄 | [学校年刊](https://www.triyog.edu.np/assets/backend/uploads/Publications/Tribeni/Triveni%202016-2017.pdf) | 日常年龄概念而非严格物理断言；中文已写通常随生日增加，文字权利仍未知 | UNKNOWN |
| 15 | 满房间不占空间 / 光 | 未确立可靠原始出处；本轮只见网络题解/讨论候选 | 比喻把空间当固体体积，非科学结论；不得据此认定新创或无版权 | UNKNOWN |
| 16 | 有字不说话 / 书 | [广播媒体学习文章的相似版本](https://www.cadenadial.com/2023/adivinanzas-para-ayudar-a-los-ninos-a-aprender-ingles-343630.html) | 当前措辞与提示/解释来源未建立；中文不是自然获得授权的独立作品证明 | UNKNOWN |
| 17 | 会run不walk / 河流 | [香港大学语法教学例题](https://www.fe.hku.hk/telec/pgram/1-tt/109f/109-032.htm) | 英语run与河床/河岸提示关联；中文明确是借英文的联想，需核查译文/解释权利 | UNKNOWN |
| 18 | 说出即破 / 安静 | [题目发布者的变体页面](https://riddlesbrainteasers.com/say-name/) | 英文说其名、中文泛指开口表达的是相关变体；不能称完全相同或原创 | UNKNOWN |
| 19 | 五指非活物 / 手套 | [小学练习](https://files.schudio.com/newbridge-primary-school/files/Friday12thJuneDailyLearning/Y2_Friday_12th_June_Daily_Learning.pdf) | 拟人手部形状的谜题；现有提示/答案解释作者及使用依据缺失 | UNKNOWN |
| 20 | 月份28天 / 每月 | [谜题发布页面](https://www.riddles.com/773) | “有”与“仅有”差别；须保留at least限定；题干流传不能替代许可依据 | UNKNOWN |

本表每项只引用短题型标签/答案与发表实例，不复制对照页面的长解释。检索结果日期/抓取日期不能视作题目起源日期。原始发明、权利持有人、RUNLU采集路径、中文及解释作者四项需分别补证；没有通过替换第一题就清除其他19题的风险。

## 下一步与审核口径

1. 由所有者逐题提供实际获取渠道、作者/改写者/翻译者、许可或其他可核实使用依据；不确定的继续UNKNOWN。
2. 必要时另行授权替换无法澄清的题文，保留新写过程和人工作者审阅记录；本轮没有增加玩法或批量替换19题。
3. 第一题替换是降低某一已知来源相似度，不是整个题集的版权清权证明。Studio十题及品牌/图标权利仍沿用 [九问审计](TWIST-APPLE-REVIEW-EVIDENCE-AUDIT.md) 的未决事项。
4. 可以继续整理最终审核材料；**不能标记内容权利已通过，不能据本轮结果直接上传/送审**。独立价值、账号产品关系和完整真机验收门槛也未自动解除。


## 2026-11-06 — Current implementation status (supersedes historical counts above)

- `twist.html` on `feature/twist-apple-review-remediation` now contains **20 newly written bilingual puzzle texts**: one conversation-themed wordplay puzzle (slot 1) and 19 applied reasoning exercises (slots 2–20). The earlier classic riddles in slots 2–20 have been replaced; historical source links and UNKNOWN statuses above describe **removed content**, not the current displayed questions.
- All 20 slots have bilingual questions, hints, answers, explanations and reasoning choices. The 10 Logic Studio cases remain separate and require their own provenance/rights review.
- Current browser storage key is `runlu-twist-node001-v6`. Migration from v1–v5 was exercised in a mocked DOM/JavaScript environment; changed-slot completion, hints, assessments and reasoning/reflection selections are cleared by revision while unaffected slots are retained. **No iPhone Build 6 or real-device validation is claimed.**
- Replacement and self-authored wording **do not prove worldwide originality, copyright clearance, or App Store 4.3 compliance**. The questions are largely straightforward arithmetic/operations exercises; gameplay differentiation, independent user value, accessibility, packaging, account ownership and reviewer answers remain open.
- The previous statements saying classic riddles remain, or that only a small batch was replaced, are retained as historical audit snapshots and are **not current implementation status**. Do not copy them into the final Apple reviewer response.

**Release decision: HOLD** pending independent content review, end-to-end real-device QA, verified App Store packaging and truthful reviewer evidence.
