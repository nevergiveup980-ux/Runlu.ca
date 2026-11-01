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

## Candidate D — Slot 5: The warehouse scan
EN Question: A warehouse has four numbered bins. A scanner reports that the missing item is in an even-numbered bin greater than 1 but less than 4. Which bin should be checked?
EN Hint: List the even numbers strictly between 1 and 4.
EN Answer: Bin 2.
EN Explanation: The only even integer strictly between 1 and 4 is 2.
ZH Question: 仓库有四个编号1至4的货位。扫描器显示，缺失物品在一个大于1、小于4的偶数货位。应该检查几号？
ZH Hint: 找出严格位于1和4之间的偶数。
ZH Answer: 2号货位。
ZH Explanation: 大于1、小于4的偶数整数只有2。
Validation: unambiguous; may be too simple for later difficulty tiers.

## Candidate E — Slot 6: The shared clue
EN Question: A note says, "The correct door is not the left door." There are exactly two doors, left and right, and exactly one is correct. Which door is correct?
EN Hint: Use only the information provided; no hidden third door.
EN Answer: The right door.
EN Explanation: Exactly one of two doors is correct, and the left is excluded.
ZH Question: 一张纸条写着：“正确的门不是左边那扇。”这里只有左右两扇门，而且恰好一扇正确。正确的是哪扇？
ZH Hint: 只有两扇门，不存在第三种选择。
ZH Answer: 右边那扇门。
ZH Explanation: 两扇门恰好一扇正确，排除左门就只能选右门。
Validation: unambiguous but trivial; replace if insufficient challenge.

## Engineering and editorial gates
1. These are drafts, not content already implemented in twist.html, Build 5, or Apple-reviewed Build 3.
2. Editorial review must assess fun, novelty, difficulty, translation equivalence, and repetition with the existing Logic Studio. Candidates D and E are likely too similar to existing elimination tasks; do not ship without redesign.
3. If approved, update puzzles[], zh[], explanations.en[], explanations.zh[] in lockstep; verify all indices, scoring, saved-progress migration, and language switching.
4. Add bilingual test assertions for each new item and ensure existing build artifacts are not silently described as updated.
5. Keep the 19-item UNKNOWN rights register until each specific old item is actually removed or independently cleared.
