"use client";
"use no memo";

import { useNode, useEditor } from "@craftjs/core";
import React from "react";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn, getSpacing, getResponsiveSpacing } from "@/lib/utils";
import { AnimationSection, getAnimationVariants } from "./AnimationSection";
import { motion } from "framer-motion";
import { useCanvasDrag } from "./hooks/useCanvasDrag";
import { useAppContext } from "../editor/AppContext";

export const ContainerSettings = () => {
  const { actions: { setProp }, background, gap, borderRadius, backgroundImage, height, minHeight, width, layoutMode, gridColumns } = useNode((node) => ({
    background: node.data.props.background,
    gap: node.data.props.gap,
    borderRadius: node.data.props.borderRadius,
    backgroundImage: node.data.props.backgroundImage,
    height: node.data.props.height,
    minHeight: node.data.props.minHeight,
    width: node.data.props.width,
    layoutMode: node.data.props.layoutMode,
    gridColumns: node.data.props.gridColumns,
  }));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Background Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={background && background !== "transparent" ? background : "#ffffff"}
            className="w-10 h-10 p-1"
            onChange={(e) => setProp((props: any) => props.background = e.target.value)}
          />
          <Input
            value={background}
            onChange={(e) => setProp((props: any) => props.background = e.target.value)}
          />
        </div>
      </div>

      {/* <div className="space-y-2">
        <Label>Background Image URL</Label>
        <Input
          value={backgroundImage || ""}
          placeholder="https://..."
          onChange={(e) => setProp((props: any) => props.backgroundImage = e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Upload Background Image</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              if (reader.result) {
                setProp((props: any) => props.backgroundImage = reader.result);
              }
            };
            reader.readAsDataURL(file);
          }}
        />
      </div> */}

      <div className="space-y-2">
        <Label>Border Radius: {borderRadius}px</Label>
        <Slider
          defaultValue={[borderRadius || 0]}
          max={50}
          step={1}
          onValueChange={(val) => setProp((props: any) => props.borderRadius = val[0])}
        />
      </div>

      <div className="space-y-2">
        <Label>Gap: {gap}px</Label>
        <Slider
          defaultValue={[gap || 0]}
          max={50}
          step={1}
          onValueChange={(val) => setProp((props: any) => props.gap = val[0])}
        />
      </div>

      {/* Dimensions apply to both modes */}
      <div className="space-y-4 pt-4 border-t">
        <Label>Dimensions</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-gray-400">Width</Label>
            <Input
              value={width || ""}
              placeholder="e.g. 100%"
              onChange={(e) => setProp((props: any) => props.width = e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-400">Height</Label>
            <Input
              value={height || ""}
              placeholder="e.g. 200px or auto"
              onChange={(e) => setProp((props: any) => props.height = e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-400">Min Height</Label>
            <Input
              value={minHeight || ""}
              placeholder="e.g. 100px or 100%"
              onChange={(e) => setProp((props: any) => props.minHeight = e.target.value)}
            />
          </div>
        </div>
      </div>

      <AnimationSection />
    </div>
  );
};

export const UserContainer = ({ children, background, padding, margin, flexDirection, alignItems, justifyContent, flexWrap, gap, borderRadius, backgroundImage, height, minHeight, width, layoutMode, gridColumns, animationType, animationDuration, animationDelay, disableVisuals }: any) => {
  const { connectors: { connect, drag }, selected, node, actions: { setProp }, top, left } = useNode((state) => ({
    selected: state.events.selected,
    node: state,
    top: state.data.props.top,
    left: state.data.props.left,
  }));

  const { enabled, actions: editorActions } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const { device } = useAppContext();

  React.useEffect(() => {
    if (disableVisuals && selected && node?.data?.parent) {
      editorActions.selectNode(node.data.parent);
    }
  }, [disableVisuals, selected, node?.data?.parent, editorActions]);

  const { isCanvas, itemStyle } = useCanvasDrag(top, left);

  const variants = getAnimationVariants(animationType, animationDuration, animationDelay);

  // Check if container is empty (no children)
  const hasChildren = React.Children.count(children) > 0 || (node?.data?.nodes && node.data.nodes.length > 0);

  // Determine if we should show visual indicators (only when empty, transparent, and editor is enabled)
  const isTransparent = !background || background === "transparent" || background === "";
  const showVisualIndicators = enabled && isTransparent && !backgroundImage && !hasChildren && !disableVisuals;

  // Create a subtle background pattern for visual indication
  const backgroundPattern = showVisualIndicators
    ? `linear-gradient(45deg, rgba(59, 130, 246, 0.05) 25%, transparent 25%), linear-gradient(-45deg, rgba(59, 130, 246, 0.05) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(59, 130, 246, 0.05) 75%), linear-gradient(-45deg, transparent 75%, rgba(59, 130, 246, 0.05) 75%)`
    : undefined;
  const backgroundPatternSize = showVisualIndicators ? "20px 20px" : undefined;
  const backgroundPatternPosition = showVisualIndicators ? "0 0, 0 0, 10px 10px, 10px 10px" : undefined;

  const isSelfCanvas = layoutMode === "canvas";

  return (
    <motion.div
      ref={(ref: any) => connect(drag(ref))}
      onDragOver={(e) => {
        if (isSelfCanvas) {
          e.preventDefault(); // Allow drop
          e.stopPropagation();
          const container = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - container.left;
          const y = e.clientY - container.top;
          (window as any).__craft_drop_pos = {
            x,
            y,
            width: container.width,
            height: container.height,
            containerId: node.id,
            ts: Date.now(),
          };
        }
      }}
      // remove onDrop entirely to let Craft handle the structure update naturally
      style={{
        backgroundColor: background || (showVisualIndicators ? "rgba(249, 250, 251, 0.5)" : undefined),
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : backgroundPattern,
        // Use 'cover' so the background fills the full width of the section
        // without leaving empty space on the sides.
        backgroundSize: backgroundImage ? "cover" : backgroundPatternSize,
        backgroundPosition: backgroundImage ? "center center" : backgroundPatternPosition,
        backgroundRepeat: backgroundImage ? "no-repeat" : undefined,
        padding: isSelfCanvas ? 0 : getSpacing(device === "mobile" ? getResponsiveSpacing(padding, device) : padding),
        margin: (isSelfCanvas && device === "mobile") ? 0 : getSpacing(device === "mobile" ? getResponsiveSpacing(margin, device) : margin),
        overflow: device === "mobile" ? "hidden" : (isSelfCanvas ? "hidden" : "visible"), // Always clip on mobile to prevent overflow
        maxWidth: device === "mobile" ? "100%" : undefined,

        // Layout Config
        display: isSelfCanvas ? "block" : (layoutMode === "grid" ? "grid" : "flex"),
        // Always relative so absolute children (Free Movement) anchor to this container
        // UNLESS we are inside a canvas, then we are absolute ourselves?
        // Wait, itemStyle sets position:absolute if isCanvas is true.
        // We need to merge them.
        position: isCanvas ? "absolute" : "relative",

        // Grid Props
        gridTemplateColumns: layoutMode === "grid" ? `repeat(${gridColumns || 1}, 1fr)` : undefined,

        // Flex Props (Only apply if NOT canvas AND NOT grid)
        // On mobile, force column direction for row layouts
        flexDirection: (isSelfCanvas || layoutMode === "grid") 
          ? undefined 
          : (device === "mobile" && flexDirection === "row" ? "column" : flexDirection),
        alignItems: (isSelfCanvas) ? undefined : alignItems, // Grid uses alignItems too
        justifyContent: (isSelfCanvas || layoutMode === "grid") ? undefined : justifyContent,
        flexWrap: (isSelfCanvas || layoutMode === "grid") ? undefined : flexWrap,
        gap: isSelfCanvas ? undefined : `${device === "mobile" ? Math.max(gap * 0.5, 8) : gap}px`,

        height: typeof height === "number" ? `${height}px` : height,
        minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight,
        width: device === "mobile" 
          ? "100%" 
          : (typeof width === "number" ? `${width}px` : width),
        borderRadius: `${borderRadius}px`,
        ...itemStyle, // This overwrites position/top/left if isCanvas is true
      }}
      className={cn(
        "min-h-[50] transition-all cursor-move",
        device === "mobile" && !enabled
          ? "border-0" // No borders on mobile in preview mode
          : selected
            ? "border-2 border-transparent shadow-sm" // Selection outline comes from RenderNode only; avoids double border + dotted persistence
            : showVisualIndicators
              ? "border border-blue-200 border-dashed hover:border-blue-400 hover:shadow-sm"
              : "border border-transparent hover:border-gray-300 hover:border-dashed"
      )}
      initial="initial"
      animate="animate"
      variants={variants as any}
    >
      {children}
    </motion.div>
  );
};


UserContainer.craft = {
  displayName: "Container",
  isCanvas: true, // Ensures toolbox-dropped containers are canvas nodes so their children are draggable (Craft.js isDraggable() requires parent.isCanvas())
  props: {
    background: "transparent",
    padding: 20,
    margin: 0,
    backgroundImage: "",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    flexWrap: "nowrap",
    gap: 10,
    gridColumns: 1,
    borderRadius: 0,
    animationType: "none",
    animationDuration: 0.5,
    animationDelay: 0,
    height: "auto",
    minHeight: "50px",
    width: "100%",
    layoutMode: "flex",
    top: 0,
    left: 0,
    positionType: "relative",
  },
  related: {
    settings: ContainerSettings,
  },
};
