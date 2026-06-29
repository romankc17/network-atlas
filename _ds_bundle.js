/* @ds-bundle: {"format":3,"namespace":"NetworkAtlasDesignSystem_9827fa","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"SearchBar","sourcePath":"components/core/SearchBar.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"BackToGalaxy","sourcePath":"components/network/BackToGalaxy.jsx"},{"name":"InstitutionAnchor","sourcePath":"components/network/InstitutionAnchor.jsx"},{"name":"INSTITUTION_TYPE_LABEL","sourcePath":"components/network/InstitutionIcon.jsx"},{"name":"InstitutionIcon","sourcePath":"components/network/InstitutionIcon.jsx"},{"name":"InstitutionLegend","sourcePath":"components/network/InstitutionLegend.jsx"},{"name":"PersonNode","sourcePath":"components/network/PersonNode.jsx"},{"name":"ProfilePanel","sourcePath":"components/network/ProfilePanel.jsx"},{"name":"RELATIONSHIP_TYPES","sourcePath":"components/network/RelationshipLegend.jsx"},{"name":"RelationshipLegend","sourcePath":"components/network/RelationshipLegend.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"b47d04d85ee1","components/core/Badge.jsx":"e34a384712ba","components/core/Button.jsx":"4f322c554f26","components/core/IconButton.jsx":"55c7e0bfe421","components/core/SearchBar.jsx":"4144a6548a70","components/core/Tag.jsx":"468515dd0a08","components/network/BackToGalaxy.jsx":"1ec7f70f78c4","components/network/InstitutionAnchor.jsx":"e78338e8851a","components/network/InstitutionIcon.jsx":"f746d4024a28","components/network/InstitutionLegend.jsx":"49f4c181d8b7","components/network/PersonNode.jsx":"e2d43d63e87d","components/network/ProfilePanel.jsx":"33a3f6cfd599","components/network/RelationshipLegend.jsx":"e74481d55dbb","ui_kits/network-atlas/App.jsx":"48a9fb51b023","ui_kits/network-atlas/Galaxy.jsx":"d864763a89a0","ui_kits/network-atlas/data.js":"a9e5744563e7"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.NetworkAtlasDesignSystem_9827fa = window.NetworkAtlasDesignSystem_9827fa || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Person avatar — initials on a tinted disk, ringed in the person's primary
 * institution colour. `bridge` shows a second-institution arc for people who
 * span two institutions. */
const SIZES = {
  xs: 22,
  sm: 30,
  md: 40,
  lg: 56,
  xl: 72
};
function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
function Avatar({
  name = '',
  src,
  size = 'md',
  color = 'var(--inst-slate)',
  bridgeColor,
  ring = true,
  style,
  ...rest
}) {
  const px = typeof size === 'number' ? size : SIZES[size] || SIZES.md;
  const fontSize = Math.round(px * 0.36);
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: px,
      height: px,
      flex: 'none',
      borderRadius: '50%',
      background: src ? 'transparent' : `color-mix(in oklab, ${color} 22%, var(--space-surface))`,
      color: 'var(--ink-1)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize,
      letterSpacing: '0.02em',
      boxShadow: ring ? `inset 0 0 0 1.5px color-mix(in oklab, ${color} 80%, transparent)` : 'none',
      overflow: 'hidden',
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : initials(name), bridgeColor ? /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: '50%',
      border: `1.5px solid transparent`,
      borderTopColor: bridgeColor,
      borderRightColor: bridgeColor,
      transform: 'rotate(45deg)',
      pointerEvents: 'none'
    }
  }) : null);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Small status / type label. `tone` pulls a colour from the palette; pass a raw
 * colour via `color` to key a badge to an institution or relationship hue. */
const TONES = {
  neutral: 'var(--ink-2)',
  signal: 'var(--signal)',
  live: 'var(--status-live)',
  warn: 'var(--status-warn)',
  alert: 'var(--status-alert)'
};
function Badge({
  children,
  tone = 'neutral',
  color,
  variant = 'soft',
  mono = false,
  dot = false,
  style,
  ...rest
}) {
  const c = color || TONES[tone] || TONES.neutral;
  const solid = variant === 'solid';
  const outline = variant === 'outline';
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      height: '20px',
      padding: '0 8px',
      borderRadius: 'var(--radius-pill)',
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
      fontSize: mono ? 'var(--mono-2xs)' : 'var(--text-2xs)',
      fontWeight: mono ? 400 : 600,
      letterSpacing: mono ? 'var(--tracking-mono)' : '0.04em',
      textTransform: mono ? 'none' : 'uppercase',
      whiteSpace: 'nowrap',
      color: solid ? 'var(--ink-on-accent)' : c,
      background: solid ? c : outline ? 'transparent' : `color-mix(in oklab, ${c} 15%, transparent)`,
      border: outline ? `1px solid color-mix(in oklab, ${c} 45%, transparent)` : '1px solid transparent',
      ...style
    }
  }, rest), dot ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: solid ? 'var(--ink-on-accent)' : c,
      flex: 'none',
      boxShadow: solid ? 'none' : `0 0 6px ${c}`
    }
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    height: 'var(--control-sm)',
    padding: '0 12px',
    font: 'var(--text-xs)',
    gap: '6px'
  },
  md: {
    height: 'var(--control-md)',
    padding: '0 16px',
    font: 'var(--text-sm)',
    gap: '8px'
  },
  lg: {
    height: 'var(--control-lg)',
    padding: '0 20px',
    font: 'var(--text-body)',
    gap: '8px'
  }
};
function variantStyle(variant, hover) {
  switch (variant) {
    case 'primary':
      return {
        background: hover ? 'var(--signal-bright)' : 'var(--signal)',
        color: 'var(--ink-on-accent)',
        border: '1px solid transparent',
        boxShadow: hover ? '0 0 18px -3px var(--signal-glow)' : '0 0 0 1px var(--signal-glow)'
      };
    case 'secondary':
      return {
        background: hover ? 'var(--space-raised)' : 'var(--space-surface)',
        color: 'var(--ink-1)',
        border: '1px solid var(--line-strong)'
      };
    case 'ghost':
      return {
        background: hover ? 'var(--signal-wash)' : 'transparent',
        color: hover ? 'var(--signal-bright)' : 'var(--ink-2)',
        border: '1px solid transparent'
      };
    case 'danger':
      return {
        background: hover ? 'color-mix(in oklab, var(--rel-family) 22%, transparent)' : 'transparent',
        color: 'var(--rel-family)',
        border: '1px solid color-mix(in oklab, var(--rel-family) 40%, transparent)'
      };
    default:
      return {};
  }
}
function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon = null,
  iconRight = null,
  disabled = false,
  fullWidth = false,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const s = SIZES[size] || SIZES.md;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      height: s.height,
      padding: s.padding,
      width: fullWidth ? '100%' : 'auto',
      fontFamily: 'var(--font-sans)',
      fontSize: s.font,
      fontWeight: 'var(--weight-medium)',
      letterSpacing: '0.01em',
      borderRadius: 'var(--radius-sm)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      whiteSpace: 'nowrap',
      transition: 'background var(--dur-hover) var(--ease-out), box-shadow var(--dur-hover) var(--ease-out), color var(--dur-hover) var(--ease-out)',
      ...variantStyle(variant, hover && !disabled),
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      marginLeft: '-2px'
    }
  }, icon) : null, children, iconRight ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      marginRight: '-2px'
    }
  }, iconRight) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Square icon-only control. Used in the tool rail and panel headers. */
