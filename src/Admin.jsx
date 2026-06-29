/* Admin.jsx — data-entry site for Network Atlas.
 * Inline-editable CRUD over the store (institutions / people / connections),
 * with JSON export/import and reset. Everything saves to the browser (localStorage)
 * immediately; switching to the galaxy (#/) reflects the changes. */
import React from 'react';
import logoUrl from '../assets/brand/logo.svg';
import {
  getRaw, exportJSON, importJSON, resetToSeed, isCustomised,
  upsertInstitution, deleteInstitution, addPerson, upsertPerson, deletePerson,
  addEdge, updateEdge, deleteEdge, INST_TYPES, INST_COLORS, REL_TYPES,
} from './store.js';

const h = React.createElement;

const S = {
  input: { background: 'var(--space-surface)', border: '1px solid var(--line-soft)', borderRadius: 'var(--radius-sm)', color: 'var(--ink-1)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', padding: '7px 10px', outline: 'none', width: '100%' },
  card: { background: 'color-mix(in oklab, var(--space-deep) 92%, transparent)', border: '1px solid var(--line-soft)', borderRadius: 'var(--radius-md)', padding: 12, display: 'flex', alignItems: 'center', gap: 10 },
  label: { fontFamily: 'var(--font-mono)', fontSize: 'var(--mono-xs)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--ink-3)' },
  btn: { fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-soft)', background: 'var(--space-surface)', color: 'var(--ink-1)', cursor: 'pointer' },
  btnPrimary: { fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 600, padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--signal)', background: 'var(--signal-wash)', color: 'var(--signal-bright)', cursor: 'pointer' },
  icon: { width: 30, height: 30, flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-soft)', background: 'transparent', color: 'var(--ink-3)', cursor: 'pointer', fontSize: 16, lineHeight: 1 },
};

function Field({ label, children }) {
  return h('label', { style: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 } },
    h('span', { style: S.label }, label), children);
}

function Section({ title, count, action, children }) {
  return h('section', { style: { marginTop: 26 } },
    h('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 } },
      h('h2', { style: { margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-h3)', color: 'var(--ink-1)' } }, title,
        h('span', { style: { marginLeft: 8, fontFamily: 'var(--font-mono)', fontSize: 'var(--mono-xs)', color: 'var(--ink-3)' } }, count)),
      action),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } }, children));
}

