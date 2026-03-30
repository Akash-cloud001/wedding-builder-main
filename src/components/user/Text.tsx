"use client";
"use no memo";

import { useNode, useEditor } from "@craftjs/core";
import React, { useEffect, useState } from "react";
import ContentEditable from "react-contenteditable";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Bold, Italic, Underline, Strikethrough } from "lucide-react";
import { AnimationSection, getAnimationVariants } from "./AnimationSection";
import { motion } from "framer-motion";
import { getSpacing, getResponsiveFontSize, getResponsiveSpacing } from "@/lib/utils";
import { useCanvasDrag } from "./hooks/useCanvasDrag";
import { useAppContext } from "../editor/AppContext";

export const TextSettings = () => {
    const { actions: { setProp }, fontSize, color, textAlign, fontWeight, fontStyle, textDecoration, text, fontFamily, height, width, background, borderRadius } = useNode((node) => ({
        fontSize: node.data.props.fontSize,
        color: node.data.props.color,
        textAlign: node.data.props.textAlign,
        fontWeight: node.data.props.fontWeight,
        fontStyle: node.data.props.fontStyle,
        textDecoration: node.data.props.textDecoration,
        text: node.data.props.text,
        fontFamily: node.data.props.fontFamily,
        height: node.data.props.height,
        width: node.data.props.width,
        background: node.data.props.background,
        borderRadius: node.data.props.borderRadius,
    }));

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Text Content</Label>
                <textarea
                    className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={text || ""}
                    onChange={(e) => setProp((props: any) => props.text = e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label>Font Family</Label>
                <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={fontFamily || "sans-serif"}
                    onChange={(e) => setProp((props: any) => props.fontFamily = e.target.value)}
                >
                    <option value="sans-serif">Sans Serif</option>
                    <option value="serif">Serif</option>
                    <option value="monospace">Monospace</option>
                    <option value="'Playfair Display', serif">Playfair Display (Elegant)</option>
                    <option value="'Montserrat', sans-serif">Montserrat (Modern)</option>
                    <option value="'Great Vibes', cursive">Great Vibes (Script)</option>
                </select>
            </div>

            <div className="space-y-2">
                <Label>Font Size: {fontSize}px</Label>
                <Slider
                    value={[fontSize || 16]}
                    max={100}
                    step={1}
                    onValueChange={(val) => {
                        const newSize = val[0];
                        setProp((props: any) => {
                            props.fontSize = newSize;
                            props.baseFontSize = newSize;
                            props.baseHeight = typeof height === "number" ? height : undefined;
                            props.baseWidth = typeof width === "number" ? width : undefined;
                        });
                    }}
                />
            </div>

            <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                    <Input
                        type="color"
                        value={color || "#000000"}
                        className="w-10 h-10 p-1"
                        onChange={(e) => setProp((props: any) => props.color = e.target.value)}
                    />
                    <Input
                        type="text"
                        value={color || "#000000"}
                        onChange={(e) => setProp((props: any) => props.color = e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex gap-2">
                    <Input
                        type="color"
                        value={background && background !== "transparent" ? background : "#ffffff"}
                        className="w-10 h-10 p-1"
                        onChange={(e) => setProp((props: any) => props.background = e.target.value)}
                    />
                    <Input
                        type="text"
                        value={background || ""}
                        placeholder="#ffffff or transparent"
                        onChange={(e) => setProp((props: any) => props.background = e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Border Radius: {borderRadius || 0}px</Label>
                <Slider
                    value={[borderRadius || 0]}
                    max={64}
                    step={1}
                    onValueChange={(val) => setProp((props: any) => props.borderRadius = val[0])}
                />
            </div>

            <div className="space-y-2">
                <Label>Style</Label>
                <ToggleGroup
                    type="multiple"
                    value={[
                        // Treat any non-normal weight as bold for consistency
                        fontWeight && fontWeight !== "normal" ? "bold" : "",
                        fontStyle === "italic" ? "italic" : "",
                        textDecoration && textDecoration.includes("underline") ? "underline" : "",
                        textDecoration && textDecoration.includes("line-through") ? "line-through" : "",
                        textDecoration && textDecoration.includes("overline") ? "overline" : "",
                    ].filter(Boolean)}
                    onValueChange={(vals) => {
                        setProp((props: any) => {
                            // Bold / Italic
                            props.fontWeight = vals.includes("bold") ? "bold" : "normal";
                            props.fontStyle = vals.includes("italic") ? "italic" : "normal";

                            // Text decoration: allow at most one at a time, in priority order
                            if (vals.includes("underline")) props.textDecoration = "underline";
                            else if (vals.includes("line-through")) props.textDecoration = "line-through";
                            else if (vals.includes("overline")) props.textDecoration = "overline";
                            else props.textDecoration = "none";
                        });
                    }}
                >
                    <ToggleGroupItem value="bold" aria-label="Bold"><Bold className="h-4 w-4" /></ToggleGroupItem>
                    <ToggleGroupItem value="italic" aria-label="Italic"><Italic className="h-4 w-4" /></ToggleGroupItem>
                    <ToggleGroupItem value="underline" aria-label="Underline"><Underline className="h-4 w-4" /></ToggleGroupItem>
                    <ToggleGroupItem value="line-through" aria-label="Strikethrough"><Strikethrough className="h-4 w-4" /></ToggleGroupItem>
                    <ToggleGroupItem value="overline" aria-label="Overline">
                        <span
                            className="text-xs font-bold underline decoration-2 decoration-current align-top"
                            style={{ textDecorationLine: "overline" }}
                        >
                            O
                        </span>
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
        </div>
    );
};

export const UserText = ({ text, fontSize, color, textAlign, fontWeight, fontStyle, textDecoration, fontFamily, padding, margin, width, height, baseFontSize, baseHeight, baseWidth, minHeight, background, borderRadius, top, left, animationType, animationDuration, animationDelay }: any) => {
    const { connectors: { connect, drag }, actions: { setProp }, selected } = useNode((state) => ({
        selected: state.events.selected,
    }));

    const { device } = useAppContext();

    // Access parent node to check if it's a "canvas" container
    const { itemStyle } = useCanvasDrag(top, left);

    const [editable, setEditable] = useState(false);

    useEffect(() => {
        if (selected) return;
        setEditable(false);
    }, [selected]);

    // When box is resized (numeric width/height), establish or use baseline so text scales with box
    useEffect(() => {
        const w = typeof width === "number" ? width : undefined;
        const h = typeof height === "number" ? height : undefined;
        const bw = typeof baseWidth === "number" ? baseWidth : undefined;
        const bh = typeof baseHeight === "number" ? baseHeight : undefined;
        const bf = typeof baseFontSize === "number" ? baseFontSize : undefined;
        const hasSize = (w != null && w > 0) || (h != null && h > 0);
        if (!hasSize || (bw != null && bh != null && bf != null)) return;
        try {
            setProp((p: any) => {
                if (p.baseWidth == null && typeof p.width === "number") p.baseWidth = p.width;
                if (p.baseHeight == null && typeof p.height === "number") p.baseHeight = p.height;
                if (p.baseFontSize == null) p.baseFontSize = p.fontSize || 16;
            });
        } catch {
            // Node may have been removed (e.g. deleted); ignore
        }
    }, [width, height, baseWidth, baseHeight, baseFontSize, setProp]);

    const variants = getAnimationVariants(animationType, animationDuration, animationDelay);

    const baseF = typeof baseFontSize === "number" ? baseFontSize : (fontSize || 16);
    const baseW = typeof baseWidth === "number" && baseWidth > 0 ? baseWidth : null;
    const baseH = typeof baseHeight === "number" && baseHeight > 0 ? baseHeight : null;
    const numWidth = typeof width === "number" ? width : null;
    const numHeight = typeof height === "number" ? height : null;
    const scaleW = baseW != null && numWidth != null ? numWidth / baseW : 1;
    const scaleH = baseH != null && numHeight != null ? numHeight / baseH : 1;
    const scale = (scaleW !== 1 || scaleH !== 1) ? Math.min(scaleW, scaleH) : 1;
    const scaledFontSize = Math.round(Math.max(8, Math.min(200, baseF * scale)));

    useEffect(() => {
        const hasResized = (numWidth != null && baseW != null) || (numHeight != null && baseH != null);
        const targetSize = hasResized ? scaledFontSize : (fontSize || 16);
        if (!targetSize || targetSize === fontSize) return;
        try {
            setProp((p: any) => {
                p.fontSize = targetSize;
            });
        } catch {
        }
    }, [numWidth, numHeight, baseW, baseH, scaledFontSize, fontSize, setProp]);

    // Get responsive font size based on device (use scaled size when resized by width or height)
    const responsiveFontSize = getResponsiveFontSize((numWidth != null || numHeight != null) ? scaledFontSize : (fontSize || 16), device);

    // Adjust width consistently with media components: numeric values become px, string widths pass through
    const responsiveWidth = device === "mobile" && width && typeof width === "string" && width.includes("px")
        ? "100%"
        : width;
    const styleWidth = typeof width === "number" ? `${width}px` : responsiveWidth;
    const styleHeight = undefined;

    return (
        <motion.div
            ref={(ref: any) => connect(drag(ref))}
            onDoubleClick={(e) => {
                if (selected) setEditable(true);
            }}
            initial="initial"
            animate="animate"
            variants={variants as any}

            style={{
                width: styleWidth,
                height: styleHeight,
                minHeight,
                padding: getSpacing(device === "mobile" ? getResponsiveSpacing(padding, device) : padding),
                margin: getSpacing(device === "mobile" ? getResponsiveSpacing(margin, device) : margin),
                backgroundColor: background,
                borderRadius: `${borderRadius}px`,
                ...(device === "mobile" 
                    ? { position: "relative", top: 0, left: 0, width: "100%" } 
                    : itemStyle),
                zIndex: selected ? 100 : (device === "mobile" ? 10 : 1),
                maxWidth: device === "mobile" ? "100%" : undefined,
                overflow: device === "mobile" ? "hidden" : undefined,
                overflowWrap: "break-word",
                wordWrap: "break-word",
                wordBreak: "break-word",

                // For fit-content width, we must align the block itself
                alignSelf: device === "mobile"
                    ? undefined
                    : ((responsiveWidth === "fit-content" || responsiveWidth === "auto")
                        ? (textAlign === "center" ? "center" : textAlign === "right" ? "flex-end" : "flex-start")
                        : undefined),
            }}
        >
            <ContentEditable
                html={text}
                disabled={!editable}
                onChange={(e: any) =>
                    setProp((props: any) => props.text = e.target.value)
                }
                tagName="div"
                style={{
                    fontSize: `${responsiveFontSize}px`,
                    color,
                    textAlign: textAlign, // Keep original alignment
                    fontWeight,
                    fontStyle,
                    textDecoration,
                    fontFamily,
                    minHeight: "1em", // Ensure it doesn't collapse
                    width: "100%",
                    maxWidth: "100%",
                    overflowWrap: "break-word",
                    wordWrap: "break-word",
                    wordBreak: "break-word",
                }}
                className={`outline-none focus:outline-blue-400 focus:outline-2 focus:outline-dashed ${!editable ? "cursor-move" : "cursor-text"}`}
            />
        </motion.div>
    );
};

UserText.craft = {
    displayName: "Text",
    props: {
        text: "Edit this text",
        fontSize: 16,
        color: "#000000",
        textAlign: "left",
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none",
        fontFamily: "sans-serif",
        padding: 0,
        margin: 0,
        width: "fit-content",
        height: undefined,
        minHeight: "auto",
        background: "transparent",
        borderRadius: 0,
        animationType: "none",
        animationDuration: 0.5,
        animationDelay: 0,
        top: 0,
        left: 0,
        baseFontSize: undefined,
        baseHeight: undefined,
        baseWidth: undefined,
    },
    related: {
        settings: TextSettings,
    },
};
