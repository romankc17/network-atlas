/* data.js — builds the rendered graph (ATLAS) from the editable store.
 *
 * The store holds raw records; here we compute everything the galaxy needs:
 * institution positions (grid), person positions (orbit rings), node sizes,
 * adjacency, labels, and the profile builder. ATLAS is a STABLE object that
 * `rebuild()` repopulates in place, so importers keep a valid reference while
 * the underlying data changes (e.g. after admin edits). */
import { getRaw } from './store.js';

const CANVAS = { w: 1680, h: 940 };

// ---- Layout ---------------------------------------------------------------
function layoutInstitutions(institutions) {
  const n = institutions.length || 1;
  const cols = Math.max(1, Math.round(Math.sqrt(n * CANVAS.w / CANVAS.h)));
  const rows = Math.ceil(n / cols);
  // Asymmetric margins leave room for the on-screen chrome (wider right gap for
  // the institution/relationship legends) so anchors never hide behind a panel.
  const padL = CANVAS.w * 0.12, padR = CANVAS.w * 0.24;
  const padT = CANVAS.h * 0.17, padB = CANVAS.h * 0.18;
  const gw = CANVAS.w - padL - padR, gh = CANVAS.h - padT - padB;
  institutions.forEach((inst, i) => {
    const c = i % cols, r = Math.floor(i / cols);
    inst.cx = Math.round(padL + (cols === 1 ? 0.5 : c / (cols - 1)) * gw);
    inst.cy = Math.round(padT + (rows === 1 ? 0.5 : r / (rows - 1)) * gh);
  });
}

function placeOnRings(inst, list) {
  let idx = 0, ring = 0;
  while (idx < list.length) {
    const baseR = 70 + ring * 54;
    const cap = ring === 0 ? Math.min(list.length, 5) : 6 + ring * 2;
    const count = Math.min(cap, list.length - idx);
    for (let k = 0; k < count; k++) {
      const a = (k / count) * Math.PI * 2 + ring * 0.5 + inst.cx * 0.0007;
      const jitter = ((k * 9301 + ring * 49297) % 23) / 23 - 0.5;
      const r = baseR + jitter * 16;
      const p = list[idx];
      p.x = Math.round(inst.cx + Math.cos(a) * r);
      p.y = Math.round(inst.cy + Math.sin(a) * r * 0.82);
      idx += 1;
    }
    ring += 1;
  }
}

function layoutPeople(institutions, peopleByInst) {
  institutions.forEach((inst) => {
    const mine = peopleByInst[inst.id] || [];
    placeOnRings(inst, mine.filter((p) => !p.labeled));
    const labeled = mine.filter((p) => p.labeled);
    labeled.forEach((p, i) => {
      const a = (i / Math.max(1, labeled.length)) * Math.PI * 2 + 0.4;
      p.x = Math.round(inst.cx + Math.cos(a) * 152);
      p.y = Math.round(inst.cy + Math.sin(a) * 152 * 0.82);
    });
  });
}

