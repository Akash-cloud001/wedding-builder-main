"use client";
"use no memo";

import { useEditor } from "@craftjs/core";
import React from "react";
import { ChevronRight, ChevronDown, ChevronUp, Box, Type, Image as ImageIcon, Video, Layers as LayersIcon } from "lucide-react";

const ROOT_NODE = "ROOT";

export const Layers = () => {
    const { nodes, actions, selected } = useEditor((state) => ({
        nodes: state.nodes,
        selected: state.events.selected,
    }));

    const handleSelect = (id: string) => {
        actions.selectNode(id);
        (actions as any).setNodeEvent?.("hovered", null);
    };

    const getIcon = (displayName: string) => {
        switch (displayName) {
            case "Text":
            case "Heading":
            case "Paragraph":
                return <Type className="h-4 w-4" />;
            case "Image": return <ImageIcon className="h-4 w-4" />;
            case "Video": return <Video className="h-4 w-4" />;
                case "Canvas":
            case "Container":
            case "Row":
            case "Grid 2":
            case "Grid 4":
            case "Grid 6":
            case "2 Cols":
                return <Box className="h-4 w-4" />;
            default: return <LayersIcon className="h-4 w-4" />;
        }
    };

    const moveLayer = (nodeId: string, direction: "up" | "down") => {
        const node = nodes[nodeId];
        if (!node) return;
        const parentId = node.data.parent as string | undefined;
        if (parentId == null) return;
        const parent = nodes[parentId];
        if (!parent?.data?.nodes || !Array.isArray(parent.data.nodes)) return;
        const siblings = parent.data.nodes as string[];
        const currentIndex = siblings.indexOf(nodeId);
        if (currentIndex < 0) return;
        // Craft.js move() replaces the node with a placeholder then splices at the given index.
        // Move up: target index currentIndex-1 gives correct order.
        // Move down: we must pass currentIndex+2 so the node is inserted after the next sibling.
        const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 2;
        if (newIndex < 0 || newIndex > siblings.length) return;
        actions.move(nodeId, parentId, newIndex);
    };

    const LayerItem = ({ id, depth = 0 }: { id: string; depth?: number }) => {
        const [expanded, setExpanded] = React.useState(true);

        const node = nodes[id];
        if (!node) return null;

        const isSelected = selected.has(id);
        const hasChildren = node.data.nodes && node.data.nodes.length > 0;
        const parentId = node.data.parent as string | undefined;
        const parent = parentId ? nodes[parentId] : null;
        const siblings = parent?.data?.nodes as string[] | undefined;
        const currentIndex = siblings ? siblings.indexOf(id) : -1;
        const canMoveUp = parentId != null && Array.isArray(siblings) && currentIndex > 0;
        const canMoveDown = parentId != null && Array.isArray(siblings) && currentIndex >= 0 && currentIndex < siblings.length - 1;
        const showOrderControls = id !== ROOT_NODE && (canMoveUp || canMoveDown);

        return (
            <div className="select-none">
                <div
                    className={`
            flex items-center gap-1 py-2 px-2 cursor-pointer text-sm
            ${isSelected ? "bg-blue-100 text-blue-700 font-medium" : "hover:bg-gray-100"}
          `}
                    style={{ paddingLeft: `${depth * 12 + 12}px` }}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(id);
                    }}
                >
                    {hasChildren ? (
                        <div
                            className="p-0.5 rounded-sm hover:bg-gray-200 cursor-pointer shrink-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpanded(!expanded);
                            }}
                        >
                            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </div>
                    ) : (
                        <div className="w-4 shrink-0" />
                    )}

                    <span className="text-gray-500 shrink-0">
                        {getIcon(node.data.custom?.displayName || node.data.displayName)}
                    </span>

                    <span className="min-w-0 truncate flex-1">
                        {node.data.custom?.displayName || node.data.displayName}
                    </span>

                    {showOrderControls && (
                        <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                                type="button"
                                className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:pointer-events-none"
                                disabled={!canMoveUp}
                                onClick={() => moveLayer(id, "up")}
                                title="Move up"
                            >
                                <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:pointer-events-none"
                                disabled={!canMoveDown}
                                onClick={() => moveLayer(id, "down")}
                                title="Move down"
                            >
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                {hasChildren && expanded && (
                    <div>
                        {node.data.nodes.map((childId: string) => (
                            <LayerItem key={childId} id={childId} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full">
            <LayerItem id={ROOT_NODE} />
        </div>
    );
};
