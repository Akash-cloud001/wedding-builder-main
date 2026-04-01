# Project Context

This document provides a comprehensive overview of the `wedding-builder-main` project structure, architecture, and core functionality. It is intended to help developers understand the codebase quickly for future reference.

## 1. Project Overview

The project is a visual drag-and-drop website builder designed for creating event landing pages (like weddings). It serves as a standalone studio editor (part of the broader Nin9 event management platform) and allows users to construct fully responsive single-page websites with sections, animations, and custom styling.

## 2. Tech Stack

- **Framework**: Next.js 16 (App Router with React Compiler enabled)
- **Library**: React 19 (Strict Mode + TypeScript)
- **Visual Builder Engine**: `@craftjs/core` (Handles node tree, serialization, drag-and-drop logic)
- **Styling**: Tailwind CSS v4 + PostCSS
- **Animations / Interactions**: Framer Motion
- **Typography**: Next.js Font Optimization with 7+ curated wedding Google Fonts (Great Vibes, Dancing Script, Playfair Display, etc.).
- **UI Primitives**: Radix UI + shadcn/ui components (located in `src/components/ui/`)
- **Other Key Libraries**: 
  - `recharts` for charts.
  - `react-contenteditable` for text editing directly on the canvas.
  - `react-resizable-panels` for drag-resizable editor sidebars.

## 3. Directory Structure

The source code primarily lives under the `src/` directory.

### `src/app/`
- Contains `layout.tsx`, `page.tsx`, and `globals.css`. 
- **`page.tsx`**: The single page where the entire editor application mounts. 
- **`api/upload/route.ts`**: Handles Cloudinary media uploads and deletions with strictly typed async handlers.

### `src/components/`
Divided into core logical boundaries:

#### `src/components/editor/`
Holds the foundational structure and layout elements of the visual builder editor.
- **`EditorProvider.tsx`**: Wraps craft.js `<Editor>` and maps all draggable user components (resolvers) so they can be parsed from saved state.
- **`AppContext.tsx`**: Manages editor context states (responsive mode toggling, preview mode, etc.). Includes state for switched right panels (Properties, Templates, Decoratives).
- **`Viewport.tsx`**: The main three-panel layout shell.
- **`Toolbox.tsx`**: The left sidebar containing component palettes. Includes triggers for the right-panel asset libraries.
- **`SettingsPanel.tsx`**: The right sidebar that loads setting properties corresponding to the currently selected node or switches to asset libraries like `DecorativeLibrary`.
- **`DecorativeLibrary.tsx`**: A searchable/tabbed asset browser for SVG lines and shapes, supporting both drag-and-drop and one-click addition.
- **`RenderNode.tsx`**: Custom UI wrapper for every component dropped onto the canvas. It injects resize handles, selection outlines, and movement toolbars.
- **`Topbar.tsx`**: The top navigation for utility actions.
- **`Layers.tsx`**: A tree-view of the actual node hierarchy currently on the canvas.

#### `src/components/user/`
Contains every draggable element that users can place on the canvas. These components strictly adhere to CraftJS's `useNode()` hook architecture.
- **Base Elements**: `Container.tsx`, `Text.tsx`, `Image.tsx`, `Button.tsx`, `Input.tsx`, `Video.tsx`, etc.
- **`Decorative.tsx`**: Specialized component for SVG assets with support for dynamic resizing, rotation, and opacity.
- **`hooks/useCanvasDrag.ts`**: Vital custom hook determining if an element is inside an absolute-positioned canvas versus flex/grid contexts. Applies Framer Motion props for drag movement.

#### `src/components/user/sections/`
Pre-built composition templates (like `ModernHero.tsx`, `Footer.tsx`) that users can drop as entire block sections.

#### `src/components/ui/`
Standard reusable Radix/shadcn UI basic building blocks.

### `src/utils/`
- **`storage.ts`**: Handles state persistence for templates using IndexedDB / localStorage.

## 4. Architecture & Data Flow

### The Builder Hierarchy
```
AppProvider (Manages Device Types, Preview State)
  ↳ EditorProvider (Initializes Craft.js framework + Registers Components)
      ↳ Viewport (The UI Layout)
          ├─ Toolbox (Left: Draggable primitive components)
          ├─ Canvas (Center: Where rendering and designing happens)
          └─ SettingsPanel (Right: Configuration panel or Asset Libraries)
```

### Key Systems & Logic

#### Intelligent Canvas Alignment
- **Problem**: Traditional flex alignment often breaks in absolute-position "Canvas" containers.
- **Solution**: Components like `UserText` detect their parent container mode. In "Canvas" mode, alignment triggers update the component's `top`/`left` properties to percentage values (`50%`, `100%`) rather than flex-alignment props. 
- **Visual Accuracy**: Uses CSS `translateX`/`translateY` transforms to ensure elements are centered on their own mid-points, preventing layout squish and ensuring precise positioning.

#### Decoratives System
- **Library Flow**: Users click the 'Decoratives' trigger in the Toolbox, which switches the `SettingsPanel` to library mode via `AppContext`.
- **Composition**: Library uses `connectors.create` for dragging and `actions.add` for instant one-click placement into the `ROOT` node.
- **Assets**: Powered by local SVG files in `public/shapes/`, managed via the `UserDecorative` component.

### Drag & Drop Lifecycle
1. **Toolbox to Canvas**: User drags an element from `Toolbox.tsx` or chooses an asset from `DecorativeLibrary.tsx`.
2. **Node Creation**: Craft.js intercepts this and creates a node referencing the matching React component.
3. **Rendering (`RenderNode.tsx`)**: Whenever a component is rendered, `RenderNode.tsx` wraps it, instantly injecting editing tools.
4. **Configuration**: When the user clicks the element, Craft.js marks it as `selected`. The `SettingsPanel.tsx` dynamically mounts the specific settings component.
5. **State Updating**: Setting panels trigger `setProp()` mutations, Craft.js updates the node tree, and the canvas rerenders seamlessly.

## 5. Development Principles & Commands

### Workflow
- Start Server: `npm run dev`
- Build for Production: `npm run build` (Requires strict typing on API routes and resolvers)
- Lint Codebase: `npm run lint`

### Critical Rules & Constraints
- **Explicit Types for API Routes:** Next.js 16 requires explicit `Promise<Response>` return types for `POST`/`DELETE` handlers to avoid build failures.
- **Node Resolver Registration:** Any new `UserComponent` must be imported and added to the `craftResolver` in `EditorProvider.tsx`.
- **Canvas-Aware Positioning:** When adding new components, use the `useCanvasDrag` hook and verify behavior in both "Flex" and "Canvas" layout modes.
- **Typography Constraints:** New fonts should be initialized in `layout.tsx` using `next/font/google` and exposed via global CSS variables for use in `UserText`.
to React Nodes.
