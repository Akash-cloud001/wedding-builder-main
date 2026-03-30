"use client";
"use no memo";

import { Element, useNode, useEditor } from "@craftjs/core";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UserContainer } from "../Container";
import { UserText } from "../Text";
import { UserButton } from "../Button";
import { UserInput } from "../Input";
import { UserLabel } from "../Label";

export const PrivateEventPopupSettings = () => {
    const { actions: { setProp }, triggerText, isOpen, openOnLoad, hideTrigger, width, position } = useNode((node) => ({
        triggerText: node.data.props.triggerText,
        isOpen: node.data.props.isOpen,
        openOnLoad: node.data.props.openOnLoad,
        hideTrigger: node.data.props.hideTrigger,
        width: node.data.props.width,
        position: node.data.props.position,
    }));

    return (
        <div className="space-y-4">
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
                    value={parseInt(width) || 500}
                    onChange={(e) => setProp((props: any) => props.width = `${e.target.value}px`)}
                />
            </div>

            <div className="space-y-2">
                <Label>Position</Label>
                <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={position || "center"}
                    onChange={(e) => setProp((props: any) => props.position = e.target.value)}
                >
                    <option value="center">Center</option>
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                </select>
            </div>

            <div className="flex items-center justify-between">
                <Label>Force Open (Editor)</Label>
                <Switch
                    checked={isOpen}
                    onCheckedChange={(checked) => setProp((props: any) => props.isOpen = checked)}
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

export const UserPrivateEventPopup = ({ triggerText, isOpen, openOnLoad, hideTrigger, width = "450px", position = "center" }: any) => {
    const { connectors: { connect, drag }, selected, actions: { setProp } } = useNode((state) => ({
        selected: state.events.selected,
    }));

    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled,
    }));

    const [internalOpen, setInternalOpen] = useState(false);

    React.useEffect(() => {
        if (!enabled && openOnLoad) {
            const timer = setTimeout(() => setInternalOpen(true), 500);
            return () => clearTimeout(timer);
        } else if (enabled) {
            setInternalOpen(false);
        }
    }, [enabled, openOnLoad]);

    const openState = enabled ? isOpen : internalOpen;

    const getPositionStyles = () => {
        switch (position) {
            case "top-left": return { top: "20px", left: "20px", transform: "none" };
            case "top-right": return { top: "20px", left: "auto", right: "20px", transform: "none" };
            case "bottom-left": return { top: "auto", bottom: "20px", left: "20px", transform: "none" };
            case "bottom-right": return { top: "auto", bottom: "20px", left: "auto", right: "20px", transform: "none" };
            case "center":
            default: return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
        }
    };

    return (
        <div ref={(ref: any) => connect(drag(ref))} className="inline-block">
            <Dialog
                open={openState}
                modal={!enabled}
                onOpenChange={(val) => {
                    if (enabled) {
                        setProp((props: any) => props.isOpen = val);
                    } else {
                        setInternalOpen(val);
                    }
                }}
            >
                {(!hideTrigger || enabled) && (
                    <DialogTrigger asChild>
                        <Button 
                            variant="outline" 
                            className={hideTrigger && enabled ? "opacity-50 border-dashed border-red-400" : ""}
                        >
                            {triggerText}
                        </Button>
                    </DialogTrigger>
                )}
                
                <DialogContent 
                    portal={!enabled}
                    onInteractOutside={(e) => {
                        if (enabled) e.preventDefault();
                    }}
                    className="p-0 border-none shadow-none bg-transparent sm:max-w-none z-[9999]"
                    style={{  
                        width: width, 
                        maxWidth: "90vw",
                        ...getPositionStyles()
                    }}
                >
                    <DialogTitle className="sr-only">Private Event Access</DialogTitle>
                    <Element 
                        id="popup_content" 
                        is={UserContainer} 
                        width="100%" 
                        background="#ffffff" 
                        borderRadius={24} 
                        padding={40} 
                        canvas
                        flexDirection="column"
                        alignItems="center"
                        gap={20}
                    >
                        <Element id="title" is={UserText} text="Private Event" fontSize={28} fontWeight="bold" textAlign="center" color="#1a1a1a" />
                        
                        <Element id="desc" is={UserText} text="Use the password shared by your host to see event details." fontSize={16} color="#666666" textAlign="center" />
                        
                        <Element id="help_link" is={UserContainer} background="transparent" flexDirection="row" gap={5} alignItems="center" justifyContent="center">
                            <UserText text="Need it?" fontSize={14} color="#666666" />
                            <UserButton text="Ask the Host" variant="ghost" fontSize={14} color="#1a1a1a" padding={0} />
                        </Element>

                        <Element id="form_group" is={UserContainer} background="transparent" width="100%" flexDirection="column" gap={10} alignItems="flex-start" margin={{top: 20, bottom: 0, left: 0, right: 0}}>
                            <UserLabel text="Event Password" fontSize={14} color="#1a1a1a" />
                            <UserInput type="password" placeholder="eg. xy4686" width="100%" />
                        </Element>

                        <UserButton text="View Event" width="100%" color="#ffffff" background="#1a1a1a" borderRadius={50} padding={12} margin={{top: 10, bottom: 0, left: 0, right: 0}} />
                        
                        <UserButton text="Sign In" variant="ghost" fontSize={14} color="#1a1a1a" />

                    </Element>
                </DialogContent>
            </Dialog>
        </div>
    );
};

UserPrivateEventPopup.craft = {
    displayName: "Private Event Popup",
    props: {
        triggerText: "Private Event",
        isOpen: true, // Open by default when dropped so user can see it
        openOnLoad: false,
        hideTrigger: false,
        width: "450px",
        position: "center",
    },
    related: {
        settings: PrivateEventPopupSettings,
    },
};
