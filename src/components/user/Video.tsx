"use client";
"use no memo";

import { useNode, useEditor } from "@craftjs/core";
import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Slider } from "../ui/slider";
import { AnimationSection, getAnimationVariants } from "./AnimationSection";
import { motion } from "framer-motion";
import { getSpacing, cn } from "@/lib/utils";
import { useCanvasDrag } from "./hooks/useCanvasDrag";
import { useAppContext } from "../editor/AppContext";

export const VideoSettings = () => {
    const { actions: { setProp }, url, width, height, background, borderRadius, minHeight, autoplay, loop, controls, animationType, animationDuration, animationDelay } = useNode((node) => ({
        url: node.data.props.url,
        width: node.data.props.width,
        height: node.data.props.height,
        background: node.data.props.background,
        borderRadius: node.data.props.borderRadius,
        minHeight: node.data.props.minHeight,
        autoplay: node.data.props.autoplay,
        loop: node.data.props.loop,
        controls: node.data.props.controls,
        animationType: node.data.props.animationType,
        animationDuration: node.data.props.animationDuration,
        animationDelay: node.data.props.animationDelay,
    }));

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Video URL (YouTube, Vimeo, or Direct .mp4)</Label>
                {(() => {
                    const isUpload =
                        typeof url === "string" &&
                        (url.startsWith("blob:") || url.startsWith("data:video"));

                    return (
                        <>
                            <Input
                                value={isUpload ? "" : (url || "")}
                                placeholder="https://..."
                                onChange={(e) =>
                                    setProp((props: any) => {
                                        props.url = e.target.value;
                                    })
                                }
                            />
                            {isUpload && (
                                <p className="text-[10px] text-gray-400">
                                    Using uploaded video. Enter a URL to replace it.
                                </p>
                            )}
                        </>
                    );
                })()}
            </div>

            <div className="space-y-2">
                <Label>Upload Video</Label>
                <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        // Revoke previous blob URL to prevent memory leak
                        if (typeof url === "string" && url.startsWith("blob:")) {
                            URL.revokeObjectURL(url);
                        }
                        const objectUrl = URL.createObjectURL(file);
                        setProp((props: any) => {
                            props.url = objectUrl;
                        });
                    }}
                />
            </div>

            <div className="flex items-center justify-between">
                <Label>Autoplay</Label>
                <Switch
                    checked={autoplay}
                    onCheckedChange={(val) => setProp((props: any) => props.autoplay = val)}
                />
            </div>

            <div className="flex items-center justify-between">
                <Label>Loop</Label>
                <Switch
                    checked={loop}
                    onCheckedChange={(val) => setProp((props: any) => props.loop = val)}
                />
            </div>

            <div className="flex items-center justify-between">
                <Label>Controls</Label>
                <Switch
                    checked={controls}
                    onCheckedChange={(val) => setProp((props: any) => props.controls = val)}
                />
            </div>

            <div className="space-y-2 pt-4 border-t">
                <Label>Background Color</Label>
                <div className="flex gap-2">
                    <Input
                        type="color"
                        value={background && background !== "transparent" ? background : "#000000"}
                        className="w-8 h-8 p-1 border-none"
                        onChange={(e) => setProp((props: any) => (props.background = e.target.value))}
                    />
                    <Input
                        value={background || ""}
                        placeholder="#000000 or transparent"
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

export const UserVideo = ({ url, width, height, padding, margin, background, borderRadius, minHeight, autoplay, loop, controls, animationType, animationDuration, animationDelay, align, top, left }: any): React.JSX.Element => {
    const { connectors: { connect, drag }, selected, actions: { setProp } } = useNode((state) => ({
        selected: state.events.selected,
    }));

    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled
    }));

    const { device } = useAppContext();

    const { itemStyle } = useCanvasDrag(top, left);

    // Adjust width for mobile - ensure it doesn't exceed container
    const responsiveWidth = device === "mobile" && width && typeof width === "string" && width.includes("px")
        ? "100%"
        : (typeof width === 'number' ? `${width}px` : (width || "100%"));

    const getEmbedUrl = (url: string) => {
        if (!url) return "";

        // If this is an inline data: video URL from an upload,
        // we want to use the <video> tag instead of an iframe.
        if (url.startsWith("data:video")) {
            return "";
        }
        
        // Robust YouTube Parser
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        if (ytMatch && ytMatch[1]) {
            return `https://www.youtube.com/embed/${ytMatch[1]}`;
        }

        // Robust Vimeo Parser (Handles channels, groups, and standard links)
        // Extracts the numeric ID safely
        const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
        if (vimeoMatch && vimeoMatch[1]) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }
        
        return url;
    }

    const embedUrl = getEmbedUrl(url);
    const variants = getAnimationVariants(animationType, animationDuration, animationDelay);

    const isVideoFile =
        !!url &&
        (
            url.toLowerCase().endsWith(".mp4") ||
            url.toLowerCase().endsWith(".webm") ||
            url.startsWith("data:video") ||
            url.startsWith("blob:")
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
                zIndex: 0, // Keep media below text (z-index 1) when selected, consistent with Image
                ...(device === "mobile" ? { position: "relative", top: 0, left: 0 } : itemStyle),
            }}
            initial="initial"
            animate="animate"
            variants={variants as any}
        >
            <div style={{ 
                width: "100%", 
                height: "100%", 
                aspectRatio: "16/9", 
                maxWidth: device === "mobile" ? "100%" : (responsiveWidth === "100%" ? "100%" : responsiveWidth)
            }}>
                {isVideoFile ? (
                    <video
                        src={url}
                        className={cn("w-full h-full object-cover", enabled && "pointer-events-none")}
                        autoPlay={autoplay}
                        loop={loop}
                        controls={controls}
                        muted={autoplay} // Autoplay usually requires muted
                        style={{ borderRadius: `${borderRadius}px` }}
                    />
                ) : embedUrl ? (
                    <iframe
                        src={embedUrl}
                        className={cn("w-full h-full", enabled && "pointer-events-none")}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ borderRadius: `${borderRadius}px` }}
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 aspect-video rounded-md">
                        Enter a Video URL (YouTube, Vimeo, or .mp4)
                    </div>
                )}
            </div>
        </motion.div>
    );
};

UserVideo.craft = {
    displayName: "Video",
    props: {
        url: "",
        width: "400px",
        height: "300px",
        padding: 0,
        margin: 0,
        background: "transparent",
        minHeight: "auto",
        borderRadius: 0,
        autoplay: false,
        loop: false,
        controls: true,
        animationType: "none",
        animationDuration: 0.5,
        animationDelay: 0,
        align: "center",
        top: 0,
        left: 0,
    },
    related: {
        settings: VideoSettings,
    },
};
