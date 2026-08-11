RUNLU.CA V1.2 · Brand Structure
================================

Main changes
- Added final What We Do / 我们所做之事 copy.
- Added final How We Do It / 我们的方式 copy.
- Added Principles section.
- Reframed Studio as selected works.
- Added RUNLU Notes placeholder.
- Added Contact & Support structure.
- Added privacy.html and support.html.
- Language preference now persists locally.
- Fixed V1.1 hero animation background so the image cannot disappear when .hero background is cleared.

Deployment
- Upload all files/folders in this package to the Runlu.ca repository root.
- Keep the assets folder intact.
- If a CNAME file already exists in GitHub for runlu.ca, keep it.


RUNLU Forum Prototype · V0.1
----------------------------
Added:
- forum.html / forum.css / forum.js
- Human Only / Invite One AI / AI Roundtable modes
- AI seat placeholders for OpenAI, Claude, and Gemini
- Prototype budget indicator
- Local-only post creation using browser localStorage
- Clear labeling that no AI API is connected
- Sample roundtable transcripts are illustrative only and not model quotes
- Main RUNLU site now links to Forum

This prototype is intentionally zero-API-cost. No API keys or external model calls are included.


RUNLU.CA V1.4 · Desktop Refinement
----------------------------------
Main site
- Quieter and narrower Hero glass panel.
- Reduced Hero text weight and shadow so image/title lead visually.

RUNLU Forum V0.2
- Reduced desktop top whitespace.
- Increased discussion card breathing room.
- Added quiet activity strip:
  people here today · discussions active · AI seats available.
- Added Prototype activity label so numbers are not mistaken for live analytics.
- Prepared future seat-state styling for Available / Resting / Budget reached / External Agent.
- No AI API calls are made in this prototype.


RUNLU.CA V1.5 · App Release Support
-----------------------------------
Added public App Store-facing website content for RUNLU Universal Invoice:
- invoice.html — product / release information
- invoice-privacy.html — product-specific privacy policy
- invoice-support.html — product-specific support page
- Studio card now links to Universal Invoice product page
- General RUNLU Privacy and Support pages link to the product-specific pages

Important:
- PrivacyInfo.xcprivacy remains an iOS/Xcode project file and should not be treated as a webpage.
- App Store review notes and submission checklists are internal App Store Connect / release materials and are not published publicly.
- Final App Store privacy answers must match the exact shipping app behavior.


RUNLU.CA V1.6 · Honest Beta + Quiet Growth
------------------------------------------
Main site
- Added Currently at RUNLU status section.
- Added Warehouse OS public project page.
- Expanded RUNLU Notes into a real landing page with first three note themes.
- Forum homepage language updated from Prototype to Early Beta.
- Added canonical/Open Graph metadata on homepage.
- Added robots.txt, sitemap.xml, and 404.html.

RUNLU Forum V0.3 · Honest Beta
- Removed fabricated live activity counters.
- Live activity now explicitly says no analytics are connected yet.
- Demo people and replies are labeled Demo; no fake Member identity remains.
- Demo AI replies no longer imply participation by named commercial models.
- Local-only publishing warning added to composer.
- No external AI APIs are called.


RUNLU.CA V1.6.1 · Integrity & Consistency
------------------------------------------
Purpose
- Preserve the V1.6 Honest Beta + Quiet Growth design while tightening truthfulness, metadata, navigation, and release consistency.

Changes
- Removed duplicate desktop “Now” navigation and added matching mobile “Now” navigation.
- Standardized Universal Invoice public status to “iOS release candidate”.
- Added canonical and Open Graph metadata to Forum, Warehouse OS, Universal Invoice, Notes, Privacy, and Support pages.
- Added invoice privacy/support URLs to sitemap.xml.
- Marked 404.html noindex,follow.
- Preserved Forum Human Only as the default, clearly labeled demo content, local-only browser posting, and no external AI API connection.
- Added repository maintenance guidance and pull-request checks.

Recommended GitHub workflow
- main = stable production branch.
- release/* or feature/* = all changes under review.
- Open a pull request into main for every release.
- Run site integrity checks before merge.
- Prefer squash merge for a clean release history.
- Never commit credentials, API keys, private keys, or production secrets.
