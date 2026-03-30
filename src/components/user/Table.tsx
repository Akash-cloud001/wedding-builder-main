"use no memo";

import React from "react";
import { useNode } from "@craftjs/core";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useCanvasDrag } from "./hooks/useCanvasDrag";
import { useAppContext } from "../editor/AppContext";

interface TableProps {
    data?: string[][];
    borderColor?: string;
    headerColor?: string;
    top?: number;
    left?: number;
    width?: number | string;
    height?: number | string;
}

const DEFAULT_DATA = [
    ["Header 1", "Header 2", "Header 3"],
    ["Row 1 Col 1", "Row 1 Col 2", "Row 1 Col 3"],
    ["Row 2 Col 1", "Row 2 Col 2", "Row 2 Col 3"],
];

export const UserTable = ({
    data = DEFAULT_DATA,
    borderColor = "#e5e7eb",
    headerColor = "#f3f4f6",
    top = 0,
    left = 0,
    width = 400,
    height = "auto",
}: TableProps) => {
    const { connectors: { connect, drag } } = useNode();
    const { itemStyle } = useCanvasDrag(top, left);
    const { device } = useAppContext();

    const resolvedWidth = typeof width === "number" ? `${width}px` : width;
    const resolvedHeight = typeof height === "number" ? `${height}px` : height;
    const positionStyle = device === "mobile" ? { position: "relative" as const, top: 0, left: 0 } : itemStyle;

    return (
        <div
            ref={(ref: any) => connect(drag(ref))}
            className="overflow-x-auto"
            style={{
                ...positionStyle,
                width: resolvedWidth,
                height: resolvedHeight,
                minHeight: typeof height === "number" ? `${height}px` : 120,
            }}
        >
            <table className="w-full border-collapse h-full" style={{ borderColor }}>
                <thead>
                    <tr style={{ backgroundColor: headerColor }}>
                        {data[0]?.map((cell, i) => (
                            <th key={i} className="p-2 border text-left font-semibold" style={{ borderColor }}>{cell}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.slice(1).map((row, i) => (
                        <tr key={i}>
                            {row.map((cell, j) => (
                                <td key={j} className="p-2 border" style={{ borderColor }}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const TableSettings = () => {
    const { actions: { setProp }, data, borderColor, headerColor } = useNode((node) => ({
        data: node.data.props.data,
        borderColor: node.data.props.borderColor,
        headerColor: node.data.props.headerColor,
    }));

    const rows = data?.length ? data : [[""]];
    const numCols = Math.max(1, rows[0]?.length ?? 1);
    const normalized = rows.map((row: string[]) => [...row, ...Array(Math.max(0, numCols - row.length)).fill("")]);

    const setCell = (rowIndex: number, colIndex: number, value: string) => {
        setProp((props: any) => {
            const next = (props.data || [[]]).map((r: string[]) => [...r]);
            while (next.length <= rowIndex) next.push([]);
            while (next[rowIndex].length <= colIndex) next[rowIndex].push("");
            next[rowIndex][colIndex] = value;
            props.data = next;
        });
    };

    const addColumn = () => {
        setProp((props: any) => {
            const next = (props.data || [[]]).map((r: string[]) => [...r, ""]);
            props.data = next;
        });
    };

    const removeColumn = (colIndex: number) => {
        if (numCols <= 1) return;
        setProp((props: any) => {
            const next = (props.data || [[]]).map((r: string[]) => r.filter((_, j) => j !== colIndex));
            props.data = next;
        });
    };

    const addRow = () => {
        setProp((props: any) => {
            const next = [...(props.data || [[]]), Array(numCols).fill("")];
            props.data = next;
        });
    };

    const removeRow = (rowIndex: number) => {
        if (rows.length <= 1) return;
        setProp((props: any) => {
            const next = (props.data || [[]]).filter((_: string[], i: number) => i !== rowIndex);
            props.data = next;
        });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Border Color</Label>
                <Input type="color" value={borderColor} className="h-10" onChange={(e) => setProp((props: any) => props.borderColor = e.target.value)} />
            </div>

            <div className="space-y-2">
                <Label>Header Background</Label>
                <Input type="color" value={headerColor} className="h-10" onChange={(e) => setProp((props: any) => props.headerColor = e.target.value)} />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>Table data</Label>
                    <div className="flex gap-1">
                        <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={addColumn} title="Add column">
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={addRow} title="Add row">
                            <Plus className="h-4 w-4 rotate-90" />
                        </Button>
                    </div>
                </div>
                <div className="border rounded-md overflow-x-auto max-h-[280px] overflow-y-auto">
                    <div className="inline-block min-w-full">
                        {/* Header row labels */}
                        <div className="grid gap-1 p-2 bg-muted/50 sticky top-0 z-10" style={{ gridTemplateColumns: `repeat(${numCols}, minmax(80px, 1fr)) 24px` }}>
                            {Array.from({ length: numCols }).map((_, colIndex) => (
                                <div key={colIndex} className="flex items-center gap-1">
                                    <Input
                                        className="h-8 text-xs font-medium"
                                        placeholder={`Col ${colIndex + 1}`}
                                        value={normalized[0]?.[colIndex] ?? ""}
                                        onChange={(e) => setCell(0, colIndex, e.target.value)}
                                    />
                                    {numCols > 1 && (
                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeColumn(colIndex)} title="Remove column">
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <div />
                        </div>
                        {/* Body rows */}
                        {normalized.slice(1).map((row: string[], rowIndex: number) => (
                            <div key={rowIndex} className="grid gap-1 p-2 border-t" style={{ gridTemplateColumns: `repeat(${numCols}, minmax(80px, 1fr)) 24px` }}>
                                {row.slice(0, numCols).map((cell: string, colIndex: number) => (
                                    <Input
                                        key={colIndex}
                                        className="h-8 text-xs"
                                        placeholder={`Row ${rowIndex + 1}`}
                                        value={cell}
                                        onChange={(e) => setCell(rowIndex + 1, colIndex, e.target.value)}
                                    />
                                ))}
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeRow(rowIndex + 1)} title="Remove row">
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">First row is the header. Edit cells and use + to add columns or rows.</p>
            </div>
        </div>
    );
};

(UserTable as any).craft = {
    displayName: "Table",
    props: {
        data: DEFAULT_DATA,
        borderColor: "#e5e7eb",
        headerColor: "#f3f4f6",
        top: 0,
        left: 0,
        width: 400,
        height: 200,
    },
    related: {
        settings: TableSettings,
    },
};
