"use client";
"use no memo";

import React from "react";
import { useEditor } from "@craftjs/core";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useAppContext } from "./AppContext";
import { TemplateList } from "./TemplateList";
import { DecorativeLibrary } from "./DecorativeLibrary";

export const SettingsPanel = () => {
    const { activeRightPanel, setActiveRightPanel } = useAppContext();
    const { selected, actions } = useEditor((state, query) => {
        const [currentNodeId] = state.events.selected;
        let selected;

        if (currentNodeId && state.nodes[currentNodeId]) {
            const node = state.nodes[currentNodeId];
            selected = {
                id: currentNodeId,
                name: node.data.custom?.displayName || node.data.displayName || node.data.name,
                settings: node.related && node.related.settings,
                isDeletable: query.node(currentNodeId).isDeletable(),
                props: node.data.props, // Need props to check for src
                resolvedName: (node.data.type as any).resolvedName || node.data.name
            };
        }

        return {
            selected,
        };
    });

    React.useEffect(() => {
        if (selected?.id && activeRightPanel !== "properties" && activeRightPanel !== "decoratives" && activeRightPanel !== "templates") {
            setActiveRightPanel("properties");
        }
    }, [selected?.id, activeRightPanel, setActiveRightPanel]);

    if (activeRightPanel === "templates") {
        return (
            <div className="h-full flex flex-col bg-white">
                <TemplateList />
            </div>
        );
    }

    if (activeRightPanel === "decoratives") {
        return (
            <div className="h-full flex flex-col bg-white">
                <DecorativeLibrary />
            </div>
        );
    }

    return (
        <Card className="rounded-none border-l h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between shadow-xs z-10 pb-6">
                <CardTitle>Properties</CardTitle>
                {selected && (
                    <Badge variant="secondary">{selected.name}</Badge>
                )}
            </CardHeader>
            <div className="flex-1 overflow-y-auto">
                <CardContent className="p-4">
                    {selected ? (
                        <div className="space-y-4">
                            {selected.settings && React.createElement(selected.settings)}

                            <div className="pt-4 border-t mt-4">
                                {selected.isDeletable ? (
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            // Handle Cloudinary cleanup if removing an Image element
                                            if (selected.resolvedName === "UserImage" && selected.props?.src) {
                                                const src = selected.props.src;
                                                if (typeof src === "string" && src.includes("res.cloudinary.com")) {
                                                    fetch('/api/upload', {
                                                        method: "DELETE",
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ url: src })
                                                    }).catch(err => console.error("Failed to delete removed image:", err));
                                                }
                                            }
                                            actions.delete(selected.id);
                                        }}
                                        className="w-full"
                                    >
                                        Delete Component
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                            <p className="text-sm">Click a component to customize.</p>
                        </div>
                    )}
                </CardContent>
            </div>
        </Card>
    );
};
