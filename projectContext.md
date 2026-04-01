# Project Context

This document summarizes **wedding-builder-main** (npm package name: `wedding-anti`): a standalone visual editor for event landing pages, built for embedding in the broader **Nin9** event platform (e.g. `/planner/studio` in the main app). Use it to onboard quickly and to keep architecture decisions visible.

---

## 1. What the product is

- **Purpose**: Drag-and-drop **CraftJS** editor for wedding/event-style landing pages: sections, typography, media, forms, charts, decoratives, and animations.
- **Shape of the app**: Single Next.js route (`src/app/page.tsx`) mounts the full studio: **AppProvider → EditorProvider → Viewport** with a **Frame** whose root is a **canvas-mode** `UserContainer` (free placement).
- **Not included**: Hosted backend for templates; persistence is **browser storage** plus optional **Cloudinary** uploads and a **dev-oriented** JSON file API.

---

## 2. Tech stack

| Area | Choice |
|------|--------|
| Framework | **Next.js 16** (App Router), **React Compiler** enabled in `next.config.ts` |
| UI | **React 19**, TypeScript strict |
| Builder | **@craftjs/core** (+ **@craftjs/layers** for the Layers tree in the toolbox) |
| Styling | **Tailwind CSS v4** + PostCSS |
| Motion | **Framer Motion** (canvas drag, animations on user components) |
| Primitives | **Radix UI** + shadcn-style components in `src/components/ui/` |
| Fonts | **next/font/google** in `layout.tsx` (Geist + wedding-oriented faces: Great Vibes, Dancing Script, Playfair, Cormorant Garamond, Sacramento, Montserrat, Lobster Two). Viewport also loads a small Google Fonts `<link>` for canvas use. |
| Charts / inputs | **recharts**, **react-contenteditable**, **react-resizable-panels** |
| Media | **cloudinary** SDK on `/api/upload` |

**Path alias**: `@/*` → `./src/*` (`tsconfig.json`).

**Dependencies in package.json not referenced under `src/`** (as of this doc): e.g. `styled-components`, `lottie-react`, `react-best-gradient-color-picker` — may be reserved for future UI or unused; verify before relying on them.

---

## 3. Directory map

### `src/app/`