const SIZES = {
  sm: 28,
  md: 34,
  lg: 42
};
function IconButton({
  children,
  size = 'md',
  variant = 'ghost',
  active = false,
  disabled = false,
  label,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const px = SIZES[size] || SIZES.md;
  const on = active || hover && !disabled;
  const base = variant === 'solid' ? {
    background: on ? 'var(--space-overlay)' : 'var(--space-surface)',
    border: '1px solid var(--line-soft)'
  } : {
    background: on ? 'var(--signal-wash)' : 'transparent',
    border: '1px solid transparent'
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: px,
      height: px,
      flex: 'none',
      borderRadius: 'var(--radius-sm)',
      color: active ? 'var(--signal-bright)' : on ? 'var(--ink-1)' : 'var(--ink-3)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      transition: 'all var(--dur-hover) var(--ease-out)',
      ...base,
      boxShadow: active ? 'inset 0 0 0 1px var(--signal-glow)' : 'none',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/SearchBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Live search bar — the analyst's primary entry point into the graph.
 * Mono input so typed IDs / coordinates read like a case file. */
function SearchBar({
  value,
  onChange,
  placeholder = 'Search people, institutions, IDs…',
  count = null,
  width = 320,
  autoFocus = false,
  onFocus,
  onBlur,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      width,
      height: 'var(--control-lg)',
      padding: '0 12px',
      background: 'var(--bg-input)',
      border: `1px solid ${focus ? 'var(--signal)' : 'var(--line-strong)'}`,
      borderRadius: 'var(--radius-sm)',
      boxShadow: focus ? '0 0 0 3px var(--signal-wash)' : 'none',
      backdropFilter: 'var(--blur-chip)',
      transition: 'border-color var(--dur-hover) var(--ease-out), box-shadow var(--dur-hover) var(--ease-out)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: focus ? 'var(--signal)' : 'var(--ink-3)',
    strokeWidth: "1.8",
    strokeLinecap: "round",
    style: {
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "16.5",
    y1: "16.5",
    x2: "21",
    y2: "21"
  })), /*#__PURE__*/React.createElement("input", _extends({
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    autoFocus: autoFocus,
    onFocus: e => {
      setFocus(true);
      onFocus && onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      onBlur && onBlur(e);
    },
    style: {
      flex: 1,
      minWidth: 0,
      background: 'transparent',
      border: 'none',
      outline: 'none',
      color: 'var(--ink-1)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      letterSpacing: '0.01em'
    }
  }, rest)), count != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--mono-xs)',
      color: 'var(--ink-3)',
      letterSpacing: 'var(--tracking-mono)',
      flex: 'none'
    }
  }, count) : /*#__PURE__*/React.createElement("kbd", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--mono-2xs)',
      color: 'var(--ink-4)',
      border: '1px solid var(--line-soft)',
      borderRadius: '4px',
      padding: '2px 5px',
      flex: 'none'
    }
  }, "/"));
}
Object.assign(__ds_scope, { SearchBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SearchBar.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Filter / selection chip. Optional leading swatch keys it to an institution or
 * relationship colour; optional onRemove makes it dismissable. */
function Tag({
  children,
  color,
  active = false,
  onRemove,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const interactive = !!onClick;
  return /*#__PURE__*/React.createElement("span", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '7px',
      height: '26px',
      padding: '0 9px',
      borderRadius: 'var(--radius-sm)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      fontWeight: 500,
      color: active ? 'var(--ink-1)' : 'var(--ink-2)',
      background: active ? 'var(--space-raised)' : hover && interactive ? 'var(--space-surface)' : 'transparent',
      border: `1px solid ${active ? 'var(--line-bright)' : 'var(--line-soft)'}`,
      cursor: interactive ? 'pointer' : 'default',
      transition: 'all var(--dur-hover) var(--ease-out)',
      ...style
    }
  }, rest), color ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '2px',
      flex: 'none',
      background: color,
      boxShadow: active ? `0 0 7px ${color}` : 'none'
    }
  }) : null, children, onRemove ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: e => {
      e.stopPropagation();
      onRemove(e);
    },
    "aria-label": "Remove",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 14,
      height: 14,
      marginRight: -2,
      padding: 0,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: 'var(--ink-3)',
      borderRadius: '3px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "9",
    viewBox: "0 0 10 10",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "1",
    y1: "1",
    x2: "9",
    y2: "9"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "9",
    y1: "1",
    x2: "1",
    y2: "9"
  }))) : null);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/network/BackToGalaxy.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* "Back to galaxy" control — surfaces when the analyst is inside a person's
 * universe; flies the camera back out to the overview. */
function BackToGalaxy({
  onClick,
  label = 'Back to galaxy',
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '9px',
      height: 'var(--control-md)',
      padding: '0 16px 0 12px',
      borderRadius: 'var(--radius-pill)',
      background: hover ? 'var(--space-overlay)' : 'color-mix(in oklab, var(--space-deep) 88%, transparent)',
      border: '1px solid var(--line-strong)',
      backdropFilter: 'var(--blur-panel)',
      boxShadow: 'var(--shadow-card)',
      color: 'var(--ink-1)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'background var(--dur-hover) var(--ease-out)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--signal)",
    strokeWidth: "1.9",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      transform: hover ? 'translateX(-2px)' : 'none',
      transition: 'transform var(--dur-hover)'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M15 6l-6 6 6 6"
  })), label);
}
Object.assign(__ds_scope, { BackToGalaxy });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/network/BackToGalaxy.jsx", error: String((e && e.message) || e) }); }

// components/network/InstitutionIcon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Institution type glyphs — monoline, drawn on a 24×24 grid, stroked in
 * currentColor so a parent can tint them in the institution's signature hue. */
const PATHS = {
  government: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M3 8.5 L12 3.5 L21 8.5"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3.5",
    y1: "9.2",
    x2: "20.5",
    y2: "9.2"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "10.4",
    x2: "6",
    y2: "17.6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "10",
    y1: "10.4",
    x2: "10",
    y2: "17.6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "14",
    y1: "10.4",
    x2: "14",
    y2: "17.6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "18",
    y1: "10.4",
    x2: "18",
    y2: "17.6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "4.2",
    y1: "18.6",
    x2: "19.8",
    y2: "18.6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "20.6",
    x2: "21",
    y2: "20.6"
  })),
  bank: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("ellipse", {
    cx: "12",
    cy: "6.5",
    rx: "7",
    ry: "2.6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 6.5 v3.4 c0 1.44 3.13 2.6 7 2.6 s7 -1.16 7 -2.6 v-3.4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 11.6 v3.4 c0 1.44 3.13 2.6 7 2.6 s7 -1.16 7 -2.6 v-3.4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 16.7 v0.5 c0 1.44 3.13 2.6 7 2.6 s7 -1.16 7 -2.6 v-0.5"
  })),
  construction: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "8",
    y1: "6",
    x2: "8",
    y2: "20.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5.5 20.5 L8 17 L10.5 20.5"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "6",
    x2: "21",
    y2: "6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 3.2 L20.5 6 M8 3.2 L4 6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8",
    y1: "6",
    x2: "11.5",
    y2: "3.2"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "18",
    y1: "6",
    x2: "18",
    y2: "9.4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16.7 9.4 h2.6"
  })),
  media: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 20.5 L11.2 9 M15.5 20.5 L12.8 9"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "9.6",
    y1: "14.2",
    x2: "14.4",
    y2: "14.2"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "9",
    y1: "17.3",
    x2: "15",
    y2: "17.3"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "10.6",
    y1: "20.5",
    x2: "13.4",
    y2: "20.5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "6.8",
    r: "1.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.6 4 a4.6 4.6 0 0 0 0 5.6 M15.4 4 a4.6 4.6 0 0 1 0 5.6"
  })),
  ngo: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 11.4 c-1.1 -2.2 -4.4 -1.9 -4.4 0.7 c0 1.7 2.5 3.4 4.4 4.6 c1.9 -1.2 4.4 -2.9 4.4 -4.6 c0 -2.6 -3.3 -2.9 -4.4 -0.7 Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3.4 13.5 c1.6 2.6 4.9 5 8.6 6.9 c3.7 -1.9 7 -4.3 8.6 -6.9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3.4 13.5 a1.5 1.5 0 0 1 2 -0.6 M20.6 13.5 a1.5 1.5 0 0 0 -2 -0.6"
  })),
  university: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 4.5 L21.5 9 L12 13.5 L2.5 9 Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.5 11 v4.4 c0 1.3 2.46 2.4 5.5 2.4 s5.5 -1.1 5.5 -2.4 V11"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "21.5",
    y1: "9",
    x2: "21.5",
    y2: "14"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "21.5",
    cy: "14.8",
    r: "0.9"
  })),
  holding: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "7.5",
    width: "18",
    height: "12.5",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 7.5 V6 a2 2 0 0 1 2 -2 h2 a2 2 0 0 1 2 2 v1.5"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "12.6",
    x2: "21",
    y2: "12.6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10.4 12.6 h3.2 v1.8 h-3.2 Z"
  }))
};

