"use client";
"use no memo";

import React from "react";
import { useNode } from "@craftjs/core";
import { motion } from "framer-motion";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { AnimationSection, getAnimationVariants } from "./AnimationSection";
import { useCanvasDrag } from "./hooks/useCanvasDrag";

interface EmojiProps {
    emoji?: string;
    size?: number;
    animationType?: string;
    animationDuration?: number;
    animationDelay?: number;
}

export const UserEmoji = ({
    emoji = "😊",
    size = 48,
    width,
    height,
    animationType,
    animationDuration = 0.5,
    animationDelay = 0,
}: EmojiProps & { width?: number | string; height?: number }) => {
    const { connectors: { connect, drag }, actions: { setProp }, top, left, selected } = useNode((state) => ({
        selected: state.events.selected,
        top: state.data.props.top || 0,
        left: state.data.props.left || 0,
    }));
    const variants = getAnimationVariants(animationType || "none", animationDuration, animationDelay);
    const { itemStyle } = useCanvasDrag(top, left);

    return (
        <motion.div
            ref={(ref: any) => connect(drag(ref))}
            style={{
                display: "inline-block",
                width: typeof width === "number" ? `${width}px` : undefined,
                height: typeof height === "number" ? `${height}px` : undefined,
                ...itemStyle,
            }}
            className={selected ? "ring-2 ring-blue-400 ring-offset-2 rounded" : ""}
            initial={variants.initial}
            animate={variants.animate}
        >
            <div
                style={{ fontSize: `${size}px`, lineHeight: 1 }}
            >
                {emoji}
            </div>
        </motion.div>
    );
};

const EmojiSettings = () => {
    const { actions: { setProp }, emoji, size } = useNode((node) => ({
        emoji: node.data.props.emoji,
        size: node.data.props.size,
    }));

    const COMMON_EMOJIS = ["😊", "🎉", "❤️", "👰", "🤵", "💍", "🎂", "🥂", "💒", "💐"];

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Select Emoji</Label>
                <div className="grid grid-cols-5 gap-2">
                    {COMMON_EMOJIS.map(e => (
                        <button
                            key={e}
                            className={`p-2 text-xl border rounded hover:bg-gray-100 ${emoji === e ? 'bg-blue-100 border-blue-500' : ''}`}
                            onClick={() => setProp((props: any) => props.emoji = e)}
                        >
                            {e}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <Label>Size: {size}px</Label>
                <Slider
                    defaultValue={[size]}
                    max={200}
                    step={1}
                    onValueChange={(val) => setProp((props: any) => props.size = val[0])}
                />
            </div>

            <AnimationSection />
        </div>
    );
};

(UserEmoji as any).craft = {
    displayName: "Emoji",
    props: {
        emoji: "😊",
        size: 48,
        width: undefined,
        height: undefined,
        top: 0,
        left: 0,
        animationType: "none",
        animationDuration: 0.5,
        animationDelay: 0,
    },
    related: {
        settings: EmojiSettings,
    },
};
