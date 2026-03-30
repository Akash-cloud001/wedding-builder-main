"use client";
"use no memo";

import { useNode, useEditor } from "@craftjs/core";
import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { MessageSquare } from "lucide-react";

export const WelcomeModalSettings = () => {
    const {
        actions: { setProp },
        title,
        message,
        buttonText,
        enabled,
    } = useNode((node) => ({
        title: node.data.props.title,
        message: node.data.props.message,
        buttonText: node.data.props.buttonText,
        enabled: node.data.props.enabled,
    }));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Enable Modal</Label>
                <Switch
                    checked={enabled}
                    onCheckedChange={(checked) =>
                        setProp((props: any) => (props.enabled = checked))
                    }
                />
            </div>

            <div className="space-y-2">
                <Label>Title</Label>
                <Input
                    value={title}
                    onChange={(e) =>
                        setProp((props: any) => (props.title = e.target.value))
                    }
                />
            </div>

            <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                    value={message}
                    onChange={(e) =>
                        setProp((props: any) => (props.message = e.target.value))
                    }
                    className="min-h-25"
                />
            </div>

            <div className="space-y-2">
                <Label>Button Text</Label>
                <Input
                    value={buttonText}
                    onChange={(e) =>
                        setProp((props: any) => (props.buttonText = e.target.value))
                    }
                />
            </div>
        </div>
    );
};

export const UserWelcomeModal = ({
    title,
    message,
    buttonText,
    enabled,
}: any) => {
    const {
        connectors: { connect, drag },
        selected,
    } = useNode((state) => ({
        selected: state.events.selected,
    }));

    const { enabled: isEditorEnabled } = useEditor((state) => ({
        enabled: state.options.enabled,
    }));

    const [open, setOpen] = useState(false);

    // Show modal only in preview mode (when editor is disabled) and if component is enabled
    useEffect(() => {
        if (!isEditorEnabled && enabled) {
            // Small timeout to simulate "page load" appearance
            const timer = setTimeout(() => setOpen(true), 500);
            return () => clearTimeout(timer);
        } else {
            setOpen(false);
        }
    }, [isEditorEnabled, enabled]);

    const handleContinue = () => {
        setOpen(false);
    };

    if (isEditorEnabled) {
        return (
            <div
                ref={(ref: any) => connect(drag(ref))}
                className={`w-full p-4 border-2 border-dashed rounded-lg bg-gray-50 flex items-center gap-4 ${selected ? "border-blue-500" : "border-gray-300"
                    }`}
            >
                <div className="p-2 bg-white rounded-full border shadow-sm">
                    <MessageSquare className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <h3 className="font-medium text-gray-900">Welcome Modal</h3>
                    <p className="text-sm text-gray-500">
                        {enabled ? "Enabled - Visible on publish" : "Disabled"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent showCloseButton={false} className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-medium text-gray-800">
                        {title}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4 text-sm text-gray-600 whitespace-pre-wrap text-center">
                    {message}
                </div>
                <DialogFooter className="sm:justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-full px-8"
                        onClick={handleContinue}
                    >
                        {buttonText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

UserWelcomeModal.craft = {
    displayName: "Welcome Modal",
    props: {
        title: "Message from the Couple",
        message:
            "Welcome - We're so glad you're here!!\n\nTake a browse through the pages on our wedding website and please complete your RSVP by March 1, 2026. We cannot wait to celebrate with you!\n\nWith love, Rahul and Ashna",
        buttonText: "Continue",
        enabled: true,
    },
    related: {
        settings: WelcomeModalSettings,
    },
};
