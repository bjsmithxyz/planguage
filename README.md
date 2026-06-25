# Planguage

A bright, interactive web app that translates English into **Planguage** — where every consonant becomes `p`.

Live demo: enable GitHub Pages on this repo (see below).

## Rules

1. **Consonants → P** — every consonant is replaced with `p` (vowels `a e i o u` stay as-is).
2. **Natural P** — a letter that was already `p` in the original text is preserved as a natural P.
3. **Collapse runs** — consecutive `p` characters collapse: each natural P counts separately, and all replacement P's in the same run count as one P.

### Examples

| English       | Planguage    |
|---------------|--------------|
| for example   | pop epappe   |
| fff           | p            |
| hello         | pepo         |
| paper         | papep        |

## Local preview

From the project root:

```bash
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080).

## Run tests

```bash
node --input-type=module -e "import './js/planguage.test.js'"
```

## GitHub Pages deployment

1. Push this repo to GitHub as `planguage`.
2. Go to **Settings → Pages**.
3. Set **Source** to deploy from branch `main`, folder `/ (root)`.
4. Your site will be at `https://<username>.github.io/planguage/`.

## Easter eggs

- Type **planguage** → toast: **Planged!**
- Click the mascot **7 times** → party mode confetti
- Type exactly **for example** → mascot wink + canonical example badge

## Project structure

```
index.html          Main page
css/styles.css      Layout and animations
js/planguage.js     Translation engine
js/planguage.test.js Test cases
js/app.js           UI, copy, easter eggs
assets/mascot.svg   P mascot
```
