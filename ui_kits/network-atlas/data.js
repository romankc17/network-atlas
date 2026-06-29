/* Network Atlas — sample investigative graph.
 * A plain-JS module (no build step): sets window.ATLAS = { institutions, people,
 * edges, CANVAS }. Person positions are precomputed here so the galaxy view just
 * reads {x, y}. Deterministic — no randomness at render time. */
(function () {
  const CANVAS = { w: 1680, h: 940 };

  // id, name, type, colour var, cluster centre, headcount label
  const institutions = [
    { id: 'mow', name: 'Ministry of Works',   type: 'government',   color: 'var(--inst-gold)',    cx: 470,  cy: 320, count: 84 },
    { id: 'nor', name: 'Northwood University', type: 'university',   color: 'var(--inst-violet)',  cx: 880,  cy: 250, count: 63 },
    { id: 'mer', name: 'Meridian Capital',     type: 'bank',         color: 'var(--inst-emerald)', cx: 1290, cy: 330, count: 51 },
    { id: 'hel', name: 'Helica Foundation',    type: 'ngo',          color: 'var(--inst-rose)',    cx: 320,  cy: 720, count: 22 },
    { id: 'van', name: 'Vance Construction',   type: 'construction', color: 'var(--inst-amber)',   cx: 800,  cy: 720, count: 33 },
    { id: 'orb', name: 'Orbit Media Group',    type: 'media',        color: 'var(--inst-azure)',   cx: 1280, cy: 720, count: 37 },
  ];
  const instById = Object.fromEntries(institutions.map((i) => [i.id, i]));

  // ---- People. Each cluster gets N people placed on 1–2 orbit rings. ----
  const NAMES = [
    'Viktor Hale','Dana Okonkwo','Mira Sol','Roman Vance','Ada Reyes','Karl Imo',
    'Elena Hale','Priya Nair','Tomas Berg','Lena Voss','Omar Diallo','Yuki Tan',
    'Greta Lind','Sol Ramirez','Ivan Petrov','Nadia Haq','Felix Mraz','Hana Kim',
    'Bram de Wit','Sana Iqbal','Theo Marsh','Cleo Park','Rita Mensah','Gus Oduya',
    'Nora Beck','Dimitri Vasilev','Asha Rao','Pavel Novak','Maya Levin','Otto Frey',
    'Liv Sandberg','Caius Roth','Wren Adeyemi','Bo Fan','Esme Cole','Jonas Welt',
    'Ife Bello','Kira Sato','Milo Vance','Tess Okoro',
  ];
  let ni = 0;
  const nextName = () => NAMES[ni++ % NAMES.length];

  function ring(inst, items) {
    // items: [{r, n, big?}] orbit specs; returns placed people
    const out = [];
    items.forEach((spec, ringIdx) => {
      for (let k = 0; k < spec.n; k++) {
        const a = (k / spec.n) * Math.PI * 2 + ringIdx * 0.6 + inst.cx * 0.0007;
        const jitter = ((k * 9301 + ringIdx * 49297) % 23) / 23 - 0.5;
        const r = spec.r + jitter * 18;
        out.push({
          inst: inst.id,
          color: inst.color,
          x: Math.round(inst.cx + Math.cos(a) * r),
          y: Math.round(inst.cy + Math.sin(a) * r * 0.82),
          conn: spec.big ? 14 + ((k * 7) % 9) : 4 + ((k * 5) % 6),
        });
      }
    });
    return out;
  }

  const people = [];
  const roles = ['Director','Lead','Analyst','Officer','Advisor','Coordinator','Aide','Counsel','Manager','Partner'];
  function addCluster(instId, rings) {
    const inst = instById[instId];
    ring(inst, rings).forEach((p, idx) => {
      const id = instId + '-' + idx;
      people.push({
        id,
        name: nextName(),
        role: roles[(idx + instId.length) % roles.length],
        instId,
        instName: inst.name,
        ...p,
        labeled: false,
      });
    });
  }
  addCluster('mow', [{ r: 78, n: 4, big: true }, { r: 138, n: 6 }]);
  addCluster('nor', [{ r: 74, n: 3, big: true }, { r: 132, n: 6 }]);
  addCluster('mer', [{ r: 72, n: 3, big: true }, { r: 128, n: 5 }]);
  addCluster('hel', [{ r: 62, n: 3, big: true }, { r: 112, n: 3 }]);
  addCluster('van', [{ r: 70, n: 3, big: true }, { r: 124, n: 5 }]);
  addCluster('orb', [{ r: 70, n: 3, big: true }, { r: 126, n: 5 }]);

  const byId = Object.fromEntries(people.map((p) => [p.id, p]));

  // Label the single most-connected person per institution (no label spaghetti)
  institutions.forEach((inst) => {
    const mine = people.filter((p) => p.instId === inst.id);
    mine.sort((a, b) => b.conn - a.conn);
    if (mine[0]) { mine[0].labeled = true; mine[0].conn = Math.max(mine[0].conn, 18); }
  });

  // ---- Hero people: give recognisable names + the bridge person ----
  function setHero(id, patch) { Object.assign(byId[id], patch); }
  setHero('mow-0', { name: 'Viktor Hale', role: 'Deputy Director', labeled: true, conn: 22, bridge: 'mer' });
  setHero('mer-0', { name: 'Ada Reyes', role: 'Portfolio Manager', labeled: true, conn: 19 });
  setHero('van-0', { name: 'Roman Vance', role: 'Founder', labeled: true, conn: 20 });
  setHero('nor-0', { name: 'Mira Sol', role: 'Dean of Engineering', labeled: true, conn: 18 });
  setHero('orb-0', { name: 'Elena Hale', role: 'Editor-in-Chief', labeled: true, conn: 17 });
  setHero('hel-0', { name: 'Dana Okonkwo', role: 'Programme Director', labeled: true, conn: 16 });

  // Push labelled people onto an outer orbit so their labels clear the anchor.
  people.forEach((p) => {
    if (!p.labeled) return;
    const inst = instById[p.instId];
    const ang = Math.atan2((p.y - inst.cy) / 0.82, p.x - inst.cx);
    p.x = Math.round(inst.cx + Math.cos(ang) * 152);
    p.y = Math.round(inst.cy + Math.sin(ang) * 152 * 0.82);
  });

  // ---- Cross-institution edges (the investigative signal) ----
  // [a, b, relType]
  const edges = [
    ['mow-0', 'mer-0', 'financial'],
    ['mow-0', 'van-0', 'business'],
    ['mow-0', 'orb-0', 'family'],
    ['mow-0', 'nor-0', 'former'],
    ['van-0', 'mer-0', 'financial'],
    ['van-0', 'mow-3', 'business'],
    ['nor-0', 'orb-0', 'colleague'],
    ['nor-0', 'hel-0', 'former'],
    ['mer-0', 'orb-0', 'business'],
    ['hel-0', 'mow-2', 'family'],
    ['hel-0', 'van-3', 'financial'],
    ['orb-0', 'mer-2', 'business'],
    ['nor-3', 'mer-3', 'former'],
  ];

  // Build adjacency for ego-networks
  const adj = {};
  people.forEach((p) => (adj[p.id] = []));
  edges.forEach(([a, b, rel]) => {
    adj[a].push({ id: b, rel });
    adj[b].push({ id: a, rel });
  });
  // intra-institution colleague links for hero people (a few each)
  people.forEach((p) => {
    if (!p.labeled) return;
    const mates = people.filter((q) => q.instId === p.instId && q.id !== p.id).slice(0, 3);
    mates.forEach((m) => {
      if (!adj[p.id].some((e) => e.id === m.id)) {
        adj[p.id].push({ id: m.id, rel: 'colleague' });
        adj[m.id].push({ id: p.id, rel: 'colleague' });
      }
    });
  });

  // ---- Profiles for the focus panel ----
  const REL_BY_ID = {};
  function buildProfile(p) {
    const inst = instById[p.instId];
    const institutions = [{ name: inst.name, type: inst.type, color: inst.color, role: p.role }];
    if (p.bridge) {
      const b = instById[p.bridge];
      institutions.push({ name: b.name, type: b.type, color: b.color, role: 'Advisory Board' });
    }
    const connections = (adj[p.id] || []).map(({ id, rel }) => {
      const q = byId[id];
      const qi = instById[q.instId];
      return { id: q.id, name: q.name, role: q.role, institution: qi.name, color: qi.color,
               bridgeColor: q.bridge ? instById[q.bridge].color : undefined, relType: rel };
    });
    const phone = '+44 7700 ' + (900000 + (p.id.charCodeAt(0) * 137 + p.name.length * 991) % 99999);
    return {
      id: p.id,
      name: p.name,
      institutions,
      tenure: (2010 + (p.name.length % 9)) + ' — present',
      contact: {
        phone: phone.slice(0, 13) + ' ' + phone.slice(13),
        email: p.name.toLowerCase().replace(/[^a-z]/g, '.').replace(/\.+/g, '.') + '@' + p.instId + '.org',
        location: (51 + (p.x % 4) * 0.01).toFixed(4) + ', ' + (-0.12 - (p.y % 6) * 0.01).toFixed(4),
        id: 'ATL-' + (10000 + people.indexOf(p) * 311).toString().slice(0, 5),
      },
      summary: p.bridge
        ? 'Spans two institutions — the strongest cross-institution link in this part of the graph.'
        : undefined,
      family: p.labeled ? [
        { name: p.name.split(' ')[0][0] + '. ' + p.name.split(' ')[1], relation: 'Spouse', color: 'var(--inst-rose)' },
        { name: 'J. ' + p.name.split(' ')[1], relation: 'Sibling', color: 'var(--inst-slate)' },
      ] : [],
      connections,
    };
  }

  window.ATLAS = {
    CANVAS,
    institutions,
    instById,
    people,
    byId,
    edges,
    adj,
    buildProfile,
    egoOf(id) {
      const set = new Set([id]);
      (adj[id] || []).forEach((e) => set.add(e.id));
      return set;
    },
  };
})();
