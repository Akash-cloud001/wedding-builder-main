"use no memo";
import { useEditor, useNode } from "@craftjs/core";
import { useAppContext } from "../../editor/AppContext";
import { useEffect } from "react";

type PendingDropPosition = {
    x: number;
    y: number;
    width: number;
    height: number;
    containerId: string;
    ts: number;
};

export const useCanvasDrag = (top: number, left: number) => {
    const {
        parent,
        actions: { setProp },
    } = useNode((node) => ({
        parent: node.data.parent,
    }));

    const { device } = useAppContext();
    const isMobile = device === "mobile";

    const { parentLayoutMode } = useEditor((state) => {
        const parentNode = parent && state.nodes[parent] ? state.nodes[parent] : null;
        return {
            parentLayoutMode: parentNode ? parentNode.data.props.layoutMode : "flex",
        }
    });

    const isFree = parentLayoutMode === "canvas";

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!isFree || isMobile) return;
        if (!parent) return;
        // Only initialize just-created dropped nodes; don't move existing nodes.
        if ((top ?? 0) !== 0 || (left ?? 0) !== 0) return;

        const pending = (window as Window & { __craft_drop_pos?: PendingDropPosition }).__craft_drop_pos;
        if (!pending) return;
        if (pending.containerId !== parent) return;
        // Ignore stale drag-over values.
        if (Date.now() - pending.ts > 1500) return;
        if (pending.width <= 0 || pending.height <= 0) return;

        const nextLeft = Math.max(0, Math.min(100, (pending.x / pending.width) * 100));
        const nextTop = Math.max(0, Math.min(100, (pending.y / pending.height) * 100));

        setProp((props: { left?: number; top?: number; positionType?: string }) => {
            props.left = Math.round(nextLeft * 100) / 100;
            props.top = Math.round(nextTop * 100) / 100;
            // Keep existing free-move semantics in desktop canvas.
            props.positionType = "absolute";
        });

        // Consume once so one drop only positions the newly dropped node.
        delete (window as Window & { __craft_drop_pos?: PendingDropPosition }).__craft_drop_pos;
    }, [isFree, isMobile, left, parent, setProp, top]);

    // On mobile, convert absolute positioning to relative to prevent off-screen elements
    const itemStyle: React.CSSProperties = isFree && !isMobile
        ? {
            position: "absolute",
            // Backward-compat:
            // - New behavior stores `top/left` as percentages (0..100).
            // - Legacy projects may still have px values; if > 100, render as px.
            top: top > 100 ? `${top}px` : `${top}%`,
            left: left > 100 ? `${left}px` : `${left}%`,
        }
        : {
        position: "relative",
        top: isMobile ? 0 : undefined,
        left: isMobile ? 0 : undefined,
    };

    return {
        isCanvas: isFree && !isMobile, // Don't treat as canvas on mobile
        itemStyle
    };
};