/* Short labels used in legends / metadata rows. */
const INSTITUTION_TYPE_LABEL = {
  government: 'GOV',
  bank: 'FIN',
  construction: 'CON',
  media: 'MED',
  ngo: 'NGO',
  university: 'EDU',
  holding: 'HLD'
};
function InstitutionIcon({
  type = 'holding',
  size = 24,
  color = 'currentColor',
  strokeWidth = 1.6,
  glow = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    style: {
      display: 'block',
      flex: 'none',
      filter: glow ? `drop-shadow(0 0 ${size * 0.22}px color-mix(in oklab, ${color} 55%, transparent))` : undefined,
      ...style
    }
  }, rest), PATHS[type] || PATHS.holding);
}
Object.assign(__ds_scope, { INSTITUTION_TYPE_LABEL, InstitutionIcon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/network/InstitutionIcon.jsx", error: String((e && e.message) || e) }); }

// components/network/InstitutionAnchor.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Institution anchor marker — the bright, labelled core of a constellation.
 * A glowing disk carrying the institution's type glyph, with its name and
 * headcount. People cluster and orbit around this; tethers run back to it. */
function InstitutionAnchor({
  name,
  type = 'holding',
  count,
  color = 'var(--inst-slate)',
  size = 56,
  state = 'default',
  // 'default' | 'active' | 'dim'
  labelBelow = true,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const dim = state === 'dim';
  const active = state === 'active';
  const lit = active || hover;
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      cursor: onClick ? 'pointer' : 'default',
      opacity: dim ? 0.32 : 1,
      filter: dim ? 'saturate(0.5)' : 'none',
      transition: 'opacity var(--dur-panel) var(--ease-out), filter var(--dur-panel) var(--ease-out)',
      color,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: size,
      height: size,
      borderRadius: '50%',
      display: 'grid',
      placeItems: 'center',
      background: `radial-gradient(circle at 50% 38%, color-mix(in oklab, ${color} 32%, var(--space-abyss)) 0%, var(--space-abyss) 78%)`,
      boxShadow: `inset 0 0 0 1.5px color-mix(in oklab, ${color} 85%, transparent), 0 0 ${lit ? size * 0.7 : size * 0.42}px -6px ${color}, 0 0 0 ${lit ? 6 : 0}px color-mix(in oklab, ${color} 12%, transparent)`,
      transition: 'box-shadow var(--dur-hover) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.InstitutionIcon, {
    type: type,
    size: Math.round(size * 0.5),
    color: color,
    glow: true
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      inset: -7,
      borderRadius: '50%',
      border: `1px solid color-mix(in oklab, ${color} 28%, transparent)`,
      pointerEvents: 'none'
    }
  })), labelBelow ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '3px',
      maxWidth: 150
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      letterSpacing: '0.01em',
      color: lit ? 'var(--ink-1)' : 'var(--ink-2)',
      textAlign: 'center',
      lineHeight: 1.2,
      textShadow: '0 1px 6px rgba(0,0,0,0.8)'
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--mono-2xs)',
      letterSpacing: 'var(--tracking-mono)',
      color: 'var(--ink-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color
    }
  }, __ds_scope.INSTITUTION_TYPE_LABEL[type]), count != null ? /*#__PURE__*/React.createElement("span", null, "\xB7 ", count, " ppl") : null)) : null);
}
Object.assign(__ds_scope, { InstitutionAnchor });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/network/InstitutionAnchor.jsx", error: String((e && e.message) || e) }); }

// components/network/InstitutionLegend.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Institution legend — every institution in view, with its glyph, signature
 * colour, and headcount. Click a row to isolate that institution (dim the
 * rest of the galaxy). */
function InstitutionLegend({
  institutions = [],
  isolatedId = null,
  onIsolate,
  title = 'Institutions',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width: 'var(--legend-width)',
      background: 'color-mix(in oklab, var(--space-deep) 86%, transparent)',
      border: '1px solid var(--line-soft)',
      borderRadius: 'var(--radius-md)',
      backdropFilter: 'var(--blur-panel)',
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '12px 12px 10px',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--mono-2xs)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--ink-3)'
    }
  }, /*#__PURE__*/React.createElement("span", null, title), /*#__PURE__*/React.createElement("span", null, institutions.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '6px'
    }
  }, institutions.map(inst => {
    const isolated = isolatedId === inst.id;
    const muted = isolatedId && !isolated;
    return /*#__PURE__*/React.createElement("button", {
      key: inst.id,
      type: "button",
      onClick: () => onIsolate && onIsolate(isolated ? null : inst.id),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '7px 12px',
        background: isolated ? 'var(--space-raised)' : 'transparent',
        border: 'none',
        borderLeft: `2px solid ${isolated ? inst.color : 'transparent'}`,
        cursor: 'pointer',
        textAlign: 'left',
        opacity: muted ? 0.45 : 1,
        transition: 'opacity var(--dur-hover), background var(--dur-hover)'
      },
      onMouseEnter: e => {
        if (!isolated) e.currentTarget.style.background = 'var(--space-surface)';
      },
      onMouseLeave: e => {
        if (!isolated) e.currentTarget.style.background = 'transparent';
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 26,
        height: 26,
        borderRadius: 'var(--radius-sm)',
        flex: 'none',
        display: 'grid',
        placeItems: 'center',
        background: `color-mix(in oklab, ${inst.color} 14%, transparent)`,
        color: inst.color
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.InstitutionIcon, {
      type: inst.type,
      size: 16,
      color: inst.color
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-xs)',
        fontWeight: 500,
        color: 'var(--ink-1)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, inst.name), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--mono-2xs)',
        letterSpacing: 'var(--tracking-mono)',
        color: 'var(--ink-3)',
        marginTop: '1px'
      }
    }, __ds_scope.INSTITUTION_TYPE_LABEL[inst.type], " \xB7 ", inst.count)), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: '50%',
        flex: 'none',
        background: inst.color,
        boxShadow: `0 0 7px ${inst.color}`
      }
    }));
  })));
}
Object.assign(__ds_scope, { InstitutionLegend });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/network/InstitutionLegend.jsx", error: String((e && e.message) || e) }); }

// components/network/PersonNode.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Person node — a dot in the galaxy, sized by connection count, tinted in its
 * institution's colour. The most-connected people carry a label; the rest stay
 * quiet until hovered (no label spaghetti). */
