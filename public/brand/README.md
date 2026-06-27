# Decomp Academy — Brand Assets

The `{dA}` monogram and **decomp academy** wordmark, recreated as clean, self-contained
vector assets. All text is **converted to outline paths**, so every SVG renders identically
everywhere with **no font dependency**.

Open **`brand-sheet.html`** in a browser for a visual overview of the whole kit.

---

## Color palette

| Swatch | Hex | Role |
| --- | --- | --- |
| ⬛ Ink | `#3A1E6E` | `{dA}` letters, wordmark, primary dark |
| 🟪 Violet | `#6C4FD6` | Brace main fill |
| 🟣 Lavender | `#A78BFA` | Brace echo / accent |
| ⬜ Pale | `#E5DFFF` | Tints, backgrounds |
| ⬛ Near-black | `#1B1226` | Dark surfaces |

## Typography

- **Monogram `{dA}`** — Poppins SemiBold (outlined).
- **Wordmark `decomp academy`** — Poppins SemiBold (outlined).
- The braces are bespoke vector strokes (not a font glyph) with a mirrored, inward-and-down
  lavender "echo" that nods to the decompilation/layers theme.

> The website UI itself uses **Inter** (`next/font`). The logo intentionally uses Poppins to
> match the original brand exploration; it ships as outlines so Poppins is **not** required at runtime.

---

## File index

### `svg/` — scalable, production source
| File | Use |
| --- | --- |
| `logo-horizontal.svg` | Primary lockup: mark + divider + wordmark (light backgrounds) |
| `logo-horizontal-on-dark.svg` | Same, white text/mark for dark backgrounds |
| `logo-horizontal-mono.svg` | Single-color (ink) lockup for one-color print/stamps |
| `logo-stacked.svg` | Mark over two-line wordmark (square-ish contexts) |
| `logo-stacked-on-dark.svg` | Stacked, for dark backgrounds |
| `icon.svg` | The `{dA}` mark only (full color) |
| `icon-on-dark.svg` | Mark only, white for dark backgrounds |
| `icon-mono.svg` / `icon-mono-white.svg` | Single-color mark (ink / white) |
| `wordmark.svg` / `wordmark-on-dark.svg` | `decomp academy` text only |
| `favicon.svg` | Rounded-square app icon (dark tile, white `{dA}`) |
| `apple-touch.svg` | Full-bleed squared tile (iOS applies its own mask) |
| `icon-maskable.svg` | Extra-padded full-bleed tile for Android adaptive icons |
| `og-image.svg` | 1200×630 social-share card |

### `png/` — rasterized exports (transparent unless noted)
`icon-{256,512,1024}`, `logo-horizontal-{80,160,320,640}`, `logo-stacked-{256,512}`,
on-dark/mono variants, `wordmark-{64,128}`, and `og-image.png` (1200×630, opaque).

### `favicon/` — web/app icons
`favicon.ico` (16/32/48 multi-size), `favicon-{16…512}.png`, `apple-touch-icon.png` (180),
`icon-192.png`, `icon-512.png`, `maskable-512.png`.

---

## Usage guidelines

- **Clear space:** keep padding ≥ the height of the `d` around the lockup.
- **Minimum size:** horizontal lockup ≥ 120px wide; icon ≥ 24px.
- **Don't** recolor the letters, stretch, add shadows, or re-space the wordmark.
- Prefer the **on-dark** variants on backgrounds darker than `#6C4FD6`.

---

## Wiring the favicon (Next.js App Router)

This project uses the App Router (`src/app`). Two options:

**A. Drop-in metadata files (simplest).** Copy into `src/app/` — Next auto-generates the tags:

```bash
cp public/brand/favicon/favicon.ico        src/app/favicon.ico
cp public/brand/svg/favicon.svg            src/app/icon.svg
cp public/brand/favicon/apple-touch-icon.png src/app/apple-icon.png
```

**B. Explicit metadata** in `src/app/layout.tsx`:

```ts
export const metadata: Metadata = {
  // ...existing fields...
  icons: {
    icon: [
      { url: "/brand/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/brand/favicon/apple-touch-icon.png",
  },
  manifest: "/brand/site.webmanifest",
  openGraph: { images: ["/brand/png/og-image.png"] },
  themeColor: "#3A1E6E",
};
```

Files in `public/` are served from the site root, e.g. `public/brand/svg/icon.svg` → `/brand/svg/icon.svg`.