// ---- Build ----------------------------------------------------------------
const ATLAS = {
  CANVAS,
  institutions: [],
  instById: {},
  people: [],
  byId: {},
  edges: [],
  adj: {},
  buildProfile,
  egoOf(id) {
    const set = new Set([id]);
    (ATLAS.adj[id] || []).forEach((e) => set.add(e.id));
    return set;
  },
  connectsToInst(personId, instId) {
    return (ATLAS.adj[personId] || []).some((e) => ATLAS.byId[e.id] && ATLAS.byId[e.id].instId === instId);
  },
  employeesOf(instId) {
    return ATLAS.people.filter((p) => p.instId === instId).sort((a, b) => b.conn - a.conn);
  },
  // ---- Hierarchy (parent ⇄ child institutions) ----
  childrenOf(instId) {
    return ATLAS.institutions.filter((i) => i.parentId === instId);
  },
  parentOf(instId) {
    const inst = ATLAS.instById[instId];
    return inst && inst.parentId ? ATLAS.instById[inst.parentId] : null;
  },
  hasChildren(instId) {
    return ATLAS.institutions.some((i) => i.parentId === instId);
  },
  // Root → … → self, walking parentId up (loop-guarded). Drives the breadcrumb.
  lineageOf(instId) {
    const path = [];
    const seen = new Set();
    let cur = ATLAS.instById[instId];
    while (cur && !seen.has(cur.id)) {
      seen.add(cur.id);
      path.unshift(cur);
      cur = cur.parentId ? ATLAS.instById[cur.parentId] : null;
    }
    return path;
  },
  linkCountBetween(instA, instB) {
    return ATLAS.people.filter((p) => p.instId === instA && ATLAS.connectsToInst(p.id, instB)).length;
  },
  crossLinksOf(instId) {
    return ATLAS.edges
      .filter(([a, b]) => ATLAS.byId[a].instId === instId || ATLAS.byId[b].instId === instId)
      .map(([a, b, rel]) => ({ a, b, rel }));
  },
  linksBetween(instA, instB) {
    return ATLAS.edges
      .filter(([a, b]) => (ATLAS.byId[a].instId === instA && ATLAS.byId[b].instId === instB) || (ATLAS.byId[a].instId === instB && ATLAS.byId[b].instId === instA))
      .map(([a, b, rel]) => {
        const aIsA = ATLAS.byId[a].instId === instA;
        const fromId = aIsA ? a : b, toId = aIsA ? b : a;
        return { fromId, toId, fromName: ATLAS.byId[fromId].name, toName: ATLAS.byId[toId].name, rel };
      });
  },
  relTypesBetween(instA, instB) {
    return [...new Set(ATLAS.linksBetween(instA, instB).map((l) => l.rel))];
  },
  relBreakdown(instId) {
    const src = instId ? ATLAS.crossLinksOf(instId) : ATLAS.edges.map(([a, b, rel]) => ({ a, b, rel }));
    const out = {};
    src.forEach(({ rel }) => (out[rel] = (out[rel] || 0) + 1));
    return out;
  },
};

const REL_LABEL = { colleague: 'colleague', former: 'former-colleague', family: 'family', business: 'business', financial: 'financial' };

function buildProfile(p) {
  const inst = ATLAS.instById[p.instId] || { name: '—', type: 'government', color: 'var(--inst-slate)' };
  const institutions = [{ name: inst.name, type: inst.type, color: inst.color, role: p.role }];
  if (p.bridge && ATLAS.instById[p.bridge]) {
    const b = ATLAS.instById[p.bridge];
    institutions.push({ name: b.name, type: b.type, color: b.color, role: 'Advisory Board' });
  }
  const connections = (ATLAS.adj[p.id] || []).map(({ id, rel }) => {
    const q = ATLAS.byId[id];
    const qi = ATLAS.instById[q.instId] || {};
    return { id: q.id, name: q.name, role: q.role, institution: qi.name, color: qi.color,
             bridgeColor: q.bridge && ATLAS.instById[q.bridge] ? ATLAS.instById[q.bridge].color : undefined, relType: rel };
  });
  const phone = '+44 7700 ' + (900000 + (p.id.charCodeAt(0) * 137 + p.name.length * 991) % 99999);

  const links = ATLAS.adj[p.id] || [];
  const otherInsts = new Set(links.map((c) => ATLAS.byId[c.id].instId).filter((id) => id !== p.instId));
  const relCount = {};
  links.forEach((c) => (relCount[c.rel] = (relCount[c.rel] || 0) + 1));
  const relPhrase = Object.keys(relCount).map((r) => relCount[r] + ' ' + REL_LABEL[r]).join(' · ');
  let summary = 'Linked to ' + links.length + (links.length === 1 ? ' person' : ' people');
  if (otherInsts.size) summary += ' across ' + otherInsts.size + ' other ' + (otherInsts.size === 1 ? 'institution' : 'institutions');
  summary += '.';
  if (relPhrase) summary += '  ' + relPhrase + '.';
  if (p.bridge && ATLAS.instById[p.bridge]) summary += '  Bridges ' + inst.name + ' ↔ ' + ATLAS.instById[p.bridge].name + '.';

  const parts = p.name.split(' ');
  const last = parts[1] || parts[0];
  return {
    id: p.id,
    name: p.name,
    institutions,
    tenure: (2010 + (p.name.length % 9)) + ' — present',
    contact: {
      phone: phone.slice(0, 13) + ' ' + phone.slice(13),
      email: p.name.toLowerCase().replace(/[^a-z]/g, '.').replace(/\.+/g, '.') + '@' + p.instId + '.org',
      location: (51 + (Math.abs(p.x || 0) % 4) * 0.01).toFixed(4) + ', ' + (-0.12 - (Math.abs(p.y || 0) % 6) * 0.01).toFixed(4),
      id: 'ATL-' + (10000 + ATLAS.people.indexOf(p) * 311).toString().slice(0, 5),
    },
    summary,
    family: p.labeled ? [
      { name: parts[0][0] + '. ' + last, relation: 'Spouse', color: 'var(--inst-rose)' },
      { name: 'J. ' + last, relation: 'Sibling', color: 'var(--inst-slate)' },
    ] : [],
    connections,
  };
}

