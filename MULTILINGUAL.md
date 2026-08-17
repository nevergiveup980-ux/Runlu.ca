# RUNLU Multilingual Content Architecture

## Languages

- `en`: English — active
- `zh`: Simplified Chinese — active
- `fr`: French — planned and hidden until reviewed
- `es`: Spanish — planned and hidden until reviewed

The shared preference key is `runlu_site_language`. English is the fallback whenever a requested translation is missing or has not been approved.

## Short-text template

Use data attributes for navigation labels, buttons, badges, and short paragraphs:

```html
<span data-en="Read the article" data-zh="阅读文章" data-fr="" data-es="">Read the article</span>
```

## Long-form template

Use separate blocks for articles and substantial prose:

```html
<section class="copy-en" lang="en">Reviewed English content</section>
<section class="copy-zh" lang="zh-CN">经审核的中文内容</section>
<section class="copy-fr" lang="fr" hidden>Reviewed French content</section>
<section class="copy-es" lang="es" hidden>Reviewed Spanish content</section>
```

Planned-language blocks remain hidden until translations are complete and the shared language core activates that language.

## Editorial rule

Never expose a partially translated page. If the chosen language is unavailable, RUNLU falls back to the complete English version. Scientific and health translations require terminology and evidence-boundary review, not raw machine translation.

## New-page checklist

1. Review the English source.
2. Add complete Chinese content.
3. Load `runlu-language.js`.
4. Use the standard language selector.
5. Confirm only one language body is visible.
6. Confirm the choice persists across RUNLU pages.
7. Add French or Spanish only after full-page review.
