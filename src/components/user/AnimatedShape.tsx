"use no memo";

import React from "react";
import { useNode } from "@craftjs/core";
import { motion } from "framer-motion";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { AnimationSection, getAnimationVariants } from "./AnimationSection";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Circle, Square, Triangle, Star, Heart, Hexagon, ArrowRight, Minus, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useCanvasDrag } from "./hooks/useCanvasDrag";

interface AnimatedShapeProps {
    width?: number;
    height?: number;
    backgroundColor?: string;
    shapeType?: "rectangle" | "circle" | "rounded" | "line" | "arrow" | "triangle" | "star" | "heart" | "hexagon";
    animationType?: string;
    animationDuration?: number;
    animationDelay?: number;
    loopAnimation?: "none" | "rotate" | "pulse" | "bounce";
}

export const UserAnimatedShape = ({
    width = 100,
    height = 100,
    backgroundColor = "#3b82f6",
    shapeType = "rectangle",
    animationType,
    animationDuration = 0.5,
    animationDelay = 0,
    loopAnimation = "none",
    align,
    top,
    left,
    positionType
}: any) => {
    const { connectors: { connect, drag }, selected, actions: { setProp } } = useNode((state) => ({
        selected: state.events.selected,
    }));

    const { isCanvas, itemStyle } = useCanvasDrag(top, left);

    const isFree = isCanvas || positionType === "absolute";

    const entryVariants = getAnimationVariants(animationType || "none", animationDuration, animationDelay);

    const loopVariants = {
        rotate: { rotate: 360, transition: { duration: 2, repeat: Infinity, ease: "linear" } },
        pulse: { scale: [1, 1.1, 1], transition: { duration: 1.5, repeat: Infinity } },
        bounce: { y: [0, -20, 0], transition: { duration: 1, repeat: Infinity } },
        none: {}
    };

    const combinedAnimate = {
        ...(entryVariants.animate || {}),
        ...(loopAnimation !== "none" ? (loopVariants as any)[loopAnimation] : {})
    };

    const renderShape = () => {
        const iconProps = {
            className: "w-full h-full",
            strokeWidth: 0,
            fill: backgroundColor,
            color: backgroundColor
        };

        const strokeProps = {
            className: "w-full h-full",
            strokeWidth: 4,
            color: backgroundColor
        };

        switch (shapeType) {
            case "rectangle":
                return <div style={{ width: "100%", height: "100%", backgroundColor }} />;
            case "rounded":
                return <div style={{ width: "100%", height: "100%", backgroundColor, borderRadius: "12px" }} />;
            case "circle":
                return <div style={{ width: "100%", height: "100%", backgroundColor, borderRadius: "50%" }} />;

            // Shapes from Lucide Library
            case "line":
                // Use a div for the line to allow width/height control (Thickness = height, Length = width)
                return <div style={{ width: "100%", height: "100%", backgroundColor, borderRadius: "50px" }} />;
            case "arrow":
                return <ArrowRight {...strokeProps} strokeWidth={2} />;
            case "triangle":
                return <Triangle {...iconProps} />;
            case "star":
                return <Star {...iconProps} />;
            case "heart":
                return <Heart {...iconProps} />;
            case "hexagon":
                return <Hexagon {...iconProps} />;

            default:
                return <div style={{ width: "100%", height: "100%", backgroundColor }} />;
        }
    };

    return (
        <motion.div
            ref={(ref: any) => connect(drag(ref))}
            style={{
                display: "inline-block",
                width: `${width}px`,
                height: `${height}px`,
                position: isFree ? "absolute" : "relative",
                ...itemStyle,
                // Use alignSelf to position the component itself within the parent flex container
                alignSelf: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
                zIndex: selected ? 10 : 1, // Bring to front when selected
                transform: selected ? "translateZ(10px)" : "none" // Subtle lift
            }}
            className={`${selected ? "ring-2 ring-blue-500" : ""}`}
        >
            <motion.div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
                initial={entryVariants.initial}
                animate={combinedAnimate}
            >
                {renderShape()}
            </motion.div>
        </motion.div>
    );
};

