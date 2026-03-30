"use no memo";

import React from "react";
import { useNode } from "@craftjs/core";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useCanvasDrag } from "./hooks/useCanvasDrag";
import { useAppContext } from "../editor/AppContext";

interface ChartProps {
    type?: "bar" | "line" | "pie";
    data?: any[];
    width?: number | string;
    height?: number | string;
    color?: string;
    top?: number;
    left?: number;
}

const DEFAULT_DATA = [
    { name: 'A', value: 400 },
    { name: 'B', value: 300 },
    { name: 'C', value: 300 },
    { name: 'D', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const UserChart = ({
    type = "bar",
    data = DEFAULT_DATA,
    width = 400,
    height = 300,
    color = "#8884d8",
    top = 0,
    left = 0,
}: ChartProps) => {
    const { connectors: { connect, drag } } = useNode();
    const { itemStyle } = useCanvasDrag(top, left);
    const { device } = useAppContext();

    const resolvedWidth = typeof width === "number" ? `${width}px` : width;
    const resolvedHeight = typeof height === "number" ? `${height}px` : height;
    const positionStyle = device === "mobile" ? { position: "relative" as const, top: 0, left: 0 } : itemStyle;

    const renderChart = () => {
        switch (type) {
            case "line":
                return (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke={color} activeDot={{ r: 8 }} />
                    </LineChart>
                );
            case "pie":
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                );
            case "bar":
            default:
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill={color} />
                    </BarChart>
                );
        }
    };

    return (
        <div
            ref={(ref: any) => connect(drag(ref))}
            style={{
                ...positionStyle,
                width: resolvedWidth,
                height: resolvedHeight,
                minHeight: typeof height === "number" ? `${height}px` : 120,
            }}
        >
            <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
};

type DataItem = { name: string; value: number };

const ChartSettings = () => {
    const { actions: { setProp }, type, data, color, height } = useNode((node) => ({
        type: node.data.props.type,
        data: node.data.props.data,
        color: node.data.props.color,
        height: node.data.props.height,
    }));

    const rows: DataItem[] = Array.isArray(data) && data.length > 0
        ? data.map((item: any) => ({
            name: typeof item?.name === "string" ? item.name : String(item?.name ?? ""),
            value: typeof item?.value === "number" && !Number.isNaN(item.value) ? item.value : Number(item?.value) || 0,
        }))
        : [{ name: "", value: 0 }];

    const setRow = (index: number, field: "name" | "value", value: string | number) => {
        setProp((props: any) => {
            const next = [...(Array.isArray(props.data) ? props.data : []).map((r: any) => ({ name: String(r?.name ?? ""), value: Number(r?.value) || 0 }))];
            while (next.length <= index) next.push({ name: "", value: 0 });
            if (field === "name") next[index] = { ...next[index], name: String(value) };
            else next[index] = { ...next[index], value: Number(value) || 0 };
            props.data = next;
        });
    };

    const addRow = () => {
        setProp((props: any) => {
            const prev = (Array.isArray(props.data) ? props.data : []).map((r: any) => ({ name: String(r?.name ?? ""), value: Number(r?.value) || 0 }));
            const next = [...prev, { name: "", value: 0 }];
            props.data = next;
        });
    };

    const removeRow = (index: number) => {
        if (rows.length <= 1) return;
        setProp((props: any) => {
            const next = (Array.isArray(props.data) ? props.data : []).filter((_: any, i: number) => i !== index);
            props.data = next.length ? next : [{ name: "", value: 0 }];
        });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Chart Type</Label>
                <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={type}
                    onChange={(e) => setProp((props: any) => props.type = e.target.value)}
                >
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="pie">Pie Chart</option>
                </select>
            </div>

            <div className="space-y-2">
                <Label>Main Color</Label>
                <div className="flex gap-2">
                    <Input type="color" value={color} className="w-10 h-10 p-1" onChange={(e) => setProp((props: any) => props.color = e.target.value)} />
                    <Input type="text" value={color} onChange={(e) => setProp((props: any) => props.color = e.target.value)} />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Height</Label>
                <Input type="number" value={typeof height === "number" ? height : 300} onChange={(e) => setProp((props: any) => props.height = parseInt(e.target.value, 10) || 300)} />
            </div>

            <div className="space-y-2 pt-4 mt-4 border-t border-border">
                <div className="flex items-center justify-between gap-2">
                    <Label className="shrink-0">Chart data</Label>
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={addRow} title="Add row">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <div className="border rounded-md overflow-hidden max-h-[240px] overflow-y-auto">
                    <div className="grid grid-cols-[1fr_80px_28px] gap-1 p-2 bg-muted sticky top-0 z-10 text-xs font-medium border-b border-border">
                        <span>Label</span>
                        <span>Value</span>
                        <span />
                    </div>
                    {rows.map((row: DataItem, index: number) => (
                        <div key={index} className="grid grid-cols-[1fr_80px_28px] gap-1 p-2 border-t items-center">
                            <Input
                                className="h-8 text-xs"
                                placeholder="e.g. Jan"
                                value={row.name}
                                onChange={(e) => setRow(index, "name", e.target.value)}
                            />
                            <Input
                                type="number"
                                className="h-8 text-xs"
                                placeholder="0"
                                value={row.value}
                                onChange={(e) => setRow(index, "value", e.target.value)}
                            />
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeRow(index)} title="Remove row">
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground">Label = axis/slice name, Value = number. Add rows with +.</p>
            </div>
        </div>
    );
};

(UserChart as any).craft = {
    displayName: "Chart",
    props: {
        type: "bar",
        data: DEFAULT_DATA,
        width: 400,
        height: 300,
        color: "#8884d8",
        top: 0,
        left: 0,
    },
    related: {
        settings: ChartSettings,
    },
};
