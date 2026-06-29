/* Galaxy.jsx — the Network Atlas overview + focus renderer.
 * Composes InstitutionAnchor + PersonNode from the design-system bundle and
 * adds the constellation scaffolding: nebula membranes, tethers, cross-edges,
 * a far starfield, and the eased camera dive into a person's universe.
 * Reads the sample graph from window.ATLAS. Exports window.Galaxy. */
(function () {
  const A = window.ATLAS;
  const NS = window.NetworkAtlasDesignSystem_9827fa || {};
  const { InstitutionAnchor, PersonNode } = NS;
  const REL_COLOR = {
    colleague: 'var(--rel-colleague)', former: 'var(--rel-former)',
    family: 'var(--rel-family)', business: 'var(--rel-business)', financial: 'var(--rel-financial)',
  };

  // Deterministic far starfield (built once).
  const STARS = (() => {
    const out = [];
    let seed = 7;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let i = 0; i < 90; i++) {
      out.push({ x: rnd() * A.CANVAS.w, y: rnd() * A.CANVAS.h, r: 0.5 + rnd() * 1.3, o: 0.12 + rnd() * 0.4 });
    }
    return out;
  })();

  function useFit() {
    const [fit, setFit] = React.useState({ s: 1, x: 0, y: 0, vw: 1200, vh: 700 });
    React.useEffect(() => {
      function recompute() {
        const vw = window.innerWidth, vh = window.innerHeight;
        const s = Math.max(vw / A.CANVAS.w, vh / A.CANVAS.h) * 1.02;
        setFit({ s, x: (vw - A.CANVAS.w * s) / 2, y: (vh - A.CANVAS.h * s) / 2, vw, vh });
      }
      recompute();
      window.addEventListener('resize', recompute);
      return () => window.removeEventListener('resize', recompute);
    }, []);
    return fit;
  }

  function Galaxy({ focusId, onFocus, isolatedId, activeRels, query }) {
    const fit = useFit();
    const q = (query || '').trim().toLowerCase();
    const ego = focusId ? A.egoOf(focusId) : null;
    const focusPerson = focusId ? A.byId[focusId] : null;

    const matches = (p) => !q || p.name.toLowerCase().includes(q) || A.instById[p.instId].name.toLowerCase().includes(q);

    // camera dive: center focused person in the left ~38% of the viewport
    let cam = 'none';
    let camOrigin = '0 0';
    if (focusPerson) {
      const scale = 1.5;
      const targetX = fit.vw * 0.37;
      const targetY = fit.vh * 0.5;
      const px = fit.x + focusPerson.x * fit.s;
      const py = fit.y + focusPerson.y * fit.s;
      cam = `translate(${(targetX - px)}px, ${(targetY - py)}px) scale(${scale})`;
      camOrigin = `${focusPerson.x}px ${focusPerson.y}px`;
    }

    const relOn = (rel) => !activeRels || activeRels.includes(rel);

    const instDimmed = (instId) => {
      if (focusPerson) return focusPerson.instId !== instId && focusPerson.bridge !== instId;
      if (isolatedId) return isolatedId !== instId;
      return false;
    };

    return (
      React.createElement('div', {
        style: {
          position: 'absolute', inset: 0, overflow: 'hidden',
          background: 'radial-gradient(1300px 760px at 58% 26%, color-mix(in oklab, var(--inst-violet) 5%, transparent), transparent 60%), var(--space-void)',
        },
      },
        React.createElement('div', {
          style: { position: 'absolute', left: fit.x, top: fit.y, width: A.CANVAS.w, height: A.CANVAS.h, transformOrigin: '0 0', transform: `scale(${fit.s})` },
        },
          React.createElement('div', {
            style: { position: 'absolute', inset: 0, transform: cam, transformOrigin: camOrigin, transition: 'transform var(--dur-dive) var(--ease-dive)' },
          },
            // starfield
            React.createElement('svg', { style: { position: 'absolute', inset: 0, width: A.CANVAS.w, height: A.CANVAS.h }, 'aria-hidden': true },
              STARS.map((s, i) => React.createElement('circle', { key: i, cx: s.x, cy: s.y, r: s.r, fill: '#aebfe0', opacity: focusPerson ? s.o * 0.4 : s.o }))
            ),
            // nebula membranes (fill)
            A.institutions.map((inst) => {
              const dim = instDimmed(inst.id);
              return React.createElement('div', {
                key: inst.id,
                style: {
                  position: 'absolute', left: inst.cx, top: inst.cy, width: 440, height: 360,
                  transform: 'translate(-50%,-50%)', borderRadius: '50%',
                  opacity: dim ? 0.12 : 0.5, transition: 'opacity var(--dur-panel) var(--ease-out)',
                  background: `radial-gradient(circle, color-mix(in oklab, ${inst.color} 20%, transparent) 0%, transparent 66%)`,
                  filter: 'blur(28px)', pointerEvents: 'none',
                },
              });
            }),
            // membrane outlines + tethers + cross edges
            React.createElement('svg', { style: { position: 'absolute', inset: 0, width: A.CANVAS.w, height: A.CANVAS.h, overflow: 'visible', pointerEvents: 'none' } },
              A.institutions.map((inst) => {
                const dim = instDimmed(inst.id);
                return React.createElement('ellipse', { key: inst.id, cx: inst.cx, cy: inst.cy, rx: 192, ry: 160, fill: 'none', stroke: inst.color, strokeOpacity: dim ? 0.04 : 0.18, strokeWidth: 1, strokeDasharray: '2 6' });
              }),
              A.people.map((p) => {
                const inst = A.instById[p.instId];
                const dim = (focusPerson && !(ego && ego.has(p.id))) || (isolatedId && p.instId !== isolatedId) || (q && !matches(p));
                return React.createElement('line', { key: p.id, x1: inst.cx, y1: inst.cy, x2: p.x, y2: p.y, stroke: inst.color, strokeOpacity: dim ? 0.03 : 0.2, strokeWidth: 1 });
              }),
              A.edges.map((e, i) => {
                const a = A.byId[e[0]], b = A.byId[e[1]];
                if (!relOn(e[2])) return null;
                const inEgo = focusPerson && (e[0] === focusId || e[1] === focusId);
                const isoTouch = isolatedId && (a.instId === isolatedId || b.instId === isolatedId);
                let op = 0.5;
                if (focusPerson) op = inEgo ? 0.95 : 0.04;
                else if (isolatedId) op = isoTouch ? 0.85 : 0.06;
                return React.createElement('line', {
                  key: i, x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: REL_COLOR[e[2]], strokeOpacity: op,
                  strokeWidth: inEgo ? 2 : 1.3,
                  style: { filter: inEgo ? `drop-shadow(0 0 7px ${REL_COLOR[e[2]]})` : 'none', transition: 'stroke-opacity var(--dur-panel)' },
                });
              })
            ),
            // anchors
            A.institutions.map((inst) => {
              const dim = instDimmed(inst.id);
              const active = isolatedId === inst.id || (focusPerson && (focusPerson.instId === inst.id || focusPerson.bridge === inst.id));
              return React.createElement('div', {
                key: inst.id,
                style: { position: 'absolute', left: inst.cx, top: inst.cy, transform: 'translate(-50%,-50%)', zIndex: 5 },
              }, InstitutionAnchor && React.createElement(InstitutionAnchor, {
                name: inst.name, type: inst.type, count: inst.count, color: inst.color,
                state: dim ? 'dim' : active ? 'active' : 'default',
              }));
            }),
            // person nodes
            A.people.map((p) => {
              let state = 'default';
              if (focusPerson) state = p.id === focusId ? 'active' : (ego && ego.has(p.id) ? 'trace' : 'dim');
              else if (isolatedId) state = p.instId === isolatedId ? 'default' : 'dim';
              else if (q) state = matches(p) ? 'trace' : 'dim';
              return React.createElement('div', {
                key: p.id,
                onClick: () => onFocus && onFocus(p.id),
                style: { position: 'absolute', left: p.x, top: p.y, transform: 'translate(-50%,-50%)', zIndex: state === 'active' ? 9 : 6 },
              }, PersonNode && React.createElement(PersonNode, {
                name: p.name, color: p.color, connections: p.conn, label: p.labeled, state,
              }));
            })
          )
        )
      )
    );
  }

  window.Galaxy = Galaxy;
})();
