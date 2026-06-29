# Network Atlas

Interactive investigative relationship-mapping "galaxy": an institution-anchored
constellation you explore by diving into any person's universe. Built as a
Vite + React app.

## Run it

```bash
npm install
npm run dev        # dev server with HMR  → http://localhost:8753
npm run build      # production build      → dist/
npm run preview    # serve the production build to check it
```

## How it's wired

```
index.html             Vite entry (mounts /src/main.jsx)
src/
  main.jsx             entry: imports react-globals → styles → DS bundle → App, then mounts
  react-globals.js     exposes React on window for the (legacy) design-system bundle
  App.jsx              shell: overview ↔ focus, search, isolation, relationship filtering
  Galaxy.jsx           renderer + interactive camera (pan / zoom / recenter / focus dive)
  data.js              the sample graph (institutions, people, edges) + buildProfile()
_ds_bundle.js          PRECOMPILED design-system components (see "Design system" below)
styles.css + tokens/   design tokens (colors, type, spacing, effects) — imported by main.jsx
assets/brand/logo.svg  logo (imported as an asset URL in App.jsx)
```

### Interaction

- **Click a person** — dive into their cross-institution ego-network; the profile panel slides in.
- **Scroll / pinch** — zoom toward the cursor. **Drag** — pan. The bottom-left
  buttons zoom in/out and recenter.
- **Search**, the **institution legend** (click to isolate), and the
  **relationship legend** (click to filter edge types) all live around the canvas.

### Design system

`_ds_bundle.js` is a **precompiled, auto-generated** artifact (Babel-transpiled
JSX) that registers its components on `window.NetworkAtlasDesignSystem_9827fa`
and references a global `React`. It is treated as a vendored dependency:

- `src/react-globals.js` puts `React` on `window`, and is imported **before** the
  bundle in `main.jsx` so the global exists when the bundle evaluates.
- Don't hand-edit `_ds_bundle.js` — it is generated from component source elsewhere.

The original no-build prototype (CDN React + in-browser Babel) is preserved under
`ui_kits/network-atlas/` for reference; the live app is the Vite project above.

## Notes

- `npm audit` reports a moderate/high advisory in the Vite/esbuild **dev server**
  (GHSA-67mh-4wv8-2f99). It does not affect production builds; the fix is a Vite
  major-version bump.
- Webfonts load from Google Fonts (see `tokens/fonts.css`).
