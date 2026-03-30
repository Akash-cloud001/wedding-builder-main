"use client";
import React, { useEffect, useState } from "react";
import { useEditor } from "@craftjs/core";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { showToast } from "@/lib/utils";

// Mock data (we will fetch this later from an API)
import templatesData from "@/data/templates.json";

export const TemplateList = () => {
    const { actions, query } = useEditor();
    const [templates, setTemplates] = useState<any[]>(templatesData);
    const [confirmTemplate, setConfirmTemplate] = useState<any | null>(null);

    const handleAppendTemplate = (template: any) => {
        try {
            const currentState = JSON.parse(query.serialize());
            const templateData = template.data;
            const idMap = new Map<string, string>();

            // Generate new IDs for all template nodes to prevent collisions
            Object.keys(templateData).forEach((key) => {
                // Generate ID for ROOT as well so it transforms into a standard container
                idMap.set(key, `node-${crypto.randomUUID()}`);
            });

            const newNodesToAdd: Record<string, any> = {};

            Object.keys(templateData).forEach((key) => {
                const nodeCopy = JSON.parse(JSON.stringify(templateData[key]));
                
                // Update parent
                if (key === "ROOT") {
                    // The template's ROOT will now be a normal child of the Editor's ROOT
                    nodeCopy.parent = "ROOT";
                } else if (nodeCopy.parent) {
                    nodeCopy.parent = idMap.get(nodeCopy.parent) || nodeCopy.parent;
                }

                // Update children nodes
                if (nodeCopy.nodes && Array.isArray(nodeCopy.nodes)) {
                    nodeCopy.nodes = nodeCopy.nodes.map((n: string) => idMap.get(n) || n);
                }

                // Update linkedNodes
                if (nodeCopy.linkedNodes) {
                    const newLinkedNodes: Record<string, string> = {};
                    Object.entries(nodeCopy.linkedNodes).forEach(([lk, lv]) => {
                        newLinkedNodes[lk] = idMap.get(lv as string) || (lv as string);
                    });
                    nodeCopy.linkedNodes = newLinkedNodes;
                }

                const newId = idMap.get(key);
                if (newId) {
                    newNodesToAdd[newId] = nodeCopy;
                }
            });

            if (!currentState["ROOT"]) {
                console.error("No ROOT node found in current state.");
                showToast("Failed to append template.", "#ef4444");
                return;
            }

            // Push mapped new wrapper container into the current editor ROOT
            const templateRootId = idMap.get("ROOT");
            if (templateRootId) {
                currentState["ROOT"].nodes.push(templateRootId);
            }
            
            // Merge dictionaries
            Object.assign(currentState, newNodesToAdd);

            // Trigger Craft.js to digest the new tree
            actions.deserialize(JSON.stringify(currentState));
            showToast(`Template "${template.name}" added!`);
            setConfirmTemplate(null);
            
            // Scroll to the bottom of the canvas or select the newly added section
            // A simple timeout to allow render
            setTimeout(() => {
                const workspace = document.querySelector(".editor-canvas-root"); 
                if (workspace) {
                    workspace.scrollTo({ top: workspace.scrollHeight, behavior: "smooth" });
                }
            }, 100);

        } catch (e) {
            console.error("Error appending template:", e);
            showToast("Error loading template", "#ef4444");
        }
    };

    return (
        <div className="flex flex-col h-full relative">
            <div className="p-4 border-b flex items-center justify-between shadow-xs sticky top-0 bg-white z-10">
                <div>
                    <h3 className="font-semibold">Templates</h3>
                    <p className="text-xs text-gray-500">Append prebuilt sections</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {templates.map((tpl) => (
                    <div 
                        key={tpl.id} 
                        className="group border rounded-lg overflow-hidden cursor-pointer hover:border-pink-500 hover:shadow-md transition-all flex flex-col bg-white"
                        onClick={() => setConfirmTemplate(tpl)}
                    >
                        <div className="h-32 w-full bg-gray-100 overflow-hidden relative">
                            {tpl.thumbnail ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={tpl.thumbnail} alt={tpl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                            )}
                        </div>
                        <div className="p-3">
                            <h4 className="font-medium text-sm text-gray-900 leading-tight">{tpl.name}</h4>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{tpl.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={!!confirmTemplate} onOpenChange={(open) => !open && setConfirmTemplate(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Append Template</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to add &quot;{confirmTemplate?.name}&quot; to your current page? This will append the sections to the bottom of your canvas.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmTemplate(null)}>Cancel</Button>
                        <Button onClick={() => handleAppendTemplate(confirmTemplate)}>Append Template</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
