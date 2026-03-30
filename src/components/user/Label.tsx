"use client";
"use no memo";

import { useNode } from "@craftjs/core";
import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { StylesPanel } from "../editor/properties/StylesPanel";
import { getSpacing } from "@/lib/utils";
import { motion } from "framer-motion";
import { getAnimationVariants } from "./AnimationSection";
import { useCanvasDrag } from "./hooks/useCanvasDrag";

export const LabelSettings = () => {
    const { actions: { setProp }, text } = useNode((node) => ({
        text: node.data.props.text,
    }));

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Label Text</Label>
                <Input
                    value={text}
                    onChange={(e) => setProp((props: any) => props.text = e.target.value)}
                />
            </div>
            <StylesPanel hideDimensions />
        </div>
    );
};

export const UserLabel = ({ text, padding, margin, width, height, background, borderRadius, animationType, animationDuration, animationDelay }: any) => {
    const { connectors: { connect, drag }, selected, actions: { setProp }, top, left } = useNode((state) => ({
        selected: state.events.selected,
        top: state.data.props.top || 0,
        left: state.data.props.left || 0,
    }));

    const variants = getAnimationVariants(animationType, animationDuration, animationDelay);
    const { itemStyle } = useCanvasDrag(top, left);

    return (
        <motion.div
            ref={(ref: any) => connect(drag(ref))}
            style={{
                width: typeof width === "number" ? `${width}px` : (width === "100%" ? "auto" : width),
                height: typeof height === "number" ? `${height}px` : undefined,
                padding: getSpacing(padding),
                margin: getSpacing(margin),
                backgroundColor: background,
                borderRadius: borderRadius ? `${borderRadius}px` : undefined,
                ...itemStyle,
            }}
            className="inline-block"
            initial="initial"
            animate="animate"
            variants={variants as any}
        >
            <Label className={selected ? "text-blue-500" : ""}>
                {text}
            </Label>
        </motion.div>
    );
};

UserLabel.craft = {
    displayName: "Label",
    props: {
        text: "Label Text",
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
        settings: LabelSettings,
    },
};
