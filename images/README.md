# images/

This folder holds image assets used by `index.html` and other site pages.

Recommended usage:
- Place optimized images here (webp/avif preferred; fallback jpg/png as needed)
- Use descriptive filenames with hyphens, e.g., `hero-construction-site.webp`
- Keep large originals elsewhere; commit only web-ready assets

Referencing images in HTML:
- From `index.html`, use relative paths like `./images/hero-construction-site.webp`
- Consider adding width/height attributes or a CSS aspect ratio to prevent layout shifts

Optimization tips:
- Target 1600–2400px width for hero banners; 1200px for content images; 400–800px for thumbnails
- Compress to < 200KB per image when possible
- Export multiple sizes if you plan to use `srcset`
