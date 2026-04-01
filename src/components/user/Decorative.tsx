"use client";
"use no memo";

import { useNode, useEditor } from "@craftjs/core";
import React from "react";
import { Label } from "../ui/label";
import { PrefixInput } from "../ui/prefix-input";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import { RotateCw, RotateCcw, Eye, Droplet } from "lucide-react";
import { AnimationSection, getAnimationVariants } from "./AnimationSection";
import { motion } from "framer-motion";
import { getSpacing, cn } from "@/lib/utils";
import { useCanvasDrag } from "./hooks/useCanvasDrag";
import { useAppContext } from "../editor/AppContext";

export const DecorativeSettings = () => {
    const { actions: { setProp }, src, width, height, rotation, opacity, color, radius } = useNode((node) => ({
        src: node.data.props.src,
        width: node.data.props.width,
        height: node.data.props.height,
        rotation: node.data.props.rotation,
        opacity: node.data.props.opacity,
        color: node.data.props.color,
        radius: node.data.props.radius,
    }));

    const [isConstrained, setIsConstrained] = React.useState(false);
    const [aspectRatio, setAspectRatio] = React.useState(1);

    const toggleConstrain = () => {
        if (!isConstrained) {
            const currentW = typeof width === 'number' ? width : parseFloat(width) || 1;
            const currentH = typeof height === 'number' ? height : (height === "auto" ? currentW : parseFloat(height) || 1);
            setAspectRatio(currentW === 0 || currentH === 0 ? 1 : currentW / currentH);
        }
        setIsConstrained(!isConstrained);
    };

    const handleWidthChange = (newVal: number) => {
        setProp((props: any) => {
            props.width = newVal;
            if (isConstrained) {
                props.height = parseFloat((newVal / aspectRatio).toFixed(2));
            }
        });
    };

    const handleHeightChange = (newVal: number | "auto") => {
        setProp((props: any) => {
            props.height = newVal;
            if (isConstrained && typeof newVal === "number") {
                props.width = parseFloat((newVal * aspectRatio).toFixed(2));
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="font-semibold text-sm">Layout</h3>
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground font-medium">Dimensions</Label>
                    <div className="flex items-center gap-2">
                        <PrefixInput
                            containerClassName="flex-1"
                            prefix="W"
                            value={typeof width === 'number' ? width : (width === 0 ? 0 : (width || "").toString().replace('px', ''))}
                            onChange={(e) => {
                                if (e.target.value === "") {
                                    handleWidthChange(0);
                                } else {
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val)) handleWidthChange(val);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    const currentVal = typeof width === 'number' ? width : (parseFloat(width) || 0);
                                    const step = e.shiftKey ? 10 : 1;
                                    handleWidthChange(Math.max(0, e.key === 'ArrowUp' ? currentVal + step : currentVal - step));
                                }
                            }}
                        />

                        <div className="flex shrink-0 items-center justify-center w-3 h-8 px-1">
                            <svg width="10" height="4" viewBox="0 0 10 4" fill="none" xmlns="http://www.w3.org/2000/svg" className={isConstrained ? "text-zinc-100" : "text-zinc-500"}>
                                <rect x="0" y="1.5" width="10" height="1" fill="currentColor" />
                                <circle cx="1" cy="2" r="1.5" fill="currentColor" />
                                <circle cx="9" cy="2" r="1.5" fill="currentColor" />
                            </svg>
                        </div>

                        <PrefixInput
                            containerClassName="flex-1"
                            prefix="H"
                            value={typeof height === 'number' ? height : (height === "auto" ? "auto" : (height === 0 ? 0 : (height || "").toString().replace('px', '')))}
                            onChange={(e) => {
                                if (e.target.value === "auto") {
                                    handleHeightChange("auto");
                                } else if (e.target.value === "") {
                                    handleHeightChange(0);
                                } else {
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val)) handleHeightChange(val);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    const currentVal = (height === "auto" || !height) ? 0 : (typeof height === 'number' ? height : parseFloat(height));
                                    const step = e.shiftKey ? 10 : 1;
                                    handleHeightChange(Math.max(0, e.key === 'ArrowUp' ? currentVal + step : currentVal - step));
                                }
                            }}
                        />

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                                "h-8 w-8 ml-1 shrink-0 rounded-md border",
                                isConstrained ? "bg-[#4F5B73]/50 text-[#8299C9] border-[#4F5B73]" : "text-[#8299C9] hover:bg-[#4F5B73] hover:text-[#9FB6E8] border-transparent"
                            )}
                            onClick={toggleConstrain}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="m9 15 6-6" /><path d="M9 9h.01" /><path d="M15 15h.01" /></svg>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="h-px bg-zinc-800 w-full" />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Appearance</h3>
                </div>

                <div className="flex gap-3">
                    <div className="flex-1 space-y-1.5">
                        <Label className="text-xs text-muted-foreground font-medium">Opacity</Label>
                        <PrefixInput
                            prefix={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>}
                            value={`${Math.round((opacity || 1) * 100)}%`}
                            onChange={(e) => {
                                const rawVal = e.target.value.replace('%', '');
                                if (rawVal === "") {
                                    setProp((props: any) => (props.opacity = 0));
                                } else {
                                    const val = parseFloat(rawVal);
                                    if (!isNaN(val)) {
                                        setProp((props: any) => (props.opacity = Math.max(0, Math.min(100, val)) / 100));
                                    }
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    const currentVal = Math.round((opacity || 0) * 100);
                                    const step = e.shiftKey ? 10 : 1;
                                    const newVal = Math.max(0, Math.min(100, e.key === 'ArrowUp' ? currentVal + step : currentVal - step));
                                    setProp((props: any) => (props.opacity = newVal / 100));
                                }
                            }}
                        />
                    </div>

                    <div className="flex-1 flex gap-2">
                        <div className="flex-1 space-y-1.5">
                            <Label className="text-xs text-muted-foreground font-medium">Corner radius</Label>
                            <PrefixInput
                                prefix={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15v2a2 2 0 0 0 2 2h2" /><path d="M15 19h2a2 2 0 0 0 2-2v-2" /><path d="M19 9V7a2 2 0 0 0-2-2h-2" /><path d="M9 5H7a2 2 0 0 0-2 2v2" /></svg>}
                                value={radius || 0}
                                onChange={(e) => {
                                    if (e.target.value === "") {
                                        setProp((props: any) => (props.radius = 0));
                                    } else {
                                        const val = parseFloat(e.target.value);
                                        if (!isNaN(val)) setProp((props: any) => (props.radius = val));
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        const currentVal = radius || 0;
                                        const step = e.shiftKey ? 10 : 1;
                                        setProp((props: any) => (props.radius = Math.max(0, e.key === 'ArrowUp' ? currentVal + step : currentVal - step)));
                                    }
                                }}
                            />
                        </div>

                        <div className="flex items-end">
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-zinc-800 text-zinc-400">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 3H3v18h18V3zM3 15h18M9 21V9" /></svg>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-px bg-zinc-800 w-full mb-4" />

            <div className="space-y-3">
                <Label className="text-xs text-muted-foreground font-medium">Rotation</Label>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1 h-8 text-xs bg-zinc-800/80 border-zinc-700/50 hover:bg-zinc-700 text-zinc-300"
                        onClick={() => setProp((p: any) => (p.rotation = ((p.rotation || 0) - 90 + 360) % 360))}
                    >
                        <RotateCcw className="size-3" />
                        -90°
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1 h-8 text-xs bg-zinc-800/80 border-zinc-700/50 hover:bg-zinc-700 text-zinc-300"
                        onClick={() => setProp((p: any) => (p.rotation = ((p.rotation || 0) + 90) % 360))}
                    >
                        <RotateCw className="size-3" />
                        +90°
                    </Button>
                </div>
            </div>

            <AnimationSection />
        </div>
    );
};

export const UserDecorative = ({ src, width, height, rotation, opacity, radius, animationType, animationDuration, animationDelay, top, left }: any) => {
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
                    borderRadius: radius ? `${radius}px` : undefined,
                    overflow: "hidden"
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
        radius: 0,
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
