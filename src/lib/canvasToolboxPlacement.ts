import type { EditorState } from "@craftjs/core";
import { ROOT_NODE } from "@craftjs/utils";

/** Matches Container.tsx drag-over payload + optional center-anchor for toolbox clicks. */
export type PendingCanvasDropPosition = {
    x: number;
    y: number;
    width: number;
    height: number;
    containerId: string;
    ts: number;
    /** When set, element is visually centered at (x,y) (see useCanvasDrag). */
    anchor?: "center";
};

/** Craft actions that can introduce a new child under a canvas (drag-drop / programmatic add). */
const DROP_POSITION_ACTIONS = new Set(["addNodeTree", "move", "add"]);

/**
 * Apply `window.__craft_drop_pos` during Editor `normalizeNodes` so `top`/`left` exist before
 * the first React paint (fixes drag-and-drop flash; `useLayoutEffect` alone runs too late).
 */
export function applyPendingDropPositionInNormalize(
    state: EditorState,
    previousState: EditorState,
    actionType: string | number | symbol | undefined,
): void {
    if (typeof window === "undefined") return;
    const t = actionType != null ? String(actionType) : "";
    if (!DROP_POSITION_ACTIONS.has(t)) return;

    const w = window as Window & { __craft_drop_pos?: PendingCanvasDropPosition };
    const pending = w.__craft_drop_pos;
    if (!pending) return;
    if (Date.now() - pending.ts > 2500) {
        delete w.__craft_drop_pos;
        return;
    }

    const containerId = pending.containerId;
    const prevParent = previousState.nodes[containerId];
    const nextParent = state.nodes[containerId];
    if (!nextParent?.data?.nodes || !prevParent?.data) return;

    const oldSet = new Set(prevParent.data.nodes ?? []);
    const addedId = nextParent.data.nodes.find((id) => !oldSet.has(id));
    if (!addedId) return;

    const node = state.nodes[addedId];
    if (!node?.data?.props) return;

    const top = Number(node.data.props.top ?? 0);
    const left = Number(node.data.props.left ?? 0);
    if (top !== 0 || left !== 0) return;

    if (pending.width <= 0 || pending.height <= 0) return;

    const nextLeft = Math.max(0, Math.min(100, (pending.x / pending.width) * 100));
    const nextTop = Math.max(0, Math.min(100, (pending.y / pending.height) * 100));

    const props = node.data.props;
    props.left = Math.round(nextLeft * 100) / 100;
    props.top = Math.round(nextTop * 100) / 100;
    props.positionType = "absolute";

    if (pending.anchor === "center") {
        const name = node.data.name;
        if (name === "UserText") {
            props.alignX = "center";
            props.alignY = "center";
            props.canvasTranslateCenter = false;
        } else {
            props.canvasTranslateCenter = true;
        }
    }

    delete w.__craft_drop_pos;
}

type MinimalNode = {
    data: {
        nodes?: string[];
        props?: { layoutMode?: string };
    };
};

type ToolboxQuery = {
    getNodes: () => Record<string, MinimalNode | undefined>;
    node: (id: string) => { isCanvas: () => boolean; get: () => { dom?: HTMLElement | null } };
};

/** Parsed tree from `query.parseReactElement(...).toNodeTree()` before `actions.addNodeTree`. */
export type CraftNodeTree = {
    rootNodeId: string;
    nodes: Record<
        string,
        {
            data?: {
                name?: string;
                props?: Record<string, unknown>;
            };
        }
    >;
};

/**
 * Sets root node position to canvas center (50%, 50%) before first paint.
 * UserText uses alignX/Y; other nodes use canvasTranslateCenter (see useCanvasDrag).
 */
export function applyCenterPlacementToRootTree(tree: CraftNodeTree): void {
    const root = tree.nodes[tree.rootNodeId];
    if (!root?.data) return;

    const name = root.data.name ?? "";
    const prev = root.data.props ?? {};
    root.data.props = {
        ...prev,
        top: 50,
        left: 50,
        positionType: "absolute",
        ...(name === "UserText"
            ? { alignX: "center", alignY: "center", canvasTranslateCenter: false }
            : { canvasTranslateCenter: true }),
    };
}

/**
 * Prefer the main page canvas (layoutMode === "canvas") so new nodes match drag-and-drop
 * parenting instead of landing as siblings of that wrapper on ROOT.
 */
export function resolveToolboxDropParentId(query: ToolboxQuery): string {
    const nodes = query.getNodes();
    const root = nodes[ROOT_NODE];
    const childIds = root?.data?.nodes ?? [];

    for (const id of childIds) {
        const n = nodes[id];
        if (!n?.data) continue;
        if (n.data.props?.layoutMode === "canvas") return id;
    }
    for (const id of childIds) {
        try {
            if (query.node(id).isCanvas()) return id;
        } catch {
            // ignore invalid ids
        }
    }
    return ROOT_NODE;
}
