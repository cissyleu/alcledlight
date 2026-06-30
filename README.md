# ALC LED Light Cloudflare Site

Deploy with Cloudflare Pages / Workers Static Assets from GitHub.

## Structure

```text
public/
  index.html
  contact/index.html
  products/milky-white-silicone-neon-flex/index.html
  assets/css/site.css
  assets/js/site.js
  assets/js/alc-tracking.js
  robots.txt
  sitemap.xml
  _headers
wrangler.toml
google-apps-script/Code.gs
GOOGLE_APPS_SCRIPT_SETUP.md
```

## Cloudflare

```text
Build command: exit 0
Deploy command: npx wrangler deploy
Root directory: /
```

`wrangler.toml` points Cloudflare to `./public`.

## Google Analytics

GA4 Google tag ID has been added globally:

```text
G-RVR3DE78M9
```

The tag is inserted in the `<head>` of every HTML page.

## Custom Google Sheets tracking

The global tracking script is here:

```text
public/assets/js/alc-tracking.js
```

Before it can write to Google Sheets, replace this line with your Apps Script Web App URL:

```js
const API_URL = "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_EXEC_URL_HERE";
```

Apps Script setup instructions are in:

```text
GOOGLE_APPS_SCRIPT_SETUP.md
```
