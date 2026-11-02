# Birchify ATS

`BirchifyATS-Regular.ttf` is a modified Noto Sans SC Regular font, merged from
the locally installed `@fontsource/noto-sans-sc` 5.3.1 WOFF subsets. It uses a new
family name, "Birchify ATS", and is licensed under SIL Open Font License 1.1.
The original copyright and full license are in the adjacent `OFL.txt`.

The bundled font supports 13,635 Unicode characters. ATS export checks every
character and reports unsupported characters instead of silently omitting them.
The application embeds only used glyphs into each PDF and loads the font from
the same origin; no external font/CDN service is required.

To reproduce, install Python FontTools and the project's npm dependencies, then
run `python scripts/build-ats-font.py`. The generated TTF is committed: normal
Vite builds and GitHub Pages deployments need only Node.js, not Python.
