/* store.js — the editable data layer for Network Atlas.
 *
 * Holds the raw graph ({ institutions, people, edges }) — NO positions or derived
 * fields; data.js computes those. Persists to localStorage and supports JSON
 * import/export. The admin UI reads getRaw() and calls the CRUD helpers; the
 * galaxy reads the built ATLAS from data.js, which is rebuilt from here. */

export const INST_TYPES = [
  { id: 'government', label: 'Government' },
  { id: 'university', label: 'University' },
  { id: 'bank', label: 'Bank / Finance' },
  { id: 'ngo', label: 'NGO / Foundation' },
  { id: 'construction', label: 'Construction' },
  { id: 'media', label: 'Media' },
];
export const INST_COLORS = [
  'var(--inst-gold)', 'var(--inst-violet)', 'var(--inst-emerald)', 'var(--inst-rose)',
  'var(--inst-amber)', 'var(--inst-azure)', 'var(--inst-cyan)', 'var(--inst-slate)',
];
export const REL_TYPES = [
  { id: 'colleague', label: 'Colleague' },
  { id: 'former', label: 'Former colleague' },
  { id: 'family', label: 'Family' },
  { id: 'business', label: 'Business' },
  { id: 'financial', label: 'Financial' },
];

const KEY = 'network-atlas-data-v1';

// ---- Seed (the original sample graph), generated as concrete editable records ----
function makeSeed() {
  // `parentId` nests an institution under another (a holding/parent). The galaxy
  // reveals children orbiting their parent on dive; top-level institutions omit it.
  const institutions = [
    { id: 'mow', name: 'Ministry of Works', type: 'government', color: 'var(--inst-gold)', count: 84 },
    { id: 'nor', name: 'Northwood University', type: 'university', color: 'var(--inst-violet)', count: 63 },
    { id: 'mer', name: 'Meridian Capital', type: 'bank', color: 'var(--inst-emerald)', count: 51 },
    { id: 'hel', name: 'Helica Foundation', type: 'ngo', color: 'var(--inst-rose)', count: 22, parentId: 'mer' },
    { id: 'van', name: 'Vance Construction', type: 'construction', color: 'var(--inst-amber)', count: 33, parentId: 'mow' },
    { id: 'orb', name: 'Orbit Media Group', type: 'media', color: 'var(--inst-azure)', count: 37 },
    { id: 'hwy', name: 'Highways Agency', type: 'government', color: 'var(--inst-cyan)', count: 28, parentId: 'mow' },
    { id: 'rail', name: 'Rail Directorate', type: 'government', color: 'var(--inst-slate)', count: 24, parentId: 'mow' },
  ];
  const NAMES = [
    'Viktor Hale', 'Dana Okonkwo', 'Mira Sol', 'Roman Vance', 'Ada Reyes', 'Karl Imo',
    'Elena Hale', 'Priya Nair', 'Tomas Berg', 'Lena Voss', 'Omar Diallo', 'Yuki Tan',
    'Greta Lind', 'Sol Ramirez', 'Ivan Petrov', 'Nadia Haq', 'Felix Mraz', 'Hana Kim',
    'Bram de Wit', 'Sana Iqbal', 'Theo Marsh', 'Cleo Park', 'Rita Mensah', 'Gus Oduya',
    'Nora Beck', 'Dimitri Vasilev', 'Asha Rao', 'Pavel Novak', 'Maya Levin', 'Otto Frey',
    'Liv Sandberg', 'Caius Roth', 'Wren Adeyemi', 'Bo Fan', 'Esme Cole', 'Jonas Welt',
    'Ife Bello', 'Kira Sato', 'Milo Vance', 'Tess Okoro',
  ];
  const roles = ['Director', 'Lead', 'Analyst', 'Officer', 'Advisor', 'Coordinator', 'Aide', 'Counsel', 'Manager', 'Partner'];
  const sizes = { mow: 10, nor: 9, mer: 8, hel: 6, van: 8, orb: 8, hwy: 5, rail: 5 };
  let ni = 0;
  const people = [];
  institutions.forEach((inst) => {
    for (let k = 0; k < sizes[inst.id]; k++) {
      people.push({ id: inst.id + '-' + k, name: NAMES[ni++ % NAMES.length], role: roles[(k + inst.id.length) % roles.length], instId: inst.id });
    }
  });
  const byId = Object.fromEntries(people.map((p) => [p.id, p]));
  const hero = (id, patch) => Object.assign(byId[id], patch);
  hero('mow-0', { name: 'Viktor Hale', role: 'Deputy Director', bridge: 'mer' });
  hero('mer-0', { name: 'Ada Reyes', role: 'Portfolio Manager' });
  hero('van-0', { name: 'Roman Vance', role: 'Founder' });
  hero('nor-0', { name: 'Mira Sol', role: 'Dean of Engineering' });
  hero('orb-0', { name: 'Elena Hale', role: 'Editor-in-Chief' });
  hero('hel-0', { name: 'Dana Okonkwo', role: 'Programme Director' });
  hero('hwy-0', { name: 'Greta Lind', role: 'Chief Engineer' });
  hero('rail-0', { name: 'Tomas Berg', role: 'Director of Rail' });

  // Make display names unique (the cycling pool + hero overrides can collide).
  const heroIds = new Set(['mow-0', 'mer-0', 'van-0', 'nor-0', 'orb-0', 'hel-0', 'hwy-0', 'rail-0']);
  const ROMAN = ['', ' II', ' III', ' IV', ' V', ' VI'];
  const taken = new Set();
  people.forEach((p) => { if (heroIds.has(p.id)) taken.add(p.name); });
  people.forEach((p) => {
    if (heroIds.has(p.id)) return;
    let k = 0, nm = p.name;
    while (taken.has(nm)) { k += 1; nm = p.name + (ROMAN[k] || ' ' + (k + 1)); }
    p.name = nm;
    taken.add(nm);
  });

  const edges = [
    ['mow-0', 'mer-0', 'financial'], ['mow-0', 'van-0', 'business'], ['mow-0', 'orb-0', 'family'],
    ['mow-0', 'nor-0', 'former'], ['van-0', 'mer-0', 'financial'], ['van-0', 'mow-3', 'business'],
    ['nor-0', 'orb-0', 'colleague'], ['nor-0', 'hel-0', 'former'], ['mer-0', 'orb-0', 'business'],
    ['hel-0', 'mow-2', 'family'], ['hel-0', 'van-3', 'financial'], ['orb-0', 'mer-2', 'business'],
    ['nor-3', 'mer-3', 'former'],
    // sub-institution ties (children carry their own cross-links)
    ['hwy-0', 'van-0', 'business'], ['rail-0', 'mow-0', 'colleague'], ['hwy-0', 'mer-0', 'financial'],
  ];
  return { institutions, people, edges };
}

