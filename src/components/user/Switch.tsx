"use client";
"use no memo";

import { useNode } from "@craftjs/core";
import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { StylesPanel } from "../editor/properties/StylesPanel";
import { getSpacing } from "@/lib/utils";
import { motion } from "framer-motion";
import { getAnimationVariants } from "./AnimationSection";
import { useCanvasDrag } from "./hooks/useCanvasDrag";
import { useAppContext } from "../editor/AppContext";

export const SwitchSettings = () => {
    const { actions: { setProp }, label, checked } = useNode((node) => ({
        label: node.data.props.label,
        checked: node.data.props.checked,
    }));

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Side Label</Label>
                <Input
                    value={label}
                    onChange={(e) => setProp((props: any) => props.label = e.target.value)}
                />
            </div>
            <div className="flex items-center justify-between">
                <Label>Default Checked</Label>
                <Switch
                    checked={checked}
                    onCheckedChange={(val) => setProp((props: any) => props.checked = val)}
                />
            </div>
            <StylesPanel hideDimensions />
        </div>
    );
};

export const UserSwitch = ({ label, checked, padding, margin, width, height, background, borderRadius, animationType, animationDuration, animationDelay }: any) => {
    const { connectors: { connect, drag }, selected, actions: { setProp }, top, left } = useNode((state) => ({
        selected: state.events.selected,
        top: state.data.props.top || 0,
        left: state.data.props.left || 0,
    }));

    const { device } = useAppContext();
    const variants = getAnimationVariants(animationType, animationDuration, animationDelay);
    const { itemStyle } = useCanvasDrag(top, left);

    const responsiveWidth = device === "mobile" && width && typeof width === "string" && width.includes("px")
        ? "100%"
        : (typeof width === "number" ? `${width}px` : (width === "100%" ? "auto" : width));

    return (
        <motion.div
            ref={(ref: any) => connect(drag(ref))}
            style={{
                width: responsiveWidth,
                maxWidth: device === "mobile" ? "100%" : undefined,
                height: typeof height === "number" ? `${height}px` : undefined,
                padding: getSpacing(padding),
                margin: getSpacing(margin),
                backgroundColor: background,
                borderRadius: borderRadius ? `${borderRadius}px` : undefined,
                ...(device === "mobile" ? { position: "relative" as const, top: 0, left: 0 } : itemStyle),
            }}
            className={`flex items-center gap-2 ${selected ? "ring-2 ring-blue-400 ring-offset-2 rounded" : ""}`}
            initial="initial"
            animate="animate"
            variants={variants as any}
        >
            <div
                onPointerDown={(e) => e.stopPropagation()}
                onPointerMove={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center shrink-0"
            >
                <Switch
                    checked={checked}
                    onCheckedChange={(val) => setProp((props: any) => (props.checked = val))}
                />
            </div>
            {label && <Label>{label}</Label>}
        </motion.div>
    );
};

UserSwitch.craft = {
    displayName: "Switch",
    props: {
        label: "Toggle me",
        checked: false,
        padding: 0,
        margin: 0,
        width: "auto",
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
        settings: SwitchSettings,
    },
};
