# devdattajoshi.com

Personal portfolio of **Devdatta Mahesh Joshi**, styled like a bash terminal, with light and dark themes.
Served by GitHub Pages at **https://devdattajoshi.com**.

Plain HTML, CSS and JS with no build step: whatever is on `main` is the live site.

## Structure

```
index.html              the whole site (resume content lives here)
404.html                "no such file or directory" page
assets/css/style.css    terminal theme; colours are CSS variables at the top (dark + light)
assets/js/main.js       theme toggle, interactive shell commands, service worker registration
assets/img/             favicon, Android/iOS icons, social preview image
manifest.webmanifest    makes the site installable on Android ("Add to Home screen")
sw.js                   network-first service worker (offline fallback)
CNAME                   custom domain: devdattajoshi.com
.nojekyll               serve files as-is (no Jekyll processing)
```

## Editing

- **Resume content:** edit the matching `<section>` in `index.html`. Each job is an `<li>` in the experience `<ol class="tree">`.
- **Colours:** change the variables in `:root` (dark) and the two light-theme blocks in `style.css`.
- **Shell commands:** add one to the `COMMANDS` object in `assets/js/main.js`.
- After changing CSS or JS, bump `VERSION` in `sw.js` so returning visitors get the new files offline too.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deployment / domain

- Repo → Settings → Pages: Source = *Deploy from a branch*, `main`, `/ (root)`; Custom domain = `devdattajoshi.com`; **Enforce HTTPS** on.
- DNS at the registrar for `devdattajoshi.com`:
  - `A @` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  - `AAAA @` → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
  - `CNAME www` → `devdatta-mahesh-joshi.github.io`
- Verify the domain under GitHub profile → Settings → Pages to prevent takeover.