// ---- Persistence ----
function clone(o) { return JSON.parse(JSON.stringify(o)); }

export function getRaw() {
  if (typeof localStorage !== 'undefined') {
    try {
      const s = localStorage.getItem(KEY);
      if (s) {
        const raw = JSON.parse(s);
        if (raw && Array.isArray(raw.institutions) && Array.isArray(raw.people) && Array.isArray(raw.edges)) return raw;
      }
    } catch (_) { /* fall through to seed */ }
  }
  return makeSeed();
}

export function saveRaw(raw) {
  if (typeof localStorage !== 'undefined') {
    try { localStorage.setItem(KEY, JSON.stringify(raw)); } catch (_) { /* quota / disabled */ }
  }
  return raw;
}

export function resetToSeed() {
  if (typeof localStorage !== 'undefined') {
    try { localStorage.removeItem(KEY); } catch (_) {}
  }
  return getRaw();
}

export function isCustomised() {
  if (typeof localStorage === 'undefined') return false;
  try { return !!localStorage.getItem(KEY); } catch (_) { return false; }
}

export function exportJSON() {
  return JSON.stringify(getRaw(), null, 2);
}

export function importJSON(text) {
  const raw = JSON.parse(text);
  if (!raw || !Array.isArray(raw.institutions) || !Array.isArray(raw.people) || !Array.isArray(raw.edges)) {
    throw new Error('Invalid file: expected { institutions, people, edges }.');
  }
  return saveRaw(raw);
}

function genId(prefix, existing) {
  let id;
  do { id = prefix + '-' + Math.random().toString(36).slice(2, 7); } while (existing.has(id));
  return id;
}

