"use no memo";
import { useEditor, useNode } from "@craftjs/core";
import { useAppContext } from "../../editor/AppContext";
import { useLayoutEffect } from "react";
import type { CSSProperties } from "react";
import type { PendingCanvasDropPosition } from "@/lib/canvasToolboxPlacement";

export const useCanvasDrag = (top: number, left: number) => {
    const {
        parent,
        actions: { setProp },
        resolvedName,
        canvasTranslateCenter,
    } = useNode((node) => {
        const t = node.data.type as { resolvedName?: string } | string;
        const resolvedName =
            typeof t === "object" && t && "resolvedName" in t
                ? t.resolvedName ?? ""
                : typeof t === "string"
                  ? t
                  : "";
        return {
            parent: node.data.parent,
            resolvedName,
            canvasTranslateCenter: node.data.props.canvasTranslateCenter === true,
        };
    });

    const { device } = useAppContext();
    const isMobile = device === "mobile";

    const { parentLayoutMode } = useEditor((state) => {
        const parentNode = parent && state.nodes[parent] ? state.nodes[parent] : null;
        return {
            parentLayoutMode: parentNode ? parentNode.data.props.layoutMode : "flex",
        }
    });

    const isFree = parentLayoutMode === "canvas";

    // useLayoutEffect: apply drop position before paint to avoid a flash at top/left 0.
    useLayoutEffect(() => {
        if (typeof window === "undefined") return;
        if (!isFree || isMobile) return;
        if (!parent) return;
        // Only initialize just-created dropped nodes; don't move existing nodes.
        if ((top ?? 0) !== 0 || (left ?? 0) !== 0) return;

        const pending = (window as Window & { __craft_drop_pos?: PendingCanvasDropPosition }).__craft_drop_pos;
        if (!pending) return;
        if (pending.containerId !== parent) return;
        // Ignore stale drag-over values.
        if (Date.now() - pending.ts > 1500) return;
        if (pending.width <= 0 || pending.height <= 0) return;

        const nextLeft = Math.max(0, Math.min(100, (pending.x / pending.width) * 100));
        const nextTop = Math.max(0, Math.min(100, (pending.y / pending.height) * 100));

        setProp((props: Record<string, unknown>) => {
            props.left = Math.round(nextLeft * 100) / 100;
            props.top = Math.round(nextTop * 100) / 100;
            props.positionType = "absolute";

            if (pending.anchor === "center") {
                if (resolvedName === "UserText") {
                    props.alignX = "center";
                    props.alignY = "center";
                    props.canvasTranslateCenter = false;
                } else {
                    props.canvasTranslateCenter = true;
                }
            }
        });

        delete (window as Window & { __craft_drop_pos?: PendingCanvasDropPosition }).__craft_drop_pos;
    }, [isFree, isMobile, left, parent, resolvedName, setProp, top]);

    const centerTransform =
        isFree && !isMobile && canvasTranslateCenter ? "translate(-50%, -50%)" : undefined;

    const itemStyle: CSSProperties = isFree && !isMobile
        ? {
            position: "absolute",
            top: top > 100 ? `${top}px` : `${top}%`,
            left: left > 100 ? `${left}px` : `${left}%`,
            ...(centerTransform ? { transform: centerTransform } : {}),
        }
        : {
        position: "relative",
        top: isMobile ? 0 : undefined,
        left: isMobile ? 0 : undefined,
    };

    return {
        isCanvas: isFree && !isMobile,
        itemStyle
    };
};
