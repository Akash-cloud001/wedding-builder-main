"use client";
"use no memo";

import { useNode } from "@craftjs/core";
import React from "react";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Activity, MoveHorizontal, MoveVertical, Zap } from "lucide-react";

export const AnimationSection = () => {
    const { actions: { setProp }, animationType, animationDuration, animationDelay } = useNode((node) => ({
        animationType: node.data.props.animationType,
        animationDuration: node.data.props.animationDuration,
        animationDelay: node.data.props.animationDelay,
    }));

    return (
        <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-medium text-sm flex items-center"><Zap className="w-4 h-4 mr-2" /> Animation</h4>

            <div className="space-y-2">
                <Label>Type</Label>
                <ToggleGroup type="single" value={animationType || "none"} onValueChange={(val) => val && setProp((props: any) => props.animationType = val)}>
                    <ToggleGroupItem value="none" aria-label="None">None</ToggleGroupItem>
                    <ToggleGroupItem value="fade" aria-label="Fade">Fade</ToggleGroupItem>
                    <ToggleGroupItem value="slide-up" aria-label="Slide Up"><MoveVertical className="h-4 w-4" /></ToggleGroupItem>
                    <ToggleGroupItem value="slide-in" aria-label="Slide In"><MoveHorizontal className="h-4 w-4" /></ToggleGroupItem>
                    <ToggleGroupItem value="scale" aria-label="Scale"><Activity className="h-4 w-4" /></ToggleGroupItem>
                </ToggleGroup>
            </div>

            {animationType && animationType !== "none" && (
                <>
                    <div className="space-y-2">
                        <Label>Duration: {animationDuration}s</Label>
                        <Slider
                            defaultValue={[animationDuration || 0.5]}
                            max={3}
                            step={0.1}
                            onValueChange={(val) => setProp((props: any) => props.animationDuration = val[0])}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Delay: {animationDelay}s</Label>
                        <Slider
                            defaultValue={[animationDelay || 0]}
                            max={2}
                            step={0.1}
                            onValueChange={(val) => setProp((props: any) => props.animationDelay = val[0])}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export const getAnimationVariants = (type: string, duration: number, delay: number) => {
    const transition = { duration, delay };
    switch (type) {
        case "fade":
            return {
                initial: { opacity: 0 },
                animate: { opacity: 1, transition }
            };
        case "slide-up":
            return {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0, transition }
            };
        case "slide-in":
            return {
                initial: { opacity: 0, x: -20 },
                animate: { opacity: 1, x: 0, transition }
            };
        case "scale":
            return {
                initial: { opacity: 0, scale: 0.8 },
                animate: { opacity: 1, scale: 1, transition }
            };
        default:
            return {};
    }
};
