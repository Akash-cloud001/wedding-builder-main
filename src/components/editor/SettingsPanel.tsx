"use client";
"use no memo";

import React from "react";
import { useEditor } from "@craftjs/core";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";


export const SettingsPanel = () => {
    const { selected, actions } = useEditor((state, query) => {
        const [currentNodeId] = state.events.selected;
        let selected;

        if (currentNodeId && state.nodes[currentNodeId]) {
            selected = {
                id: currentNodeId,
                name: state.nodes[currentNodeId].data.custom?.displayName || state.nodes[currentNodeId].data.displayName || state.nodes[currentNodeId].data.name,
                settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.settings,
                isDeletable: query.node(currentNodeId).isDeletable(),
            };
        }

        return {
            selected,
        };
    });

    return (
        <Card className="rounded-none border-l h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between shadow-xs z-10">
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