// ---- Hierarchy helpers ----
// True if making `parentId` the parent of `id` would create a cycle (parentId is
// id itself, or a descendant of id). Guards the admin parent picker.
export function wouldCycle(institutions, id, parentId) {
  if (!parentId) return false;
  if (parentId === id) return true;
  const byId = Object.fromEntries(institutions.map((i) => [i.id, i]));
  let cur = byId[parentId];
  const seen = new Set();
  while (cur) {
    if (cur.id === id) return true;          // id is an ancestor of parentId → cycle
    if (seen.has(cur.id)) break;             // pre-existing loop guard
    seen.add(cur.id);
    cur = cur.parentId ? byId[cur.parentId] : null;
  }
  return false;
}

// ---- CRUD (each returns the new raw) ----
export function upsertInstitution(patch) {
  const raw = getRaw();
  // Normalise/guard the parent link: empty string clears it; a cycle is rejected.
  const cleanParent = (id, parentId) => {
    if (!parentId) return undefined;
    if (wouldCycle(raw.institutions, id, parentId)) return undefined;
    return parentId;
  };
  if (patch.id && raw.institutions.some((i) => i.id === patch.id)) {
    raw.institutions = raw.institutions.map((i) => {
      if (i.id !== patch.id) return i;
      const next = { ...i, ...patch };
      if ('parentId' in patch) {
        const pid = cleanParent(i.id, patch.parentId);
        if (pid) next.parentId = pid; else delete next.parentId;
      }
      return next;
    });
  } else {
    const id = patch.id || genId('inst', new Set(raw.institutions.map((i) => i.id)));
    const inst = { id, name: patch.name || 'New institution', type: patch.type || 'government', color: patch.color || INST_COLORS[raw.institutions.length % INST_COLORS.length], count: patch.count || 0 };
    const pid = cleanParent(id, patch.parentId);
    if (pid) inst.parentId = pid;
    raw.institutions.push(inst);
  }
  return saveRaw(raw);
}

export function deleteInstitution(id) {
  const raw = getRaw();
  // Capture the deleted node's parent BEFORE removing it, so we can re-parent its
  // children to the grandparent (don't cascade-delete a whole sub-tree).
  const removed = raw.institutions.find((i) => i.id === id);
  const grandparent = removed && removed.parentId;
  raw.institutions = raw.institutions.filter((i) => i.id !== id);
  raw.institutions.forEach((i) => {
    if (i.parentId === id) { if (grandparent) i.parentId = grandparent; else delete i.parentId; }
  });
  const goneP = new Set(raw.people.filter((p) => p.instId === id).map((p) => p.id));
  raw.people = raw.people.filter((p) => p.instId !== id);
  raw.people.forEach((p) => { if (p.bridge === id) delete p.bridge; });
  raw.edges = raw.edges.filter(([a, b]) => !goneP.has(a) && !goneP.has(b));
  return saveRaw(raw);
}

export function addPerson(instId) {
  const raw = getRaw();
  const id = genId('p', new Set(raw.people.map((p) => p.id)));
  raw.people.push({ id, name: 'New person', role: 'Staff', instId: instId || (raw.institutions[0] && raw.institutions[0].id) || '' });
  return saveRaw(raw);
}

export function upsertPerson(patch) {
  const raw = getRaw();
  raw.people = raw.people.map((p) => {
    if (p.id !== patch.id) return p;
    const next = { ...p, ...patch };
    if (!next.bridge) delete next.bridge;
    return next;
  });
  return saveRaw(raw);
}

export function deletePerson(id) {
  const raw = getRaw();
  raw.people = raw.people.filter((p) => p.id !== id);
  raw.edges = raw.edges.filter(([a, b]) => a !== id && b !== id);
  return saveRaw(raw);
}

export function addEdge() {
  const raw = getRaw();
  raw.edges.push(['', '', 'colleague']);
  return saveRaw(raw);
}

export function updateEdge(index, edge) {
  const raw = getRaw();
  if (raw.edges[index]) raw.edges[index] = edge;
  return saveRaw(raw);
}

export function deleteEdge(index) {
  const raw = getRaw();
  raw.edges = raw.edges.filter((_, i) => i !== index);
  return saveRaw(raw);
}

export { makeSeed, clone };
