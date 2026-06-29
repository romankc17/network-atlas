/* App.jsx — the Network Atlas application shell.
 * Orchestrates overview ↔ focus, search, institution isolation, and relationship
 * filtering. Composes the design-system primitives + Galaxy, and drives the
 * camera controls (zoom / recenter) through a ref into Galaxy. */
import React from 'react';
import ATLAS from './data.js';
import Galaxy from './Galaxy.jsx';
import logoUrl from '../assets/brand/logo.svg';

const A = ATLAS;
const NS = (typeof window !== 'undefined' && window.NetworkAtlasDesignSystem_9827fa) || {};
const { SearchBar, InstitutionLegend, RelationshipLegend, RELATIONSHIP_TYPES, ProfilePanel, BackToGalaxy, IconButton, Avatar, Badge, InstitutionIcon, INSTITUTION_TYPE_LABEL } = NS;
const h = React.createElement;

function Logo() {
  return h('img', { src: logoUrl, alt: 'Network Atlas', style: { height: 36, display: 'block' } });
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

const TYPE_ABBR = { government: 'GOV', university: 'EDU', bank: 'FIN', ngo: 'NGO', construction: 'CON', media: 'MED' };
const REL_META = {
  colleague: { label: 'Colleague', color: 'var(--rel-colleague)' },
  former: { label: 'Former', color: 'var(--rel-former)' },
  family: { label: 'Family', color: 'var(--rel-family)' },
  business: { label: 'Business', color: 'var(--rel-business)' },
  financial: { label: 'Financial', color: 'var(--rel-financial)' },
};
const REL_ORDER = ['colleague', 'former', 'family', 'business', 'financial'];
const degreeOf = (id) => (A.adj[id] || []).length;

// Scoped panel CSS: staggered tile entrance (motion-safe) + cheap row hovers.
const PANEL_CSS = `
@keyframes atlasTileRise { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }
.atlas-tile { animation: atlasTileRise .42s var(--ease-out) both; }
.atlas-row:hover, .atlas-figure:hover, .atlas-linkrow:hover { background: var(--space-raised) !important; }
@media (prefers-reduced-motion: reduce) { .atlas-tile { animation: none; } }
`;

// Mono uppercase section label with an optional right-aligned count (mirrors
// ProfilePanel's SectionLabel, which is module-local there and not exported).
function SectionLabel({ children, count }) {
  return h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: 'var(--font-mono)', fontSize: 'var(--mono-2xs)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '0 0 9px' } },
    h('span', null, children),
    count != null ? h('span', null, count) : null
  );
}

