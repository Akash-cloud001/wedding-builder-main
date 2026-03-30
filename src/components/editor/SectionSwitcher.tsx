"use client";
"use no memo";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEditor } from "@craftjs/core";
import { useAppContext } from "./AppContext";
import { showToast } from "@/lib/utils";


const SECTIONS = ["Home", "Story", "Schedule", "Gallery", "RSVP", "Travel", "Registry"];

export const SectionSwitcher = () => {
    const { actions, query } = useEditor();
    const { currentSection, setCurrentSection, saveSection, loadSection } = useAppContext();

    const handleSectionChange = (newSection: string) => {
        // 1. Save current section state
        const json = query.serialize();
        saveSection(currentSection, json);

        // 2. Load new section state
        const savedJson = loadSection(newSection);

        if (savedJson) {
            try {
                const data = JSON.parse(savedJson);

                // SECURITY PATCH: Remove 'HeroSection' nodes if they exist
                Object.keys(data).forEach(key => {
                    const node = data[key];
                    if (node.type && node.type.resolvedName === "HeroSection") {
                        // 1. Remove this node
                        delete data[key];
                        // 2. Remove reference from parent
                        if (node.parent) {
                            const parent = data[node.parent];
                            if (parent && parent.nodes) {
                                parent.nodes = parent.nodes.filter((id: string) => id !== key);
                            }
                        }
                    }
                });

                actions.deserialize(JSON.stringify(data));
            } catch (e) {
                console.error("Load failed", e);
            }
        } else {
            // Load a default empty state for new sections
            const defaultState = {
                "ROOT": {
                    "type": { "resolvedName": "UserContainer" },
                    "isCanvas": true,
                    "props": {
                        "width": "100%",
                        "minHeight": "auto",
                        "padding": 20,
                        "background": "#ffffff",
                        "flexDirection": "column"
                    },
                    "displayName": "Container",
                    "custom": { "displayName": "App" },
                    "hidden": false,
                    "nodes": [],
                    "linkedNodes": {}
                }
            };
            actions.deserialize(JSON.stringify(defaultState));
        }

        setCurrentSection(newSection);
        showToast(`Switched to ${newSection}`, "#3b82f6");
    };

    return (
        <div className="flex items-center gap-2 mr-4">
            <span className="text-sm font-medium text-gray-500">Section:</span>
            <Select value={currentSection} onValueChange={handleSectionChange}>
                <SelectTrigger className="w-[140px] h-8">
                    <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                    {SECTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};
