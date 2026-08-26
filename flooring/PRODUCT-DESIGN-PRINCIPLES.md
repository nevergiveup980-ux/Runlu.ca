# RUNLU Deerfoot Flooring OS — Product Design Principles

## Core Principle

**Let the software adapt to the way people already work, instead of forcing people to adapt to the software.**

中文：**让软件适应人的工作习惯，而不是逼人去适应软件。**

## Signature Differentiator: Dual-Track Workflow

RUNLU Deerfoot Flooring OS deliberately supports two parallel ways of working with the same underlying business data:

1. **Database / Form Mode** — structured entry through Jobs, PO, Invoice, Claim and related system fields.
2. **Editable Paper Mode** — direct entry on the familiar Deerfoot paper-style form, preserving the visual and muscle-memory workflow Sales already knows.

These two modes are not separate systems. They are two interfaces to the same operational record.

### What Editable Paper Mode is designed to feel like

- Open the familiar Deerfoot Invoice / PO paper.
- Tap the place where a person would normally write with a pen.
- Enter customer, delivery, product, supplier, quantity and price directly on the paper layout.
- Let the system calculate line totals, GST, totals and balances automatically.
- Save a paper draft.
- Save the edits back to the PO / Job / Invoice record when appropriate.
- Reopen, continue editing, print or save as PDF.

## Why This Matters

Most business software asks employees to learn the software's structure first. RUNLU takes the opposite approach: preserve the user's existing mental model and familiar workflow wherever possible, while adding the benefits of structured digital data underneath.

The goal is to reduce training friction, resistance and cognitive load without giving up database discipline.

**Front end: as natural as paper.**  
**Back end: as structured as a database.**

中文概括：**前台像纸一样自然，后台像数据库一样严谨。**

## Product / Marketing Positioning

This Dual-Track Workflow should be treated as a distinctive RUNLU product characteristic when:

- describing Deerfoot Flooring OS on runlu.ca;
- documenting the evolution of the project;
- presenting the system to Sales or management;
- designing a future generic / multi-company Flooring OS;
- explaining why RUNLU differs from conventional ERP / CRM / flooring-management software.

A useful positioning line:

> **Use the system when you want structure. Write on the familiar paper when you want speed. Either way, the data stays connected.**

中文：

> **需要规范时用系统表单，需要直觉和速度时直接在熟悉的纸面上写；无论走哪条路，数据始终相连。**

## Product Rule Going Forward

When a mature real-world paper workflow already works well for staff, do not replace it merely because software can. First ask whether it can be digitized without destroying the familiar workflow.

This principle should guide future RUNLU modules and the eventual generic version.

---

Recorded after the successful V0.3.44 Dual-Track Editable Invoice / PO workflow validation, August 2026.