// A glowing headline numeral over a mono caption, on a tinted card.
function MetricTile({ label, value, sub, accent, color, signal, delay }) {
  const glow = signal ? '0 0 16px var(--signal-glow)' : `0 0 16px color-mix(in oklab, ${color} 45%, transparent)`;
  return h('div', { className: 'atlas-tile', style: { position: 'relative', overflow: 'hidden', padding: '13px 12px 11px', borderRadius: 'var(--radius-md)', background: 'color-mix(in oklab, var(--space-surface) 70%, transparent)', border: '1px solid var(--line-soft)', animationDelay: delay + 'ms' } },
    h('span', { 'aria-hidden': true, style: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `color-mix(in oklab, ${accent} 60%, transparent)` } }),
    h('div', { style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--text-h1)', fontWeight: 600, lineHeight: 1, letterSpacing: 'var(--tracking-tight)', color: signal ? 'var(--signal-bright)' : 'var(--ink-1)', textShadow: glow } },
      value,
      sub != null ? h('span', { style: { fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--ink-3)', letterSpacing: 0 } }, sub) : null
    ),
    h('div', { style: { marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: 'var(--mono-2xs)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--ink-3)' } }, label)
  );
}

// One row of the Connections list. The list IS the connection filter: clicking a
// row toggles onPickLink; the active row tints to the target hue and expands the
// underlying person→person links in place (names route to onSelectEmployee).
function ReachRow({ row, on, onToggle, links, employeesCount, onSelectEmployee }) {
  const [hover, setHover] = React.useState(false);
  const o = row.o;
  const oc = o.color;
  return h('div', null,
    h('button', {
      type: 'button', onClick: onToggle, onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false),
      style: {
        display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '8px 9px', borderRadius: 'var(--radius-sm)',
        border: `1px solid ${on ? `color-mix(in oklab, ${oc} 50%, transparent)` : 'transparent'}`,
        borderLeft: `2px solid ${on ? oc : 'transparent'}`,
        background: on ? `color-mix(in oklab, ${oc} 16%, transparent)` : hover ? 'var(--space-raised)' : 'transparent',
        cursor: 'pointer', textAlign: 'left', transition: 'background var(--dur-hover)',
      },
    },
      h('span', { style: { width: 7, height: 7, borderRadius: '50%', background: oc, boxShadow: `0 0 7px ${oc}`, flex: 'none' } }),
      InstitutionIcon && h(InstitutionIcon, { type: o.type, size: 14, color: oc }),
      h('span', { style: { flex: 1, minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', color: on ? 'var(--ink-1)' : 'var(--ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, o.name),
      row.types.length ? h('span', { style: { display: 'inline-flex', gap: 3, flex: 'none' } },
        row.types.map((t) => h('span', { key: t, title: (REL_META[t] || {}).label, style: { width: 5, height: 5, borderRadius: '50%', background: (REL_META[t] || {}).color } }))) : null,
      h('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 'var(--mono-xs)', color: on ? 'var(--ink-1)' : 'var(--ink-3)', flex: 'none', minWidth: 12, textAlign: 'right' } }, row.n)
    ),
    on && links ? h('div', { style: { padding: '6px 8px 9px 13px' } },
      h('div', { style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', color: 'var(--ink-3)', margin: '2px 0 6px' } },
        h('span', { style: { color: 'var(--ink-1)', fontWeight: 600 } }, row.n), ` of ${employeesCount} connect to ${o.name}`),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 1 } },
        links.map((l, i) => h('button', {
          key: i, type: 'button', className: 'atlas-linkrow', onClick: () => onSelectEmployee(l.fromId),
          style: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '4px 6px', borderRadius: 'var(--radius-xs)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' },
        },
          h('span', { style: { flex: 1, minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', color: 'var(--ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } },
            l.fromName, h('span', { style: { color: 'var(--ink-4)' } }, ' → '), l.toName),
          h('span', { title: (REL_META[l.rel] || {}).label, style: { width: 14, height: 3, borderRadius: 2, flex: 'none', background: (REL_META[l.rel] || {}).color, boxShadow: `0 0 7px ${(REL_META[l.rel] || {}).color}` } })
        ))
      )
    ) : null
  );
}

// Left-docked dossier for a selected institution: an anchor-core header, glowing
// vitals tiles, a relationship-mix bar, a ranked Connections list that doubles as
// the inter-institution filter, key figures, and the full roster. The connection
// filter, employee selection, and close are all delegated up to App.
function InstitutionPanel({ instId, linkInst, onPickLink, onSelectEmployee, onClose, onDive }) {
  const inst = instId && A.instById[instId];
  if (!inst) return null;
  const C = inst.color;
  const employees = A.employeesOf(instId);
  const others = A.institutions.filter((i) => i.id !== instId);
  const breakdown = A.relBreakdown(instId);
  const crossLinks = A.crossLinksOf(instId).length;
  const target = linkInst ? A.instById[linkInst] : null;
  const children = A.childrenOf(instId);   // sub-institutions nested under this one
  const parent = A.parentOf(instId);       // the holding it sits under, if any

  // Every other institution this one links into, strongest tie first.
  const reachRows = others
    .map((o) => ({ o, n: A.linkCountBetween(instId, o.id), types: A.relTypesBetween(instId, o.id) }))
    .sort((a, b) => b.n - a.n);
  const reachable = reachRows.filter((r) => r.n > 0);
  const noLink = reachRows.length - reachable.length;

  // Strongest tie + its dominant relationship — drives the headline sentence.
  let strongest = null;
  if (reachable[0]) {
    const links = A.linksBetween(instId, reachable[0].o.id);
    const relC = {};
    links.forEach((l) => (relC[l.rel] = (relC[l.rel] || 0) + 1));
    const domRel = Object.keys(relC).sort((a, b) => relC[b] - relC[a])[0];
    strongest = { other: reachable[0].o, rel: domRel };
  }

  const typeLabel = (INSTITUTION_TYPE_LABEL && INSTITUTION_TYPE_LABEL[inst.type]) || TYPE_ABBR[inst.type] || inst.type;
  const hi = (txt) => h('span', { style: { color: 'var(--ink-1)', fontWeight: 600 } }, txt);
  const bridgeColor = (p) => (p.bridge && A.instById[p.bridge] ? A.instById[p.bridge].color : undefined);

  const tiles = [
    { label: 'Headcount', value: inst.count, accent: C },
    { label: 'Cross-links', value: crossLinks, accent: 'var(--signal)', signal: true },
    { label: 'Reach', value: reachable.length, sub: ' /' + others.length, accent: C },
    { label: 'Indexed', value: employees.length, accent: C },
  ];

  return h('div', {
    style: {
      width: 360, height: '100%', display: 'flex', flexDirection: 'column',
      background: 'color-mix(in oklab, var(--space-deep) 92%, transparent)',
      border: '1px solid var(--line-soft)', borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-panel)', backdropFilter: 'var(--blur-panel)', overflow: 'hidden',
    },
  },
    h('style', null, PANEL_CSS),

    // ---- Header: anchor-core glyph (echoes the clicked node) + identity ----
    h('div', { style: { position: 'relative', padding: '18px 18px 16px', borderBottom: '1px solid var(--line-faint)', display: 'flex', gap: 13, alignItems: 'flex-start' } },
      h('span', { 'aria-hidden': true, style: { position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(120% 80% at 20% -10%, color-mix(in oklab, ${C} 16%, transparent) 0%, transparent 60%)` } }),
      h('button', { type: 'button', onClick: onClose, 'aria-label': 'Close', style: { position: 'absolute', top: 14, right: 14, zIndex: 2, width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 'var(--radius-sm)', background: 'transparent', border: '1px solid var(--line-soft)', color: 'var(--ink-3)', cursor: 'pointer' } },
        h('svg', { width: 12, height: 12, viewBox: '0 0 12 12', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' },
          h('line', { x1: 2, y1: 2, x2: 10, y2: 10 }), h('line', { x1: 10, y1: 2, x2: 2, y2: 10 }))
      ),
      h('div', { style: { position: 'relative', width: 46, height: 46, flex: 'none', borderRadius: '50%', display: 'grid', placeItems: 'center', background: `radial-gradient(circle at 50% 38%, color-mix(in oklab, ${C} 32%, var(--space-abyss)) 0%, var(--space-abyss) 78%)`, boxShadow: `inset 0 0 0 1.5px color-mix(in oklab, ${C} 85%, transparent), 0 0 22px -6px ${C}` } },
        InstitutionIcon && h(InstitutionIcon, { type: inst.type, size: 23, color: C, glow: true }),
        h('span', { style: { position: 'absolute', inset: -5, borderRadius: '50%', border: `1px solid color-mix(in oklab, ${C} 28%, transparent)`, pointerEvents: 'none' } })
      ),
      h('div', { style: { position: 'relative', flex: 1, minWidth: 0, paddingRight: 28 } },
        h('div', { style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--text-h2)', fontWeight: 600, letterSpacing: 'var(--tracking-tight)', color: 'var(--ink-1)', lineHeight: 1.12 } }, inst.name),
        h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 } },
          Badge && h(Badge, { color: C, variant: 'outline', dot: true, mono: true }, typeLabel),
          Badge && h(Badge, { tone: 'neutral', variant: 'soft', mono: true }, inst.count + ' STAFF')
        )
      )
    ),

    // ---- Scrollable body ----
    h('div', { style: { flex: 1, overflowY: 'auto', padding: '16px 18px' } },
      // "Part of" — climb to the parent holding (when this is a sub-institution).
      parent ? h('button', {
        type: 'button', className: 'atlas-row', onClick: () => onDive && onDive(parent.id),
        style: { display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 14, padding: '5px 12px 5px 8px', borderRadius: 'var(--radius-pill)', background: 'var(--space-surface)', border: '1px solid var(--line-soft)', cursor: 'pointer' },
      },
        h('span', { style: { color: parent.color, fontSize: 12, lineHeight: 1 } }, '▲'),
        InstitutionIcon && h(InstitutionIcon, { type: parent.type, size: 13, color: parent.color }),
        h('span', { style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', color: 'var(--ink-2)' } }, 'Part of ', h('span', { style: { color: 'var(--ink-1)', fontWeight: 600 } }, parent.name))
      ) : null,

      // Narrative summary (key numerals brightened).
      h('p', { style: { margin: '0 0 16px', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', color: 'var(--ink-2)', textWrap: 'pretty' } },
        inst.name, ' — ', hi(inst.count), ' staff (', hi(employees.length), ' on record), ', hi(crossLinks), ' cross-link' + (crossLinks === 1 ? '' : 's'),
        reachable.length
          ? h(React.Fragment, null, ' into ', hi(reachable.length), ' of ' + others.length + ' institutions')
          : ' — no outside ties on record yet',
        strongest
          ? h(React.Fragment, null, '; strongest tie ',
              h('span', { style: { color: (REL_META[strongest.rel] || {}).color, fontWeight: 600 } }, (REL_META[strongest.rel] || {}).label ? REL_META[strongest.rel].label.toLowerCase() : strongest.rel),
              ' → ', hi(strongest.other.name))
          : null,
        '.'
      ),

      // Sub-institutions — the children nested under this one; click to dive into that system.
      children.length ? h('div', { style: { marginBottom: 18 } },
        h(SectionLabel, { count: children.length }, 'Sub-institutions'),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
          children.map((c) => {
            const staff = A.employeesOf(c.id).length;
            const subs = A.childrenOf(c.id).length;
            return h('button', {
              key: c.id, type: 'button', className: 'atlas-row', onClick: () => onDive && onDive(c.id),
              style: { display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--space-surface)', border: `1px solid color-mix(in oklab, ${c.color} 24%, var(--line-soft))`, borderLeft: `2px solid ${c.color}`, cursor: 'pointer', textAlign: 'left' },
            },
              h('span', { style: { position: 'relative', width: 30, height: 30, flex: 'none', borderRadius: '50%', display: 'grid', placeItems: 'center', background: `radial-gradient(circle at 50% 38%, color-mix(in oklab, ${c.color} 30%, var(--space-abyss)), var(--space-abyss) 78%)`, boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${c.color} 70%, transparent), 0 0 14px -5px ${c.color}` } },
                InstitutionIcon && h(InstitutionIcon, { type: c.type, size: 15, color: c.color })),
              h('span', { style: { flex: 1, minWidth: 0 } },
                h('span', { style: { display: 'block', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--ink-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, c.name),
                h('span', { style: { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 'var(--mono-2xs)', color: 'var(--ink-3)' } }, (subs ? subs + ' sub · ' : '') + staff + ' staff · ' + c.count + ' headcount')),
              h('span', { style: { color: c.color, fontFamily: 'var(--font-mono)', fontSize: 'var(--mono-sm)', flex: 'none' } }, '→')
            );
          }))
      ) : null,

      // Vitals — glowing display numerals (2×2).
      h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 } },
        tiles.map((t, i) => h(MetricTile, { key: t.label, label: t.label, value: t.value, sub: t.sub, accent: t.accent, signal: t.signal, color: C, delay: i * 45 }))
      ),

      // Relationship mix — proportional stacked bar + counted legend.
      crossLinks ? h('div', { style: { marginBottom: 18 } },
        h(SectionLabel, { count: crossLinks }, 'Relationship mix'),
        h('div', { style: { display: 'flex', height: 13, borderRadius: 'var(--radius-pill)', overflow: 'hidden', background: 'var(--space-abyss)', boxShadow: 'inset 0 0 0 1px var(--line-soft)' } },
          REL_ORDER.filter((r) => breakdown[r]).map((r, idx) =>
            h('span', { key: r, title: `${REL_META[r].label} · ${breakdown[r]}`, style: { flexGrow: breakdown[r], flexBasis: 0, background: REL_META[r].color, boxShadow: 'inset 0 0 6px -2px rgba(255,255,255,.35)', borderLeft: idx ? '1px solid var(--space-deep)' : 'none' } }))
        ),
        h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 14px', marginTop: 10 } },
          REL_ORDER.filter((r) => breakdown[r]).map((r) =>
            h('div', { key: r, style: { display: 'flex', alignItems: 'center', gap: 6 } },
              h('span', { style: { width: 8, height: 8, borderRadius: '50%', background: REL_META[r].color, boxShadow: `0 0 6px ${REL_META[r].color}`, flex: 'none' } }),
              h('span', { style: { flex: 1, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', color: 'var(--ink-2)' } }, REL_META[r].label),
              h('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 'var(--mono-xs)', color: 'var(--ink-1)' } }, breakdown[r])
            ))
        )
      ) : null,

      // Connections — ranked list that IS the inter-institution filter.
      h('div', { style: { marginBottom: 18 } },
        h(SectionLabel, { count: reachable.length }, 'Connections'),
        reachable.length
          ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: 3 } },
              reachable.map((row) => h(ReachRow, {
                key: row.o.id, row, on: linkInst === row.o.id,
                onToggle: () => onPickLink(linkInst === row.o.id ? null : row.o.id),
                links: linkInst === row.o.id ? A.linksBetween(instId, row.o.id) : null,
                employeesCount: employees.length, onSelectEmployee,
              })))
          : h('div', { style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', color: 'var(--ink-3)' } }, 'No links to other institutions on record.'),
        noLink ? h('div', { style: { marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 'var(--mono-2xs)', letterSpacing: 'var(--tracking-mono)', color: 'var(--ink-4)' } }, '+' + noLink + ' institution' + (noLink === 1 ? '' : 's') + ' with no links') : null
      ),

      // Key figures — the most-connected people; bridge-spanners get a split ring.
      employees.length ? h('div', { style: { marginBottom: 18 } },
        h(SectionLabel, { count: employees.length }, 'Key figures'),
        h('div', { style: { display: 'flex', gap: 10, flexWrap: 'wrap' } },
          employees.slice(0, 4).map((p) => {
            const connected = linkInst ? A.connectsToInst(p.id, linkInst) : false;
            const dim = linkInst && !connected;
            return h('button', {
              key: p.id, type: 'button', className: 'atlas-figure', onClick: () => onSelectEmployee(p.id),
              style: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, width: 62, padding: '5px 2px', borderRadius: 'var(--radius-sm)', background: 'transparent', border: 'none', cursor: 'pointer', opacity: dim ? 0.4 : 1, transition: 'opacity var(--dur-hover)' },
            },
              h('span', { style: { position: 'relative' } },
                Avatar && h(Avatar, { name: p.name, color: C, bridgeColor: bridgeColor(p), size: 40 }),
                connected ? h('span', { style: { position: 'absolute', bottom: -2, right: -2, width: 15, height: 15, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--space-deep)', boxShadow: `0 0 0 1.5px ${target.color}`, color: target.color, fontSize: 9, lineHeight: 1 } }, '→') : null
              ),
              h('span', { style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', color: 'var(--ink-1)', textAlign: 'center', lineHeight: 1.15, maxWidth: 62, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, p.name),
              h('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: p.labeled ? C : 'var(--ink-3)' } }, p.labeled ? 'Anchor' : 'Deg ' + degreeOf(p.id))
            );
          })
        )
      ) : null,

      // Roster — the full staff list; degree numerals, dim/arrow under the filter.
      h('div', null,
        h(SectionLabel, { count: employees.length }, 'Roster'),
        target ? h('div', { style: { margin: '-3px 0 8px', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', color: 'var(--ink-3)' } },
          hi(A.linkCountBetween(instId, linkInst)), ' of ' + employees.length + ' connect to ' + target.name) : null,
        h('div', { style: { display: 'flex', flexDirection: 'column' } },
          employees.map((p) => {
            const connected = linkInst ? A.connectsToInst(p.id, linkInst) : false;
            const dimRow = linkInst && !connected;
            const deg = degreeOf(p.id);
            return h('button', {
              key: p.id, type: 'button', className: 'atlas-row', onClick: () => onSelectEmployee(p.id),
              style: { display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '7px 8px', borderRadius: 'var(--radius-sm)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', opacity: dimRow ? 0.4 : 1, transition: 'opacity var(--dur-hover)' },
            },
              Avatar && h(Avatar, { name: p.name, color: C, bridgeColor: bridgeColor(p), size: 28 }),
              h('span', { style: { flex: 1, minWidth: 0 } },
                h('span', { style: { display: 'block', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--ink-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, p.name),
                h('span', { style: { display: 'block', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', color: 'var(--ink-3)' } }, p.role)
              ),
              connected
                ? h('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 'var(--mono-xs)', color: target.color, flex: 'none' } }, '→')
                : h('span', { title: deg + ' connection' + (deg === 1 ? '' : 's'), style: { fontFamily: 'var(--font-mono)', fontSize: 'var(--mono-2xs)', color: 'var(--ink-4)', flex: 'none' } }, deg ? deg : '')
            );
          })
        )
      )
    )
  );
}

// One segment of the lineage breadcrumb. A plain label crumb (the "Galaxy" root) or an
// institution crumb (with its type glyph + colour); the current node reads bolder/tinted.
function Crumb({ label, node, current, onClick }) {
  const [hov, setHov] = React.useState(false);
  return h('button', {
    type: 'button', onClick, onMouseEnter: () => setHov(true), onMouseLeave: () => setHov(false),
    style: { display: 'inline-flex', alignItems: 'center', gap: 5, flex: 'none', maxWidth: 190, padding: '4px 9px', borderRadius: 'var(--radius-sm)', background: hov ? 'var(--space-raised)' : 'transparent', border: 'none', cursor: 'pointer', transition: 'background var(--dur-hover)' },
  },
    node && InstitutionIcon ? h(InstitutionIcon, { type: node.type, size: 12, color: node.color }) : null,
    h('span', { style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', fontWeight: current ? 600 : 400, color: current && node ? node.color : 'var(--ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, node ? node.name : label)
  );
}

function App() {
  const [focusId, setFocusId] = React.useState(null);
  const [isolatedId, setIsolatedId] = React.useState(null);
  const [linkInst, setLinkInst] = React.useState(null);
  const [activeRels, setActiveRels] = React.useState(null);
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const galaxyRef = React.useRef(null);

  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 1300); return () => clearTimeout(t); }, []);

  const focusPerson = focusId ? A.byId[focusId] : null;
  const profile = focusPerson ? A.buildProfile(focusPerson) : null;
  const lineage = isolatedId ? A.lineageOf(isolatedId) : [];   // root → … → open institution

  // Relationship legend with counts — for the selected institution, or global.
  const relCounts = A.relBreakdown(isolatedId);
  const relItems = (RELATIONSHIP_TYPES || []).map((t) => ({ ...t, count: relCounts[t.id] || 0 }));

  const toggleRel = (id) => {
    setActiveRels((cur) => {
      const all = ['colleague', 'former', 'family', 'business', 'financial'];
      const base = cur || all;
      const next = base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
      return next.length === all.length ? null : next;
    });
  };

  // Selecting an institution also clears any active connection filter.
  const isolate = (id) => { setLinkInst(null); setIsolatedId(id); };
  const pick = (id) => { setQuery(''); setLinkInst(null); setIsolatedId(null); setFocusId(id); };
  const camera = (fn) => () => { const g = galaxyRef.current; if (g && g[fn]) g[fn](); };

  return h('div', { style: { position: 'fixed', inset: 0, fontFamily: 'var(--font-sans)' } },
    Galaxy && h(Galaxy, { ref: galaxyRef, focusId, onFocus: setFocusId, isolatedId, onIsolate: isolate, linkInst, activeRels, query }),

    // Top-left: logo + search (overview only), or back control during focus.
    // While an institution is selected the left side is taken by InstitutionPanel.
    h('div', { style: { position: 'absolute', top: 20, left: 22, zIndex: 60, display: 'flex', flexDirection: 'column', gap: 14 } },
      focusPerson
        ? (BackToGalaxy && h(BackToGalaxy, { onClick: () => setFocusId(null) }))
        : isolatedId
          ? null
          : h(React.Fragment, null,
              h(Logo, null),
              SearchBar && h('div', null,
                h(SearchBar, { value: query, onChange: (e) => setQuery(e.target.value), width: 360,
                  count: query ? A.people.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()) || A.instById[p.instId].name.toLowerCase().includes(query.trim().toLowerCase())).length : null }),
                h(SearchResults, { query, onPick: pick })
              )
            )
    ),

    // Top-center: lineage breadcrumb while an institution system is open (climb the hierarchy).
    (isolatedId && !focusPerson && lineage.length)
      ? h('div', {
          className: 'atlas-pop',
          style: { position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 60, display: 'flex', alignItems: 'center', gap: 4, maxWidth: '60vw', padding: '6px 12px', borderRadius: 'var(--radius-pill)', background: 'color-mix(in oklab, var(--space-deep) 84%, transparent)', border: '1px solid var(--line-soft)', backdropFilter: 'var(--blur-chip)', boxShadow: 'var(--shadow-popover)', overflow: 'hidden' },
        },
          h(Crumb, { label: '✦ Galaxy', onClick: () => isolate(null) }),
          lineage.map((node, idx) => h(React.Fragment, { key: node.id },
            h('span', { style: { color: 'var(--ink-4)', fontSize: 11, flex: 'none' } }, '▸'),
            h(Crumb, { node, current: idx === lineage.length - 1, onClick: () => isolate(node.id) })))
        )
      : null,

    // Top-right: institution legend (hidden during focus)
    h('div', { style: { position: 'absolute', top: 20, right: 22, zIndex: 50, opacity: focusPerson ? 0 : 1, pointerEvents: focusPerson ? 'none' : 'auto', transition: 'opacity var(--dur-panel)' } },
      InstitutionLegend && h(InstitutionLegend, { institutions: A.institutions.map((i) => ({ id: i.id, name: i.name, type: i.type, color: i.color, count: i.count })), isolatedId, onIsolate: isolate })
    ),

    // Bottom-right: relationship legend (hidden during focus)
    h('div', { style: { position: 'absolute', bottom: 22, right: 22, zIndex: 50, opacity: focusPerson ? 0 : 1, pointerEvents: focusPerson ? 'none' : 'auto', transition: 'opacity var(--dur-panel)' } },
      RelationshipLegend && h(RelationshipLegend, { items: relItems, active: activeRels, onToggle: toggleRel })
    ),

    // Bottom-left: stats + zoom controls (hidden during focus or institution view)
    h('div', { style: { position: 'absolute', bottom: 22, left: 22, zIndex: 50, display: 'flex', alignItems: 'center', gap: 12, opacity: (focusPerson || isolatedId) ? 0 : 1, pointerEvents: (focusPerson || isolatedId) ? 'none' : 'auto', transition: 'opacity var(--dur-panel)' } },
      h(StatChip, null),
      IconButton && h('div', { style: { display: 'flex', gap: 6 } },
        h(IconButton, { variant: 'solid', label: 'Zoom in', onClick: camera('zoomIn') }, h(ZoomIcon, { dir: 'in' })),
        h(IconButton, { variant: 'solid', label: 'Zoom out', onClick: camera('zoomOut') }, h(ZoomIcon, { dir: 'out' })),
        h(IconButton, { variant: 'solid', label: 'Recenter', onClick: camera('recenter') }, h(RecenterIcon, null))
      ),
      h('a', { href: '#/admin', title: 'Add or edit data', style: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 'var(--radius-pill)', background: 'color-mix(in oklab, var(--space-deep) 80%, transparent)', border: '1px solid var(--line-soft)', backdropFilter: 'var(--blur-chip)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', color: 'var(--ink-2)', textDecoration: 'none' } }, 'Edit data')
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

    // Institution panel (left): employees + connection explorer, shown when an
    // institution is selected and no person is focused.
    h('div', {
      style: {
        position: 'absolute', top: 0, left: 0, height: '100%', zIndex: 65,
        padding: 18, display: 'flex', alignItems: 'stretch',
        transform: (isolatedId && !focusPerson) ? 'translateX(0)' : 'translateX(-110%)',
        opacity: (isolatedId && !focusPerson) ? 1 : 0,
        transition: 'transform var(--dur-panel) var(--ease-dive), opacity var(--dur-panel)',
        pointerEvents: (isolatedId && !focusPerson) ? 'auto' : 'none',
      },
    },
      isolatedId && h(InstitutionPanel, { instId: isolatedId, linkInst, onPickLink: setLinkInst, onSelectEmployee: setFocusId, onClose: () => isolate(null), onDive: isolate })
    ),

    loading && h(Loading, null)
  );
}

export default App;
