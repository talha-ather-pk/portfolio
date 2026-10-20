# Talha Ather — Portfolio

Personal portfolio of Talha Ather, a data analyst in Karachi working with Power BI, SQL and Python.

**Live site:** https://talha-ather.netlify.app

## What's here

- **Experience, credentials and skills**, with links to the course certificates
- **Selected work**: employer case studies and an HR attrition analysis in Power BI
- **Scroll-driven 3D story**, built with [Three.js](https://threejs.org): scattered data blocks snap into a grid, rise into a bar chart, and one series is highlighted with a trend line
- **Contact form** handled by Netlify Forms, with separate paths for recruiters and clients

## Stack

Plain HTML, CSS and JavaScript, with no framework and no build step.

```
index.html               main page
case-studies/            one page per case study
css/styles.css           all styles
js/main.js               navigation, counters, contact form, loads the 3D scene on first scroll
js/scene.js              Three.js scroll story
js/vendor/               three.module.min.js (r160)
fonts/                   self-hosted Archivo and IBM Plex (latin subset)
assets/                  résumé, photo, screenshots, certificates
netlify.toml             headers and redirects
```

## Run locally

The pages use root-relative paths, so serve the folder instead of opening the files directly:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Deploy

The site is hosted on Netlify. Publish only the site files, not repository files like this README:

```bash
mkdir -p ../dist
cp -r index.html 404.html thank-you.html robots.txt sitemap.xml netlify.toml css js assets case-studies fonts ../dist/
netlify deploy --prod --dir ../dist
```

## Credits

- [Three.js](https://github.com/mrdoob/three.js), MIT License
- [Archivo](https://fonts.google.com/specimen/Archivo) and [IBM Plex](https://github.com/IBM/plex), SIL Open Font License

© 2026 Talha Ather. The code may be reused; the content (text, photo, résumé, certificates and screenshots) is not licensed for reuse.
