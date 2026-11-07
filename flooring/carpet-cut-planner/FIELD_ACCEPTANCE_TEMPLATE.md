# RUNLU Carpet Cut & Waste Planner — Field Acceptance Record

> Blank template. No real warehouse job has been inspected or approved by this document. Do not enter customer names, addresses or other personal data unless necessary and authorized.

## Job identification
- Internal job reference (non-sensitive):
- Date / reviewer / device and browser:
- Test environment / code commit:
- Status: NOT TESTED / PASS / FAIL / BLOCKED

## Inputs confirmed against original cut sheet
| Item | Recorded value | Independently verified by |
| --- | --- | --- |
| Roll ID, type (full/short/remnant), width, available length | | |
| Dye lot per roll and required piece | | |
| Required piece ID, width and length | | |
| Allowed rotation / pile direction | | |
| Width and length allowances | | |
| Pattern repeat (if applicable) | | |
| Installer seam / pattern / installation constraints | | |

## Independent expected result
- Which pieces must be placed, and which cannot fit:
- Expected roll allocation (LF per roll):
- Expected allocated SF / SYD, net SF, waste SF and waste percentage:
- Independent sketch or reference to a cut sheet:

## Software result and comparison
| Check | Expected | Actual | PASS / FAIL / N/A |
| --- | --- | --- | --- |
| All pieces placed or clearly listed as unplaced | | | |
| No cross-dye-lot assignment | | | |
| No overlap / out-of-roll placement | | | |
| Rotation and cut direction correct | | | |
| Allocated LF per roll | | | |
| SF / SYD / waste calculations | | | |
| Mobile layout and controls | | | |
| Printed report matches screen and warns when incomplete | | | |
| JSON save and reload retains plan inputs but clears old review | | | |

## Defects and disposition
- Observed difference, reproducible steps and expected behavior:
- Severity: BLOCKER / MAJOR / MINOR
- GitHub issue or commit reference:
- Retest result:

## Sign-off
- Software comparison reviewer / date:
- Installer or warehouse cutting authority / date (independent approval):
- Release decision: BLOCKED until at least three independently verified real jobs and all manual gates pass.

**Limitations:** Rectangular heuristic planning only. This template is not a cutting authorization; seam placement, pattern alignment, nap direction, irregular rooms and site measurement must be verified independently.
