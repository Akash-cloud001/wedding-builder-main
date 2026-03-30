"use client";
"use no memo";

import { useNode, useEditor } from "@craftjs/core";
import React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { StylesPanel } from "../editor/properties/StylesPanel";
import { getSpacing } from "@/lib/utils";
import { motion } from "framer-motion";
import { getAnimationVariants } from "./AnimationSection";
import { useAppContext } from "../editor/AppContext";
import { useCanvasDrag } from "./hooks/useCanvasDrag";

export const InputSettings = () => {
    const { actions: { setProp }, placeholder, type, value } = useNode((node) => ({
        placeholder: node.data.props.placeholder,
        type: node.data.props.type,
        value: node.data.props.value,
    }));

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Default Value</Label>
                <Input
                    value={value}
                    onChange={(e) => setProp((props: any) => props.value = e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label>Placeholder</Label>
                <Input
                    value={placeholder}
                    onChange={(e) => setProp((props: any) => props.placeholder = e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label>Type</Label>
                <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={type}
                    onChange={(e) => setProp((props: any) => props.type = e.target.value)}
                >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="password">Password</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                </select>
            </div>

            <StylesPanel hideDimensions />
        </div>
    );
};

export const UserInput = ({ placeholder, type, value, padding, margin, width, height, background, borderRadius, animationType, animationDuration, animationDelay }: any) => {
    const { connectors: { connect, drag }, selected, actions: { setProp }, top, left } = useNode((state) => ({
        selected: state.events.selected,
        top: state.data.props.top || 0,
        left: state.data.props.left || 0,
    }));

    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled,
    }));

    const { device } = useAppContext();
    const variants = getAnimationVariants(animationType, animationDuration, animationDelay);
    const { itemStyle } = useCanvasDrag(top, left);

    const responsiveWidth = device === "mobile" && width && typeof width === "string" && width.includes("px")
        ? "100%"
        : (typeof width === "number" ? `${width}px` : (width || "100%"));

    return (
        <motion.div
            ref={(ref: any) => connect(drag(ref))}
            style={{
                width: responsiveWidth,
                maxWidth: device === "mobile" ? "100%" : undefined,
                height: typeof height === "number" ? `${height}px` : undefined,
                padding: getSpacing(padding),
                margin: getSpacing(margin),
                background,
                borderRadius: borderRadius ? `${borderRadius}px` : undefined,
                ...(device === "mobile" ? { position: "relative" as const, top: 0, left: 0 } : itemStyle),
            }}
            className="w-full"
            initial="initial"
            animate="animate"
            variants={variants as any}
        >
            <Input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => setProp((props: any) => props.value = e.target.value)}
                className={selected ? "ring-2 ring-blue-400" : ""}
                readOnly={enabled && !selected} // Writable if selected (Editor) or if Preview mode (!enabled)
            />
        </motion.div>
    );
};

UserInput.craft = {
    displayName: "Input",
    props: {
        placeholder: "Enter text...",
        value: "",
        type: "text",
        padding: 0,
        margin: 0,
        width: "50%",
        height: undefined,
        top: 0,
        left: 0,
        background: "transparent",
        borderRadius: 0,
        animationType: "none",
        animationDuration: 0.5,
        animationDelay: 0,
    },
    related: {
        settings: InputSettings,
    },
};
