"use client";
"use no memo";

import { useNode, useEditor } from "@craftjs/core";
import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import { RotateCw, RotateCcw } from "lucide-react";
import { AnimationSection, getAnimationVariants } from "./AnimationSection";
import { motion } from "framer-motion";
import { getSpacing, cn } from "@/lib/utils";
import { useCanvasDrag } from "./hooks/useCanvasDrag";
import { useAppContext } from "../editor/AppContext";

const OBJECT_FIT_OPTIONS = [
    { value: "fill", label: "Fill" },
    { value: "contain", label: "Contain" },
    { value: "cover", label: "Cover" },
    { value: "none", label: "None" },
    { value: "scale-down", label: "Scale down" },
] as const;

const CROP_OBJECT_FITS = ["fill", "cover"];

export const ImageSettings = () => {
    const { actions: { setProp }, src, width, height, background, borderRadius, minHeight, animationType, animationDuration, animationDelay, objectFit, objectPositionX, objectPositionY, rotation } = useNode((node) => ({
        src: node.data.props.src,
        width: node.data.props.width,
        height: node.data.props.height,
        background: node.data.props.background,
        borderRadius: node.data.props.borderRadius,
        minHeight: node.data.props.minHeight,
        animationType: node.data.props.animationType,
        animationDuration: node.data.props.animationDuration,
        animationDelay: node.data.props.animationDelay,
        objectFit: node.data.props.objectFit,
        objectPositionX: node.data.props.objectPositionX,
        objectPositionY: node.data.props.objectPositionY,
        rotation: node.data.props.rotation,
    }));

    const showFocalPoint = CROP_OBJECT_FITS.includes(objectFit || "");
    const posX = typeof objectPositionX === "number" ? objectPositionX : 50;
    const posY = typeof objectPositionY === "number" ? objectPositionY : 50;

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Image URL</Label>
                {(() => {
                    const isUpload =
                        typeof src === "string" &&
                        (src.startsWith("blob:") || src.startsWith("data:"));

                    return (
                        <>
                            <Input
                                value={isUpload ? "" : (src || "")}
                                placeholder="https://..."
                                onChange={(e) =>
                                    setProp((props: any) => {
                                        props.src = e.target.value;
                                    })
                                }
                            />
                            {isUpload && (
                                <p className="text-[10px] text-gray-400">
                                    Using uploaded image. Enter a URL to replace it.
                                </p>
                            )}
                        </>
                    );
                })()}
            </div>

            <div className="space-y-2">
                <Label>Upload Image</Label>
                <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        // Revoke previous blob URL to prevent memory leak
                        if (typeof src === "string" && src.startsWith("blob:")) {
                            URL.revokeObjectURL(src);
                        }
                        const objectUrl = URL.createObjectURL(file);
                        setProp((props: any) => {
                            props.src = objectUrl;
                        });
                    }}
                />
            </div>

            <div className="space-y-2">
                <Label>Object fit</Label>
                <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={objectFit || "contain"}
                    onChange={(e) => setProp((props: any) => props.objectFit = e.target.value)}
                >
                    {OBJECT_FIT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {showFocalPoint && (
                <div className="space-y-3 pt-2 border-t">
                    <Label className="text-sm font-medium">Focal point</Label>
                    <p className="text-xs text-muted-foreground">Move the visible area when using Fill or Cover.</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Horizontal</Label>
                            <Slider
                                value={[posX]}
                                min={0}
                                max={100}
                                step={1}
                                onValueChange={(val) => setProp((props: any) => (props.objectPositionX = val[0]))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Vertical</Label>
                            <Slider
                                value={[posY]}
                                min={0}
                                max={100}
                                step={1}
                                onValueChange={(val) => setProp((props: any) => (props.objectPositionY = val[0]))}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3 pt-4 border-t">
                <Label className="text-sm font-medium">Rotate</Label>
                <p className="text-xs text-muted-foreground">Turn the image left or right.</p>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => setProp((p: any) => (p.rotation = ((typeof p.rotation === "number" ? p.rotation : 0) - 90 + 360) % 360))}
                    >
                        <RotateCcw className="size-4" />
                        Rotate left
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => setProp((p: any) => (p.rotation = ((typeof p.rotation === "number" ? p.rotation : 0) + 90) % 360))}
                    >
                        <RotateCw className="size-4" />
                        Rotate right
                    </Button>
                </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
                <Label>Background Color</Label>
                <div className="flex gap-2">
                    <Input
                        type="color"
                        value={background && background !== "transparent" ? background : "#ffffff"}
                        className="w-8 h-8 p-1 border-none"
                        onChange={(e) => setProp((props: any) => (props.background = e.target.value))}
                    />
                    <Input
                        value={background || ""}
                        placeholder="transparent or #hex"
                        onChange={(e) => setProp((props: any) => (props.background = e.target.value))}
                        className="h-8 flex-1"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Border Radius: {borderRadius || 0}px</Label>
                <Slider
                    defaultValue={[borderRadius || 0]}
                    max={64}
                    step={1}
                    onValueChange={(val) => setProp((props: any) => props.borderRadius = val[0])}
                />
            </div>

            <AnimationSection />
        </div>
    );
};