export function rebuild() {
  const raw = getRaw();
  const institutions = raw.institutions.map((i) => ({ ...i }));
  const instById = Object.fromEntries(institutions.map((i) => [i.id, i]));
  const people = raw.people.map((p) => ({ ...p }));
  const byId = Object.fromEntries(people.map((p) => [p.id, p]));
  // Drop edges whose endpoints no longer exist (admin may have deleted people).
  const edges = raw.edges.filter((e) => e[0] && e[1] && byId[e[0]] && byId[e[1]]);

  layoutInstitutions(institutions);

  const adj = {};
  people.forEach((p) => { adj[p.id] = []; });
  edges.forEach(([a, b, rel]) => { adj[a].push({ id: b, rel }); adj[b].push({ id: a, rel }); });

  // Derived per-person fields: colour, institution name, node size, label flag.
  people.forEach((p) => {
    const inst = instById[p.instId];
    p.color = (inst && inst.color) || 'var(--inst-slate)';
    p.instName = (inst && inst.name) || '';
    p.conn = 5 + (adj[p.id] ? adj[p.id].length : 0) * 4 + (p.id.charCodeAt(p.id.length - 1) % 6);
    p.labeled = false;
  });

  // Label the most-connected person per institution.
  institutions.forEach((inst) => {
    const mine = people.filter((p) => p.instId === inst.id).sort((a, b) => adj[b.id].length - adj[a.id].length || b.conn - a.conn);
    if (mine[0]) { mine[0].labeled = true; mine[0].conn = Math.max(mine[0].conn, 18); }
  });

  // A few intra-institution colleague links for the labelled (anchor) people.
  people.forEach((p) => {
    if (!p.labeled) return;
    people.filter((q) => q.instId === p.instId && q.id !== p.id).slice(0, 3).forEach((m) => {
      if (!adj[p.id].some((e) => e.id === m.id)) {
        adj[p.id].push({ id: m.id, rel: 'colleague' });
        adj[m.id].push({ id: p.id, rel: 'colleague' });
      }
    });
  });

  const peopleByInst = {};
  people.forEach((p) => { (peopleByInst[p.instId] = peopleByInst[p.instId] || []).push(p); });
  layoutPeople(institutions, peopleByInst);

  ATLAS.institutions = institutions;
  ATLAS.instById = instById;
  ATLAS.people = people;
  ATLAS.byId = byId;
  ATLAS.edges = edges;
  ATLAS.adj = adj;
  return ATLAS;
}

rebuild();

export default ATLAS;
