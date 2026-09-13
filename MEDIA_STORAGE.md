# RUNLU Media Storage Policy

## Purpose
Keep large binary media out of the RUNLU.ca source repository so code history, clones, deployments, and maintenance remain lightweight.

## Storage split
- GitHub repository: HTML, CSS, JavaScript, configuration, small web images, documents required by the site.
- Cloudflare R2: video and other large media files.

## Planned R2 setup
- Bucket name: `runlu-media`
- Preferred public media domain: `media.runlu.ca`
- Video path convention: `videos/YYYY/<slug>.mp4`

First planned object:
- `videos/2026/one-trip-then-another.mp4`
- Public URL target: `https://media.runlu.ca/videos/2026/one-trip-then-another.mp4`

## Publishing rule
Do not commit MP4, MOV, M4V, WebM, or AVI files to the main RUNLU.ca repository. Upload the finished media file to R2, then reference its public URL from the website page.

## Website behavior
Use native HTML5 video with `preload="metadata"` by default. Avoid autoplay unless there is a clear editorial reason. Keep controls enabled and provide meaningful nearby text so the story remains understandable even if the video cannot load.

## Future-proofing
If the media library grows, keep the same URL structure and move only storage/backend details. Website pages should depend on stable public media URLs, not temporary editor or presigned links.
