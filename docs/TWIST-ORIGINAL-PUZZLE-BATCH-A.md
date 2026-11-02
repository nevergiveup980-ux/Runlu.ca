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

## Candidate B — Slot 3: The delayed clock
EN Question: A workshop clock loses exactly 2 minutes for every real hour. It is set correctly at noon and never adjusted. When the real time is 3:00 p.m., what time does it show?
EN Hint: Three real hours have passed; add up the clock's lost minutes.
EN Answer: 2:54 p.m.
EN Explanation: The clock loses 2 minutes per hour, so after three hours it is 6 minutes slow. At real 3:00 p.m. it reads 2:54 p.m.
ZH Question: 车间里有一只钟，每经过真实的一小时，就恰好慢2分钟。中午12点校准后再也没有调整。真实时间到了下午3点，这只钟显示几点？
ZH Hint: 已经过了三个真实小时，算算一共慢了多少分钟。
ZH Answer: 下午2:54。
ZH Explanation: 每小时慢2分钟，三个小时共慢6分钟，所以真实时间下午3点时，钟显示下午2:54。
Validation: explicitly defines drift per real hour; deterministic, medium-easy arithmetic. Avoid implying this is an unprecedented puzzle form.

## Candidate C — Slot 4: The exhibition labels
EN Question: Four artworks—A, B, C and D—hang in a row. B is immediately to the right of D. A is somewhere to the left of D. C is not at either end. Which artwork is at the far right?
EN Hint: Treat D–B as a block. Then test where C can fit.
EN Answer: B.
EN Explanation: The only arrangement satisfying all clues is A–C–D–B: D–B must be adjacent; A must precede D; C must occupy an interior position. Thus B is far right.
ZH Question: 展厅里有四幅作品A、B、C、D排成一行。B紧挨在D右边；A在D左边（不要求相邻）；C不在两端。最右边是哪幅？
ZH Hint: 先把D–B当成相邻的整体，再考虑C的位置。
ZH Answer: B。
ZH Explanation: 满足所有条件的排列只有A–C–D–B：D与B相邻，A在D左边，C处于中间位置，因此最右边是B。
Validation: exhaustive enumeration of all 24 permutations confirms exactly one valid order: A–C–D–B.

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
| B: delayed clock | PASS: 3 hours × 2 minutes = 6 minutes slow | PASS | Medium-easy applied arithmetic | CANDIDATE; review similarity |
| C: exhibition labels | PASS: 1 of 24 permutations satisfies all clues | PASS | Medium, spatial sequencing | CANDIDATE; review similarity |
| D: carpet fit | PASS with explicit roll length and no joining | PASS | Medium; applied spatial reasoning | CANDIDATE, subject to technical/rights review |
| E: two statements | PASS: neither truth assignment is consistent | PASS | Medium-hard; familiar paradox structure | HOLD for similarity/provenance review |

**Editorial outcome:** Do not bulk-replace slots 2–6 yet. B and D are provisionally suitable after final editorial review; C passed exhaustive uniqueness verification. A and E require similarity/provenance review. These checks validate internal logic, not copyright clearance, user enjoyment, or App Store distinctiveness. Do not modify the existing 19-item UNKNOWN risk register on the strength of these drafts.
