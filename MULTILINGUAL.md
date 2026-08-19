# RUNLU Multilingual Content Architecture

## Languages

- `en`: English — active
- `zh`: Simplified Chinese — active
- `fr`: French — active
- `es`: Spanish — active

The shared preference key is `runlu_site_language`. English remains the technical fallback, but a public release must contain reviewed content in all four languages.

## Short-text template

Use data attributes for navigation labels, buttons, badges, and short paragraphs:

```html
<span data-en="Read the article" data-zh="阅读文章" data-fr="Lire l’article" data-es="Leer el artículo">Read the article</span>
```

## Long-form template

Use separate blocks for articles and substantial prose:

```html
<section class="copy-en" lang="en">Reviewed English content</section>
<section class="copy-zh" lang="zh-CN">经审核的中文内容</section>
<section class="copy-fr" lang="fr">Contenu français révisé</section>
<section class="copy-es" lang="es">Contenido en español revisado</section>
```

All four blocks must be complete before publication. The shared language core displays only the selected language.

## Editorial rule

Never expose a partially translated page. Scientific and health translations require terminology and evidence-boundary review, not raw machine translation. A change is not complete until English, Chinese, French, and Spanish are updated together.

## New-page checklist

1. Review the English source and its evidence boundaries.
2. Add complete, human-reviewed Chinese, French, and Spanish content.
3. Confirm scientific and health terminology, evidence type, sources, and limitations remain equivalent in all four languages.
4. Load `runlu-language.js` and use the standard language selector.
5. Confirm only the selected language body is visible.
6. Confirm the choice persists across RUNLU pages and dynamic interface messages follow it.
7. Run `node scripts/check-multilingual.mjs`; publication is blocked if any language is missing.
