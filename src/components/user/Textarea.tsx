"use client";
"use no memo";

import { useNode, useEditor } from "@craftjs/core";
import React, { useRef, useEffect, useCallback } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { StylesPanel } from "../editor/properties/StylesPanel";
import { getSpacing } from "@/lib/utils";
import { motion } from "framer-motion";
import { getAnimationVariants } from "./AnimationSection";
import { useCanvasDrag } from "./hooks/useCanvasDrag";

export const TextareaSettings = () => {
    const { actions: { setProp }, placeholder, rows, value } = useNode((node) => ({
        placeholder: node.data.props.placeholder,
        rows: node.data.props.rows,
        value: node.data.props.value,
    }));

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Default Value</Label>
                <Textarea
                    value={value}
                    onChange={(e) => setProp((props: any) => props.value = e.target.value)}
                    rows={3}
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
                <Label>Rows (min height)</Label>
                <Input
                    type="number"
                    min={1}
                    max={50}
                    value={typeof rows === "number" && rows >= 1 ? rows : 4}
                    onChange={(e) => {
                        const raw = e.target.value;
                        const num = parseInt(raw, 10);
                        const next = raw === "" ? 4 : (isNaN(num) ? (typeof rows === "number" ? rows : 4) : Math.max(1, Math.min(50, num)));
                        setProp((props: any) => (props.rows = next));
                    }}
                />
            </div>
            <StylesPanel hideDimensions />
        </div>
    );
};

const safeRows = (rows: unknown) =>
    typeof rows === "number" && rows >= 1 ? rows : 4;

export const UserTextarea = ({ placeholder, value, rows, padding, margin, width, height, background, borderRadius, animationType, animationDuration, animationDelay }: any) => {
    const { connectors: { connect, drag }, selected, actions: { setProp }, top, left } = useNode((state) => ({
        selected: state.events.selected,
        top: state.data.props.top || 0,
        left: state.data.props.left || 0,
    }));

    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled,
    }));

    const variants = getAnimationVariants(animationType, animationDuration, animationDelay);
    const { itemStyle } = useCanvasDrag(top, left);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const minRows = safeRows(rows);

    const resizeToContent = useCallback(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        const lineHeight = 20;
        const minHeight = minRows * lineHeight;
        const contentHeight = Math.max(minHeight, el.scrollHeight);
        el.style.height = `${contentHeight}px`;
    }, [minRows]);

    useEffect(() => {
        resizeToContent();
    }, [value, minRows, resizeToContent]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setProp((props: any) => (props.value = e.target.value));
        resizeToContent();
    };

    return (
        <motion.div
            ref={(ref: any) => connect(drag(ref))}
            style={{
                width: typeof width === "number" ? `${width}px` : (width || "100%"),
                height: typeof height === "number" ? `${height}px` : undefined,
                padding: getSpacing(padding),
                margin: getSpacing(margin),
                background,
                borderRadius: borderRadius ? `${borderRadius}px` : undefined,
                ...itemStyle,
            }}
            className="w-full"
            initial="initial"
            animate="animate"
            variants={variants as any}
        >
            <Textarea
                ref={textareaRef}
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                rows={minRows}
                className={selected ? "ring-2 ring-blue-400" : ""}
                readOnly={enabled && !selected}
            />
        </motion.div>
    );
};

UserTextarea.craft = {
    displayName: "Textarea",
    props: {
        placeholder: "Enter details...",
        value: "",
        rows: 4,
        padding: 0,
        margin: 0,
        width: "60%",
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
        settings: TextareaSettings,
    },
};
