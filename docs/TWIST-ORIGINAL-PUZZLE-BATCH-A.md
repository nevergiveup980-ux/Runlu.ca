# RUNLU TWIST — Original Puzzle Replacement Batch A (draft for editorial review)
Date: 2026-11-01. Status: PROPOSED, NOT IN SHIPPED BUILD. Do not claim legal clearance or exclusive originality. These prompts were newly composed for this batch; check for similarities and editorial quality before implementation.

## Candidate A — Slot 2: The label test
EN Question: Three identical envelopes sit on a desk. One says "Invoice", one says "Photo", and one says "Blank". You are told every label is wrong. You may open only the envelope labeled "Blank", and it contains a photo. Which envelope contains the invoice?
EN Hint: The envelope labeled "Blank" actually holds the photo. Neither remaining envelope can hold its own label.
EN Answer: The envelope labeled "Photo" contains the invoice.
EN Explanation: "Blank" contains the photo. The "Invoice" envelope cannot contain the invoice and must therefore be blank. The "Photo" envelope must contain the invoice.
ZH Question: 桌上有三个相同的信封，分别贴着“发票”“照片”“空白”标签。已知三个标签全贴错了。你只能打开标着“空白”的信封，发现里面是一张照片。发票在哪个信封里？
ZH Hint: “空白”信封装着照片，剩下两个信封的标签也都不正确。
ZH Answer: 发票在贴着“照片”标签的信封里。
ZH Explanation: “空白”信封装着照片；“发票”信封不可能装发票，只能是空白；因此“照片”信封装着发票。
Validation: unique assignment under all-wrong-label condition.

## Candidate B — Slot 3: The missing minute
EN Question: A display counts down in whole minutes from 5 to 0, showing each number once. It begins at 12:00 and changes exactly every minute. What does it show at 12:03?
EN Hint: Count the changes, not the number of displays.
EN Answer: 2.
EN Explanation: It shows 5 at 12:00, 4 at 12:01, 3 at 12:02 and 2 at 12:03.
ZH Question: 一个屏幕从5开始，每隔整整一分钟递减1，依次显示到0，每个数字只显示一次。12:00开始显示5，那么12:03显示什么？
ZH Hint: 数一数屏幕已经变化了几次。
ZH Answer: 2。
ZH Explanation: 12:00显示5，12:01显示4，12:02显示3，12:03显示2。
Validation: deterministic arithmetic, but relatively easy.

## Candidate C — Slot 4: The only possible order
EN Question: Three cards marked A, B and C are placed in a row. A is not first. C is immediately before A. B is not last. What is the order?
EN Hint: Treat C and A as a two-card block.
EN Answer: B, C, A.
EN Explanation: The adjacent block C–A can occupy positions 1–2 or 2–3. If it occupies 1–2, B is last, which is forbidden. So B–C–A is the only order.
ZH Question: 三张卡片A、B、C排成一列。A不在第一位；C紧挨在A前面；B不在最后一位。顺序是什么？
ZH Hint: 先把C和A看成一个相邻的整体。
ZH Answer: B、C、A。
ZH Explanation: C–A只能占第1、2位或第2、3位。若占第1、2位，B就会在最后，违反条件，因此只能是B–C–A。
Validation: unique permutation.

## Candidate D — Slot 5: The cut-plan trap
EN Question: A carpet roll is 4 metres wide and has at least 5 metres of usable length. A room is 5 metres long and 3 metres wide. You can cut one rectangular piece and rotate it, but you cannot join pieces. Can this room be covered with a single piece from the roll?
EN Hint: The room's 5-metre side can run along the roll's length, not across its width.
EN Answer: Yes, cut a 5 m × 3 m piece.
EN Explanation: A roll's width limits one dimension to 4 m; the roll's length can supply the 5 m dimension. A 3 m width fits within the 4 m roll width.
ZH Question: 一卷地毯宽4米，可用卷长至少5米。房间长5米、宽3米。允许裁下一整块长方形地毯并旋转铺设，但不能拼接。能用一整块覆盖房间吗？
ZH Hint: 房间的5米长边可以顺着地毯卷的长度方向，而不必横跨卷宽。
ZH Answer: 可以，裁一块5米×3米的地毯。
ZH Explanation: 卷宽4米限制的是横向尺寸；5米可以沿卷长方向裁取，房间3米的宽度小于卷宽4米。
Validation: usable roll length >= 5 m is now explicit; single-piece fit is feasible, ignoring installation tolerances and pattern direction.

## Candidate E — Slot 6: The reversed sign
EN Question: A sign reads, “THE NEXT SENTENCE IS FALSE.” The next sentence reads, “THE PREVIOUS SENTENCE IS TRUE.” Can both statements be assigned a consistent true-or-false value?
EN Hint: Assume the first statement is true, then assume it is false. Check both.
EN Answer: No. Neither assignment is consistent.
EN Explanation: If the first is true, the second is false; but the second then says the first is true, making the second true. If the first is false, the second is true; then the second says the first is true, contradicting the assumption.
ZH Question: 一张牌子写着：“下一句话是假的。”下一句写着：“上一句话是真的。”能否为这两句话分别判定真或假，并且不产生矛盾？
ZH Hint: 分别假设第一句话为真、为假，看看会发生什么。
ZH Answer: 不能。无论如何分配真假，都会矛盾。
ZH Explanation: 若第一句为真，则第二句为假；但第二句声称第一句为真，又会使第二句为真。若第一句为假，则第二句为真；第二句又要求第一句为真，与假设冲突。
Validation: logical consistency requires checking both assignments. Similarity to known liar-paradox family; do not market as wholly unprecedented.

## Engineering and editorial gates
1. These are drafts, not content already implemented in twist.html, Build 5, or Apple-reviewed Build 3.
2. Editorial review must assess fun, novelty, difficulty, translation equivalence, and repetition with the existing Logic Studio. Candidate D now specifies available roll length; assess whether technical installation constraints should be excluded more explicitly. Candidate E uses a known paradox structure; assess whether it is distinct enough from the Logic Studio contradiction case.
3. If approved, update puzzles[], zh[], explanations.en[], explanations.zh[] in lockstep; verify all indices, scoring, saved-progress migration, and language switching.
4. Add bilingual test assertions for each new item and ensure existing build artifacts are not silently described as updated.
5. Keep the 19-item UNKNOWN rights register until each specific old item is actually removed or independently cleared.

## Editorial verification — 2026-11-01

| Candidate | Logical correctness | Bilingual equivalence | Challenge quality | Decision |
|---|---|---|---|---|
| A: mislabeled envelopes | PASS: one permutation fits all clues | PASS | Medium; resembles a known mislabeling-puzzle family | HOLD for similarity/provenance review |
| B: countdown | PASS: 12:03 is 2 | PASS | Too easy; mainly arithmetic | REWORK before shipping |
| C: card order | PASS: B–C–A is the only ordering | PASS | Easy; similar to existing ordering cases | HOLD for gameplay differentiation |
| D: carpet fit | PASS with explicit roll length and no joining | PASS | Medium; applied spatial reasoning | CANDIDATE, subject to technical/rights review |
| E: two statements | PASS: neither truth assignment is consistent | PASS | Medium-hard; familiar paradox structure | HOLD for similarity/provenance review |

**Editorial outcome:** Do not bulk-replace slots 2–6 yet. Only D is provisionally suitable for implementation after a final content review. These checks validate internal logic, not copyright clearance, user enjoyment, or App Store distinctiveness. Do not modify the existing 19-item UNKNOWN risk register on the strength of these drafts.
