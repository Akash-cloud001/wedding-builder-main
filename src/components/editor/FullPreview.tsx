"use client";
"use no memo";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "../ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Button } from "../ui/button";
import { Eye, X, Monitor, Smartphone } from "lucide-react";
import { Editor, Frame, Element, useEditor } from "@craftjs/core";
import { useAppContext } from "./AppContext";
import { craftResolver } from "./EditorProvider";
import { cn } from "@/lib/utils";

const SECTIONS = ["Home", "Story", "Schedule", "Gallery", "RSVP", "Travel", "Registry"];

const SectionPreview = ({ json }: { json: string | null }) => {
    if (!json) return null;

    return (
        <div className="mb-8 border-b pb-8 last:border-0">
            {/* We strictly use a READ-ONLY editor here */}
            <Editor
                enabled={false}
                resolver={craftResolver}
            >
                <SectionContent json={json} />
            </Editor>
        </div>
    );
};

// Helper to load the JSON into the Frame
const SectionContent = ({ json }: { json: string }) => {
    const { actions } = useEditor();

    useEffect(() => {
        if (json) {
            try {
                const data = JSON.parse(json);
                // Attempt to find the ROOT node and override its minHeight to 'auto' or unset it
                // so it doesn't force a large gap.
                if (data.ROOT && data.ROOT.props) {
                    data.ROOT.props.minHeight = "auto";
                    data.ROOT.props.height = "auto";
                }

                // SECURITY PATCH: Remove 'HeroSection' nodes if they exist to prevent crashes
                // since we removed that component.
                const nodes = data;
                const nodesToDelete = new Set<string>();

                const collectDescendants = (nodeId: string) => {
                    const node = nodes[nodeId];
                    if (node && node.nodes && Array.isArray(node.nodes)) {
                        node.nodes.forEach((childId: string) => {
                            nodesToDelete.add(childId);
                            collectDescendants(childId);
                        });
                    }
                    if (node && node.linkedNodes && typeof node.linkedNodes === 'object') {
                        Object.values(node.linkedNodes).forEach((linkedNodeId: any) => {
                            if (typeof linkedNodeId === 'string') {
                                nodesToDelete.add(linkedNodeId);
                                collectDescendants(linkedNodeId);
                            }
                        });
                    }
                };

                Object.keys(nodes).forEach(key => {
                    const node = nodes[key];
                    if (node && node.type && node.type.resolvedName === "HeroSection") {
                        nodesToDelete.add(key);
                        collectDescendants(key);

                        // Remove reference from parent
                        if (node.parent) {
                            const parent = nodes[node.parent];
                            if (parent && parent.nodes) {
                                parent.nodes = parent.nodes.filter((id: string) => id !== key);
                            }
                        }
                    }
                });

                nodesToDelete.forEach(key => {
                    delete nodes[key];
                });

                const patchedJson = JSON.stringify(data);
                actions.deserialize(patchedJson);
            } catch (e) {
                console.error("Failed to load section preview", e);
            }
        }
    }, [json, actions]);

    return <Frame />;
};

export const FullPreview = () => {
    const { sections, currentSection, saveSection } = useAppContext();
    const { query } = useEditor(); // get current editor state
    const [isOpen, setIsOpen] = useState(false);
    const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

    const isMobile = previewDevice === "mobile";
    const MOBILE_WIDTH = 375;
    const DESKTOP_MAX_WIDTH = 1024;

    // When opening, we should ensure the *current* section is saved to the 'sections' map
    // so it appears up-to-date in the preview.
    const handleOpenChange = (open: boolean) => {
        if (open) {
            const json = query.serialize();
            saveSection(currentSection, json);
        }
        setIsOpen(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {/* <Button variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" />
                    Full Preview
                </Button> */}
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] w-full h-[95vh] sm:max-w-[95vw] overflow-hidden flex flex-col p-0">
                <div className="p-4 border-b flex items-center justify-between bg-white shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <DialogTitle className="text-xl font-bold bg-linear-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                            Full Website Preview
                        </DialogTitle>
                        <div className="h-6 w-px bg-gray-200" />
                        <ToggleGroup type="single" value={previewDevice} onValueChange={(val) => val && setPreviewDevice(val as "desktop" | "mobile")}>
                            <ToggleGroupItem value="desktop" aria-label="Desktop view">
                                <Monitor className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="mobile" aria-label="Mobile view">
                                <Smartphone className="h-4 w-4" />
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto bg-gray-100 p-8 flex justify-center">
                    <div
                        className={cn(
                            "transition-all duration-300 bg-white shadow-2xl origin-top",
                            isMobile ? "w-full" : "w-full max-w-5xl"
                        )}
                        style={isMobile ? {
                            maxWidth: `${MOBILE_WIDTH}px`,
                            width: `${MOBILE_WIDTH}px`,
                        } : {
                            maxWidth: `${DESKTOP_MAX_WIDTH}px`,
                        }}
                        data-device={previewDevice}
                    >
                        {SECTIONS
                            .filter(section => {
                                const json = sections[section];
                                if (!json) return false;
                                try {
                                    const data = JSON.parse(json);
                                    // Check if ROOT has any nodes (children)
                                    // In Craft.js serialized state, "nodes" array in ROOT contains IDs of children.
                                    // If it's empty, the section is empty.
                                    return data.ROOT && data.ROOT.nodes && data.ROOT.nodes.length > 0;
                                } catch (e) {
                                    return false;
                                }
                            })
                            .map((section) => (
                                <SectionPreview key={section} json={sections[section]} />
                            ))
                        }
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
