# Science Meets the Unknown — V2 staging checklist

This branch is for the four-language V2 manuscripts. **Do not merge or publish until the four complete JSON manuscripts are committed and validated.**

## Source editions
- zh: 当科学走向未知 V2.3 (literary final candidate)
- en: When Science Meets the Unknown V2.1 (editorial revision)
- fr: Quand la science rencontre l'inconnu V2.1 (terminology revision)
- es: Cuando la ciencia se encuentra con lo desconocido V2.0 (literary adaptation)

## Required files
Place complete, unabridged drafts at `knowledge/essays/when-science-meets-the-unknown/{zh,en,fr,es}.json`. Preserve all eight sections, their paragraph order, and exact titles/subtitles from `manifest.json`. Do not generate placeholder or replacement prose.

## Review and release gates
1. Check all four source Markdown files against converted JSON paragraph-by-paragraph.
2. Run `node knowledge/essays/validate.mjs` and `node knowledge/essays/smoke-test.mjs`.
3. Review factual claims, translation fidelity, rights, mobile rendering and locale selection.
4. Keep `manifest.status = "draft"`, `publication.approved = false`, and every locale `status = "draft"` until explicit editorial approval.
5. Only then consider a separate release change.

Local V2 four-language JSON package has been prepared separately; this branch does **not** yet include the manuscript bodies.
