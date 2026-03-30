"use client";
"use no memo";

import React, { useEffect, useState } from "react";
import { useEditor } from "@craftjs/core";
import { Toolbox } from "./Toolbox";
import { SettingsPanel } from "./SettingsPanel";
import { Topbar } from "./Topbar";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useAppContext } from "./AppContext";

interface PageMeta {
    id: string;
    name: string;
}

export const Viewport = ({ children }: { children: React.ReactNode }) => {
    const { device } = useAppContext();
    const { enabled, actions } = useEditor((state) => ({
        enabled: state.options.enabled,
    }));

    const isMobile = device === "mobile";
    const DESKTOP_MAX_WIDTH = 1024;
    // Fixed panel widths so center = total - TOOLBOX_WIDTH - PANEL_WIDTH (no overlap at any viewport)
    const TOOLBOX_WIDTH_PX = 256;   // w-64
    const PANEL_WIDTH_PX = 320;    // w-80

    const [pages, setPages] = useState<PageMeta[]>([]);
    const [currentPageId, setCurrentPageId] = useState<string | null>(null);

    useEffect(() => {
        const handler = (event: any) => {
            const detail = event.detail as { pages: PageMeta[]; currentTemplateId: string | null };
            setPages(detail?.pages || []);
            setCurrentPageId(detail?.currentTemplateId || null);
        };

        window.addEventListener("nin9-pages-state", handler as EventListener);
        return () => window.removeEventListener("nin9-pages-state", handler as EventListener);
    }, []);

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:wght@400;700&family=Playfair+Display:wght@400;700&display=swap"
                rel="stylesheet"
            />
            <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
                <Topbar />
                <div
                    className="flex flex-1 min-w-0 overflow-hidden"
                    style={{
                        // Center gets exactly (100% - toolbox - panel); prevents right panel overlapping canvas at any viewport
                        ["--toolbox-w" as string]: `${TOOLBOX_WIDTH_PX}px`,
                        ["--panel-w" as string]: `${PANEL_WIDTH_PX}px`,
                    }}
                >
                    {/* Toolbox: in Preview keep space so canvas width stays same; hide visually with invisible */}
                    <div
                        className={cn(
                            "bg-white shrink-0 transition-all h-full flex flex-col overflow-hidden border-r min-h-0",
                            enabled ? "flex" : "invisible pointer-events-none"
                        )}
                        style={{ width: TOOLBOX_WIDTH_PX, minWidth: TOOLBOX_WIDTH_PX }}
                    >
                        <Toolbox />
                    </div>

                    <div
                        className={cn(
                            "min-w-0 overflow-y-auto overflow-x-hidden relative flex flex-col craftjs-renderer",
                            isMobile ? "p-0 justify-center" : "p-8 items-center"
                        )}
                        style={{
                            // Center = remaining width; flex-1 + min-w-0 ensures it shrinks and never overlaps right panel
                            flex: "1 1 0%",
                            width: "0%",
                        }}
                    >
                        <div
                            className={cn(
                                "bg-white shadow-lg transition-all duration-300 origin-top relative editor-canvas-root",
                                isMobile ? "w-full overflow-x-hidden" : "w-full max-w-5xl",
                                enabled ? "ring-offset-2 ring-0" : "ring-0"
                            )}
                            style={isMobile ? {
                                width: "var(--mobile-canvas-default, 375px)",
                                minWidth: "var(--mobile-canvas-min, 320px)",
                                maxWidth: "var(--mobile-canvas-max, 428px)",
                                overflowX: "hidden",
                                overflowY: "auto",
                                marginLeft: "auto",
                                marginRight: "auto",
                                padding: 0,
                            } : {
                                maxWidth: `${DESKTOP_MAX_WIDTH}px`,
                            }}
                            data-device={device}
                            onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                    if (enabled) {
                                        actions.selectNode(undefined);
                                        (actions as any).setNodeEvent?.("hovered", null);
                                    }
                                }
                            }}
                        >
                            {children}
                        </div>

                        <div className={cn(
                            "w-full flex flex-col gap-3",
                            isMobile ? "mt-4 px-4 items-center" : "mt-4 pb-8 items-center max-w-5xl"
                        )}
                            style={isMobile ? { maxWidth: "var(--mobile-canvas-max, 428px)", marginLeft: "auto", marginRight: "auto" } : undefined}>
                            <button
                                type="button"
                                className="w-full border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                onClick={() => window.dispatchEvent(new CustomEvent("nin9-add-section"))}
                            >
                                + Add section
                            </button>

                            {pages.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 border border-gray-200">
                                        {pages.map((p, idx) => {
                                            const isActive = p.id === currentPageId;
                                            return (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() =>
                                                        window.dispatchEvent(
                                                            new CustomEvent("nin9-set-page", {
                                                                detail: { id: p.id },
                                                            })
                                                        )
                                                    }
                                                    className={`w-10 h-10 text-sm rounded-md border flex items-center justify-center transition-colors ${
                                                        isActive
                                                            ? "border-indigo-500 bg-white text-indigo-600"
                                                            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                                                    }`}
                                                >
                                                    {idx + 1}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="w-10 h-10 rounded-lg"
                                        onClick={() =>
                                            window.dispatchEvent(new CustomEvent("nin9-add-page"))
                                        }
                                    >
                                        +
                                    </Button>

                                    <Select
                                        value={currentPageId ?? undefined}
                                        onValueChange={(id) =>
                                            window.dispatchEvent(
                                                new CustomEvent("nin9-set-page", { detail: { id } })
                                            )
                                        }
                                    >
                                        <SelectTrigger className="w-32 h-10 rounded-lg bg-white">
                                            <SelectValue placeholder="Select page" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pages.map((p, idx) => {
                                                const label =
                                                    p.name && p.name.trim().length > 0
                                                        ? p.name
                                                        : "Untitled";
                                                return (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {idx + 1}. {label}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right panel: in Preview keep space so canvas width stays same; hide visually with invisible */}
                    <div
                        className={cn(
                            "bg-white shrink-0 border-l transition-all h-full flex flex-col overflow-hidden",
                            enabled ? "flex" : "invisible pointer-events-none"
                        )}
                        style={{ width: PANEL_WIDTH_PX, minWidth: PANEL_WIDTH_PX }}
                    >
                        <SettingsPanel />
                    </div>
                </div>
            </div>
        </>
    );
};
