# Portfolio

Personal portfolio of Muhammad Ammar Shahzad. Plain HTML, CSS and JavaScript, with no build step.

## Structure

```
index.html                          page content
css/styles.css                      layout and light/dark theme tokens
js/main.js                          theme toggle (remembers the visitor's choice)
assets/Muhammad-Ammar-Shahzad-CV.pdf  downloadable CV
```

## Run locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Deploy to GitHub Pages

1. Create a repository (for a root URL, name it `ammarshahzad365.github.io`).
2. Push these files to the `main` branch.
3. In the repository, go to **Settings → Pages**, set **Source** to *Deploy from a branch*, and pick `main` / `root`.

## Updating

- **CV:** replace `assets/Muhammad-Ammar-Shahzad-CV.pdf`, keeping the same file name.
- **Colours:** every colour is a variable at the top of `css/styles.css`. Light mode is under `:root`, and dark mode is under `:root[data-theme="dark"]` and the `prefers-color-scheme: dark` block. Keep those two dark blocks in sync.
