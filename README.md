# ALC LED Light / FLUX Cloudflare Pages Site

This repository is structured for Cloudflare Pages with GitHub auto deployment.

## Recommended Cloudflare Pages settings

- Framework preset: None
- Build command: `exit 0`
- Build output directory: `public`
- Production branch: `main`

## Structure

```text
repo-root/
├── public/
│   ├── index.html
│   ├── contact/
│   │   └── index.html
│   ├── products/
│   │   └── milky-white-silicone-neon-flex/
│   │       └── index.html
│   ├── assets/
│   │   ├── css/site.css
│   │   ├── js/site.js
│   │   └── images/
│   ├── robots.txt
│   ├── sitemap.xml
│   └── _headers
└── README.md
```

## Custom domain

For Cloudflare Pages, connect `alcledlight.com` in Cloudflare Pages → Custom domains. A GitHub Pages `CNAME` file is not required.