function PersonNode({
  name,
  color = 'var(--inst-slate)',
  connections = 0,
  size,
  // explicit px overrides the count-derived size
  label = false,
  // always show the name label
  state = 'default',
  // 'default' | 'active' | 'dim' | 'trace'
  initials,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const px = size || Math.max(7, Math.min(22, 7 + connections * 0.5));
  const dim = state === 'dim';
  const active = state === 'active';
  const trace = state === 'trace'; // part of the lit ego-network
  const showLabel = label || hover || active;
  const lit = hover || active || trace;
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: 'relative',
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: onClick ? 'pointer' : 'default',
      opacity: dim ? 0.22 : 1,
      transition: 'opacity var(--dur-panel) var(--ease-out)',
      color,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: px,
      height: px,
      borderRadius: '50%',
      background: active ? color : `radial-gradient(circle at 38% 32%, color-mix(in oklab, ${color} 92%, white) 0%, ${color} 60%, color-mix(in oklab, ${color} 50%, var(--space-abyss)) 100%)`,
      boxShadow: active ? `0 0 18px -1px ${color}, 0 0 0 4px color-mix(in oklab, ${color} 18%, transparent)` : lit ? `0 0 12px -1px ${color}, 0 0 0 1.5px color-mix(in oklab, ${color} 40%, transparent)` : `0 0 6px -1px ${color}`,
      outline: active ? `1.5px solid color-mix(in oklab, ${color} 90%, white)` : 'none',
      outlineOffset: 2,
      transition: 'box-shadow var(--dur-hover) var(--ease-out), transform var(--dur-hover) var(--ease-out)',
      transform: hover && !active ? 'scale(1.18)' : 'scale(1)'
    }
  }), showLabel ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: px + 5,
      left: '50%',
      transform: 'translateX(-50%)',
      whiteSpace: 'nowrap',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-2xs)',
      fontWeight: 500,
      color: lit ? 'var(--ink-1)' : 'var(--ink-2)',
      textShadow: '0 1px 6px rgba(0,0,0,0.9)',
      pointerEvents: 'none'
    }
  }, name) : null);
}
Object.assign(__ds_scope, { PersonNode });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/network/PersonNode.jsx", error: String((e && e.message) || e) }); }

// components/network/RelationshipLegend.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* The five relationship-edge types. Edges in the galaxy are colour-coded by
 * these; the legend doubles as a filter (click to toggle a type on/off). */
const RELATIONSHIP_TYPES = [{
  id: 'colleague',
  label: 'Colleague',
  color: 'var(--rel-colleague)'
}, {
  id: 'former',
  label: 'Former colleague',
  color: 'var(--rel-former)'
}, {
  id: 'family',
  label: 'Family',
  color: 'var(--rel-family)'
}, {
  id: 'business',
  label: 'Business',
  color: 'var(--rel-business)'
}, {
  id: 'financial',
  label: 'Financial',
  color: 'var(--rel-financial)'
}];
function RelationshipLegend({
  items = RELATIONSHIP_TYPES,
  active,
  // array of active ids; undefined = all on
  onToggle,
  title = 'Relationships',
  style,
  ...rest
}) {
  const isOn = id => !active || active.includes(id);
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width: 'var(--legend-width)',
      padding: '12px 12px 13px',
      background: 'color-mix(in oklab, var(--space-deep) 86%, transparent)',
      border: '1px solid var(--line-soft)',
      borderRadius: 'var(--radius-md)',
      backdropFilter: 'var(--blur-panel)',
      boxShadow: 'var(--shadow-card)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--mono-2xs)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--ink-3)',
      marginBottom: '10px'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    }
  }, items.map(it => {
    const on = isOn(it.id);
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      type: "button",
      onClick: () => onToggle && onToggle(it.id),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '5px 6px',
        background: 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-xs)',
        cursor: onToggle ? 'pointer' : 'default',
        opacity: on ? 1 : 0.4,
        transition: 'opacity var(--dur-hover), background var(--dur-hover)',
        textAlign: 'left'
      },
      onMouseEnter: e => e.currentTarget.style.background = 'var(--space-raised)',
      onMouseLeave: e => e.currentTarget.style.background = 'transparent'
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 18,
        height: 3,
        borderRadius: '2px',
        flex: 'none',
        background: it.color,
        boxShadow: on ? `0 0 8px ${it.color}` : 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-xs)',
        color: 'var(--ink-2)'
      }
    }, it.label), it.count != null ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--mono-2xs)',
        color: 'var(--ink-3)'
      }
    }, it.count) : null);
  })));
}
Object.assign(__ds_scope, { RELATIONSHIP_TYPES, RelationshipLegend });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/network/RelationshipLegend.jsx", error: String((e && e.message) || e) }); }