export const UserImage = ({ src, width, height, padding, margin, background, borderRadius, minHeight, animationType, animationDuration, animationDelay, align, top, left, grayscale, objectFit, objectPositionX, objectPositionY, rotation }: any): React.JSX.Element => {
    const { connectors: { connect, drag }, selected, actions: { setProp } } = useNode((state) => ({
        selected: state.events.selected,
    }));

    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled
    }));

    const { device } = useAppContext();

    const { itemStyle } = useCanvasDrag(top, left);

    // Adjust width for mobile - ensure it doesn't exceed container (mirror Video)
    const responsiveWidth = device === "mobile" && width && typeof width === "string" && width.includes("px")
        ? "100%"
        : (typeof width === 'number' ? `${width}px` : (width || "100%"));

    const variants = getAnimationVariants(animationType, animationDuration, animationDelay);

    const isImageUrl = !!src && (
        typeof src === "string" &&
        (src.startsWith("http") || src.startsWith("data:") || src.startsWith("blob:") || src.startsWith("/"))
    );

    const getJustifyContent = () => {
        switch (align) {
            case "left": return "flex-start";
            case "right": return "flex-end";
            case "center":
            default: return "center";
        }
    };

    return (
        <motion.div
            ref={(ref: any) => connect(drag(ref))}
            style={{
                width: responsiveWidth,
                maxWidth: device === "mobile" ? "100%" : undefined,
                height: typeof height === 'number' ? `${height}px` : (height || "auto"),
                minHeight: typeof minHeight === 'number' ? `${minHeight}px` : (minHeight || "auto"),
                padding: getSpacing(padding),
                margin: getSpacing(margin),
                backgroundColor: background,
                borderRadius: `${borderRadius}px`,
                display: "flex",
                justifyContent: getJustifyContent(),
                alignSelf: getJustifyContent(),
                zIndex: 0, // Keep media below text (z-index 1) when selected, matching Video layering
                ...(device === "mobile" ? { position: "relative", top: 0, left: 0 } : itemStyle),
            }}
            initial="initial"
            animate="animate"
            variants={variants as any}
        >
            <div style={{
                width: "100%",
                height: "100%",
                maxWidth: device === "mobile" ? "100%" : (responsiveWidth === "100%" ? "100%" : responsiveWidth),
                overflow: "hidden",
                borderRadius: `${borderRadius}px`,
            }}>
                {isImageUrl ? (
                    <img
                        src={src}
                        alt="User Image"
                        className={cn("w-full h-full", enabled && "pointer-events-none")}
                        style={{
                            borderRadius: `${borderRadius}px`,
                            filter: grayscale ? "grayscale(100%)" : "none",
                            transform: typeof rotation === "number" && rotation ? `rotate(${rotation}deg)` : undefined,
                            objectFit: objectFit || "contain",
                            objectPosition: `${typeof objectPositionX === "number" ? objectPositionX : 50}% ${typeof objectPositionY === "number" ? objectPositionY : 50}%`,
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 min-h-[200px] rounded-md">
                        Enter an Image URL or upload an image
                    </div>
                )}
            </div>
        </motion.div>
    );
};

UserImage.craft = {
    displayName: "Image",
    props: {
        src: "",
        width: "400px",
        height: "300px",
        padding: 0,
        margin: 0,
        background: "transparent",
        minHeight: "auto",
        borderRadius: 0,
        animationType: "none",
        animationDuration: 0.5,
        animationDelay: 0,
        align: "center",
        top: 0,
        left: 0,
        grayscale: false,
        objectFit: "contain",
        objectPositionX: 50,
        objectPositionY: 50,
        rotation: 0,
    },
    related: {
        settings: ImageSettings,
    },
};
