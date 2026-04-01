"use client";
"use no memo";

import React from "react";
import { useEditor } from "@craftjs/core";
import { ROOT_NODE } from "@craftjs/utils";
import {
    applyCenterPlacementToRootTree,
    resolveToolboxDropParentId,
} from "@/lib/canvasToolboxPlacement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { UserDecorative } from "../user/Decorative";
import { Label } from "../ui/label";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useAppContext } from "./AppContext";

const DECORATIVE_LINES = [
    "Frame 231.svg", "Frame 232.svg", "Frame 233.svg", "Frame 234.svg", "Frame 235.svg",
    "Frame 236.svg", "Frame 237.svg", "Frame 238.svg", "Frame 239.svg", "Frame 240.svg",
    "Frame 241.svg", "Frame 242.svg", "Frame 243.svg", "Frame 253.svg", "Frame 254.svg",
    "Frame 255.svg", "Frame 256.svg"
];

const DECORATIVE_SHAPES = [
    "3601658_67176 2.svg", "3601658_67176 3.svg", "3601658_67176 4.svg", "3601658_67176 5.svg",
    "9241069_4128132 10.svg", "9241069_4128132 11.svg", "9241069_4128132 12.svg", "9241069_4128132 13.svg",
    "9241069_4128132 14.svg", "9241069_4128132 15.svg", "9241069_4128132 16.svg", "9241069_4128132 17.svg",
    "9241069_4128132 2.svg", "9241069_4128132 3.svg", "9241069_4128132 4.svg", "9241069_4128132 5.svg",
    "9241069_4128132 6.svg", "9241069_4128132 7.svg", "9241069_4128132 8.svg", "9241069_4128132 9.svg",
    "Frame 244.svg", "Frame 245.svg", "Frame 246.svg", "Frame 247.svg", "Frame 248.svg",
    "Frame 249.svg", "Frame 250.svg", "Frame 251.svg", "Frame 252.svg", "Frame 253.svg", "Frame 254.svg"
];

const DECORATIVE_STICKERS = [
    "Frame 257.png", "Frame 258.png", "Frame 259.png", "Frame 260.png",
    "Frame 261.png", "Frame 262.png", "Frame 263.png", "Frame 264.png",
    "Frame 265.png", "Frame 266.png", "Frame 267.png", "Frame 268.png",
    "Frame 269.png", "Frame 270.png", "Frame 271.png", "Frame 272.png",
    "Frame 273.png", "Frame 274.png", "Frame 275.png", "Frame 276.png"
];



export const DecorativeLibrary = () => {
    const { connectors, actions, query } = useEditor();
    const { setActiveRightPanel } = useAppContext();

    const handleAddItem = (path: string) => {
        try {
            delete (window as Window & { __craft_drop_pos?: unknown }).__craft_drop_pos;
            const parentId = resolveToolboxDropParentId(query);
            const nodes = query.getNodes();
            const targetParent =
                nodes[parentId]?.data ? parentId : ROOT_NODE;

            const tree = query
                .parseReactElement(
                    <UserDecorative src={path} width={200} height="auto" />
                )
                .toNodeTree();
            applyCenterPlacementToRootTree(tree);
            actions.addNodeTree(tree, targetParent);
        } catch (error) {
            console.error("Failed to add decorative item:", error);
        }
    };

    const renderItems = (items: string[], category: string) => (
        <div className="grid grid-cols-2 gap-4 p-4">
            {items.map((item) => {
                const path = `/shapes/${category}/${item}`;
                return (
                    <div
                        key={item}
                        className="group relative aspect-square rounded-lg border bg-muted/50 p-2 hover:border-primary hover:bg-muted transition-all cursor-pointer"
                        ref={(ref: any) => connectors.create(ref, <UserDecorative src={path} width={200} height="auto" />)}
                        onClick={() => handleAddItem(path)}
                    >
                        <img
                            src={path}
                            alt={item}
                            className="h-full w-full object-contain pointer-events-none"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/5 rounded-lg transition-opacity">
                            <span className="text-[10px] bg-white px-2 py-1 rounded shadow-sm font-medium">Click or Drag</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            <div className="px-4 py-4 border-b flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setActiveRightPanel("properties")}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h3 className="font-semibold text-lg">Decoratives</h3>
                    <p className="text-xs text-muted-foreground">Drag SVGs onto the canvas</p>
                </div>
            </div>

            <Tabs defaultValue="lines" className="flex-1 flex flex-col min-h-0">
                <div className="px-4 pt-2">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="lines">Lines</TabsTrigger>
                        <TabsTrigger value="shapes">Shapes</TabsTrigger>
                        <TabsTrigger value="stickers">Stickers</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="lines" className="flex-1 overflow-y-auto min-h-0">
                    {renderItems(DECORATIVE_LINES, "decorative-lines")}
                </TabsContent>
                <TabsContent value="shapes" className="flex-1 overflow-y-auto min-h-0">
                    {renderItems(DECORATIVE_SHAPES, "decorative-shape")}
                </TabsContent>
                <TabsContent value="stickers" className="flex-1 overflow-y-auto min-h-0">
                    {renderItems(DECORATIVE_STICKERS, "decorative-stickers")}
                </TabsContent>
            </Tabs>
        </div>
    );
};