// components/network/ProfilePanel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const REL = Object.fromEntries(__ds_scope.RELATIONSHIP_TYPES.map(r => [r.id, r]));
function SectionLabel({
  children,
  count
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--mono-2xs)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--ink-3)',
      margin: '0 0 9px'
    }
  }, /*#__PURE__*/React.createElement("span", null, children), count != null ? /*#__PURE__*/React.createElement("span", null, count) : null);
}
function MetaRow({
  k,
  v,
  mono = true
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '6px 0',
      borderBottom: '1px solid var(--line-faint)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--mono-xs)',
      letterSpacing: 'var(--tracking-mono)',
      color: 'var(--ink-3)',
      textTransform: 'uppercase'
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
      fontSize: mono ? 'var(--mono-xs)' : 'var(--text-xs)',
      color: 'var(--ink-1)',
      textAlign: 'right'
    }
  }, v));
}
function ConnectionRow({
  c,
  onSelect
}) {
  const [hover, setHover] = React.useState(false);
  const rel = REL[c.relType] || REL.colleague;
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onSelect && onSelect(c),
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      width: '100%',
      padding: '7px 8px',
      borderRadius: 'var(--radius-sm)',
      background: hover ? 'var(--space-raised)' : 'transparent',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'background var(--dur-hover)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: c.name,
    color: c.color,
    bridgeColor: c.bridgeColor,
    size: 30
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      color: 'var(--ink-1)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, c.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-2xs)',
      color: 'var(--ink-3)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, c.role, c.institution ? ` · ${c.institution}` : '')), /*#__PURE__*/React.createElement("span", {
    title: rel.label,
    style: {
      width: 14,
      height: 3,
      borderRadius: '2px',
      flex: 'none',
      background: rel.color,
      boxShadow: `0 0 7px ${rel.color}`
    }
  }), /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--ink-3)",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      flex: 'none',
      opacity: hover ? 1 : 0.4
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M9 6l6 6-6 6"
  })));
}
function ProfilePanel({
  person,
  onClose,
  onSelectConnection,
  style,
  ...rest
}) {
  if (!person) return null;
  const {
    name,
    institutions = [],
    tenure,
    contact = {},
    family = [],
    connections = [],
    summary
  } = person;
  const primary = institutions[0] || {};
  const bridge = institutions.length > 1;

  // group connections by relationship type, in legend order
  const grouped = __ds_scope.RELATIONSHIP_TYPES.map(r => ({
    ...r,
    items: connections.filter(c => c.relType === r.id)
  })).filter(g => g.items.length);
  return /*#__PURE__*/React.createElement("aside", _extends({
    style: {
      width: 'var(--panel-width)',
      maxHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'color-mix(in oklab, var(--space-deep) 92%, transparent)',
      border: '1px solid var(--line-soft)',
      borderRadius: 'var(--radius-lg)',
      backdropFilter: 'var(--blur-panel)',
      boxShadow: 'var(--shadow-panel)',
      overflow: 'hidden',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      padding: '18px 18px 16px',
      borderBottom: '1px solid var(--line-faint)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      background: `radial-gradient(120% 80% at 20% -10%, color-mix(in oklab, ${primary.color || 'var(--inst-slate)'} 16%, transparent) 0%, transparent 60%)`
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    "aria-label": "Close",
    style: {
      position: 'absolute',
      top: 14,
      right: 14,
      width: 28,
      height: 28,
      display: 'grid',
      placeItems: 'center',
      borderRadius: 'var(--radius-sm)',
      background: 'transparent',
      border: '1px solid var(--line-soft)',
      color: 'var(--ink-3)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "2",
    y1: "2",
    x2: "10",
    y2: "10"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "10",
    y1: "2",
    x2: "2",
    y2: "10"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      gap: '14px',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: name,
    color: primary.color,
    bridgeColor: bridge ? institutions[1].color : undefined,
    size: "xl"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      paddingTop: '2px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 5px',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-h2)',
      fontWeight: 600,
      color: 'var(--ink-1)',
      letterSpacing: 'var(--tracking-tight)',
      lineHeight: 1.1
    }
  }, name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }
  }, institutions.map((inst, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '7px'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.InstitutionIcon, {
    type: inst.type,
    size: 14,
    color: inst.color
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      color: 'var(--ink-2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-1)'
    }
  }, inst.role), " \xB7 ", inst.name)))), bridge ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '9px'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    color: institutions[1].color,
    variant: "outline",
    dot: true
  }, "Bridge \xB7 2 institutions")) : null))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px 18px'
    }
  }, summary ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 18px',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      lineHeight: 'var(--leading-relaxed)',
      color: 'var(--ink-2)',
      textWrap: 'pretty'
    }
  }, summary) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '18px'
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Case file"), tenure ? /*#__PURE__*/React.createElement(MetaRow, {
    k: "Tenure",
    v: tenure
  }) : null, contact.phone ? /*#__PURE__*/React.createElement(MetaRow, {
    k: "Phone",
    v: contact.phone
  }) : null, contact.email ? /*#__PURE__*/React.createElement(MetaRow, {
    k: "Email",
    v: contact.email
  }) : null, contact.location ? /*#__PURE__*/React.createElement(MetaRow, {
    k: "Location",
    v: contact.location
  }) : null, contact.id ? /*#__PURE__*/React.createElement(MetaRow, {
    k: "Atlas ID",
    v: contact.id
  }) : null), family.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '18px'
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, {
    count: family.length
  }, "Family & associates"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '14px',
      flexWrap: 'wrap'
    }
  }, family.map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '5px',
      width: 56
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: f.name,
    color: f.color,
    size: 36
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-2xs)',
      color: 'var(--ink-2)',
      textAlign: 'center',
      lineHeight: 1.15
    }
  }, f.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '9px',
      color: 'var(--ink-3)',
      textTransform: 'uppercase',
      letterSpacing: '0.08em'
    }
  }, f.relation))))) : null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionLabel, {
    count: connections.length
  }, "Connections"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }
  }, grouped.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.id
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '7px',
      margin: '0 0 4px',
      padding: '0 8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 3,
      borderRadius: '2px',
      background: g.color,
      boxShadow: `0 0 6px ${g.color}`
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-2xs)',
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: 'var(--ink-2)'
    }
  }, g.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--mono-2xs)',
      color: 'var(--ink-3)'
    }
  }, g.items.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1px'
    }
  }, g.items.map((c, i) => /*#__PURE__*/React.createElement(ConnectionRow, {
    key: i,
    c: c,
    onSelect: onSelectConnection
  })))))))));
}
Object.assign(__ds_scope, { ProfilePanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/network/ProfilePanel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/network-atlas/App.jsx
try { (() => {
/* App.jsx — the Network Atlas application shell.
 * Orchestrates overview ↔ focus, search, institution isolation, and relationship
 * filtering. Composes the design-system primitives + window.Galaxy.
 * Exports window.App. */
(function () {
  const A = window.ATLAS;
  const NS = window.NetworkAtlasDesignSystem_9827fa || {};
  const {
    SearchBar,
    InstitutionLegend,
    RelationshipLegend,
    ProfilePanel,
    BackToGalaxy,
    IconButton,
    Avatar
  } = NS;
  const Galaxy = window.Galaxy;
  const h = React.createElement;
  function Logo() {
    return h('img', {
      src: '../../assets/brand/logo.svg',
      alt: 'Network Atlas',
      style: {
        height: 36,
        display: 'block'
      }
    });
  }
  function ZoomIcon({
    dir
  }) {
    return h('svg', {
      width: 16,
      height: 16,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.8,
      strokeLinecap: 'round'
    }, h('circle', {
      cx: 11,
      cy: 11,
      r: 7
    }), h('line', {
      x1: 16.5,
      y1: 16.5,
      x2: 21,
      y2: 21
    }), h('line', {
      x1: 8,
      y1: 11,
      x2: 14,
      y2: 11
    }), dir === 'in' ? h('line', {
      x1: 11,
      y1: 8,
      x2: 11,
      y2: 14
    }) : null);
  }
  function RecenterIcon() {
    return h('svg', {
      width: 16,
      height: 16,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.7,
      strokeLinecap: 'round'
    }, h('circle', {
      cx: 12,
      cy: 12,
      r: 3
    }), h('path', {
      d: 'M12 2v3M12 19v3M2 12h3M19 12h3'
    }));
  }
  function SearchResults({
    query,
    onPick
  }) {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const people = A.people.filter(p => p.name.toLowerCase().includes(q) || A.instById[p.instId].name.toLowerCase().includes(q)).slice(0, 7);
    return h('div', {
      style: {
        marginTop: 8,
        width: 360,
        background: 'color-mix(in oklab, var(--space-deep) 94%, transparent)',
        border: '1px solid var(--line-soft)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-popover)',
        backdropFilter: 'var(--blur-panel)',
        overflow: 'hidden'
      }
    }, people.length === 0 ? h('div', {
      style: {
        padding: '22px 16px',
        textAlign: 'center'
      }
    }, h('div', {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-sm)',
        color: 'var(--ink-2)',
        marginBottom: 4
      }
    }, 'No entities match'), h('div', {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--mono-xs)',
        color: 'var(--ink-3)'
      }
    }, '“' + query + '”')) : people.map(p => {
      const inst = A.instById[p.instId];
      return h('button', {
        key: p.id,
        type: 'button',
        onClick: () => onPick(p.id),
        onMouseEnter: e => e.currentTarget.style.background = 'var(--space-raised)',
        onMouseLeave: e => e.currentTarget.style.background = 'transparent',
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          padding: '8px 12px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left'
        }
      }, Avatar && h(Avatar, {
        name: p.name,
        color: inst.color,
        size: 28
      }), h('span', {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, h('span', {
        style: {
          display: 'block',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-sm)',
          color: 'var(--ink-1)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, p.name), h('span', {
        style: {
          display: 'block',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-2xs)',
          color: 'var(--ink-3)'
        }
      }, p.role + ' · ' + inst.name)), h('span', {
        style: {
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: inst.color,
          boxShadow: `0 0 6px ${inst.color}`,
          flex: 'none'
        }
      }));
    }));
  }
  function Loading() {
    return h('div', {
      style: {
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'grid',
        placeItems: 'center',
        background: 'var(--space-void)',
        animation: 'atlasFade .5s var(--ease-out) forwards',
        animationDelay: '.7s'
      }
    }, h('div', {
      style: {
        textAlign: 'center'
      }
    }, h('div', {
      className: 'atlas-pulse',
      style: {
        width: 60,
        height: 60,
        margin: '0 auto 18px',
        borderRadius: '50%',
        border: '1.5px solid var(--signal)',
        boxShadow: '0 0 30px -4px var(--signal-glow)'
      }
    }), h('div', {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--mono-xs)',
        letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase',
        color: 'var(--ink-3)'
      }
    }, 'Indexing ' + A.people.length + ' entities · ' + A.institutions.length + ' institutions')));
  }
  function StatChip() {
    return h('div', {
      style: {
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        padding: '8px 14px',
        borderRadius: 'var(--radius-pill)',
        background: 'color-mix(in oklab, var(--space-deep) 80%, transparent)',
        border: '1px solid var(--line-soft)',
        backdropFilter: 'var(--blur-chip)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--mono-xs)',
        color: 'var(--ink-3)',
        letterSpacing: 'var(--tracking-mono)'
      }
    }, h('span', null, h('span', {
      style: {
        color: 'var(--ink-1)'
      }
    }, A.institutions.length), ' inst'), h('span', {
      style: {
        color: 'var(--line-strong)'
      }
    }, '·'), h('span', null, h('span', {
      style: {
        color: 'var(--ink-1)'
      }
    }, A.people.length), ' people'), h('span', {
      style: {
        color: 'var(--line-strong)'
      }
    }, '·'), h('span', null, h('span', {
      style: {
        color: 'var(--signal)'
      }
    }, A.edges.length), ' cross-links'));
  }
  function App() {
    const [focusId, setFocusId] = React.useState(null);
    const [isolatedId, setIsolatedId] = React.useState(null);
    const [activeRels, setActiveRels] = React.useState(null);
    const [query, setQuery] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    React.useEffect(() => {
      const t = setTimeout(() => setLoading(false), 1300);
      return () => clearTimeout(t);
    }, []);
    const focusPerson = focusId ? A.byId[focusId] : null;
    const profile = focusPerson ? A.buildProfile(focusPerson) : null;
    const toggleRel = id => {
      setActiveRels(cur => {
        const all = ['colleague', 'former', 'family', 'business', 'financial'];
        const base = cur || all;
        const next = base.includes(id) ? base.filter(x => x !== id) : [...base, id];
        return next.length === all.length ? null : next;
      });
    };
    const pick = id => {
      setQuery('');
      setIsolatedId(null);
      setFocusId(id);
    };
    return h('div', {
      style: {
        position: 'fixed',
        inset: 0,
        fontFamily: 'var(--font-sans)'
      }
    }, Galaxy && h(Galaxy, {
      focusId,
      onFocus: setFocusId,
      isolatedId,
      activeRels,
      query
    }),
    // Top-left: logo + search OR back control
    h('div', {
      style: {
        position: 'absolute',
        top: 20,
        left: 22,
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, focusPerson ? BackToGalaxy && h(BackToGalaxy, {
      onClick: () => setFocusId(null)
    }) : h(React.Fragment, null, h(Logo, null), SearchBar && h('div', null, h(SearchBar, {
      value: query,
      onChange: e => setQuery(e.target.value),
      width: 360,
      count: query ? A.people.filter(p => p.name.toLowerCase().includes(query.trim().toLowerCase()) || A.instById[p.instId].name.toLowerCase().includes(query.trim().toLowerCase())).length : null
    }), h(SearchResults, {
      query,
      onPick: pick
    })))),
    // Top-right: institution legend (hidden during focus)
    h('div', {
      style: {
        position: 'absolute',
        top: 20,
        right: 22,
        zIndex: 50,
        opacity: focusPerson ? 0 : 1,
        pointerEvents: focusPerson ? 'none' : 'auto',
        transition: 'opacity var(--dur-panel)'
      }
    }, InstitutionLegend && h(InstitutionLegend, {
      institutions: A.institutions.map(i => ({
        id: i.id,
        name: i.name,
        type: i.type,
        color: i.color,
        count: i.count
      })),
      isolatedId,
      onIsolate: setIsolatedId
    })),
    // Bottom-right: relationship legend (hidden during focus)
    h('div', {
      style: {
        position: 'absolute',
        bottom: 22,
        right: 22,
        zIndex: 50,
        opacity: focusPerson ? 0 : 1,
        pointerEvents: focusPerson ? 'none' : 'auto',
        transition: 'opacity var(--dur-panel)'
      }
    }, RelationshipLegend && h(RelationshipLegend, {
      active: activeRels,
      onToggle: toggleRel
    })),
    // Bottom-left: stats + zoom controls
    h('div', {
      style: {
        position: 'absolute',
        bottom: 22,
        left: 22,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        opacity: focusPerson ? 0 : 1,
        transition: 'opacity var(--dur-panel)'
      }
    }, h(StatChip, null), IconButton && h('div', {
      style: {
        display: 'flex',
        gap: 6
      }
    }, h(IconButton, {
      variant: 'solid',
      label: 'Zoom in'
    }, h(ZoomIcon, {
      dir: 'in'
    })), h(IconButton, {
      variant: 'solid',
      label: 'Zoom out'
    }, h(ZoomIcon, {
      dir: 'out'
    })), h(IconButton, {
      variant: 'solid',
      label: 'Recenter'
    }, h(RecenterIcon, null)))),
    // Profile / universe panel
    h('div', {
      style: {
        position: 'absolute',
        top: 0,
        right: 0,
        height: '100%',
        zIndex: 70,
        padding: 18,
        display: 'flex',
        alignItems: 'stretch',
        transform: focusPerson ? 'translateX(0)' : 'translateX(110%)',
        opacity: focusPerson ? 1 : 0,
        transition: 'transform var(--dur-panel) var(--ease-dive), opacity var(--dur-panel)',
        pointerEvents: focusPerson ? 'auto' : 'none'
      }
    }, ProfilePanel && h(ProfilePanel, {
      person: profile,
      onClose: () => setFocusId(null),
      onSelectConnection: c => c.id && setFocusId(c.id)
    })), loading && h(Loading, null));
  }
  window.App = App;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/network-atlas/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/network-atlas/Galaxy.jsx
try { (() => {
/* Galaxy.jsx — the Network Atlas overview + focus renderer.
 * Composes InstitutionAnchor + PersonNode from the design-system bundle and
 * adds the constellation scaffolding: nebula membranes, tethers, cross-edges,
 * a far starfield, and the eased camera dive into a person's universe.
 * Reads the sample graph from window.ATLAS. Exports window.Galaxy. */
(function () {
  const A = window.ATLAS;
  const NS = window.NetworkAtlasDesignSystem_9827fa || {};
  const {
    InstitutionAnchor,
    PersonNode
  } = NS;
  const REL_COLOR = {
    colleague: 'var(--rel-colleague)',
    former: 'var(--rel-former)',
    family: 'var(--rel-family)',
    business: 'var(--rel-business)',
    financial: 'var(--rel-financial)'
  };

  // Deterministic far starfield (built once).
  const STARS = (() => {
    const out = [];
    let seed = 7;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < 90; i++) {
      out.push({
        x: rnd() * A.CANVAS.w,
        y: rnd() * A.CANVAS.h,
        r: 0.5 + rnd() * 1.3,
        o: 0.12 + rnd() * 0.4
      });
    }
    return out;
  })();
  function useFit() {
    const [fit, setFit] = React.useState({
      s: 1,
      x: 0,
      y: 0,
      vw: 1200,
      vh: 700
    });
    React.useEffect(() => {
      function recompute() {
        const vw = window.innerWidth,
          vh = window.innerHeight;
        const s = Math.max(vw / A.CANVAS.w, vh / A.CANVAS.h) * 1.02;
        setFit({
          s,
          x: (vw - A.CANVAS.w * s) / 2,
          y: (vh - A.CANVAS.h * s) / 2,
          vw,
          vh
        });
      }
      recompute();
      window.addEventListener('resize', recompute);
      return () => window.removeEventListener('resize', recompute);
    }, []);
    return fit;
  }
  function Galaxy({
    focusId,
    onFocus,
    isolatedId,
    activeRels,
    query
  }) {
    const fit = useFit();
    const q = (query || '').trim().toLowerCase();
    const ego = focusId ? A.egoOf(focusId) : null;
    const focusPerson = focusId ? A.byId[focusId] : null;
    const matches = p => !q || p.name.toLowerCase().includes(q) || A.instById[p.instId].name.toLowerCase().includes(q);

    // camera dive: center focused person in the left ~38% of the viewport
    let cam = 'none';
    let camOrigin = '0 0';
    if (focusPerson) {
      const scale = 1.5;
      const targetX = fit.vw * 0.37;
      const targetY = fit.vh * 0.5;
      const px = fit.x + focusPerson.x * fit.s;
      const py = fit.y + focusPerson.y * fit.s;
      cam = `translate(${targetX - px}px, ${targetY - py}px) scale(${scale})`;
      camOrigin = `${focusPerson.x}px ${focusPerson.y}px`;
    }
    const relOn = rel => !activeRels || activeRels.includes(rel);
    const instDimmed = instId => {
      if (focusPerson) return focusPerson.instId !== instId && focusPerson.bridge !== instId;
      if (isolatedId) return isolatedId !== instId;
      return false;
    };
    return React.createElement('div', {
      style: {
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: 'radial-gradient(1300px 760px at 58% 26%, color-mix(in oklab, var(--inst-violet) 5%, transparent), transparent 60%), var(--space-void)'
      }
    }, React.createElement('div', {
      style: {
        position: 'absolute',
        left: fit.x,
        top: fit.y,
        width: A.CANVAS.w,
        height: A.CANVAS.h,
        transformOrigin: '0 0',
        transform: `scale(${fit.s})`
      }
    }, React.createElement('div', {
      style: {
        position: 'absolute',
        inset: 0,
        transform: cam,
        transformOrigin: camOrigin,
        transition: 'transform var(--dur-dive) var(--ease-dive)'
      }
    },
    // starfield
    React.createElement('svg', {
      style: {
        position: 'absolute',
        inset: 0,
        width: A.CANVAS.w,
        height: A.CANVAS.h
      },
      'aria-hidden': true
    }, STARS.map((s, i) => React.createElement('circle', {
      key: i,
      cx: s.x,
      cy: s.y,
      r: s.r,
      fill: '#aebfe0',
      opacity: focusPerson ? s.o * 0.4 : s.o
    }))),
    // nebula membranes (fill)
    A.institutions.map(inst => {
      const dim = instDimmed(inst.id);
      return React.createElement('div', {
        key: inst.id,
        style: {
          position: 'absolute',
          left: inst.cx,
          top: inst.cy,
          width: 440,
          height: 360,
          transform: 'translate(-50%,-50%)',
          borderRadius: '50%',
          opacity: dim ? 0.12 : 0.5,
          transition: 'opacity var(--dur-panel) var(--ease-out)',
          background: `radial-gradient(circle, color-mix(in oklab, ${inst.color} 20%, transparent) 0%, transparent 66%)`,
          filter: 'blur(28px)',
          pointerEvents: 'none'
        }
      });
    }),
    // membrane outlines + tethers + cross edges
    React.createElement('svg', {
      style: {
        position: 'absolute',
        inset: 0,
        width: A.CANVAS.w,
        height: A.CANVAS.h,
        overflow: 'visible',
        pointerEvents: 'none'
      }
    }, A.institutions.map(inst => {
      const dim = instDimmed(inst.id);
      return React.createElement('ellipse', {
        key: inst.id,
        cx: inst.cx,
        cy: inst.cy,
        rx: 192,
        ry: 160,
        fill: 'none',
        stroke: inst.color,
        strokeOpacity: dim ? 0.04 : 0.18,
        strokeWidth: 1,
        strokeDasharray: '2 6'
      });
    }), A.people.map(p => {
      const inst = A.instById[p.instId];
      const dim = focusPerson && !(ego && ego.has(p.id)) || isolatedId && p.instId !== isolatedId || q && !matches(p);
      return React.createElement('line', {
        key: p.id,
        x1: inst.cx,
        y1: inst.cy,
        x2: p.x,
        y2: p.y,
        stroke: inst.color,
        strokeOpacity: dim ? 0.03 : 0.2,
        strokeWidth: 1
      });
    }), A.edges.map((e, i) => {
      const a = A.byId[e[0]],
        b = A.byId[e[1]];
      if (!relOn(e[2])) return null;
      const inEgo = focusPerson && (e[0] === focusId || e[1] === focusId);
      const isoTouch = isolatedId && (a.instId === isolatedId || b.instId === isolatedId);
      let op = 0.5;
      if (focusPerson) op = inEgo ? 0.95 : 0.04;else if (isolatedId) op = isoTouch ? 0.85 : 0.06;
      return React.createElement('line', {
        key: i,
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        stroke: REL_COLOR[e[2]],
        strokeOpacity: op,
        strokeWidth: inEgo ? 2 : 1.3,
        style: {
          filter: inEgo ? `drop-shadow(0 0 7px ${REL_COLOR[e[2]]})` : 'none',
          transition: 'stroke-opacity var(--dur-panel)'
        }
      });
    })),
    // anchors
    A.institutions.map(inst => {
      const dim = instDimmed(inst.id);
      const active = isolatedId === inst.id || focusPerson && (focusPerson.instId === inst.id || focusPerson.bridge === inst.id);
      return React.createElement('div', {
        key: inst.id,
        style: {
          position: 'absolute',
          left: inst.cx,
          top: inst.cy,
          transform: 'translate(-50%,-50%)',
          zIndex: 5
        }
      }, InstitutionAnchor && React.createElement(InstitutionAnchor, {
        name: inst.name,
        type: inst.type,
        count: inst.count,
        color: inst.color,
        state: dim ? 'dim' : active ? 'active' : 'default'
      }));
    }),
    // person nodes
    A.people.map(p => {
      let state = 'default';
      if (focusPerson) state = p.id === focusId ? 'active' : ego && ego.has(p.id) ? 'trace' : 'dim';else if (isolatedId) state = p.instId === isolatedId ? 'default' : 'dim';else if (q) state = matches(p) ? 'trace' : 'dim';
      return React.createElement('div', {
        key: p.id,
        onClick: () => onFocus && onFocus(p.id),
        style: {
          position: 'absolute',
          left: p.x,
          top: p.y,
          transform: 'translate(-50%,-50%)',
          zIndex: state === 'active' ? 9 : 6
        }
      }, PersonNode && React.createElement(PersonNode, {
        name: p.name,
        color: p.color,
        connections: p.conn,
        label: p.labeled,
        state
      }));
    }))));
  }
  window.Galaxy = Galaxy;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/network-atlas/Galaxy.jsx", error: String((e && e.message) || e) }); }

// ui_kits/network-atlas/data.js
try { (() => {
/* Network Atlas — sample investigative graph.
 * A plain-JS module (no build step): sets window.ATLAS = { institutions, people,
 * edges, CANVAS }. Person positions are precomputed here so the galaxy view just
 * reads {x, y}. Deterministic — no randomness at render time. */
(function () {
  const CANVAS = {
    w: 1680,
    h: 940
  };

  // id, name, type, colour var, cluster centre, headcount label
  const institutions = [{
    id: 'mow',
    name: 'Ministry of Works',
    type: 'government',
    color: 'var(--inst-gold)',
    cx: 470,
    cy: 320,
    count: 84
  }, {
    id: 'nor',
    name: 'Northwood University',
    type: 'university',
    color: 'var(--inst-violet)',
    cx: 880,
    cy: 250,
    count: 63
  }, {
    id: 'mer',
    name: 'Meridian Capital',
    type: 'bank',
    color: 'var(--inst-emerald)',
    cx: 1290,
    cy: 330,
    count: 51
  }, {
    id: 'hel',
    name: 'Helica Foundation',
    type: 'ngo',
    color: 'var(--inst-rose)',
    cx: 320,
    cy: 720,
    count: 22
  }, {
    id: 'van',
    name: 'Vance Construction',
    type: 'construction',
    color: 'var(--inst-amber)',
    cx: 800,
    cy: 720,
    count: 33
  }, {
    id: 'orb',
    name: 'Orbit Media Group',
    type: 'media',
    color: 'var(--inst-azure)',
    cx: 1280,
    cy: 720,
    count: 37
  }];
  const instById = Object.fromEntries(institutions.map(i => [i.id, i]));

  // ---- People. Each cluster gets N people placed on 1–2 orbit rings. ----
  const NAMES = ['Viktor Hale', 'Dana Okonkwo', 'Mira Sol', 'Roman Vance', 'Ada Reyes', 'Karl Imo', 'Elena Hale', 'Priya Nair', 'Tomas Berg', 'Lena Voss', 'Omar Diallo', 'Yuki Tan', 'Greta Lind', 'Sol Ramirez', 'Ivan Petrov', 'Nadia Haq', 'Felix Mraz', 'Hana Kim', 'Bram de Wit', 'Sana Iqbal', 'Theo Marsh', 'Cleo Park', 'Rita Mensah', 'Gus Oduya', 'Nora Beck', 'Dimitri Vasilev', 'Asha Rao', 'Pavel Novak', 'Maya Levin', 'Otto Frey', 'Liv Sandberg', 'Caius Roth', 'Wren Adeyemi', 'Bo Fan', 'Esme Cole', 'Jonas Welt', 'Ife Bello', 'Kira Sato', 'Milo Vance', 'Tess Okoro'];
  let ni = 0;
  const nextName = () => NAMES[ni++ % NAMES.length];
  function ring(inst, items) {
    // items: [{r, n, big?}] orbit specs; returns placed people
    const out = [];
    items.forEach((spec, ringIdx) => {
      for (let k = 0; k < spec.n; k++) {
        const a = k / spec.n * Math.PI * 2 + ringIdx * 0.6 + inst.cx * 0.0007;
        const jitter = (k * 9301 + ringIdx * 49297) % 23 / 23 - 0.5;
        const r = spec.r + jitter * 18;
        out.push({
          inst: inst.id,
          color: inst.color,
          x: Math.round(inst.cx + Math.cos(a) * r),
          y: Math.round(inst.cy + Math.sin(a) * r * 0.82),
          conn: spec.big ? 14 + k * 7 % 9 : 4 + k * 5 % 6
        });
      }
    });
    return out;
  }
  const people = [];
  const roles = ['Director', 'Lead', 'Analyst', 'Officer', 'Advisor', 'Coordinator', 'Aide', 'Counsel', 'Manager', 'Partner'];
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
        labeled: false
      });
    });
  }
  addCluster('mow', [{
    r: 78,
    n: 4,
    big: true
  }, {
    r: 138,
    n: 6
  }]);
  addCluster('nor', [{
    r: 74,
    n: 3,
    big: true
  }, {
    r: 132,
    n: 6
  }]);
  addCluster('mer', [{
    r: 72,
    n: 3,
    big: true
  }, {
    r: 128,
    n: 5
  }]);
  addCluster('hel', [{
    r: 62,
    n: 3,
    big: true
  }, {
    r: 112,
    n: 3
  }]);
  addCluster('van', [{
    r: 70,
    n: 3,
    big: true
  }, {
    r: 124,
    n: 5
  }]);
  addCluster('orb', [{
    r: 70,
    n: 3,
    big: true
  }, {
    r: 126,
    n: 5
  }]);
  const byId = Object.fromEntries(people.map(p => [p.id, p]));

  // Label the single most-connected person per institution (no label spaghetti)
  institutions.forEach(inst => {
    const mine = people.filter(p => p.instId === inst.id);
    mine.sort((a, b) => b.conn - a.conn);
    if (mine[0]) {
      mine[0].labeled = true;
      mine[0].conn = Math.max(mine[0].conn, 18);
    }
  });

  // ---- Hero people: give recognisable names + the bridge person ----
  function setHero(id, patch) {
    Object.assign(byId[id], patch);
  }
  setHero('mow-0', {
    name: 'Viktor Hale',
    role: 'Deputy Director',
    labeled: true,
    conn: 22,
    bridge: 'mer'
  });
  setHero('mer-0', {
    name: 'Ada Reyes',
    role: 'Portfolio Manager',
    labeled: true,
    conn: 19
  });
  setHero('van-0', {
    name: 'Roman Vance',
    role: 'Founder',
    labeled: true,
    conn: 20
  });
  setHero('nor-0', {
    name: 'Mira Sol',
    role: 'Dean of Engineering',
    labeled: true,
    conn: 18
  });
  setHero('orb-0', {
    name: 'Elena Hale',
    role: 'Editor-in-Chief',
    labeled: true,
    conn: 17
  });
  setHero('hel-0', {
    name: 'Dana Okonkwo',
    role: 'Programme Director',
    labeled: true,
    conn: 16
  });

  // Push labelled people onto an outer orbit so their labels clear the anchor.
  people.forEach(p => {
    if (!p.labeled) return;
    const inst = instById[p.instId];
    const ang = Math.atan2((p.y - inst.cy) / 0.82, p.x - inst.cx);
    p.x = Math.round(inst.cx + Math.cos(ang) * 152);
    p.y = Math.round(inst.cy + Math.sin(ang) * 152 * 0.82);
  });

  // ---- Cross-institution edges (the investigative signal) ----
  // [a, b, relType]
  const edges = [['mow-0', 'mer-0', 'financial'], ['mow-0', 'van-0', 'business'], ['mow-0', 'orb-0', 'family'], ['mow-0', 'nor-0', 'former'], ['van-0', 'mer-0', 'financial'], ['van-0', 'mow-3', 'business'], ['nor-0', 'orb-0', 'colleague'], ['nor-0', 'hel-0', 'former'], ['mer-0', 'orb-0', 'business'], ['hel-0', 'mow-2', 'family'], ['hel-0', 'van-3', 'financial'], ['orb-0', 'mer-2', 'business'], ['nor-3', 'mer-3', 'former']];

  // Build adjacency for ego-networks
  const adj = {};
  people.forEach(p => adj[p.id] = []);
  edges.forEach(([a, b, rel]) => {
    adj[a].push({
      id: b,
      rel
    });
    adj[b].push({
      id: a,
      rel
    });
  });
  // intra-institution colleague links for hero people (a few each)
  people.forEach(p => {
    if (!p.labeled) return;
    const mates = people.filter(q => q.instId === p.instId && q.id !== p.id).slice(0, 3);
    mates.forEach(m => {
      if (!adj[p.id].some(e => e.id === m.id)) {
        adj[p.id].push({
          id: m.id,
          rel: 'colleague'
        });
        adj[m.id].push({
          id: p.id,
          rel: 'colleague'
        });
      }
    });
  });

  // ---- Profiles for the focus panel ----
  const REL_BY_ID = {};
  function buildProfile(p) {
    const inst = instById[p.instId];
    const institutions = [{
      name: inst.name,
      type: inst.type,
      color: inst.color,
      role: p.role
    }];
    if (p.bridge) {
      const b = instById[p.bridge];
      institutions.push({
        name: b.name,
        type: b.type,
        color: b.color,
        role: 'Advisory Board'
      });
    }
    const connections = (adj[p.id] || []).map(({
      id,
      rel
    }) => {
      const q = byId[id];
      const qi = instById[q.instId];
      return {
        id: q.id,
        name: q.name,
        role: q.role,
        institution: qi.name,
        color: qi.color,
        bridgeColor: q.bridge ? instById[q.bridge].color : undefined,
        relType: rel
      };
    });
    const phone = '+44 7700 ' + (900000 + (p.id.charCodeAt(0) * 137 + p.name.length * 991) % 99999);
    return {
      id: p.id,
      name: p.name,
      institutions,
      tenure: 2010 + p.name.length % 9 + ' — present',
      contact: {
        phone: phone.slice(0, 13) + ' ' + phone.slice(13),
        email: p.name.toLowerCase().replace(/[^a-z]/g, '.').replace(/\.+/g, '.') + '@' + p.instId + '.org',
        location: (51 + p.x % 4 * 0.01).toFixed(4) + ', ' + (-0.12 - p.y % 6 * 0.01).toFixed(4),
        id: 'ATL-' + (10000 + people.indexOf(p) * 311).toString().slice(0, 5)
      },
      summary: p.bridge ? 'Spans two institutions — the strongest cross-institution link in this part of the graph.' : undefined,
      family: p.labeled ? [{
        name: p.name.split(' ')[0][0] + '. ' + p.name.split(' ')[1],
        relation: 'Spouse',
        color: 'var(--inst-rose)'
      }, {
        name: 'J. ' + p.name.split(' ')[1],
        relation: 'Sibling',
        color: 'var(--inst-slate)'
      }] : [],
      connections
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
      (adj[id] || []).forEach(e => set.add(e.id));
      return set;
    }
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/network-atlas/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.SearchBar = __ds_scope.SearchBar;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.BackToGalaxy = __ds_scope.BackToGalaxy;

__ds_ns.InstitutionAnchor = __ds_scope.InstitutionAnchor;

__ds_ns.INSTITUTION_TYPE_LABEL = __ds_scope.INSTITUTION_TYPE_LABEL;

__ds_ns.InstitutionIcon = __ds_scope.InstitutionIcon;

__ds_ns.InstitutionLegend = __ds_scope.InstitutionLegend;

__ds_ns.PersonNode = __ds_scope.PersonNode;

__ds_ns.ProfilePanel = __ds_scope.ProfilePanel;

__ds_ns.RELATIONSHIP_TYPES = __ds_scope.RELATIONSHIP_TYPES;

__ds_ns.RelationshipLegend = __ds_scope.RelationshipLegend;

})();
