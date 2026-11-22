#!/usr/bin/env bash
# Deploy a clean copy of the site to Netlify (repository files like README stay out).
# Until talhaather.com is registered, every talhaather.com URL and the analytics domain point at the Netlify address.
set -euo pipefail
cd "$(dirname "$0")"
LIVE="talha-ather.netlify.app"
rm -rf ../portfolio-dist && mkdir ../portfolio-dist
cp -r index.html 404.html thank-you.html robots.txt sitemap.xml netlify.toml css js assets case-studies fonts ../portfolio-dist/
grep -rl 'talhaather\.com' ../portfolio-dist --include=*.html --include=*.xml --include=*.txt | xargs sed -i \
  -e "s#https://talhaather\.com#https://$LIVE#g" -e "s#data-domain=\"talhaather\.com\"#data-domain=\"$LIVE\"#g"
netlify deploy --prod --dir ../portfolio-dist --site ebd80e39-4cfa-4c4f-8c81-409b8e7a240f
