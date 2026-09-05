# RUNLU GUANSHI · Consultation Protocol

Status: **V1.2 · two consultation routes live**

Public routes:
- `guanshi-consult.html` — **Start GUANSHI / 开始观势**
- `guanshi-traditional-consult.html` — **Traditional View / 传统观势**

## Product principle

GUANSHI has two doors but one evidence discipline.

### Route A · Start GUANSHI / 开始观势

Default route for most users.

First question:

> **What are you trying to see clearly?**
>
> **你现在最想看清楚的一件事是什么？**

The intake then asks only for information relevant to the real decision:
- topic;
- time horizon;
- question;
- options / alternatives;
- known facts;
- constraints / non-negotiables;
- stakes / reversibility;
- whether the user wants a separate traditional observation layer.

Birth information is **not required by default**.

Operational order:

**Question → reality baseline → options → uncertainty → decision support → optional traditional lens → record → review**

### Route B · Traditional View / 传统观势

For a user who explicitly wants a traditional consultation from the beginning.

Supported intake categories in V1.2:
- Bazi / Four Pillars;
- Ganzhi / timing;
- Six Lines;
- Meihua;
- Feng Shui;
- mixed / not-sure traditional request.

The intake may collect:
- exact traditional question;
- birth date, time and place when relevant;
- event/deadline or target period;
- site/layout/orientation for environmental questions;
- known real-world facts;
- the real decision attached to the reading.

A birth date is not treated as a universal input:
- **Bazi** needs birth data;
- **Six Lines / Meihua** primarily need a precise event question, frozen method and outcome window;
- **Feng Shui** primarily needs actual site/environment information.

## Two-ledger rule

Traditional consultations preserve two separate ledgers.

### Traditional ledger

May include the complete traditional interpretation appropriate to the selected school or method.

Examples:
- chart mechanics;
- symbolic relationships;
- traditional timing;
- school-specific interpretive rules.

### Reality ledger

Separately records:
- known facts;
- constraints;
- base rates;
- environment;
- behavioural/context variables;
- real options and downside.

### Integrated conclusion

Traditional material may generate questions, hypotheses or cultural interpretation. It does not silently outrank stronger evidence.

For high-stakes medical, legal, financial, safety or mental-health decisions, evidence-based and qualified professional methods control the practical recommendation.

## V1.2 privacy / implementation state

The two intake pages are currently a **local-only browser prototype**.

- form fields are not submitted to a RUNLU server;
- birth information is not stored by RUNLU;
- the browser generates a structured consultation brief locally;
- the user can copy the brief;
- future AI/account/backend integration should preserve the same two-route intake model rather than replacing it.

This avoids collecting sensitive personal information before storage, retention and account policies are deliberately designed.

## Future backend handoff

When server/AI consultation is added, preserve these rules:

1. do not require birth data for the default route;
2. show why a requested field is relevant before collecting it;
3. keep traditional interpretation and factual analysis separately labeled;
4. allow users to omit optional traditional inputs;
5. store only with explicit user action and a clear retention policy;
6. preserve original predictions for later outcome review rather than silently rewriting them;
7. keep the consultation route visible in the case record (`general` vs `traditional`).

## Core sentence

> **Two doors. One GUANSHI discipline.**
>
> **两扇门，一套观势纪律。**
