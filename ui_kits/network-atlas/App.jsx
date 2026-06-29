/* App.jsx — the Network Atlas application shell.
 * Orchestrates overview ↔ focus, search, institution isolation, and relationship
 * filtering. Composes the design-system primitives + window.Galaxy.
 * Exports window.App. */
(function () {
  const A = window.ATLAS;
  const NS = window.NetworkAtlasDesignSystem_9827fa || {};
  const { SearchBar, InstitutionLegend, RelationshipLegend, ProfilePanel, BackToGalaxy, IconButton, Avatar } = NS;
  const Galaxy = window.Galaxy;
  const h = React.createElement;

  function Logo() {
    return h('img', { src: '../../assets/brand/logo.svg', alt: 'Network Atlas', style: { height: 36, display: 'block' } });
  }

  function ZoomIcon({ dir }) {
    return h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' },
      h('circle', { cx: 11, cy: 11, r: 7 }),
      h('line', { x1: 16.5, y1: 16.5, x2: 21, y2: 21 }),
      h('line', { x1: 8, y1: 11, x2: 14, y2: 11 }),
      dir === 'in' ? h('line', { x1: 11, y1: 8, x2: 11, y2: 14 }) : null
    );
  }
  function RecenterIcon() {
    return h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' },
      h('circle', { cx: 12, cy: 12, r: 3 }),
      h('path', { d: 'M12 2v3M12 19v3M2 12h3M19 12h3' })
    );
  }

  function SearchResults({ query, onPick }) {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const people = A.people.filter((p) => p.name.toLowerCase().includes(q) || A.instById[p.instId].name.toLowerCase().includes(q)).slice(0, 7);
    return h('div', {
      style: {
        marginTop: 8, width: 360, background: 'color-mix(in oklab, var(--space-deep) 94%, transparent)',
        border: '1px solid var(--line-soft)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-popover)',
        backdropFilter: 'var(--blur-panel)', overflow: 'hidden',
      },
    },
      people.length === 0
        ? h('div', { style: { padding: '22px 16px', textAlign: 'center' } },
            h('div', { style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--ink-2)', marginBottom: 4 } }, 'No entities match'),
            h('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 'var(--mono-xs)', color: 'var(--ink-3)' } }, '“' + query + '”')
          )
        : people.map((p) => {
            const inst = A.instById[p.instId];
            return h('button', {
              key: p.id, type: 'button', onClick: () => onPick(p.id),
              onMouseEnter: (e) => (e.currentTarget.style.background = 'var(--space-raised)'),
              onMouseLeave: (e) => (e.currentTarget.style.background = 'transparent'),
              style: { display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' },
            },
              Avatar && h(Avatar, { name: p.name, color: inst.color, size: 28 }),
              h('span', { style: { flex: 1, minWidth: 0 } },
                h('span', { style: { display: 'block', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--ink-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, p.name),
                h('span', { style: { display: 'block', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', color: 'var(--ink-3)' } }, p.role + ' · ' + inst.name)
              ),
              h('span', { style: { width: 7, height: 7, borderRadius: '50%', background: inst.color, boxShadow: `0 0 6px ${inst.color}`, flex: 'none' } })
            );
          })
    );
  }

  function Loading() {
    return h('div', {
      style: { position: 'fixed', inset: 0, zIndex: 200, display: 'grid', placeItems: 'center', background: 'var(--space-void)', animation: 'atlasFade .5s var(--ease-out) forwards', animationDelay: '.7s' },
    },
      h('div', { style: { textAlign: 'center' } },
        h('div', { className: 'atlas-pulse', style: { width: 60, height: 60, margin: '0 auto 18px', borderRadius: '50%', border: '1.5px solid var(--signal)', boxShadow: '0 0 30px -4px var(--signal-glow)' } }),
        h('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 'var(--mono-xs)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--ink-3)' } }, 'Indexing ' + A.people.length + ' entities · ' + A.institutions.length + ' institutions')
      )
    );
  }

  function StatChip() {
    return h('div', {
      style: { display: 'flex', gap: 16, alignItems: 'center', padding: '8px 14px', borderRadius: 'var(--radius-pill)', background: 'color-mix(in oklab, var(--space-deep) 80%, transparent)', border: '1px solid var(--line-soft)', backdropFilter: 'var(--blur-chip)', fontFamily: 'var(--font-mono)', fontSize: 'var(--mono-xs)', color: 'var(--ink-3)', letterSpacing: 'var(--tracking-mono)' },
    },
      h('span', null, h('span', { style: { color: 'var(--ink-1)' } }, A.institutions.length), ' inst'),
      h('span', { style: { color: 'var(--line-strong)' } }, '·'),
      h('span', null, h('span', { style: { color: 'var(--ink-1)' } }, A.people.length), ' people'),
      h('span', { style: { color: 'var(--line-strong)' } }, '·'),
      h('span', null, h('span', { style: { color: 'var(--signal)' } }, A.edges.length), ' cross-links')
    );
  }

  function App() {
    const [focusId, setFocusId] = React.useState(null);
    const [isolatedId, setIsolatedId] = React.useState(null);
    const [activeRels, setActiveRels] = React.useState(null);
    const [query, setQuery] = React.useState('');
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => { const t = setTimeout(() => setLoading(false), 1300); return () => clearTimeout(t); }, []);

    const focusPerson = focusId ? A.byId[focusId] : null;
    const profile = focusPerson ? A.buildProfile(focusPerson) : null;

    const toggleRel = (id) => {
      setActiveRels((cur) => {
        const all = ['colleague', 'former', 'family', 'business', 'financial'];
        const base = cur || all;
        const next = base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
        return next.length === all.length ? null : next;
      });
    };

    const pick = (id) => { setQuery(''); setIsolatedId(null); setFocusId(id); };

    return h('div', { style: { position: 'fixed', inset: 0, fontFamily: 'var(--font-sans)' } },
      Galaxy && h(Galaxy, { focusId, onFocus: setFocusId, isolatedId, activeRels, query }),

      // Top-left: logo + search OR back control
      h('div', { style: { position: 'absolute', top: 20, left: 22, zIndex: 60, display: 'flex', flexDirection: 'column', gap: 14 } },
        focusPerson
          ? (BackToGalaxy && h(BackToGalaxy, { onClick: () => setFocusId(null) }))
          : h(React.Fragment, null,
              h(Logo, null),
              SearchBar && h('div', null,
                h(SearchBar, { value: query, onChange: (e) => setQuery(e.target.value), width: 360,
                  count: query ? A.people.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()) || A.instById[p.instId].name.toLowerCase().includes(query.trim().toLowerCase())).length : null }),
                h(SearchResults, { query, onPick: pick })
              )
            )
      ),

      // Top-right: institution legend (hidden during focus)
      h('div', { style: { position: 'absolute', top: 20, right: 22, zIndex: 50, opacity: focusPerson ? 0 : 1, pointerEvents: focusPerson ? 'none' : 'auto', transition: 'opacity var(--dur-panel)' } },
        InstitutionLegend && h(InstitutionLegend, { institutions: A.institutions.map((i) => ({ id: i.id, name: i.name, type: i.type, color: i.color, count: i.count })), isolatedId, onIsolate: setIsolatedId })
      ),

      // Bottom-right: relationship legend (hidden during focus)
      h('div', { style: { position: 'absolute', bottom: 22, right: 22, zIndex: 50, opacity: focusPerson ? 0 : 1, pointerEvents: focusPerson ? 'none' : 'auto', transition: 'opacity var(--dur-panel)' } },
        RelationshipLegend && h(RelationshipLegend, { active: activeRels, onToggle: toggleRel })
      ),

      // Bottom-left: stats + zoom controls
      h('div', { style: { position: 'absolute', bottom: 22, left: 22, zIndex: 50, display: 'flex', alignItems: 'center', gap: 12, opacity: focusPerson ? 0 : 1, transition: 'opacity var(--dur-panel)' } },
        h(StatChip, null),
        IconButton && h('div', { style: { display: 'flex', gap: 6 } },
          h(IconButton, { variant: 'solid', label: 'Zoom in' }, h(ZoomIcon, { dir: 'in' })),
          h(IconButton, { variant: 'solid', label: 'Zoom out' }, h(ZoomIcon, { dir: 'out' })),
          h(IconButton, { variant: 'solid', label: 'Recenter' }, h(RecenterIcon, null))
        )
      ),

      // Profile / universe panel
      h('div', {
        style: {
          position: 'absolute', top: 0, right: 0, height: '100%', zIndex: 70,
          padding: 18, display: 'flex', alignItems: 'stretch',
          transform: focusPerson ? 'translateX(0)' : 'translateX(110%)',
          opacity: focusPerson ? 1 : 0,
          transition: 'transform var(--dur-panel) var(--ease-dive), opacity var(--dur-panel)',
          pointerEvents: focusPerson ? 'auto' : 'none',
        },
      },
        ProfilePanel && h(ProfilePanel, { person: profile, onClose: () => setFocusId(null), onSelectConnection: (c) => c.id && setFocusId(c.id) })
      ),

      loading && h(Loading, null)
    );
  }

  window.App = App;
})();
