# RUNLU TWIST — Original Puzzle Replacement Batch A (draft for editorial review)
Date: 2026-11-01. Status: PROPOSED, NOT IN SHIPPED BUILD. Do not claim legal clearance or exclusive originality. These prompts were newly composed for this batch; check for similarities and editorial quality before implementation.

## Candidate A — Slot 2: The packing receipt
EN Question: A shipping receipt lists exactly three boxes with a total weight of 18 kg. Box B weighs twice as much as box A. Box C weighs 3 kg more than box A. How much does box C weigh?
EN Hint: Express all three weights using box A.
EN Answer: 6 kg.
EN Explanation: Let A weigh x kg. Then B = 2x and C = x + 3. So x + 2x + (x + 3) = 18; x = 3, hence C = 6 kg.
ZH Question: 一张发货单上恰好有三个箱子，总重量18千克。B箱是A箱重量的两倍，C箱比A箱重3千克。C箱有多重？
ZH Hint: 先用A箱的重量表示另外两个箱子。
ZH Answer: 6千克。
ZH Explanation: 设A箱重x千克，则B箱重2x，C箱重x+3。由x+2x+(x+3)=18，得x=3，因此C箱重6千克。
Validation: unique positive solution (A,B,C) = (3,6,6) kg. This is a newly written warehouse-context exercise, not an exclusive claim to elementary algebra.

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

## Candidate E — Slot 6: The double scan
EN Question: A warehouse scans four parcels in order. The recorded weights are 4, 7, 4 and 9 kg. One parcel was scanned twice, and the real total weight is 20 kg. Which recorded weight was the duplicate scan?
EN Hint: Compare the recorded total with the real total.
EN Answer: 4 kg.
EN Explanation: The four scans total 24 kg, which is 4 kg above the real total. Removing one 4 kg duplicate leaves 20 kg. The data identify the duplicated weight, not which of the two identical 4 kg entries is the extra scan.
ZH Question: 仓库依次记录四次包裹扫描，重量为4、7、4、9千克。其中有一个包裹被重复扫描了一次，实际总重量是20千克。重复扫描的是多重的包裹？
ZH Hint: 比较扫描记录的总重量与实际总重量。
ZH Answer: 4千克。
ZH Explanation: 四次扫描共24千克，比实际多4千克。去掉一次4千克记录后正好是20千克。数据只能确定重复扫描的重量，无法确定两个4千克记录中哪一条是多余的。
Validation: arithmetic difference is 4 kg. Question deliberately asks weight, not scan position, which is underdetermined. Assumes recorded weights accurate and exactly one duplicate scan.

## Engineering and editorial gates
1. These are drafts, not content already implemented in twist.html, Build 5, or Apple-reviewed Build 3.
2. Editorial review must assess fun, novelty, difficulty, translation equivalence, and repetition with the existing Logic Studio. Candidate D now specifies available roll length; assess whether technical installation constraints should be excluded more explicitly. Candidate E now uses reconciliation of duplicated measurements; ensure the distinction between duplicate weight and duplicate scan position is retained.
3. If approved, update puzzles[], zh[], explanations.en[], explanations.zh[] in lockstep; verify all indices, scoring, saved-progress migration, and language switching.
4. Add bilingual test assertions for each new item and ensure existing build artifacts are not silently described as updated.
5. Keep the 19-item UNKNOWN rights register until each specific old item is actually removed or independently cleared.

## Editorial verification — 2026-11-01

| Candidate | Logical correctness | Bilingual equivalence | Challenge quality | Decision |
|---|---|---|---|---|
| A: packing receipt | PASS: x+2x+(x+3)=18, x=3 | PASS | Medium-easy algebra | CANDIDATE; editorial/provenance review |
| B: delayed clock | PASS: 3 hours × 2 minutes = 6 minutes slow | PASS | Medium-easy applied arithmetic | CANDIDATE; review similarity |
| C: exhibition labels | PASS: 1 of 24 permutations satisfies all clues | PASS | Medium, spatial sequencing | CANDIDATE; review similarity |
| D: carpet fit | PASS with explicit roll length and no joining | PASS | Medium; applied spatial reasoning | CANDIDATE, subject to technical/rights review |
| E: double scan | PASS: 24−20=4 kg | PASS | Medium, attention to what is identifiable | CANDIDATE; editorial/provenance review |

**Editorial outcome:** Do not bulk-replace slots 2–6 yet. B and D are provisionally suitable after final editorial review; C passed exhaustive uniqueness verification. A and E have been rewritten; all five still require final editorial/provenance review. These checks validate internal logic, not copyright clearance, user enjoyment, or App Store distinctiveness. Do not modify the existing 19-item UNKNOWN risk register on the strength of these drafts.
