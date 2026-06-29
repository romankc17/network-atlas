/* Galaxy.jsx — the Network Atlas overview + focus renderer.
 *
 * Composes InstitutionAnchor + PersonNode from the design-system bundle and
 * adds the constellation scaffolding: nebula membranes, tethers, cross-edges,
 * a far starfield, and an interactive camera.
 *
 * The whole scene lives in canvas coordinates inside one transformed layer; a
 * single `view = {s, tx, ty}` maps canvas → screen (screen = view.t + canvas*s).
 * Everything — fit-to-viewport, wheel zoom, drag pan, the focus dive, and the
 * zoom/recenter buttons — is just a different value of `view`. The component
 * exposes { zoomIn, zoomOut, recenter } imperatively via ref so the App's
 * controls can drive the camera. */
import React from 'react';
import ATLAS from './data.js';

const A = ATLAS;
const NS = (typeof window !== 'undefined' && window.NetworkAtlasDesignSystem_9827fa) || {};
const { InstitutionAnchor, PersonNode, Avatar, Badge, InstitutionIcon } = NS;
const h = React.createElement;
const REL_COLOR = {
  colleague: 'var(--rel-colleague)', former: 'var(--rel-former)',
  family: 'var(--rel-family)', business: 'var(--rel-business)', financial: 'var(--rel-financial)',
};
const REL_LABEL = {
  colleague: 'Colleague', former: 'Former colleague', family: 'Family', business: 'Business', financial: 'Financial',
};

const W = A.CANVAS.w;
const H = A.CANVAS.h;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Honour the OS "reduce motion" setting: snap the dive instantly instead of easing.
const REDUCED = typeof window !== 'undefined' && !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

// Institution dive = a 3D "orbital system": the institution is a FIXED hub at the TOP; below it,
// on a tilted plane, its bodies ride horizontal rings connected by spokes. A LEAF institution
// shows its employees on one ring. A PARENT shows its child institutions as glowing planets on an
// outer ring, with its own direct staff as moons on a tighter inner ring. Dragging spins the whole
// system (yaw only) so back bodies come round to the front; an idle drift keeps it alive.
const CAR_TILT = 52;     // look-down tilt of the orbital plane (degrees)
const CAR_R = 140;       // employee ring radius (leaf dive)
const CAR_DROP = 215;    // how far below the hub the plane sits (leaf dive)
// Parent "system" rings. A ring's near edge clears the hub only while R < drop/tan(tilt); the
// drop is raised and radii kept under that bound so planets sweep cleanly BELOW the hub (never
// colliding with its label) — drop/tan(52°) ≈ 195, so the outer ring (168) stays well clear.
const SYS_DROP = 250;    // system plane sits a little lower to give the wider rings headroom
const SYS_EMP_R = 92;    // inner "moon" ring (parent's direct staff)
const SYS_CHILD_R = 168; // outer "planet" ring (child institutions)

// Scoped dive animations: bodies blossom into orbit (staggered), the system centre breathes a
// corona, orbit discs glow. All disabled under reduce-motion (the class is dropped at the call site).
const GALAXY_CSS = `
@keyframes atlasOrbitIn { from { opacity: 0; transform: scale(0.16); } to { opacity: 1; transform: none; } }
.atlas-orbit-in { animation: atlasOrbitIn .55s var(--ease-dive) both; }
@keyframes atlasCorona { 0%,100% { opacity:.4; transform: translate(-50%,-50%) scale(1); } 50% { opacity:.75; transform: translate(-50%,-50%) scale(1.12); } }
.atlas-corona { animation: atlasCorona 3.6s var(--ease-inout) infinite; }
@keyframes atlasDiscGlow { 0%,100% { opacity:.55; } 50% { opacity:.9; } }
.atlas-disc { animation: atlasDiscGlow 4.2s var(--ease-inout) infinite; }
@media (prefers-reduced-motion: reduce) { .atlas-orbit-in, .atlas-corona, .atlas-disc { animation: none; } }
`;

// Deterministic far starfield (built once).
const STARS = (() => {
  const out = [];
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = 0; i < 90; i++) {
    out.push({ x: rnd() * W, y: rnd() * H, r: 0.5 + rnd() * 1.3, o: 0.12 + rnd() * 0.4 });
  }
  return out;
})();

// Fit the whole canvas into a viewport of size (vw, vh) — the overview "home" camera.
function computeFit(vw, vh) {
  const s = Math.max(vw / W, vh / H) * 1.02;
  return { s, tx: (vw - W * s) / 2, ty: (vh - H * s) / 2 };
}

