"use client";

import React from "react";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";


interface SpacingControlProps {
    label: string;
    value: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    } | number;
    onChange: (value: { top: number; right: number; bottom: number; left: number }) => void;
}

export const SpacingControl = ({ label, value, onChange }: SpacingControlProps) => {
    // Normalise value to object
    const values = typeof value === "number"
        ? { top: value, right: value, bottom: value, left: value }
        : value || { top: 0, right: 0, bottom: 0, left: 0 };

    const handleChange = (side: keyof typeof values, val: string) => {
        const numVal = parseInt(val) || 0;
        onChange({ ...values, [side]: numVal });
    };

    return (
        <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-gray-500">{label}</Label>
            <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-4">T</span>
                    <Input
                        type="number"
                        value={values.top}
                        onChange={(e) => handleChange("top", e.target.value)}
                        className="h-8 text-xs"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-4">R</span>
                    <Input
                        type="number"
                        value={values.right}
                        onChange={(e) => handleChange("right", e.target.value)}
                        className="h-8 text-xs"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-4">B</span>
                    <Input
                        type="number"
                        value={values.bottom}
                        onChange={(e) => handleChange("bottom", e.target.value)}
                        className="h-8 text-xs"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-4">L</span>
                    <Input
                        type="number"
                        value={values.left}
                        onChange={(e) => handleChange("left", e.target.value)}
                        className="h-8 text-xs"
                    />
                </div>
            </div>
        </div>
    );
};
