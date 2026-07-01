// Single source of truth for the design palette.
//
// The app ships a dark theme (default) and a light theme. Both are defined here
// as hex; everything downstream is derived from these two objects so colours can
// never drift between Tailwind, the raw CSS in globals.css, and the Monaco editor:
//
//   • `themeStyles`   — the `:root` / `[data-theme=light]` CSS-variable blocks
//                       (RGB *channels*, so Tailwind's `/opacity` modifiers work),
//                       injected once in the document <head>.
//   • `tailwindColors`— the semantic colour scale for tailwind.config.ts, every
//                       leaf pointing at `rgb(var(--token) / <alpha-value>)`.
//   • `palette` /     — the raw hex, read directly by Monaco (which can't use the
//     `paletteLight`    CSS vars) to build its matching dark / light editor theme.

// A node anywhere in a palette: a hex string, an array of them (rot), or a
// nested group. The derivation helpers below walk this recursively. `Palette` is
// a `type` (not `interface`) so it satisfies the index-signature shape here —
// which is what lets the helpers stay fully typed instead of taking `unknown`.
type PaletteNode = string | readonly string[] | { readonly [key: string]: PaletteNode };

// The semantic palette shape, shared by the dark and light themes.
export type Palette = {
  bg: { DEFAULT: string; soft: string; softer: string; inset: string };
  line: { DEFAULT: string; strong: string; faint: string };
  content: {
    bright: string;
    primary: string;
    DEFAULT: string;
    secondary: string;
    muted: string;
    faint: string;
    ghost: string;
  };
  accent: { DEFAULT: string; soft: string; hover: string; on: string; grad: string };
  good: { DEFAULT: string; soft: string };
  warn: string;
  bad: { DEFAULT: string; text: string };
  syntax: {
    mnemonic: string;
    keyword: string;
    reg: string;
    num: string;
    str: string;
    comment: string;
    ident: string;
  };
  rot: string[];
};

// Dark surfaces — darkest (inset, e.g. code) → lightest chrome. Faintly
// purple-tinted near-blacks so the dark theme reads as the GameCube-purple
// brand; luminance is held close to the original neutral values.
export const palette: Palette = {
  bg: {
    DEFAULT: "#0e0c16",
    soft: "#17141f",
    softer: "#1f1a2b",
    inset: "#0a0810",
  },
  // Borders / hairlines, three weights. Kept low-contrast for a flat theme that
  // separates surfaces mostly by background elevation, not hard outlines.
  line: {
    DEFAULT: "#221c30",
    strong: "#2e2740",
    faint: "#181323",
  },
  // Semantic text scale. Replaces the ~50 one-off greys the UI used to hardcode.
  // `faint`/`ghost` were lifted from #5b6675/#3a4757 to clear WCAG AA on #0d1117.
  content: {
    bright: "#f0f3f8", // headings
    primary: "#e6ebf2", // strong labels, active states
    DEFAULT: "#c4cdd9", // body
    secondary: "#b3bdca", // softer body
    muted: "#8b97a6", // captions, meta
    faint: "#7a8696", // empty states, disabled text (AA on bg)
    ghost: "#56636f", // line numbers, off pips
  },
  // GameCube-purple brand accent. Mirrors the {dA} logo palette
  // (#6C4FD6 violet / #A78BFA lavender). Kept light enough to clear WCAG AA as
  // link text on the dark surfaces below.
  accent: {
    DEFAULT: "#8b6cf0", // primary: links, fills, focus
    soft: "#5b3fc9", // deep violet: borders, secondary accent
    hover: "#a78bfa", // lavender: hover / lighter state
    on: "#140e22", // text/icon color when sitting ON an accent fill
    grad: "#bca4ff", // gradient terminal stop (pale violet)
  },
  good: {
    DEFAULT: "#3fb950",
    soft: "#56d364",
  },
  warn: "#d29922",
  bad: {
    DEFAULT: "#f85149",
    text: "#d6938c", // console error foreground
  },
  // Shared syntax palette — consumed by both AsmDiff (Tailwind) and Monaco (hex).
  syntax: {
    mnemonic: "#ff9b85",
    keyword: "#ff7b72",
    reg: "#7ee787",
    num: "#79c0ff",
    str: "#a5d6ff",
    comment: "#6b7686",
    ident: "#c9d1d9",
  },
  // objdiff's "rotating" branch-arrow hues — each branch's source/target pair
  // shares one colour you can trace; adjacent branches stay easy to tell apart.
  rot: [
    "#e3b341", // yellow
    "#56d4dd", // cyan
    "#db61a2", // pink
    "#a371f7", // purple
    "#3fb950", // green
    "#f0883e", // orange
    "#6cb6ff", // blue
    "#f47067", // red
  ],
};

