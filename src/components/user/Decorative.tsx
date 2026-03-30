"use client";
"use no memo";

import { useNode, useEditor } from "@craftjs/core";
import React from "react";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import { RotateCw, RotateCcw } from "lucide-react";
import { AnimationSection, getAnimationVariants } from "./AnimationSection";
import { motion } from "framer-motion";
import { getSpacing, cn } from "@/lib/utils";
import { useCanvasDrag } from "./hooks/useCanvasDrag";
import { useAppContext } from "../editor/AppContext";

export const DecorativeSettings = () => {
    const { actions: { setProp }, src, width, height, rotation, opacity, color } = useNode((node) => ({
        src: node.data.props.src,
        width: node.data.props.width,
        height: node.data.props.height,
        rotation: node.data.props.rotation,
        opacity: node.data.props.opacity,
        color: node.data.props.color,
    }));

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Width: {typeof width === 'number' ? width : parseInt(width)}px</Label>
                <Slider
                    value={[typeof width === 'number' ? width : parseInt(width) || 100]}
                    max={1000}
                    step={1}
                    onValueChange={(val) => setProp((props: any) => (props.width = val[0]))}
                />
            </div>

            <div className="space-y-2">
                <Label>Height: {typeof height === 'number' ? height : (height === "auto" ? "Auto" : parseInt(height))}px</Label>
                <Slider
                    value={[typeof height === 'number' ? height : (height === "auto" ? 0 : parseInt(height))]}
                    max={1000}
                    step={1}
                    onValueChange={(val) => setProp((props: any) => (props.height = val[0] === 0 ? "auto" : val[0]))}
                />
            </div>

            <div className="space-y-2 text-xs text-muted-foreground italic">
                Tip: Set height to 0 for "Auto" aspect ratio.
            </div>

            <div className="space-y-2">
                <Label>Opacity: {Math.round((opacity || 1) * 100)}%</Label>
                <Slider
                    value={[(opacity || 1) * 100]}
                    max={100}
                    step={1}
                    onValueChange={(val) => setProp((props: any) => (props.opacity = val[0] / 100))}
                />
            </div>

            <div className="space-y-3 pt-4 border-t">
                <Label className="text-sm font-medium">Rotation</Label>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => setProp((p: any) => (p.rotation = ((p.rotation || 0) - 90 + 360) % 360))}
                    >
                        <RotateCcw className="size-4" />
                        -90°
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => setProp((p: any) => (p.rotation = ((p.rotation || 0) + 90) % 360))}
                    >
                        <RotateCw className="size-4" />
                        +90°
                    </Button>
                </div>
            </div>

            <AnimationSection />
        </div>
    );
};

export const UserDecorative = ({ src, width, height, rotation, opacity, animationType, animationDuration, animationDelay, top, left }: any) => {
    const { connectors: { connect, drag } } = useNode();
    const { device } = useAppContext();
    const { itemStyle } = useCanvasDrag(top, left);

    const variants = getAnimationVariants(animationType, animationDuration, animationDelay);

    const styleWidth = typeof width === 'number' ? `${width}px` : width;
    const styleHeight = typeof height === 'number' ? `${height}px` : height;

    return (
        <motion.div
            ref={(ref: any) => connect(drag(ref))}
            style={{
                width: styleWidth,
                height: styleHeight,
                opacity: opacity || 1,
                zIndex: 0,
                ...(device === "mobile" ? { position: "relative", top: 0, left: 0 } : itemStyle),
            }}
            initial="initial"
            animate="animate"
            variants={variants as any}
        >
            <img
                src={src}
                alt="Decorative"
                style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    transform: rotation ? `rotate(${rotation}deg)` : undefined,
                    pointerEvents: "none",
                }}
            />
        </motion.div>
    );
};

UserDecorative.craft = {
    displayName: "Decorative",
    props: {
        src: "",
        width: 200,
        height: "auto",
        rotation: 0,
        opacity: 1,
        animationType: "none",
        animationDuration: 0.5,
        animationDelay: 0,
        top: 0,
        left: 0,
    },
    related: {
        settings: DecorativeSettings,
    },
};
