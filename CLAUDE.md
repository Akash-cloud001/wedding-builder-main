# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Is This

Nin9 Studio is a visual drag-and-drop website builder for event landing pages, built on **@craftjs/core**. It's part of the Nin9 event management platform and lives at the `/planner/studio` route in the main frontend. This repo is the standalone studio editor.

## Development Commands

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Production build (verifies TypeScript)
npm run lint     # ESLint
```

## Tech Stack

- **Next.js 16** with App Router, React Compiler enabled
- **React 19** with strict mode TypeScript
- **@craftjs/core** - Visual builder framework (drag-drop, node tree, serialization)
- **Framer Motion** - Animations and drag interactions
- **Radix UI + shadcn/ui** (new-york style) - UI primitives in `src/components/ui/`
- **Tailwind CSS v4** with PostCSS
- **recharts** - Chart components
- **react-contenteditable** - Inline text editing
- **react-resizable-panels** - Resizable layout panels

Path alias: `@/*` maps to `./src/*`

## Architecture

### Single-Page Editor App

The app has one page (`src/app/page.tsx`) that renders the full editor. The provider hierarchy is:

```
AppProvider (device, preview, sections state)
  → EditorProvider (CraftJS Editor with resolver + RenderNode)
    → Viewport (three-panel layout: Toolbox | Canvas | SettingsPanel)
```

### Core Editor Components (`src/components/editor/`)

| File | Purpose |
|---|---|
| `AppContext.tsx` | Context for device mode (desktop/mobile), preview toggle, section management |
| `EditorProvider.tsx` | Wraps CraftJS `<Editor>` with the resolver mapping all user components |
| `Viewport.tsx` | Main three-panel layout with device scaling and page switcher |
| `Toolbox.tsx` | Left sidebar - draggable component palette (Text, Media, Layout, Elements, Blocks) |
| `SettingsPanel.tsx` | Right sidebar - shows selected component's Settings via CraftJS `related.settings` |
| `RenderNode.tsx` | Custom CraftJS render function: selection UI, resize handles (8 directions), drag/drop, move/delete toolbar |
| `Topbar.tsx` | Header with device toggle, undo/redo, save/load/new, preview, template management |
| `Layers.tsx` | Component tree hierarchy panel |
| `SectionSwitcher.tsx` | Predefined sections: Home, Story, Schedule, Gallery, RSVP, Travel, Registry |
| `FullPreview.tsx` | Full-page preview dialog rendering all sections read-only |
| `properties/StylesPanel.tsx` | Shared padding/margin/width/height/background/border-radius controls |
| `properties/SpacingControl.tsx` | Reusable T/R/B/L spacing input |

### User/Canvas Components (`src/components/user/`)

These are the draggable components users place on the canvas. Every component follows the CraftJS pattern:

```tsx
export const MyComponent = (props) => {
    const { connectors: { connect, drag }, selected } = useNode()
    const { enabled } = useEditor()
    return <div ref={(ref) => connect(drag(ref))}>{/* content */}</div>
}

MyComponent.craft = {
    displayName: "My Component",
    props: { /* defaults */ },
    related: { settings: MyComponentSettings }
}
```

**Components:** Container, Text, Image, Button, Input, Textarea, Label, Switch, Slider, Video, Popup, AnimatedShape, Chart, Table, Emoji

**Section presets:** ModernHero, HeroSection, Footer, PrivateEventPopup (in `sections/`)

**Key hook:** `hooks/useCanvasDrag.ts` - Detects parent layout mode (flex/grid vs canvas) and provides Framer Motion drag props + absolute/relative positioning

### Layout Modes

Containers support three layout modes:
- **flex** - Normal flow with direction, wrap, align, justify, gap
- **grid** - CSS grid with configurable columns
- **canvas** - Free absolute positioning; children use `useCanvasDrag` for drag behavior

### Animation System

All components support `animationType` (fade, slide-up, slide-in, scale), `animationDuration`, and `animationDelay`. `AnimationSection.tsx` provides shared controls. Framer Motion handles the rendering.

### Persistence (`src/utils/storage.ts`)

Hybrid IndexedDB + localStorage with automatic fallback:
- `wedding-templates` - Template metadata array
- `wedding-template-${id}` - Serialized CraftJS JSON per template
- `wedding-current-template-id` - Active template
- `wedding-page-root-${id}` / `wedding-pages-${rootId}` - Multi-page structure

Save: `query.serialize()` → `storage.save()`
Load: `storage.get()` → `actions.deserialize()`

### Data Flow

1. User drags component from Toolbox → CraftJS creates node
2. `RenderNode` wraps each node with selection UI, resize handles, drag handlers
3. Clicking a node → `SettingsPanel` loads its `craft.related.settings` component
4. Settings call `setProp()` → CraftJS updates state → re-render
5. Preview mode disables editor interactions, enables real component behavior (links, inputs, popups)

## Antipatterns to Avoid

- **Don't add components to canvas without the CraftJS craft static** - Every user component needs `Component.craft = { ... }` and must be registered in `EditorProvider.tsx`'s resolver
- **Don't use refs directly in user components** - Always use `connect(drag(ref))` from `useNode()` connectors
- **Don't forget dual behavior** - Components must work in both editor mode (`enabled=true`: show selection, disable interactions) and preview mode (`enabled=false`: real interactions work)
- **Canvas vs relative confusion** - Check `useCanvasDrag` for positioning logic; components in canvas containers must support absolute positioning