const Galaxy = React.forwardRef(function Galaxy({ focusId, onFocus, isolatedId, onIsolate, linkInst, activeRels, query }, ref) {
  const q = (query || '').trim().toLowerCase();
  const ego = focusId ? A.egoOf(focusId) : null;
  const focusPerson = focusId ? A.byId[focusId] : null;

  const [view, setView] = React.useState(() => computeFit(window.innerWidth, window.innerHeight));

  // The camera transform is animated with a CSS transition (compositor-driven —
  // smooth without re-rendering every node per frame, and robust even when the
  // tab is backgrounded, unlike requestAnimationFrame). We swap the transition
  // per gesture: a short ease for zoom, the longer dive ease for focus/recenter,
  // and none for drag (which must track the pointer 1:1).
  const ZOOM_EASE = 'transform 0.1s cubic-bezier(0.22, 0.61, 0.36, 1)';
  const DIVE_EASE = 'transform var(--dur-dive) var(--ease-dive)';
  const [trans, setTrans] = React.useState(DIVE_EASE);
  const [hover, setHover] = React.useState(null); // { x, y, kind: 'person'|'inst'|'edge', id }
  const [hoveredEdge, setHoveredEdge] = React.useState(null);  // edge index armed by hover
  const [selectedEdge, setSelectedEdge] = React.useState(null); // { i, fromId, toId, rel, mid:{x,y} } — the inspected tie
  const [traced, setTraced] = React.useState(null);            // Set of person ids lit by "Trace thread", or null

  // viewRef mirrors `view` so handlers read the latest camera without re-binding;
  // it's updated synchronously in `apply` so rapid wheel/drag events accumulate
  // from the newest value even when React batches the renders together.
  const viewRef = React.useRef(view);
  viewRef.current = view;
  const fitRef = React.useRef(view);          // latest fit-to-viewport camera
  const overviewRef = React.useRef(view);     // last camera used while NOT focused (pan/zoom persists)
  const focusRef = React.useRef(focusId);
  focusRef.current = focusId;
  const isolatedRef = React.useRef(isolatedId);   // latest isolation — for handlers + camera guards
  isolatedRef.current = isolatedId;
  const yawRef = React.useRef(0);              // current turntable spin (degrees)
  const yawForRef = React.useRef(null);       // which institution the spin belongs to (reset on change)
  const turnRef = React.useRef(null);         // the turntable group (transform written directly on drag)
  const dive3dRef = React.useRef(false);      // mirrors `dive3d` for the pointer handlers

  const spinPausedRef = React.useRef(false);  // pause idle drift while hovering an orbit body

  const containerRef = React.useRef(null);
  const tiltRef = React.useRef(null);         // the 3D tilt layer (parallax)
  const dragRef = React.useRef(null);         // active drag gesture, or null
  const didDragRef = React.useRef(false);     // suppresses the click that ends a drag

  // 3D orbital system is active for a pure institution dive (not person-focus or connection-explorer).
  const dive3d = !!(isolatedId && !focusId && !linkInst && A.instById[isolatedId]);
  dive3dRef.current = dive3d;
  const diveChildren = dive3d ? A.childrenOf(isolatedId) : [];          // child institutions in orbit
  const inOrbit = (instId) => { const i = A.instById[instId]; return dive3d && !!i && i.parentId === isolatedId; };
  // Reset the spin each time a different institution is opened.
  if (dive3d && yawForRef.current !== isolatedId) { yawRef.current = 0; yawForRef.current = isolatedId; }
  if (!dive3d) yawForRef.current = null;

  const minScale = () => fitRef.current.s * 0.45;
  const maxScale = () => fitRef.current.s * 6;

  // Camera that flies INTO an institution: zoomed ~2.1×, the core landed at 62% width /
  // 50% height so the docked left panel never covers the constellation (the mirror of
  // the person-focus dive's 37% offset against the right-docked profile panel).
  const instCamera = (inst) => {
    const el = containerRef.current;
    const r = el ? el.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
    // A parent's system spans a wider outer planet-ring → pull back & raise the hub to frame it.
    const sys = A.hasChildren(inst.id);
    const s = clamp(fitRef.current.s * (sys ? 1.5 : 1.9), minScale(), maxScale());
    // Put the hub near the TOP (right of the docked panel) so the rings sit below it.
    return { s, tx: r.width * 0.58 - inst.cx * s, ty: r.height * (sys ? 0.27 : 0.3) - inst.cy * s };
  };

  // Single mutation path: set the camera to `next` with the given CSS transition.
  const apply = (next, transition) => {
    viewRef.current = next;
    setTrans(transition);
    setView(next);
    if (!focusRef.current && !isolatedRef.current) overviewRef.current = next;
    // Any camera move dismisses the edge inspector + trace (it would otherwise mislead).
    setSelectedEdge((cur) => (cur ? null : cur));
    setTraced((cur) => (cur ? null : cur));
  };

  // Zoom toward screen point (mx, my); the canvas point under it stays put.
  const zoomToward = (mx, my, factor, transition) => {
    const cur = viewRef.current;
    const ns = clamp(cur.s * factor, minScale(), maxScale());
    const k = ns / cur.s;
    apply({ s: ns, tx: mx - (mx - cur.tx) * k, ty: my - (my - cur.ty) * k }, transition);
  };

  // ---- Imperative camera controls for the App's buttons ----
  React.useImperativeHandle(ref, () => ({
    zoomIn() { zoomToward(window.innerWidth / 2, window.innerHeight / 2, 1.5, ZOOM_EASE); },
    zoomOut() { zoomToward(window.innerWidth / 2, window.innerHeight / 2, 1 / 1.5, ZOOM_EASE); },
    recenter() { apply(fitRef.current, DIVE_EASE); },
  }));

  // ---- Measure the real container and keep the fit current as it resizes ----
  // Using a ResizeObserver (rather than window dimensions read at first render)
  // makes the initial fit correct even before layout settles, and supports the
  // app being embedded in a sized container rather than the full window.
  React.useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let first = true;
    function measure() {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const f = computeFit(r.width, r.height);
      fitRef.current = f;
      if (!focusRef.current) apply(f, first ? 'none' : DIVE_EASE);
      first = false;
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---- Focus dive: animate the camera to the focused person (or back) ----
  React.useEffect(() => {
    if (focusId) {
      const p = A.byId[focusId];
      if (!p) return;
      const el = containerRef.current;
      const r = el ? el.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
      const s = fitRef.current.s * 1.5;
      apply({ s, tx: r.width * 0.37 - p.x * s, ty: r.height * 0.5 - p.y * s }, DIVE_EASE);
    } else if (isolatedRef.current && A.instById[isolatedRef.current]) {
      // Leaving a person but an institution is still isolated → settle back onto its dive.
      apply(instCamera(A.instById[isolatedRef.current]), DIVE_EASE);
    } else {
      apply(overviewRef.current || fitRef.current, DIVE_EASE);
    }
  }, [focusId]);

  // ---- Institution dive: a flat camera move into the isolated constellation (or back) ----
  // Just zoom + centre on the institution; the highlight/dim is driven by the render below.
  React.useEffect(() => {
    if (focusRef.current) return;                 // a focused person owns the camera
    const inst = isolatedId && A.instById[isolatedId];
    apply(inst ? instCamera(inst) : (overviewRef.current || fitRef.current), REDUCED ? 'none' : DIVE_EASE);
    if (tiltRef.current) tiltRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)';
  }, [isolatedId]);

  // ---- Wheel zoom (native, non-passive so we can preventDefault) ----
  // The zoom amount is proportional to how much was scrolled (with a per-event
  // cap), so a trackpad makes many small, gentle steps instead of fixed big
  // jumps; the ZOOM_EASE transition smooths each step.
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onWheel(e) {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;                 // lines → ~pixels
      else if (e.deltaMode === 2) dy *= rect.height;   // pages → ~pixels
      dy = clamp(dy, -120, 120);                        // cap any single spike
      zoomToward(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-dy * 0.003), ZOOM_EASE);
    }
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // ---- Idle orbital drift: a gentle continuous spin so the system feels alive ----
  // Writes the turntable transform + billboard var straight to the DOM (same path as drag),
  // so labels stay upright. Pauses while dragging or hovering a body, and respects reduce-motion.
  React.useEffect(() => {
    if (!dive3d || REDUCED) return;
    let raf = 0, last = null;
    const SPEED = 4.2; // degrees per second
    const tick = (t) => {
      if (last == null) last = t;
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const dragging = dragRef.current && dragRef.current.moved;
      if (!dragging && !spinPausedRef.current && turnRef.current) {
        const yaw = yawRef.current + SPEED * dt;
        yawRef.current = yaw;
        turnRef.current.style.transform = `rotateX(${CAR_TILT}deg) rotateY(${yaw}deg)`;
        turnRef.current.style.setProperty('--bb', `rotateY(${-yaw}deg) rotateX(${-CAR_TILT}deg)`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dive3d, isolatedId]);

  // ---- Drag: spin the turntable (horizontal) during an institution dive, else pan ----
  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    dragRef.current = { x: e.clientX, y: e.clientY, view: viewRef.current, moved: false, yaw: yawRef.current };
    didDragRef.current = false;
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved && Math.abs(dx) + Math.abs(dy) > 4) {
      d.moved = true;
      didDragRef.current = true;
      try { containerRef.current.setPointerCapture(e.pointerId); } catch (_) {}
    }
    if (!d.moved) return;
    if (dive3dRef.current) {
      // Horizontal drag spins the disc around the vertical axis; vertical drag is ignored
      // so the tilt stays fixed (a clean turntable). Labels stay upright via the billboards.
      const yaw = d.yaw + dx * 0.55;
      yawRef.current = yaw;
      if (turnRef.current) {
        turnRef.current.style.transform = `rotateX(${CAR_TILT}deg) rotateY(${yaw}deg)`;
        turnRef.current.style.setProperty('--bb', `rotateY(${-yaw}deg) rotateX(${-CAR_TILT}deg)`);
      }
      return;
    }
    apply({ s: d.view.s, tx: d.view.tx + dx, ty: d.view.ty + dy }, 'none');
  };
  const endDrag = (e) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (d && d.moved) {
      try { containerRef.current.releasePointerCapture(e.pointerId); } catch (_) {}
      // keep didDragRef true through the click that immediately follows, then clear
      setTimeout(() => { didDragRef.current = false; }, 0);
    }
  };

  // ---- Mouse-driven 3D tilt (parallax depth) ----
  // Applied straight to the tilt layer's DOM so it never re-renders the scene;
  // skipped mid-drag so panning doesn't swing the view.
  const TILT = 5; // max degrees of subtle mouse parallax on the overview
  const onTilt = (e) => {
    // Subtle parallax depth on the overview only — kept flat while an institution is open.
    if (!tiltRef.current || (dragRef.current && dragRef.current.moved) || isolatedRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    tiltRef.current.style.transform = `rotateY(${(nx * TILT).toFixed(2)}deg) rotateX(${(-ny * TILT).toFixed(2)}deg)`;
  };
  const resetTilt = () => { if (tiltRef.current) tiltRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)'; };

  const matches = (p) => !q || p.name.toLowerCase().includes(q) || A.instById[p.instId].name.toLowerCase().includes(q);
  const relOn = (rel) => !activeRels || activeRels.includes(rel);
  const instDimmed = (instId) => {
    if (focusPerson) return focusPerson.instId !== instId && focusPerson.bridge !== instId;
    if (isolatedId) return isolatedId !== instId && linkInst !== instId;
    return false;
  };

  // Keep the open institution centred under the camera while it spins (no swing): aim the
  // perspective vanishing point at its on-screen position.
  let perspOrigin = '50% 42%';
  if (dive3d) {
    const oi = A.instById[isolatedId];
    const vw = window.innerWidth || 1, vh = window.innerHeight || 1;
    perspOrigin = `${(((view.tx + oi.cx * view.s) / vw) * 100).toFixed(2)}% ${(((view.ty + oi.cy * view.s) / vh) * 100).toFixed(2)}%`;
  }

  // One person node — used both in the static layer and inside the rotating turntable group,
  // so the focused institution's employees can spin while everyone else stays put.
  const renderPerson = (p) => {
    let state = 'default';
    let showLabel = p.labeled;
    if (focusPerson) {
      state = p.id === focusId ? 'active' : (ego && ego.has(p.id) ? 'trace' : 'dim');
    } else if (traced) {
      const lit = traced.has(p.id);
      state = (selectedEdge && (p.id === selectedEdge.fromId || p.id === selectedEdge.toId)) ? 'active' : (lit ? 'trace' : 'dim');
      showLabel = showLabel || lit;
    } else if (isolatedId) {
      if (linkInst) {
        if (p.instId === isolatedId) { const on = A.connectsToInst(p.id, linkInst); state = on ? 'active' : 'dim'; showLabel = showLabel || on; }
        else if (p.instId === linkInst) { const on = A.connectsToInst(p.id, isolatedId); state = on ? 'trace' : 'dim'; showLabel = showLabel || on; }
        else state = 'dim';
      } else if (p.instId === isolatedId) {
        // Light every employee; label only the key figure + whoever is hovered so spinning names never collide.
        state = 'trace';
        showLabel = p.labeled || (hover && hover.kind === 'person' && hover.id === p.id);
      } else {
        state = 'dim';
      }
    } else if (q) {
      state = matches(p) ? 'trace' : 'dim';
    }
    return React.createElement('div', {
      key: p.id,
      onClick: () => { if (didDragRef.current) return; onFocus && onFocus(p.id); },
      onMouseEnter: (e) => { if (!(dragRef.current && dragRef.current.moved)) setHover({ x: e.clientX, y: e.clientY, kind: 'person', id: p.id }); },
      onMouseLeave: () => setHover(null),
      style: { position: 'absolute', left: p.x, top: p.y, transformStyle: 'preserve-3d', transform: 'translate(-50%,-50%)', cursor: 'pointer', zIndex: state === 'active' ? 9 : 6 },
    }, React.createElement('div', { style: { transform: 'var(--bb, none)', transformOrigin: 'center' } },
      PersonNode && React.createElement(PersonNode, {
        name: p.name, color: p.color, connections: p.conn, label: showLabel, state,
      })));
  };


  // Hover tooltip — rendered outside the tilt layer so it isn't 3D-transformed.
  const TIP_TYPE = { government: 'Government', university: 'University', bank: 'Bank', ngo: 'NGO', construction: 'Construction', media: 'Media' };
  function renderTip() {
    if (!hover || (hover.kind === 'edge' && selectedEdge)) return null;
    const lines = [];
    let title, titleColor = 'var(--ink-1)';
    if (hover.kind === 'person') {
      const p = A.byId[hover.id]; if (!p) return null;
      title = p.name;
      lines.push(p.role + ' · ' + A.instById[p.instId].name);
      const links = A.adj[p.id] || [];
      const others = new Set(links.map((c) => A.byId[c.id].instId).filter((id) => id !== p.instId));
      lines.push(links.length + ' connection' + (links.length === 1 ? '' : 's') + (others.size ? ' · ' + others.size + ' inst.' : ''));
      if (p.bridge) lines.push('↔ Bridges ' + A.instById[p.bridge].name);
    } else if (hover.kind === 'edge') {
      const e = A.edges[hover.id]; if (!e) return null;
      const fa = A.byId[e[0]], fb = A.byId[e[1]]; if (!fa || !fb) return null;
      title = REL_LABEL[e[2]] || e[2];
      titleColor = REL_COLOR[e[2]];
      lines.push(fa.name + '  —  ' + fb.name);
      const sf = new Set((A.adj[e[0]] || []).map((x) => x.id));
      const n = (A.adj[e[1]] || []).filter((x) => x.id !== e[0] && sf.has(x.id)).length;
      lines.push(n === 0 ? 'only link between them · click to inspect' : n + ' mutual contact' + (n === 1 ? '' : 's') + ' · click to inspect');
    } else {
      const inst = A.instById[hover.id]; if (!inst) return null;
      title = inst.name;
      lines.push((TIP_TYPE[inst.type] || inst.type) + ' · ' + inst.count + ' employees');
      lines.push(A.crossLinksOf(inst.id).length + ' cross-institution links');
    }
    return React.createElement('div', {
      style: {
        position: 'absolute', left: hover.x, top: hover.y, transform: 'translate(-50%, calc(-100% - 16px))',
        pointerEvents: 'none', zIndex: 80, padding: '8px 11px', maxWidth: 240,
        background: 'color-mix(in oklab, var(--space-overlay) 92%, transparent)',
        border: '1px solid var(--line-soft)', borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-popover)', backdropFilter: 'var(--blur-chip)',
      },
    },
      React.createElement('div', { style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 600, color: titleColor, whiteSpace: 'nowrap' } }, title),
      lines.map((ln, i) => React.createElement('div', { key: i, style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', color: 'var(--ink-3)', marginTop: 2 } }, ln))
    );
  }

  // Link Dossier — the relationship inspector for a clicked edge. Rendered OUTSIDE the
  // tilt layer (sibling of renderTip) so it isn't 3D-skewed; positioned from the live
  // camera at the tie's canvas midpoint so it stays glued to the wire under pan/zoom.
  function renderLinkDossier() {
    if (!selectedEdge || !Avatar) return null;
    const { fromId, toId, rel, mid } = selectedEdge;
    const fp = A.byId[fromId], tp = A.byId[toId];
    if (!fp || !tp) return null;
    const fi = A.instById[fp.instId] || {}, ti = A.instById[tp.instId] || {};
    const hue = REL_COLOR[rel];
    const relLabel = REL_LABEL[rel] || rel;
    const sf = new Set((A.adj[fromId] || []).map((x) => x.id));
    const mutual = (A.adj[toId] || []).filter((x) => x.id !== fromId && sf.has(x.id)).map((x) => A.byId[x.id]).filter(Boolean);
    const el = containerRef.current;
    const r = el ? el.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
    const sx = clamp(view.tx + mid.x * view.s, 168, r.width - 168);
    const sy = view.ty + mid.y * view.s;
    const below = sy < 232;                         // flip beneath the wire when near the top edge
    const bridgeColor = (p) => (p.bridge && A.instById[p.bridge] ? A.instById[p.bridge].color : undefined);

    const endpoint = (p, inst) => h('div', { style: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' } },
      h(Avatar, { name: p.name, color: inst.color || hue, bridgeColor: bridgeColor(p), size: 38 }),
      h('div', { style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--ink-1)', lineHeight: 1.15, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, p.name),
      h('div', { style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', color: 'var(--ink-3)' } }, p.role),
      h('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 1 } },
        InstitutionIcon ? h(InstitutionIcon, { type: inst.type, size: 11, color: inst.color }) : h('span', { style: { width: 6, height: 6, borderRadius: '50%', background: inst.color } }),
        h('span', { style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', color: 'var(--ink-2)', maxWidth: 92, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, inst.name)
      ),
      h('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 'var(--mono-2xs)', color: 'var(--ink-3)' } }, (A.adj[p.id] || []).length + ' links')
    );

    const ghostBtn = (label, onClick) => h('button', { type: 'button', onClick,
      onMouseEnter: (e) => (e.currentTarget.style.background = 'var(--space-raised)'),
      onMouseLeave: (e) => (e.currentTarget.style.background = 'transparent'),
      style: { flex: 'none', padding: '7px 11px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-soft)', background: 'transparent', color: 'var(--ink-2)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)' } }, label);

    return h('div', {
      onClick: (e) => e.stopPropagation(),
      style: { position: 'absolute', left: sx, top: sy, zIndex: 85, width: 300, transform: below ? 'translate(-50%, 18px)' : 'translate(-50%, calc(-100% - 18px))' },
    },
      h('div', { className: REDUCED ? undefined : 'atlas-pop', style: {
        position: 'relative', overflow: 'hidden',
        background: 'color-mix(in oklab, var(--space-deep) 94%, transparent)',
        border: `1px solid color-mix(in oklab, ${hue} 38%, var(--line-soft))`, borderRadius: 'var(--radius-lg)',
        boxShadow: `var(--shadow-popover), 0 0 24px -10px ${hue}`, backdropFilter: 'var(--blur-panel)',
      } },
        h('span', { 'aria-hidden': true, style: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: hue } }),
        h('span', { 'aria-hidden': true, style: { position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(140% 90% at 50% -10%, color-mix(in oklab, ${hue} 16%, transparent), transparent 60%)` } }),
        h('button', { type: 'button', 'aria-label': 'Close', onClick: () => setSelectedEdge(null),
          style: { position: 'absolute', top: 10, right: 10, zIndex: 2, width: 24, height: 24, display: 'grid', placeItems: 'center', borderRadius: 'var(--radius-sm)', background: 'transparent', border: '1px solid var(--line-soft)', color: 'var(--ink-3)', cursor: 'pointer' } },
          h('svg', { width: 10, height: 10, viewBox: '0 0 12 12', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' }, h('line', { x1: 2, y1: 2, x2: 10, y2: 10 }), h('line', { x1: 10, y1: 2, x2: 2, y2: 10 }))),
        h('div', { style: { position: 'relative', padding: '14px 14px 13px' } },
          h('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 12 } },
            Badge ? h(Badge, { color: hue, variant: 'soft', dot: true, mono: true }, relLabel + ' tie')
                  : h('span', { style: { color: hue, fontFamily: 'var(--font-mono)', fontSize: 'var(--mono-xs)' } }, relLabel)),
          h('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 8 } },
            endpoint(fp, fi),
            h('div', { style: { alignSelf: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, paddingTop: 6 } },
              h('span', { style: { width: 32, height: 2, borderRadius: 2, background: hue, boxShadow: `0 0 7px ${hue}` } }),
              h('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 'var(--mono-2xs)', color: 'var(--ink-4)', letterSpacing: '0.1em' } }, '◂ ▸')),
            endpoint(tp, ti)
          ),
          h('p', { style: { margin: '12px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', lineHeight: 'var(--leading-relaxed)', color: 'var(--ink-2)', textAlign: 'center', textWrap: 'pretty' } },
            h('span', { style: { color: 'var(--ink-1)', fontWeight: 600 } }, fp.name.split(' ')[0]), ' and ',
            h('span', { style: { color: 'var(--ink-1)', fontWeight: 600 } }, tp.name.split(' ')[0]),
            ' share a ', h('span', { style: { color: hue } }, relLabel.toLowerCase()), ' tie across ', fi.name, ' and ', ti.name, '.'),
          h('div', { style: { marginTop: 12, paddingTop: 11, borderTop: '1px solid var(--line-faint)' } },
            mutual.length
              ? h('div', null,
                  h('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 'var(--mono-2xs)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 } }, 'Mutual contacts · ' + mutual.length),
                  h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
                    mutual.slice(0, 3).map((m) => h('button', { key: m.id, type: 'button', onClick: () => onFocus && onFocus(m.id),
                      onMouseEnter: (e) => (e.currentTarget.style.background = 'var(--space-raised)'),
                      onMouseLeave: (e) => (e.currentTarget.style.background = 'var(--space-surface)'),
                      style: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px 3px 4px', borderRadius: 'var(--radius-pill)', background: 'var(--space-surface)', border: '1px solid var(--line-soft)', cursor: 'pointer' } },
                      h(Avatar, { name: m.name, color: (A.instById[m.instId] || {}).color || hue, size: 18 }),
                      h('span', { style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', color: 'var(--ink-2)', maxWidth: 92, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, m.name))))
                )
              : h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                  h('span', { style: { width: 7, height: 7, borderRadius: '50%', background: hue, boxShadow: `0 0 7px ${hue}`, flex: 'none' } }),
                  h('span', { style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', color: 'var(--ink-2)' } }, 'The only documented link between them.'))
          ),
          h('div', { style: { display: 'flex', gap: 7, marginTop: 13 } },
            h('button', { type: 'button', onClick: () => setTraced(new Set([...A.egoOf(fromId), ...A.egoOf(toId)])),
              onMouseEnter: (e) => (e.currentTarget.style.background = `color-mix(in oklab, ${hue} 28%, transparent)`),
              onMouseLeave: (e) => (e.currentTarget.style.background = `color-mix(in oklab, ${hue} 18%, transparent)`),
              style: { flex: 1, padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: `1px solid color-mix(in oklab, ${hue} 50%, transparent)`, background: `color-mix(in oklab, ${hue} 18%, transparent)`, color: 'var(--ink-1)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', fontWeight: 600 } }, 'Trace thread'),
            ghostBtn(fp.name.split(' ')[0], () => onFocus && onFocus(fromId)),
            ghostBtn(tp.name.split(' ')[0], () => onFocus && onFocus(toId))
          )
        )
      )
    );
  }

  // Escape dismisses the edge inspector (and any active trace).
  React.useEffect(() => {
    if (!selectedEdge && !traced) return;
    const onKey = (e) => { if (e.key === 'Escape') { setSelectedEdge(null); setTraced(null); setHoveredEdge(null); setHover(null); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedEdge, traced]);

  return (
    React.createElement('div', {
      ref: containerRef,
      onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerCancel: endDrag,
      onMouseMove: onTilt, onMouseLeave: resetTilt,
      // Click-away on empty canvas dismisses the edge inspector (edge/card clicks stopPropagation).
      onClick: () => { if (didDragRef.current) return; if (selectedEdge) setSelectedEdge(null); if (traced) setTraced(null); },
      style: {
        position: 'absolute', inset: 0, overflow: 'hidden',
        userSelect: 'none', WebkitUserSelect: 'none',   // no text selection while dragging/spinning
        cursor: 'grab', touchAction: 'none', perspective: dive3d ? '1200px' : '1600px', perspectiveOrigin: perspOrigin,
        background: 'radial-gradient(1300px 760px at 58% 26%, color-mix(in oklab, var(--inst-violet) 5%, transparent), transparent 60%), var(--space-void)',
      },
    },
      React.createElement('style', null, GALAXY_CSS),
      // 3D tilt layer — parallax depth (transform set directly in onTilt).
      React.createElement('div', {
        ref: tiltRef,
        style: { position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transition: 'transform 0.2s var(--ease-out)', willChange: 'transform' },
      },
      React.createElement('div', {
        style: {
          position: 'absolute', left: 0, top: 0, width: W, height: H,
          transformOrigin: '0 0', transformStyle: 'preserve-3d',
          transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.s})`,
          transition: trans,
          willChange: 'transform',
        },
      },
      // Static scene group. During an institution dive the institution hub + everything else
      // stays put here; only its employees spin, inside the separate turntable group below.
      React.createElement('div', {
        style: { position: 'absolute', left: 0, top: 0, width: W, height: H, transformStyle: 'preserve-3d' },
      },
        // starfield (pushed deep for parallax)
        React.createElement('svg', { style: { position: 'absolute', inset: 0, width: W, height: H, transform: 'translateZ(-300px)' }, 'aria-hidden': true },
          STARS.map((s, i) => React.createElement('circle', { key: i, cx: s.x, cy: s.y, r: s.r, fill: '#aebfe0', opacity: focusPerson ? s.o * 0.4 : s.o }))
        ),
        // nebula membranes (fill) — children orbiting their parent move into the system group, so skip them here.
        A.institutions.filter((inst) => !inOrbit(inst.id)).map((inst) => {
          const dim = instDimmed(inst.id);
          return React.createElement('div', {
            key: inst.id,
            style: {
              position: 'absolute', left: inst.cx, top: inst.cy, width: 440, height: 360,
              transform: 'translate(-50%,-50%) translateZ(-120px)', borderRadius: '50%',
              opacity: dim ? 0.12 : 0.5, transition: 'opacity var(--dur-panel) var(--ease-out)',
              background: `radial-gradient(circle, color-mix(in oklab, ${inst.color} 20%, transparent) 0%, transparent 66%)`,
              filter: 'blur(28px)', pointerEvents: 'none',
            },
          });
        }),
        // membrane outlines + lineage links + tethers + cross edges
        React.createElement('svg', { style: { position: 'absolute', inset: 0, width: W, height: H, overflow: 'visible', pointerEvents: 'none' } },
          A.institutions.filter((inst) => !(dive3d && (inst.id === isolatedId || inOrbit(inst.id)))).map((inst) => {
            const dim = instDimmed(inst.id);
            return React.createElement('ellipse', { key: inst.id, cx: inst.cx, cy: inst.cy, rx: 192, ry: 160, fill: 'none', stroke: inst.color, strokeOpacity: dim ? 0.04 : 0.18, strokeWidth: 1, strokeDasharray: '2 6' });
          }),
          // Lineage arcs: a faint, parent-coloured arc tying each child institution back to its parent.
          // They reveal the hierarchy in the overview; lit up when either end is selected/hovered.
          A.institutions.filter((c) => c.parentId && A.instById[c.parentId]).map((c) => {
            const par = A.instById[c.parentId];
            const lit = isolatedId === c.id || isolatedId === c.parentId || (hover && hover.kind === 'inst' && (hover.id === c.id || hover.id === c.parentId));
            const op = dive3d ? 0.03 : (lit ? 0.5 : 0.12);
            const mx = (par.cx + c.cx) / 2, my = (par.cy + c.cy) / 2 - 46;   // arch the control point upward
            return React.createElement('path', {
              key: 'lin-' + c.id, d: `M${par.cx},${par.cy} Q${mx},${my} ${c.cx},${c.cy}`, fill: 'none',
              stroke: par.color, strokeOpacity: op, strokeWidth: lit ? 1.6 : 1, strokeDasharray: '1 7', strokeLinecap: 'round',
              style: { filter: lit ? `drop-shadow(0 0 5px ${par.color})` : 'none', transition: 'stroke-opacity var(--dur-panel)' },
            });
          }),
          // Tethers — the focused hub's spokes move into the system group, so skip its (and its children's) people here.
          A.people.filter((p) => !(dive3d && (p.instId === isolatedId || inOrbit(p.instId)))).map((p) => {
            const inst = A.instById[p.instId];
            const dim = (focusPerson && !(ego && ego.has(p.id))) || (isolatedId && p.instId !== isolatedId) || (q && !matches(p));
            return React.createElement('line', { key: p.id, x1: inst.cx, y1: inst.cy, x2: p.x, y2: p.y, stroke: inst.color, strokeOpacity: dim ? 0.03 : 0.2, strokeWidth: 1, style: { transition: 'stroke-opacity var(--dur-panel)' } });
          }),
          A.edges.map((e, i) => {
            const a = A.byId[e[0]], b = A.byId[e[1]];
            if (!relOn(e[2])) return null;
            const hue = REL_COLOR[e[2]];
            const inEgo = focusPerson && (e[0] === focusId || e[1] === focusId);
            const isoTouch = isolatedId && (a.instId === isolatedId || b.instId === isolatedId);
            const linkEdge = isolatedId && linkInst &&
              ((a.instId === isolatedId && b.instId === linkInst) || (a.instId === linkInst && b.instId === isolatedId));
            const inTrace = traced && traced.has(e[0]) && traced.has(e[1]);
            let op = 0.5;
            let glow = inEgo;
            if (focusPerson) op = inEgo ? 0.95 : 0.04;
            else if (traced) { op = inTrace ? 0.95 : 0.04; glow = inTrace; }
            else if (isolatedId && linkInst) { op = linkEdge ? 0.95 : 0.03; glow = linkEdge; }
            else if (dive3d) { op = 0.04; }   // turntable: fade cross-links (they'd detach from spinning employees)
            else if (isolatedId) { op = isoTouch ? 0.9 : 0.06; glow = glow || isoTouch; }   // cross-institution links of the open inst
            // Hover / selection compose on top of whatever the current mode set.
            const isSel = selectedEdge && selectedEdge.i === i;
            if (selectedEdge) { op = isSel ? 0.98 : Math.min(op, 0.05); glow = isSel; }
            else if (hoveredEdge === i) { op = Math.max(op, 0.95); glow = true; }
            let width = (inEgo || linkEdge || inTrace) ? 2 : 1.3;
            if (hoveredEdge === i) width = 2.4;
            if (isSel) width = 2.6;
            const interactive = op > 0.1;   // only hittable while the wire is visibly present
            return React.createElement('g', { key: i },
              React.createElement('line', {
                x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: hue, strokeOpacity: op, strokeWidth: width,
                style: { filter: glow ? `drop-shadow(0 0 7px ${hue})` : 'none', transition: 'stroke-opacity var(--dur-panel)' },
              }),
              // Signal bead travelling A→B along the inspected wire.
              isSel && !REDUCED ? React.createElement('circle', { r: 3, fill: hue, style: { filter: `drop-shadow(0 0 6px ${hue})` } },
                React.createElement('animateMotion', { dur: '1.7s', repeatCount: 'indefinite', path: `M${a.x},${a.y} L${b.x},${b.y}` })) : null,
              // Invisible fat hit-line: makes the thin wire reliably hoverable/clickable.
              interactive ? React.createElement('line', {
                x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: 'transparent', strokeWidth: 16, strokeLinecap: 'round',
                style: { pointerEvents: 'stroke', cursor: 'pointer' },
                onMouseEnter: (ev) => { if (dragRef.current && dragRef.current.moved) return; if (!selectedEdge) { setHoveredEdge(i); setHover({ x: ev.clientX, y: ev.clientY, kind: 'edge', id: i }); } },
                onMouseLeave: () => { setHoveredEdge((c) => (c === i ? null : c)); setHover((c) => (c && c.kind === 'edge' ? null : c)); },
                onClick: (ev) => { if (didDragRef.current) return; ev.stopPropagation(); setSelectedEdge({ i, fromId: e[0], toId: e[1], rel: e[2], mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }); setTraced(null); setHoveredEdge(null); setHover(null); },
              }) : null
            );
          })
        ),
        // anchors — children orbiting their parent render in the system group below, not here.
        A.institutions.filter((inst) => !inOrbit(inst.id)).map((inst) => {
          const dim = instDimmed(inst.id);
          const active = isolatedId === inst.id || linkInst === inst.id || (focusPerson && (focusPerson.instId === inst.id || focusPerson.bridge === inst.id));
          const far = isolatedId && dim;   // non-selected institutions during a dive → de-emphasise
          const isHub = dive3d && isolatedId === inst.id;
          const kids = !isolatedId && !focusPerson && A.hasChildren(inst.id);   // overview "system" hint
          return React.createElement('div', {
            key: inst.id,
            // Click an institution to dive into it. Clicking the OPEN hub climbs one level (to its
            // parent, or back to the overview). Disabled while a person is focused.
            onClick: () => {
              if (didDragRef.current || focusId) return;
              if (isolatedId === inst.id) { const par = A.parentOf(inst.id); onIsolate && onIsolate(par ? par.id : null); }
              else onIsolate && onIsolate(inst.id);
            },
            onMouseEnter: (e) => { if (!(dragRef.current && dragRef.current.moved)) setHover({ x: e.clientX, y: e.clientY, kind: 'inst', id: inst.id }); },
            onMouseLeave: () => setHover(null),
            style: { position: 'absolute', left: inst.cx, top: inst.cy, transformStyle: 'preserve-3d', transform: 'translate(-50%,-50%)', transition: 'filter var(--dur-panel) var(--ease-out)', filter: far ? 'blur(6px) saturate(0.5)' : 'none', cursor: focusId ? 'default' : 'pointer', zIndex: isolatedId === inst.id ? 8 : 5 },
          }, React.createElement('div', { style: { position: 'relative', transform: 'var(--bb, none)', transformOrigin: 'center' } },
            // Pulsing corona when this anchor is the live system centre.
            isHub ? React.createElement('span', { 'aria-hidden': true, className: REDUCED ? undefined : 'atlas-corona', style: { position: 'absolute', top: 28, left: '50%', width: 104, height: 104, transform: 'translate(-50%,-50%)', borderRadius: '50%', border: `1px solid color-mix(in oklab, ${inst.color} 42%, transparent)`, boxShadow: `0 0 46px -8px ${inst.color}`, pointerEvents: 'none' } }) : null,
            // Faint orbit-ring hint in the overview so parents read as "has a system".
            kids ? React.createElement('span', { 'aria-hidden': true, style: { position: 'absolute', top: 28, left: '50%', width: 86, height: 86, transform: 'translate(-50%,-50%)', borderRadius: '50%', border: `1px dashed color-mix(in oklab, ${inst.color} 32%, transparent)`, opacity: dim ? 0.2 : 0.7, pointerEvents: 'none' } }) : null,
            InstitutionAnchor && React.createElement(InstitutionAnchor, {
              name: inst.name, type: inst.type, count: inst.count, color: inst.color,
              state: dim ? 'dim' : active ? 'active' : 'default',
            })));
        }),
        // person nodes — everyone EXCEPT the open system's own staff & its children's staff (those move into the system group)
        A.people.filter((p) => !(dive3d && (p.instId === isolatedId || inOrbit(p.instId)))).map(renderPerson),

        // ---- Orbital system: the hub stays fixed (static layer, top). Below it, on a tilted plane,
        // its bodies ride horizontal rings on spokes — child institutions as planets (outer ring),
        // direct staff as moons (inner ring). Drag/idle-drift spins the whole plane; billboards keep
        // every node + label upright. A leaf institution just shows its staff on a single ring. ----
        dive3d && (() => {
          const hub = A.instById[isolatedId];
          const emps = A.people.filter((p) => p.instId === isolatedId);
          const kids = diveChildren;
          const drop = kids.length ? SYS_DROP : CAR_DROP;   // system plane sits a touch lower
          const empR = kids.length ? SYS_EMP_R : CAR_R;     // tighten the staff ring when planets share the plane

          // A body's position on a ring of radius R (angle indexed around the circle, + optional phase).
          const place = (i, n, R, phase = 0) => { const t = (i / (n || 1)) * Math.PI * 2 + phase; return { x: R * Math.sin(t), z: R * Math.cos(t), deg: t * 180 / Math.PI }; };
          // A 3D spoke bar from the hub apex out to a body on ring R, at angle `deg`.
          const spoke = (key, deg, R, color, w, op) => {
            const L = Math.hypot(R, drop);
            const pitch = Math.atan2(drop, R) * 180 / Math.PI;
            return React.createElement('div', {
              key, style: {
                position: 'absolute', left: hub.cx, top: hub.cy, width: L, height: w, transformOrigin: '0 50%',
                transform: `rotateY(${deg - 90}deg) rotateZ(${pitch}deg)`, borderRadius: w,
                background: `linear-gradient(90deg, color-mix(in oklab, ${color} 8%, transparent), ${color})`,
                opacity: op, pointerEvents: 'none',
              },
            });
          };
          // A glowing orbit-path disc lying flat in the plane at ring R.
          const disc = (key, R, color) => React.createElement('div', {
            key, 'aria-hidden': true, className: REDUCED ? undefined : 'atlas-disc',
            style: {
              position: 'absolute', left: hub.cx, top: hub.cy, width: R * 2, height: R * 2, borderRadius: '50%',
              transform: `translate(-50%,-50%) translate3d(0, ${drop}px, 0) rotateX(90deg)`,
              border: `1px solid color-mix(in oklab, ${color} 24%, transparent)`,
              boxShadow: `0 0 34px -6px color-mix(in oklab, ${color} 45%, transparent)`, pointerEvents: 'none',
            },
          });
          const CHILD_PHASE = Math.PI;   // seat a planet at the front (nearest the viewer) on dive-in

          return React.createElement('div', {
            ref: turnRef,
            style: {
              position: 'absolute', left: 0, top: 0, width: W, height: H, transformStyle: 'preserve-3d',
              transformOrigin: `${hub.cx}px ${hub.cy}px`,
              transform: `rotateX(${CAR_TILT}deg) rotateY(${yawRef.current}deg)`,
              transition: 'none',   // drag/drift tracks 1:1 (camera fly-in is animated separately)
              '--bb': `rotateY(${-yawRef.current}deg) rotateX(${-CAR_TILT}deg)`,
            },
          },
            // orbit-path discs (drawn first, behind the bodies)
            emps.length ? disc('disc-emp', empR, hub.color) : null,
            kids.length ? disc('disc-kids', SYS_CHILD_R, hub.color) : null,

            // ---- staff "moons" on the inner ring ----
            emps.map((p, i) => spoke('es-' + p.id, place(i, emps.length, empR).deg, empR, hub.color, 1.4, 0.42)),
            emps.map((p, i) => {
              const { x: ex, z: ez } = place(i, emps.length, empR);
              const showLabel = p.labeled || (hover && hover.kind === 'person' && hover.id === p.id);
              return React.createElement('div', {
                key: p.id,
                onClick: () => { if (didDragRef.current) return; onFocus && onFocus(p.id); },
                onMouseEnter: (e) => { spinPausedRef.current = true; if (!(dragRef.current && dragRef.current.moved)) setHover({ x: e.clientX, y: e.clientY, kind: 'person', id: p.id }); },
                onMouseLeave: () => { spinPausedRef.current = false; setHover(null); },
                style: { position: 'absolute', left: hub.cx, top: hub.cy, transformStyle: 'preserve-3d', transform: `translate(-50%,-50%) translate3d(${ex}px, ${drop}px, ${ez}px)`, cursor: 'pointer', zIndex: 6 },
              }, React.createElement('div', { style: { transform: 'var(--bb, none)', transformOrigin: 'center' } },
                React.createElement('div', { className: REDUCED ? undefined : 'atlas-orbit-in', style: { animationDelay: (i * 45) + 'ms' } },
                  PersonNode && React.createElement(PersonNode, { name: p.name, color: p.color, connections: p.conn, label: showLabel, state: 'trace' }))));
            }),

            // ---- child institutions as "planets" on the outer ring ----
            kids.map((c, i) => spoke('cs-' + c.id, place(i, kids.length, SYS_CHILD_R, CHILD_PHASE).deg, SYS_CHILD_R, c.color, 2, 0.6)),
            kids.map((c, i) => {
              const { x: ex, z: ez } = place(i, kids.length, SYS_CHILD_R, CHILD_PHASE);
              const staff = A.employeesOf(c.id).length;
              const subs = A.childrenOf(c.id).length;
              const meta = subs ? subs + ' sub · ' + staff + ' staff' : staff + ' staff';
              return React.createElement('div', {
                key: c.id,
                onClick: () => { if (didDragRef.current) return; onIsolate && onIsolate(c.id); },   // dive deeper
                onMouseEnter: (e) => { spinPausedRef.current = true; if (!(dragRef.current && dragRef.current.moved)) setHover({ x: e.clientX, y: e.clientY, kind: 'inst', id: c.id }); },
                onMouseLeave: () => { spinPausedRef.current = false; setHover(null); },
                style: { position: 'absolute', left: hub.cx, top: hub.cy, transformStyle: 'preserve-3d', transform: `translate(-50%,-50%) translate3d(${ex}px, ${drop}px, ${ez}px)`, cursor: 'pointer', zIndex: 7 },
              }, React.createElement('div', { style: { transform: 'var(--bb, none)', transformOrigin: 'center' } },
                React.createElement('div', { className: REDUCED ? undefined : 'atlas-orbit-in', style: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', animationDelay: (i * 70 + 90) + 'ms' } },
                  React.createElement('span', { 'aria-hidden': true, style: { position: 'absolute', top: 22, left: '50%', width: 84, height: 84, transform: 'translate(-50%,-50%)', borderRadius: '50%', background: `radial-gradient(circle, color-mix(in oklab, ${c.color} 28%, transparent), transparent 68%)`, filter: 'blur(7px)', pointerEvents: 'none' } }),
                  InstitutionAnchor && React.createElement(InstitutionAnchor, { name: c.name, type: c.type, count: c.count, color: c.color, size: 44, state: 'active' }),
                  React.createElement('span', { style: { marginTop: 3, fontFamily: 'var(--font-mono)', fontSize: 'var(--mono-2xs)', letterSpacing: '0.06em', color: 'var(--ink-3)', whiteSpace: 'nowrap' } }, meta)
                )));
            })
          );
        })()
        )
      )),
      renderTip(),
      renderLinkDossier()
    )
  );
});

export default Galaxy;
