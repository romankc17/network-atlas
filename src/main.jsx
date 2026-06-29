/* main.jsx — application entry point + tiny hash router.
 *
 * Import order matters:
 *   1. react-globals — puts `React` on window for the design-system bundle.
 *   2. design-system stylesheet (tokens) and the bundle itself (side effects:
 *      registers components on window.NetworkAtlasDesignSystem_9827fa).
 *   3. App / Admin — read those components at module-eval time, so they come last.
 *
 * Routes: `#/` → galaxy (App), `#/admin` → data-entry (Admin). The galaxy's data
 * is rebuilt from the editable store on every entry so admin edits show up.
 */
import './react-globals.js';
import '../styles.css';
import '../_ds_bundle.js';

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import Admin from './Admin.jsx';
import { rebuild } from './data.js';

const root = createRoot(document.getElementById('root'));

const isAdminRoute = () => location.hash.replace(/^#\/?/, '').toLowerCase() === 'admin';

function render() {
  const admin = isAdminRoute();
  if (!admin) rebuild(); // refresh galaxy data from the store before showing it
  root.render(React.createElement(admin ? Admin : App));
}

window.addEventListener('hashchange', render);
render();
