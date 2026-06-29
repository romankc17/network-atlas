# Network Atlas — UI kit

Interactive recreation of the Network Atlas investigative relationship-mapping app: an institution-anchored "galaxy" you explore by diving into any person's universe.

## Files
- `index.html` — the running app. Loads the design-system bundle, the sample graph, and the two screen modules, then mounts `window.App`.
- `App.jsx` — application shell: overview ↔ focus state, search (with results / empty state), institution isolation, relationship-type filtering, loading state. Composes `SearchBar`, `InstitutionLegend`, `RelationshipLegend`, `ProfilePanel`, `BackToGalaxy`, `IconButton`, `Avatar` from the bundle.
- `Galaxy.jsx` — the overview + focus renderer. Composes `InstitutionAnchor` + `PersonNode` and adds the constellation scaffolding (nebula membranes, tethers, cross-edges, starfield, camera dive).
- `data.js` — the sample graph (`window.ATLAS`): institutions, people with precomputed positions, cross-institution edges, adjacency, and a `buildProfile()` for the panel.

## States demonstrated
1. **Galaxy overview** — every institution as a labelled anchor (type glyph + name + headcount) with its people clustered and tethered beneath it; cross-institution edges colour-coded by relationship.
2. **Person universe (focus)** — click any person: the rest of the galaxy dims, their ego-network across institutions lights up, the camera dives, and the profile panel slides in.
3. **Profile panel** — avatar, role @ institution(s) with a bridge badge, case-file metadata in mono, family, and a colour-coded connections list (click a connection to fly to that person).
4. **Search / empty / loading** — live search with a results dropdown and a no-match empty state; an indexing loader on first paint.

## The signature move
Each institution is drawn as a **constellation cell** — a bright, glyph-marked core wrapped in a faint nebula membrane (a dashed territory ring + blurred colour bloom) that contains its orbiting, tethered people. You read "this is an INSTITUTION and these are ITS people" instantly; the brighter coloured links that jump between cells are the investigative signal.