// Light theme — same semantic shape. A near-white, faintly cool/purple-tinted
// page so the GameCube-violet brand still carries; text + accents are darkened
// to clear WCAG AA on the light surfaces, and syntax/branch colours swap to the
// GitHub-light family (tuned for contrast on a light code background).
export const paletteLight: Palette = {
  bg: {
    DEFAULT: "#f6f6fb", // page
    soft: "#ffffff", // cards, nav, headers, table heads (elevated = white)
    softer: "#ecebf5", // hover states, chips, skeletons
    inset: "#f1f0f7", // code / pre / the recessed surface
  },
  line: {
    DEFAULT: "#d9d6e6", // visible hairlines/dividers on white
    strong: "#bcb6cf", // dividers, off pips, scrollbars, chip borders
    faint: "#e7e4f0",
  },
  content: {
    bright: "#15131c", // headings
    primary: "#221d2c", // strong labels
    DEFAULT: "#3a3547", // body
    secondary: "#4c4659", // softer body
    muted: "#5e5770", // captions, meta (AA on bg)
    faint: "#645d72", // empty states, disabled (AA on bg)
    ghost: "#8b8398", // line numbers, off pips, fine print
  },
  accent: {
    DEFAULT: "#6541cf", // links / fills — deep enough to read on white
    soft: "#8b6cf0", // borders, secondary accent
    hover: "#5836c0", // darker on hover (fills are dark-on-light)
    on: "#ffffff", // text/icon on an accent fill
    grad: "#7a52df", // gradient terminal stop + prose code text
  },
  good: {
    DEFAULT: "#1a7f37",
    soft: "#2da44e",
  },
  warn: "#8a5a00",
  bad: {
    DEFAULT: "#cf222e",
    text: "#b22730",
  },
  syntax: {
    mnemonic: "#953800",
    keyword: "#cf222e",
    reg: "#116329",
    num: "#0550ae",
    str: "#0a3069",
    comment: "#586069", // darkened to clear AA on the light code surface
    ident: "#1f2328",
  },
  rot: [
    "#8a5a00", // amber
    "#1b7c83", // teal
    "#a8307a", // pink (muted so it's not neon on white)
    "#8250df", // purple
    "#1a7f37", // green
    "#bc4c00", // orange
    "#0969da", // blue
    "#cf222e", // red
  ],
};

// ---- Derivation ----------------------------------------------------------

// "#8b6cf0" -> "139 108 240" (space-separated channels for `rgb(... / α)`).
function hexToChannels(hex: string): string {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

// Flatten a palette to { "bg": "#…", "bg-soft": "#…", "rot-0": "#…" }.
// `DEFAULT` collapses onto its parent (bg.DEFAULT -> "bg"); array indices and
// object keys append with a dash.
function flatten(
  node: PaletteNode,
  prefix: string,
  out: Record<string, string>,
): Record<string, string> {
  if (typeof node === "string") {
    out[prefix] = node;
    return out;
  }
  for (const [key, value] of Object.entries(node)) {
    const name = key === "DEFAULT" ? prefix : prefix ? `${prefix}-${key}` : key;
    flatten(value, name, out);
  }
  return out;
}

function cssVarBlock(pal: PaletteNode): string {
  return Object.entries(flatten(pal, "", {}))
    .map(([name, hex]) => `--${name}:${hexToChannels(hex)}`)
    .join(";");
}

type ColorTree = string | { [k: string]: ColorTree };

// Mirror the palette's shape, replacing each hex leaf with a reference to its CSS
// variable so Tailwind utilities (and their `/opacity` modifiers) resolve at runtime.
function toCssVarColors(node: PaletteNode, prefix: string): ColorTree {
  if (typeof node === "string") return `rgb(var(--${prefix}) / <alpha-value>)`;
  const out: Record<string, ColorTree> = {};
  for (const [key, value] of Object.entries(node)) {
    const name = key === "DEFAULT" ? prefix : prefix ? `${prefix}-${key}` : key;
    out[key] = toCssVarColors(value, name);
  }
  return out;
}

/** Injected once in <head>: dark vars on :root, light vars under [data-theme=light]. */
export const themeStyles =
  `:root{${cssVarBlock(palette)}}` + `:root[data-theme="light"]{${cssVarBlock(paletteLight)}}`;

/** Semantic colour scale for tailwind.config.ts — every leaf is a CSS-var reference. */
export const tailwindColors = toCssVarColors(palette, "") as Record<string, ColorTree>;