const AnimatedShapeSettings = () => {
    const { actions: { setProp }, width, height, backgroundColor, shapeType, loopAnimation, align, positionType } = useNode((node) => ({
        width: node.data.props.width,
        height: node.data.props.height,
        backgroundColor: node.data.props.backgroundColor,
        shapeType: node.data.props.shapeType,
        loopAnimation: node.data.props.loopAnimation,
        align: node.data.props.align,
        positionType: node.data.props.positionType,
    }));

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Shape Type</Label>
                <div className="grid grid-cols-4 gap-2">
                    <button className={`p-2 border rounded ${shapeType === 'rectangle' ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'}`} onClick={() => setProp((props: any) => { props.shapeType = "rectangle"; props.height = 100; })} title="Rectangle"><Square className="h-4 w-4" /></button>
                    <button className={`p-2 border rounded ${shapeType === 'rounded' ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'}`} onClick={() => setProp((props: any) => { props.shapeType = "rounded"; props.height = 100; })} title="Rounded"><Square className="h-4 w-4 rounded-md" /></button>
                    <button className={`p-2 border rounded ${shapeType === 'circle' ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'}`} onClick={() => setProp((props: any) => { props.shapeType = "circle"; props.height = 100; })} title="Circle"><Circle className="h-4 w-4" /></button>
                    <button className={`p-2 border rounded ${shapeType === 'triangle' ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'}`} onClick={() => setProp((props: any) => { props.shapeType = "triangle"; props.height = 100; })} title="Triangle"><Triangle className="h-4 w-4" /></button>
                    <button className={`p-2 border rounded ${shapeType === 'star' ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'}`} onClick={() => setProp((props: any) => { props.shapeType = "star"; props.height = 100; })} title="Star"><Star className="h-4 w-4" /></button>
                    <button className={`p-2 border rounded ${shapeType === 'heart' ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'}`} onClick={() => setProp((props: any) => { props.shapeType = "heart"; props.height = 100; })} title="Heart"><Heart className="h-4 w-4" /></button>
                    <button className={`p-2 border rounded ${shapeType === 'arrow' ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'}`} onClick={() => setProp((props: any) => { props.shapeType = "arrow"; props.height = 100; })} title="Arrow"><ArrowRight className="h-4 w-4" /></button>
                    <button className={`p-2 border rounded ${shapeType === 'line' ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'}`} onClick={() => setProp((props: any) => { props.shapeType = "line"; props.height = 4; })} title="Line"><Minus className="h-4 w-4" /></button>
                    <button className={`p-2 border rounded ${shapeType === 'hexagon' ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'}`} onClick={() => setProp((props: any) => { props.shapeType = "hexagon"; props.height = 100; })} title="Hexagon"><Hexagon className="h-4 w-4" /></button>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <Label>Movement Mode</Label>
                <ToggleGroup type="single" value={positionType || "relative"} onValueChange={(val) => val && setProp((props: any) => props.positionType = val)}>
                    <ToggleGroupItem value="relative" className="text-xs px-2">Auto-Layout</ToggleGroupItem>
                    <ToggleGroupItem value="absolute" className="text-xs px-2">Free Movement</ToggleGroupItem>
                </ToggleGroup>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <Label>Alignment</Label>
                <ToggleGroup type="single" value={align || "center"} onValueChange={(val) => val && setProp((props: any) => props.align = val)}>
                    <ToggleGroupItem value="left" aria-label="Align Left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
                    <ToggleGroupItem value="center" aria-label="Align Center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
                    <ToggleGroupItem value="right" aria-label="Align Right"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
                </ToggleGroup>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                <div className="space-y-2">
                    <Label>Width</Label>
                    <Slider defaultValue={[width]} max={500} step={1} onValueChange={(val) => setProp((props: any) => props.width = val[0])} />
                </div>
                <div className="space-y-2">
                    <Label>{shapeType === 'line' ? "Thickness" : "Height"}</Label>
                    <Slider defaultValue={[height]} max={500} step={1} onValueChange={(val) => setProp((props: any) => props.height = val[0])} />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                    <Input
                        type="color"
                        value={backgroundColor && backgroundColor.startsWith("#") ? backgroundColor : "#3b82f6"}
                        className="w-10 h-10 p-1"
                        onChange={(e) => setProp((props: any) => props.backgroundColor = e.target.value)}
                    />
                    <Input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setProp((props: any) => props.backgroundColor = e.target.value)}
                        placeholder="#hex or color name"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Loop Animation</Label>
                <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={loopAnimation || "none"}
                    onChange={(e) => setProp((props: any) => props.loopAnimation = e.target.value)}
                >
                    <option value="none">None</option>
                    <option value="rotate">Rotate</option>
                    <option value="pulse">Pulse</option>
                    <option value="bounce">Bounce</option>
                </select>
            </div>

            <AnimationSection />
        </div>
    );
};

(UserAnimatedShape as any).craft = {
    displayName: "Animated Shape",
    props: {
        width: 100,
        height: 100,
        backgroundColor: "#3b82f6",
        shapeType: "rectangle",
        animationType: "none",
        animationDuration: 0.5,
        animationDelay: 0,
        loopAnimation: "none",
        top: 0,
        left: 0,
        align: "center",
        positionType: "relative"
    },
    related: {
        settings: AnimatedShapeSettings,
    },
};
