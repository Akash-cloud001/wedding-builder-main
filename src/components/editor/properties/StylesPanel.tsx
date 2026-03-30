"use client";
"use no memo";

import React from "react";
import { useNode } from "@craftjs/core";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Slider } from "../../ui/slider";

type StylesPanelProps = {
    /** When true, hides the Min Height and Width dimension inputs */
    hideDimensions?: boolean;
};

export const StylesPanel = ({ hideDimensions }: StylesPanelProps) => {
    const { actions: { setProp }, width, minHeight, background, borderRadius } = useNode((node) => ({
        width: node.data.props.width,
        minHeight: node.data.props.minHeight,
        background: node.data.props.background,
        borderRadius: node.data.props.borderRadius,
    }));

    return (
        <div className="space-y-4 border-t pt-4 mt-4">
            <Label className="text-gray-500 font-bold uppercase text-xs tracking-wider">Layout & Style</Label>

            {/* Dimensions */}
            {!hideDimensions && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-400">Min Height</Label>
                            <Input
                                value={minHeight || ""}
                                placeholder="e.g. 100px"
                                onChange={(e) => setProp((props: any) => props.minHeight = e.target.value)}
                                className="h-8"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-400">Width</Label>
                            <Input
                                value={width || ""}
                                placeholder="e.g. 100%"
                                onChange={(e) => setProp((props: any) => props.width = e.target.value)}
                                className="h-8"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Appearance */}
            <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex gap-2">
                    <Input
                        type="color"
                        value={background && background !== "transparent" ? background : "#ffffff"}
                        className="w-8 h-8 p-1 border-none"
                        onChange={(e) => setProp((props: any) => props.background = e.target.value)}
                    />
                    <Input
                        value={background || ""}
                        placeholder="#ffffff"
                        onChange={(e) => setProp((props: any) => props.background = e.target.value)}
                        className="h-8"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Border Radius: {borderRadius || 0}px</Label>
                <Slider
                    defaultValue={[borderRadius || 0]}
                    max={100}
                    step={1}
                    onValueChange={(val) => setProp((props: any) => props.borderRadius = val[0])}
                />
            </div>
        </div>
    );
};