function Admin() {
  const [raw, setRaw] = React.useState(getRaw);
  const [tab, setTab] = React.useState('institutions');
  const [filterInst, setFilterInst] = React.useState('all');
  const [msg, setMsg] = React.useState(null);
  const fileRef = React.useRef(null);

  const instById = Object.fromEntries(raw.institutions.map((i) => [i.id, i]));
  const peopleCount = (id) => raw.people.filter((p) => p.instId === id).length;
  // Every institution beneath `id` (transitively) — excluded from its parent picker to bar cycles.
  const descendantsOf = (id) => {
    const out = new Set(); const stack = [id];
    while (stack.length) {
      const cur = stack.pop();
      raw.institutions.forEach((i) => { if (i.parentId === cur && !out.has(i.id)) { out.add(i.id); stack.push(i.id); } });
    }
    return out;
  };
  const personLabel = (id) => { const p = raw.people.find((x) => x.id === id); return p ? p.name + ' · ' + ((instById[p.instId] || {}).name || '?') : '— pick person —'; };

  const flash = (text, tone) => { setMsg({ text, tone }); setTimeout(() => setMsg(null), 3000); };

  const doExport = () => {
    const blob = new Blob([exportJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'network-atlas-data.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    flash('Exported network-atlas-data.json', 'ok');
  };
  const doImport = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { importJSON(String(reader.result)); setRaw(getRaw()); flash('Imported successfully', 'ok'); }
      catch (err) { flash('Import failed: ' + err.message, 'err'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  const doReset = () => { if (window.confirm('Reset all data back to the sample graph? Your edits will be lost.')) { setRaw(resetToSeed()); flash('Reset to sample data', 'ok'); } };

  // ---- Tab bodies ----
  const institutionsTab = () => h(Section, {
    title: 'Institutions', count: raw.institutions.length,
    action: h('button', { type: 'button', style: S.btnPrimary, onClick: () => setRaw(upsertInstitution({})) }, '+ Add institution'),
  },
    raw.institutions.length === 0 ? h('p', { style: { color: 'var(--ink-3)', fontFamily: 'var(--font-sans)' } }, 'No institutions yet.') : null,
    raw.institutions.map((inst) => h('div', { key: inst.id, style: S.card },
      // colour swatches
      h('div', { style: { display: 'flex', gap: 4, flex: 'none' } },
        INST_COLORS.map((c) => h('button', {
          key: c, type: 'button', 'aria-label': c, title: c,
          onClick: () => setRaw(upsertInstitution({ id: inst.id, color: c })),
          style: { width: 16, height: 16, borderRadius: '50%', background: c, border: inst.color === c ? '2px solid var(--ink-1)' : '2px solid transparent', cursor: 'pointer', padding: 0 },
        }))),
      h(Field, { label: 'Name' }, h('input', { style: S.input, value: inst.name, onChange: (e) => setRaw(upsertInstitution({ id: inst.id, name: e.target.value })) })),
      h(Field, { label: 'Type' }, h('select', { style: S.input, value: inst.type, onChange: (e) => setRaw(upsertInstitution({ id: inst.id, type: e.target.value })) },
        INST_TYPES.map((t) => h('option', { key: t.id, value: t.id }, t.label)))),
      h(Field, { label: 'Parent' }, h('select', { style: S.input, value: inst.parentId || '', onChange: (e) => setRaw(upsertInstitution({ id: inst.id, parentId: e.target.value || undefined })) },
        h('option', { value: '' }, '— top level —'),
        (() => { const blocked = descendantsOf(inst.id); return raw.institutions.filter((o) => o.id !== inst.id && !blocked.has(o.id)); })()
          .map((o) => h('option', { key: o.id, value: o.id }, o.name)))),
      h('div', { style: { width: 90, flex: 'none' } }, h(Field, { label: 'Headcount' }, h('input', { type: 'number', min: 0, style: S.input, value: inst.count, onChange: (e) => setRaw(upsertInstitution({ id: inst.id, count: Number(e.target.value) || 0 })) }))),
      h('span', { style: { width: 70, flex: 'none', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 'var(--mono-xs)', color: 'var(--ink-3)' } }, peopleCount(inst.id) + ' ppl'),
      h('button', { type: 'button', title: 'Delete institution', style: S.icon, onClick: () => { if (window.confirm('Delete ' + inst.name + ' and its ' + peopleCount(inst.id) + ' people?')) setRaw(deleteInstitution(inst.id)); } }, '×'))));

  const peopleList = filterInst === 'all' ? raw.people : raw.people.filter((p) => p.instId === filterInst);
  const peopleTab = () => h(Section, {
    title: 'People', count: peopleList.length + (filterInst === 'all' ? '' : ' / ' + raw.people.length),
    action: h('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
      h('select', { style: { ...S.input, width: 'auto' }, value: filterInst, onChange: (e) => setFilterInst(e.target.value) },
        h('option', { value: 'all' }, 'All institutions'),
        raw.institutions.map((i) => h('option', { key: i.id, value: i.id }, i.name))),
      h('button', { type: 'button', style: S.btnPrimary, onClick: () => setRaw(addPerson(filterInst === 'all' ? undefined : filterInst)) }, '+ Add person')),
  },
    raw.institutions.length === 0 ? h('p', { style: { color: 'var(--ink-3)', fontFamily: 'var(--font-sans)' } }, 'Add an institution first.') : null,
    peopleList.map((p) => h('div', { key: p.id, style: S.card },
      h(Field, { label: 'Name' }, h('input', { style: S.input, value: p.name, onChange: (e) => setRaw(upsertPerson({ id: p.id, name: e.target.value })) })),
      h(Field, { label: 'Role' }, h('input', { style: S.input, value: p.role, onChange: (e) => setRaw(upsertPerson({ id: p.id, role: e.target.value })) })),
      h(Field, { label: 'Institution' }, h('select', { style: S.input, value: p.instId, onChange: (e) => setRaw(upsertPerson({ id: p.id, instId: e.target.value })) },
        raw.institutions.map((i) => h('option', { key: i.id, value: i.id }, i.name)))),
      h(Field, { label: 'Also advises (bridge)' }, h('select', { style: S.input, value: p.bridge || '', onChange: (e) => setRaw(upsertPerson({ id: p.id, bridge: e.target.value || undefined })) },
        h('option', { value: '' }, '— none —'),
        raw.institutions.filter((i) => i.id !== p.instId).map((i) => h('option', { key: i.id, value: i.id }, i.name)))),
      h('button', { type: 'button', title: 'Delete person', style: S.icon, onClick: () => setRaw(deletePerson(p.id)) }, '×'))));

  const connectionsTab = () => h(Section, {
    title: 'Connections', count: raw.edges.length,
    action: h('button', { type: 'button', style: S.btnPrimary, onClick: () => setRaw(addEdge()), disabled: raw.people.length < 2 }, '+ Add connection'),
  },
    raw.people.length < 2 ? h('p', { style: { color: 'var(--ink-3)', fontFamily: 'var(--font-sans)' } }, 'Add at least two people to connect them.') : null,
    raw.edges.map((e, i) => h('div', { key: i, style: S.card },
      h(Field, { label: 'From' }, h('select', { style: S.input, value: e[0], onChange: (ev) => setRaw(updateEdge(i, [ev.target.value, e[1], e[2]])) },
        h('option', { value: '' }, '— pick person —'),
        raw.people.map((p) => h('option', { key: p.id, value: p.id }, personLabel(p.id))))),
      h('span', { style: { flex: 'none', color: 'var(--ink-3)', fontSize: 18 } }, '→'),
      h(Field, { label: 'To' }, h('select', { style: S.input, value: e[1], onChange: (ev) => setRaw(updateEdge(i, [e[0], ev.target.value, e[2]])) },
        h('option', { value: '' }, '— pick person —'),
        raw.people.map((p) => h('option', { key: p.id, value: p.id }, personLabel(p.id))))),
      h('div', { style: { width: 170, flex: 'none' } }, h(Field, { label: 'Relationship' }, h('select', { style: S.input, value: e[2], onChange: (ev) => setRaw(updateEdge(i, [e[0], e[1], ev.target.value])) },
        REL_TYPES.map((t) => h('option', { key: t.id, value: t.id }, t.label))))),
      h('button', { type: 'button', title: 'Delete connection', style: S.icon, onClick: () => setRaw(deleteEdge(i)) }, '×'))));

  const TABS = [['institutions', 'Institutions'], ['people', 'People'], ['connections', 'Connections']];

  return h('div', { style: { position: 'fixed', inset: 0, overflow: 'auto', background: 'var(--space-void)', fontFamily: 'var(--font-sans)' } },
    h('div', { style: { maxWidth: 1080, margin: '0 auto', padding: '26px 28px 80px' } },
      // header
      h('header', { style: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' } },
        h('a', { href: '#/', style: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' } },
          h('img', { src: logoUrl, alt: 'Network Atlas', style: { height: 30 } })),
        h('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 'var(--mono-xs)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--ink-3)', borderLeft: '1px solid var(--line-strong)', paddingLeft: 16 } }, 'Data Admin'),
        h('div', { style: { marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' } },
          msg ? h('span', { style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', color: msg.tone === 'err' ? 'var(--rel-family)' : 'var(--signal-bright)' } }, msg.text) : null,
          h('button', { type: 'button', style: S.btn, onClick: doExport }, 'Export JSON'),
          h('button', { type: 'button', style: S.btn, onClick: () => fileRef.current && fileRef.current.click() }, 'Import JSON'),
          h('input', { ref: fileRef, type: 'file', accept: 'application/json,.json', onChange: doImport, style: { display: 'none' } }),
          h('button', { type: 'button', style: S.btn, onClick: doReset }, 'Reset'),
          h('a', { href: '#/', style: S.btnPrimary }, 'View galaxy →'))),
      h('p', { style: { color: 'var(--ink-3)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', marginTop: 14, maxWidth: 620 } },
        'Edits save to this browser automatically' + (isCustomised() ? ' (custom data active)' : ' (showing sample data)') + '. Use Export/Import to back up or move your graph.'),

      // tabs
      h('div', { style: { display: 'flex', gap: 4, marginTop: 22, borderBottom: '1px solid var(--line-soft)' } },
        TABS.map(([id, label]) => h('button', {
          key: id, type: 'button', onClick: () => setTab(id),
          style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: tab === id ? 600 : 400, padding: '10px 16px', background: 'transparent', border: 'none', borderBottom: tab === id ? '2px solid var(--signal)' : '2px solid transparent', color: tab === id ? 'var(--ink-1)' : 'var(--ink-3)', cursor: 'pointer' },
        }, label))),

      tab === 'institutions' ? institutionsTab() : tab === 'people' ? peopleTab() : connectionsTab()));
}

export default Admin;