- **`page.tsx`**: Client page; wraps editor providers and initial **empty** canvas `Element`.
- **`layout.tsx`**: Root layout, global font CSS variables, default metadata (still generic “Create Next App” — product metadata may need tightening).
- **`globals.css`**: Global styles.
- **`api/upload/route.ts`**: `POST` multipart → Cloudinary `wedding-builder/` folder; `DELETE` JSON `{ url }` → parse `public_id` and destroy asset. Requires `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- **`api/save-template/route.ts`**: `POST` appends body to **`src/data/templates.json`** on disk. Intended for local/dev workflows; **not** suitable for serverless read-only FS in production.

### `src/components/editor/`

| File | Role |
|------|------|
| `AppContext.tsx` | Device (desktop/mobile), preview, **named sections** state (`sections` + `saveSection` / `loadSection`), **right panel** mode: `properties` \| `templates` \| `decoratives`. |
| `EditorProvider.tsx` | `<Editor resolver={craftResolver} onRender={RenderNode}>`. |
| `Viewport.tsx` | Three-column shell: Toolbox \| canvas \| SettingsPanel; listens for **`nin9-pages-state`** to show multi-page dropdown; mobile/desktop canvas width behavior. |
| `Toolbox.tsx` | Palettes (text, media, layout, elements, blocks), Layers tab, entry points to Templates / Decoratives (switch right panel). |
| `SettingsPanel.tsx` | Selected node settings **or** template/decoratives UI depending on `activeRightPanel`. |
| `DecorativeLibrary.tsx` | SVG decoratives from `public/shapes/`, drag or add-to-root. |
| `RenderNode.tsx` | Selection chrome, resize/move, editor vs preview behavior. |
| `Topbar.tsx` | Undo/redo, device + preview, **template CRUD** (local storage), **multi-page** within a template, save-to-`templates.json`, FullPreview trigger. |
| `SectionSwitcher.tsx` | Switches **logical sections** (Home, Story, …): serializes current canvas to context, deserializes target; strips legacy **`HeroSection`** nodes from loaded JSON. |
| `Layers.tsx` | Craft layers panel wiring. |
| `FullPreview.tsx` | Full-page preview dialog. |
| `TemplateList.tsx` | Loads starters from **`@/data/templates.json`**. |
| `properties/*` | Shared spacing/style controls for settings UIs. |

### `src/components/user/`

Craft **user components** (`useNode`, `connect`, `drag`, `craft` static with `related.settings`). Includes **Container** (flex/grid/canvas), **Text**, **Image**, **Video**, **Button**, form controls, **Popup**, **Chart**, **Table**, **Emoji**, **AnimatedShape**, **Navbar**, **Decorative**, **AnimationSection** pattern, etc.

### `src/components/user/sections/`

Preset blocks: **ModernHero**, **Footer**, **PrivateEventPopup**. **`HeroSection.tsx` exists in the folder but is not registered in `craftResolver`**; old saves are cleaned when loading via `SectionSwitcher`.

### `src/utils/storage.ts`

- **Strategy**: Prefer **localStorage**; on quota errors, write to **IndexedDB** (`DB_NAME`: `wedding-editor-db`, store `templates`). `get()` reads localStorage first, then IDB.
- **API**: `storage.save(key, string)`, `storage.get(key)`, `storage.remove(key)`.

### `src/lib/`

- **`imageRegistry.ts`**: Maps temporary **blob URLs** to `File` and optional replaced Cloudinary URL (used when saving/uploading images from the editor).
- **`utils.ts`**: `cn`, toasts, etc.

### `src/data/templates.json`

Bundled starter templates; appended to by **`/api/save-template`** when used from the Topbar flow.

---

## 4. Architecture & data flow

### Provider hierarchy

```
AppProvider (device, preview, section JSON map, right panel mode)
  └─ EditorProvider (CraftJS + resolver + RenderNode)
       └─ Viewport (Topbar + Toolbox + canvas + SettingsPanel)
            └─ Frame → root UserContainer (canvas)
```

### Editing loop

1. User drags from **Toolbox** (or adds from **DecorativeLibrary** / templates).
2. Craft creates nodes; **RenderNode** wraps each for selection and manipulation.
3. Selection drives **SettingsPanel** via each component’s `craft.related.settings`.
4. **`setProp` / Craft actions** update serialized state; **preview** toggles editor `enabled` so links/inputs behave realistically.

### Layout modes (`UserContainer`)

- **flex** / **grid**: normal flow.
- **canvas**: children use **`useCanvasDrag`** for absolute positioning; alignment helpers in **Text** etc. map to `top`/`left` + transforms where needed.

### Sections vs pages

- **SectionSwitcher**: Multiple **named sections** per session; state lives in **React** (`AppContext.sections`), not separate storage keys. Switching serializes the current tree and deserializes the other section (or a default empty ROOT).
- **Topbar templates**: **Multi-page** support: list of page IDs per **root** template, keys like `wedding-pages-${rootId}`, `wedding-page-root-${pageId}`. Dispatches **`nin9-pages-state`** so Viewport can show page names.

### Persistence keys (browser)

| Key / pattern | Role |
|---------------|------|
| `wedding-templates` | JSON array of `{ id, name, lastSaved }` |
| `wedding-template-${id}` | Craft serialized string for that page/template id |
| `wedding-current-template-id` | Active id |
| `wedding-page-root-${id}` | Root id for multi-page group |
| `wedding-pages-${rootId}` | JSON string array of page ids |
| `wedding-site-state` | Legacy single-site load path (see Topbar) |

### Server / assets

- **Images**: Client uploads via **`/api/upload`** to Cloudinary; **`imageRegistry`** ties blobs to files until upload.
- **Export templates to repo**: Topbar can **`POST /api/save-template`** to append to `src/data/templates.json` (filesystem write).

---

## 5. Commands

```bash
npm run dev    # Next dev (default port 3000)
npm run build  # Production build + typecheck
npm run lint   # ESLint
```

---

## 6. Rules for extending the codebase

1. **New canvas components**: Define `Component.craft`, implement settings, add to **`craftResolver`** in `EditorProvider.tsx`, and expose in **Toolbox** if user-placed.
2. **API routes**: Keep explicit `Promise<Response>` (or consistent NextResponse) return types where the compiler demands it.
3. **Canvas-aware widgets**: Use **`useCanvasDrag`** and test **flex/grid/canvas** parents.
4. **Legacy types**: If removing a component type from the resolver, consider migration or deserialization cleanup (pattern: `SectionSwitcher` + `HeroSection`).
5. **Production template saving**: Do not rely on **`/api/save-template`** without a writable persistence layer; current implementation is file-based under `src/data/`.

---

## 7. Doc maintenance

When adding major features (auth, remote save, new resolver entries, storage keys), update this file so agents and humans share the same mental model of **Craft tree + local persistence + Cloudinary + optional JSON templates**.
