# radhakrishnabhandari.com.np — source

A single-page personal research site, built as plain HTML/CSS (no build step,
no framework — just `index.html` and `css/style.css`). Designed to be hosted
free on GitHub Pages and pointed at your own domain.

## 1. Content

The content in `index.html` comes from the CV. Still worth adding:

- [ ] Google Scholar / ResearchGate / ORCID links (hero links and contact block)
- [ ] A public CV PDF, e.g. `cv.pdf` — use a version without phone numbers
      or referee contact details, since everything here is public
- [ ] Keep the headline numbers (articles, citations, h-index, reviews) up
      to date — they're in the `stats` block near the top of `index.html`
- [ ] Swap the illustrative genotype plot in the hero for a real figure
      once you have one you're happy to publish (it's plain SVG, or you
      can replace the whole `<svg>...</svg>` block with an `<img>` tag)

## 2. Put it in a GitHub repository

You have two options for the repo name — they behave slightly differently:

**Option A — a project site (repo can be named anything), e.g. `wheat-site`:**
```bash
cd /path/to/this/folder
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<your-username>/wheat-site.git
git push -u origin main
```
Then on GitHub: **Settings → Pages → Source → Deploy from a branch → `main` / `/(root)`**.

**Option B — a user site, repo must be named exactly `<your-username>.github.io`:**
Same commands, but the remote is
`https://github.com/<your-username>/<your-username>.github.io.git`.
This publishes automatically at `https://<your-username>.github.io` with no
extra Pages settings needed — this is the simpler option if you don't
already use that repo name for something else.

Either way works fine with a custom domain — Option B is just one less step.

## 3. Point your domain at GitHub Pages

The `CNAME` file in this repo already contains `radhakrishnabhandari.com.np`,
which is what tells GitHub Pages which custom domain to serve. You still need
to configure DNS at wherever you registered the domain (your `.com.np`
registrar, e.g. Mercantile Communications / NITC's registrar panel):

- Add an **A record** for the root domain (`@` / `radhakrishnabhandari.com.np`)
  pointing to each of GitHub's four IPs:
  ```
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153
  ```
- (Optional but recommended) Add a **CNAME record** for `www` pointing to
  `<your-username>.github.io.` so `www.radhakrishnabhandari.com.np` also works.

DNS changes can take anywhere from a few minutes to ~24 hours to propagate.

Once DNS resolves, go back to **Settings → Pages** in the repo, confirm the
custom domain field shows `radhakrishnabhandari.com.np`, and tick
**Enforce HTTPS** once the checkbox becomes available (GitHub needs to
issue a certificate first, which can take a little while after DNS is live).

## 4. Verify

```bash
dig +short radhakrishnabhandari.com.np
```
should eventually return the four GitHub IPs above. Then visit the domain
in a browser.

## Local preview

No build tools needed — just open `index.html` directly in a browser, or
serve it locally:
```bash
python3 -m http.server 8000
```
and visit `http://localhost:8000`.
