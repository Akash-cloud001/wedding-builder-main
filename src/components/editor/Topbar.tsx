"use client";
"use no memo";

import { useEditor } from "@craftjs/core";
import { ROOT_NODE } from "@craftjs/utils";
import { Button } from "../ui/button";
import { Monitor, Play, Redo, Save, Smartphone, Undo, FilePlus, FolderOpen, Trash2 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Toggle } from "../ui/toggle";
import { useAppContext } from "./AppContext";
import { FullPreview } from "./FullPreview";
import { useEffect, useRef, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn, showToast } from "@/lib/utils";

interface Template {
    id: string;
    name: string;
    lastSaved: number;
}

import { storage } from "@/utils/storage";

export const Topbar = () => {
    const { actions, query, canUndo, canRedo } = useEditor((state, query) => ({
        canUndo: query.history.canUndo(),
        canRedo: query.history.canRedo(),
    }));

    const { device, setDevice, preview, setPreview } = useAppContext();
    const { actions: { setOptions } } = useEditor();

    const [templates, setTemplates] = useState<Template[]>([]);
    const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
    const [currentRootId, setCurrentRootId] = useState<string | null>(null);
    const [pageIds, setPageIds] = useState<string[]>([]);
    const [addPageDialogOpen, setAddPageDialogOpen] = useState(false);
    const [newPageName, setNewPageName] = useState("");
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [loadDialogOpen, setLoadDialogOpen] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState("");

    const EMPTY_PAGE_STATE = "{\"ROOT\":{\"type\":{\"resolvedName\":\"UserContainer\"},\"isCanvas\":true,\"props\":{\"background\":\"#ffffff\",\"padding\":10,\"minHeight\":\"800px\",\"width\":\"100%\",\"flexDirection\":\"column\",\"alignItems\":\"flex-start\"},\"displayName\":\"UserContainer\",\"custom\":{},\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}}}";

    // Refs to hold latest callback values for event listeners (avoids stale closures)
    const handleAddSectionRef = useRef<() => void>(() => {});
    const loadTemplateRef = useRef<(id: string) => Promise<void>>(async () => {});
    const actionsRef = useRef(actions);

    const broadcastPagesState = (pages: string[], currentId: string | null, sourceTemplates?: Template[]) => {
        const templateSource = sourceTemplates || templates;
        const meta = pages.map((id) => {
            const t = templateSource.find(t => t.id === id);
            return { id, name: t?.name || "Untitled" };
        });
        window.dispatchEvent(new CustomEvent("nin9-pages-state", {
            detail: {
                pages: meta,
                currentTemplateId: currentId,
            }
        }));
    };

    const loadTemplate = async (id: string) => {
        const json = await storage.get(`wedding-template-${id}`);
        if (json) {
            try {
                actions.deserialize(json);
                setCurrentTemplateId(id);
                await storage.save("wedding-current-template-id", id);
                setLoadDialogOpen(false);
                const template = templates.find(t => t.id === id);
                showToast(`Loaded "${template?.name || 'Template'}"`);

                let rootId = await storage.get(`wedding-page-root-${id}`);
                if (!rootId) {
                    rootId = id;
                    await storage.save(`wedding-page-root-${id}`, rootId);
                }

                const pagesStr = await storage.get(`wedding-pages-${rootId}`);
                let pages: string[];
                if (pagesStr) {
                    try {
                        pages = JSON.parse(pagesStr);
                    } catch {
                        pages = [rootId];
                    }
                } else {
                    pages = [rootId];
                    await storage.save(`wedding-pages-${rootId}`, JSON.stringify(pages));
                }

                setCurrentRootId(rootId);
                setPageIds(pages);
                broadcastPagesState(pages, id);
            } catch (e) {
                console.error(e);
                showToast("Failed to load template", "#ef4444");
            }
        }
    };

    // Load templates and auto-load last state on mount
    useEffect(() => {
        const load = async () => {
            const savedTemplatesStr = await storage.get("wedding-templates");
            let savedTemplates: Template[] = [];
            try {
                savedTemplates = JSON.parse(savedTemplatesStr || "[]");
            } catch {
                console.error("Corrupted templates data, resetting");
                savedTemplates = [];
            }
            setTemplates(savedTemplates);

            const lastId = await storage.get("wedding-current-template-id");
            if (lastId) {
                await loadTemplate(lastId);
            } else {
                // Attempt legacy load
                const legacyState = await storage.get("wedding-site-state");
                if (legacyState) {
                    try {
                        actions.deserialize(legacyState);
                        showToast("Restored unsaved draft");
                    } catch (e) { console.error(e); }
                }
            }
        };
        load().catch((e) => console.error("Failed to load templates on mount", e));
    }, []);


    const handleSave = async () => {
        if (currentTemplateId) {
            // Update existing
            const template = templates.find(t => t.id === currentTemplateId);
            if (template) {
                try {
                    await saveToStorage(template.name, currentTemplateId);
                    showToast(`Saved "${template.name}"`);
                } catch (e) {
                    console.error("Failed to save template", e);
                    showToast("Failed to save", "#ef4444");
                }
            }
        } else {
            // Open Save As dialog
            setNewTemplateName("My Awesome Wedding Site");
            setSaveDialogOpen(true);
        }
    };

    const saveToStorage = async (name: string, id: string) => {
        const json = query.serialize();
        const updatedTemplates = templates.map(t => t.id === id ? { ...t, name, lastSaved: Date.now() } : t);

        // If not in list (shouldn't happen for existing, but for safety)
        if (!updatedTemplates.find(t => t.id === id)) {
            updatedTemplates.push({ id, name, lastSaved: Date.now() });
        }

        setTemplates(updatedTemplates);
        await storage.save("wedding-templates", JSON.stringify(updatedTemplates));
        await storage.save(`wedding-template-${id}`, json);
        await storage.save("wedding-current-template-id", id);
    };

    const handleCreateNewTemplate = async () => {
        const id = crypto.randomUUID();
        const name = newTemplateName.trim() || "Untitled Project";

        const newTemplate = { id, name, lastSaved: Date.now() };
        const newTemplates = [...templates, newTemplate];

        setTemplates(newTemplates);
        await storage.save("wedding-templates", JSON.stringify(newTemplates));
        await storage.save(`wedding-template-${id}`, query.serialize());
        await storage.save("wedding-current-template-id", id);
        await storage.save(`wedding-page-root-${id}`, id);
        await storage.save(`wedding-pages-${id}`, JSON.stringify([id]));

        setCurrentTemplateId(id);
        setCurrentRootId(id);
        setPageIds([id]);
        broadcastPagesState([id], id, newTemplates);
        setSaveDialogOpen(false);
        showToast(`Created "${name}"`);
    };

    const deleteTemplate = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newTemplates = templates.filter(t => t.id !== id);
        setTemplates(newTemplates);
        await storage.save("wedding-templates", JSON.stringify(newTemplates));
        await storage.remove(`wedding-template-${id}`);

        const rootIdForPage = await storage.get(`wedding-page-root-${id}`);
        if (rootIdForPage) {
            const pagesStr = await storage.get(`wedding-pages-${rootIdForPage}`);
            if (pagesStr) {
                try {
                    const pages: string[] = JSON.parse(pagesStr).filter((pid: string) => pid !== id);
                    if (pages.length > 0) {
                        await storage.save(`wedding-pages-${rootIdForPage}`, JSON.stringify(pages));
                    } else {
                        await storage.remove(`wedding-pages-${rootIdForPage}`);
                    }
                    if (currentRootId === rootIdForPage) {
                        setPageIds(pages);
                    }
                } catch {
                    // ignore parse errors
                }
            }
            await storage.remove(`wedding-page-root-${id}`);
        }

        if (currentTemplateId === id) {
            setCurrentTemplateId(null);
            setCurrentRootId(null);
            setPageIds([]);
            await storage.remove("wedding-current-template-id");
            actions.clearEvents();
            broadcastPagesState([], null, newTemplates);
        } else if (currentRootId && pageIds.length > 0) {
            broadcastPagesState(pageIds, currentTemplateId, newTemplates);
        }
        showToast("Template deleted", "#ef4444");
    };

    const handleAddSection = () => {
        const rootNode = query.node(ROOT_NODE).get();
        if (!rootNode) return;
        const currentMinHeight = rootNode.data.props.minHeight;
        let currentVh = 100;
        if (typeof currentMinHeight === "string" && currentMinHeight.endsWith("vh")) {
            const parsed = parseInt(currentMinHeight.replace("vh", ""), 10);
            if (!isNaN(parsed)) currentVh = parsed;
        }
        const newVh = currentVh + 30;
        actions.setProp(ROOT_NODE, (props: any) => {
            props.minHeight = `${newVh}vh`;
        });
        showToast(`Section height increased to ${newVh}vh`);
    };

    const handleAddPage = async () => {
        const baseRootId = currentRootId || currentTemplateId;
        if (!baseRootId) {
            showToast("Please save this project before adding pages", "#f97316");
            return;
        }

        const id = crypto.randomUUID();
        const name = newPageName.trim() || `Page ${templates.length + 1}`;

        const newTemplate = { id, name, lastSaved: Date.now() };
        const newTemplates = [...templates, newTemplate];

        try {
            setTemplates(newTemplates);
            await storage.save("wedding-templates", JSON.stringify(newTemplates));
            await storage.save(`wedding-template-${id}`, EMPTY_PAGE_STATE);
            await storage.save("wedding-current-template-id", id);

            const rootId = baseRootId;
            let pages = pageIds;
            if (!pages || pages.length === 0 || currentRootId !== rootId) {
                pages = [rootId];
            }
            if (!pages.includes(rootId)) {
                pages = [rootId, ...pages.filter(p => p !== rootId)];
            }
            if (!pages.includes(id)) {
                pages = [...pages, id];
            }

            await storage.save(`wedding-page-root-${rootId}`, rootId);
            await storage.save(`wedding-page-root-${id}`, rootId);
            await storage.save(`wedding-pages-${rootId}`, JSON.stringify(pages));

            actions.deserialize(EMPTY_PAGE_STATE);
            setCurrentTemplateId(id);
            setCurrentRootId(rootId);
            setPageIds(pages);
            broadcastPagesState(pages, id, newTemplates);
            showToast(`Created "${name}"`);
        } catch (e) {
            console.error("Failed to add page", e);
            showToast("Failed to create page", "#ef4444");
        }
    };

    // Keep refs up to date on every render
    handleAddSectionRef.current = handleAddSection;
    loadTemplateRef.current = loadTemplate;
    actionsRef.current = actions;

    useEffect(() => {
        const onAddSection = () => {
            handleAddSectionRef.current();
        };
        const onAddPage = () => {
            actionsRef.current.selectNode(undefined);
            setNewPageName("");
            setAddPageDialogOpen(true);
        };
        const onSetPage = (event: any) => {
            const id = event.detail?.id as string | undefined;
            if (id) {
                loadTemplateRef.current(id);
            }
        };

        window.addEventListener("nin9-add-section", onAddSection as EventListener);
        window.addEventListener("nin9-add-page", onAddPage as EventListener);
        window.addEventListener("nin9-set-page", onSetPage as EventListener);

        return () => {
            window.removeEventListener("nin9-add-section", onAddSection as EventListener);
            window.removeEventListener("nin9-add-page", onAddPage as EventListener);
            window.removeEventListener("nin9-set-page", onSetPage as EventListener);
        };
    }, []);

    const handleNewProject = async () => {
        if (confirm("Are you sure? This will clear your current editor.")) {
            actions.clearEvents();
            try {
                actions.deserialize(EMPTY_PAGE_STATE);
            } catch (e) {
                window.location.reload();
                return;
            }

            setCurrentTemplateId(null);
            setCurrentRootId(null);
            setPageIds([]);
            await storage.remove("wedding-current-template-id");
            showToast("Started new project");
            broadcastPagesState([], null);
        }
    };

    const currentTemplateName = templates.find(t => t.id === currentTemplateId)?.name;

    return (
        <div className="border-b px-4 py-2 flex items-center justify-between bg-white shadow-sm">
            <div className="flex items-center gap-2">
                <span className="font-bold text-lg mr-4 bg-linear-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    Nin9 Studio
                </span>
                <ToggleGroup type="single" value={device} onValueChange={(val) => val && setDevice(val as "desktop" | "mobile")}>
                    <ToggleGroupItem value="desktop" aria-label="Desktop view">
                        <Monitor className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="mobile" aria-label="Mobile view">
                        <Smartphone className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            <div className="flex items-center gap-2">
                {currentTemplateId && (
                    <Badge variant="secondary" className="mr-2">
                        {currentTemplateName}
                    </Badge>
                )}

                <Dialog
                    open={addPageDialogOpen}
                    onOpenChange={(open) => {
                        setAddPageDialogOpen(open);
                        if (!open) {
                            setNewPageName("");
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Page</DialogTitle>
                            <DialogDescription>
                                Enter a name for the new page.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="page-name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="page-name"
                                    value={newPageName}
                                    onChange={(e) => setNewPageName(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={async () => {
                                    await handleAddPage();
                                    setAddPageDialogOpen(false);
                                }}
                            >
                                Create Page
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Button
                    variant="ghost"
                    size="icon"
                    disabled={!canUndo}
                    onClick={() => actions.history.undo()}
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={!canRedo}
                    onClick={() => actions.history.redo()}
                >
                    <Redo className="h-4 w-4" />
                </Button>

                <div className="h-6 w-px bg-gray-200 mx-1" />

                <Button variant="ghost" size="sm" onClick={handleNewProject} title="New Project">
                    <FilePlus className="h-4 w-4" />
                </Button>

                <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" title="Load Project">
                            <FolderOpen className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Load Template</DialogTitle>
                            <DialogDescription>
                                Select a previously saved template to edit.
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-75 w-full rounded-md border p-4">
                            {templates.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">No saved templates found.</div>
                            ) : (
                                <div className="space-y-2">
                                    {templates.sort((a, b) => b.lastSaved - a.lastSaved).map((t) => (
                                        <div key={t.id}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors",
                                                currentTemplateId === t.id && "border-pink-500 bg-pink-50"
                                            )}
                                            onClick={() => loadTemplate(t.id)}
                                        >
                                            <div>
                                                <div className="font-medium">{t.name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(t.lastSaved).toLocaleString()}
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={(e) => deleteTemplate(t.id, e)}>
                                                <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </DialogContent>
                </Dialog>

                <Button variant="outline" size="sm" onClick={handleSave} className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    {currentTemplateId ? "Save" : "Save As"}
                </Button>

                <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Save Template</DialogTitle>
                            <DialogDescription>
                                Give your wedding site template a name.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={newTemplateName}
                                    onChange={(e) => setNewTemplateName(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateNewTemplate}>Save Template</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <div className="h-6 w-px bg-gray-200 mx-1" />

                <Toggle
                    pressed={preview}
                    onPressedChange={(pressed) => {
                        setPreview(pressed);
                        setOptions((options) => options.enabled = !pressed);
                    }}
                    variant="outline"
                    aria-label="Toggle preview"
                    className="gap-2"
                >
                    <Play className="h-4 w-4" />
                    {preview ? "Edit" : "Preview"}
                </Toggle>
                <FullPreview />
            </div>
        </div>
    );
};
