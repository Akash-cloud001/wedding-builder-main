"use client";
"use no memo";

import { Element, useNode, useEditor } from "@craftjs/core";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { UserContainer } from "./Container";
import { UserText } from "./Text";
import { useCanvasDrag } from "./hooks/useCanvasDrag";

export const PopupSettings = () => {
    const { actions: { setProp }, triggerText, openOnLoad, hideTrigger, width, height, mode, title, message } = useNode((node) => ({
        triggerText: node.data.props.triggerText,
        openOnLoad: node.data.props.openOnLoad,
        hideTrigger: node.data.props.hideTrigger,
        width: node.data.props.width,
        height: node.data.props.height,
        mode: node.data.props.mode,
        title: node.data.props.title,
        message: node.data.props.message,
    }));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Simple Mode (Text Only)</Label>
                <Switch
                    checked={mode === "simple"}
                    onCheckedChange={(checked) => setProp((props: any) => props.mode = checked ? "simple" : "custom")}
                />
            </div>

            {mode === "simple" && (
                <>
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            value={title}
                            onChange={(e) => setProp((props: any) => props.title = e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Message</Label>
                        <textarea
                            className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={message}
                            onChange={(e) => setProp((props: any) => props.message = e.target.value)}
                        />
                    </div>
                </>
            )}

            <div className="space-y-2">
                <Label>Trigger Text</Label>
                <Input
                    value={triggerText}
                    onChange={(e) => setProp((props: any) => props.triggerText = e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label>Popup Width (px)</Label>
                <Input
                    type="number"
                    value={typeof width === "number" ? width : parseInt(String(width).replace("px", "")) || 500}
                    onChange={(e) => setProp((props: any) => props.width = parseInt(e.target.value, 10) || 500)}
                />
            </div>

            <div className="space-y-2">
                <Label>Popup Height (px)</Label>
                <Input
                    type="number"
                    value={typeof height === "number" ? height : parseInt(String(height).replace("px", "")) || 300}
                    onChange={(e) => setProp((props: any) => props.height = parseInt(e.target.value, 10) || 300)}
                />
            </div>

            <div className="flex items-center justify-between">
                <Label>Open on Load</Label>
                <Switch
                    checked={openOnLoad}
                    onCheckedChange={(checked) => setProp((props: any) => props.openOnLoad = checked)}
                />
            </div>

            <div className="flex items-center justify-between">
                <Label>Hide Trigger Button</Label>
                <Switch
                    checked={hideTrigger}
                    onCheckedChange={(checked) => setProp((props: any) => props.hideTrigger = checked)}
                />
            </div>
        </div>
    );
};

export const UserPopup = ({
    triggerText,
    openOnLoad,
    hideTrigger,
    width = 500,
    height = 300,
    mode = "custom",
    title,
    message,
    position = "center",
    top = 0,
    left = 0,
    popupViewportTop,
    popupViewportLeft,
    children,
}: any) => {
    const { connectors: { connect, drag }, selected, actions: { setProp } } = useNode((state) => ({
        selected: state.events.selected,
    }));

    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled,
    }));

    const { itemStyle } = useCanvasDrag(top, left);
    const editorBoxRef = React.useRef<HTMLDivElement | null>(null);

    const [internalOpen, setInternalOpen] = useState(false);

    React.useEffect(() => {
        if (!enabled && openOnLoad) {
            const timer = setTimeout(() => setInternalOpen(true), 500);
            return () => clearTimeout(timer);
        } else if (enabled) {
            setInternalOpen(false);
        }
    }, [enabled, openOnLoad]);


    const openState = enabled ? true : internalOpen;

    const widthPx = typeof width === "number" ? width : parseInt(String(width).replace("px", ""), 10) || 500;
    const heightPx = typeof height === "number" ? height : parseInt(String(height).replace("px", ""), 10) || 300;

    const innerContent = mode === "simple" ? (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center space-y-6 h-full overflow-auto">
            {title && <h2 className="text-2xl font-serif text-gray-800">{title}</h2>}
            {message && <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{message}</p>}
            <Button onClick={() => enabled ? undefined : setInternalOpen(false)}>Continue</Button>
        </div>
    ) : (
        <Element id="popup_content" is={UserContainer} width="100%" background="#ffffff" borderRadius={12} padding={40} canvas>
            <UserText text="Popup Content" fontSize={20} textAlign="center" color="#333333" />
            <UserText text="Drag and drop components here..." fontSize={14} textAlign="center" color="#999999" />
        </Element>
    );

    // Editor: render as a canvas box (no Dialog, so no DialogTitle)
    if (enabled) {
        return (
            <div
                ref={(el: HTMLDivElement | null) => {
                    editorBoxRef.current = el;
                    if (el) connect(drag(el));
                }}
                className="rounded-xl overflow-hidden border-2 border-gray-200 bg-white shadow-lg"
                style={{
                    position: itemStyle.position as any,
                    top: itemStyle.top,
                    left: itemStyle.left,
                    width: widthPx,
                    height: heightPx,
                    minWidth: 120,
                    minHeight: 80,
                    zIndex: selected ? 100 : 1,
                    boxSizing: "border-box",
                }}
            >
                <div className="w-full h-full overflow-auto">
                    {innerContent}
                </div>
            </div>
        );
    }

    return (
        <div className="inline-block">
            <Dialog open={openState} modal onOpenChange={setInternalOpen}>
                {!hideTrigger && (
                    <DialogTrigger asChild>
                        <Button variant="outline">{triggerText}</Button>
                    </DialogTrigger>
                )}
                <DialogContent
                    portal
                    className="p-0 border-none shadow-none bg-transparent z-[9999]"
                    style={{
                        width: `${widthPx}px`,
                        maxWidth: "90vw",
                        maxHeight: "90vh"
                    }}
                >
                    <DialogTitle className="sr-only">{title || "Popup Notification"}</DialogTitle>
                    <div className="w-full h-full max-h-[90vh] overflow-auto rounded-xl shadow-lg">
                        {innerContent}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

UserPopup.craft = {
    displayName: "Popup",
    props: {
        triggerText: "Open Popup",
        openOnLoad: false,
        hideTrigger: false,
        width: 500,
        height: 300,
        top: 0,
        left: 0,
        mode: "custom",
        title: "Message From Couple",
        message: "Welcome - We're so glad you're here!!\n\nTake a browse through the pages on our wedding website and please complete your RSVP by March 1, 2026. We cannot wait to celebrate with you!\n\nWith love, Rahul and Ashna",
        position: "center",
        popupViewportTop: undefined,
        popupViewportLeft: undefined,
    },
    related: {
        settings: PopupSettings,
    },
};
