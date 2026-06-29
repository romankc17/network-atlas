/* react-globals.js — expose React on the global scope for the design-system bundle.
 *
 * `_ds_bundle.js` is a precompiled artifact (Babel-transpiled JSX) that references
 * a global `React` and registers its components on
 * `window.NetworkAtlasDesignSystem_9827fa`. It predates this build setup and has
 * no imports of its own, so we hand it the same `React` instance the rest of the
 * app uses. This module MUST be imported before `_ds_bundle.js`. */
import React from 'react';
import * as ReactDOM from 'react-dom';

if (typeof window !== 'undefined') {
  window.React = React;
  window.ReactDOM = ReactDOM;
}
