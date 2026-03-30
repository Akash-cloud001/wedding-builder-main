"use client";
"use no memo";

import React from "react";
import { useEditor, Element } from "@craftjs/core";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import { Type, Image as ImageIcon, Square, Youtube, Columns, Grid } from "lucide-react";
import { Layers } from "@craftjs/layers";
import { UserText } from "../user/Text";
import { UserContainer } from "../user/Container";
import { UserImage } from "../user/Image";
import { UserVideo } from "../user/Video";
import { UserPopup } from "../user/Popup";
import { UserButton } from "../user/Button";
import { UserInput } from "../user/Input";
import { UserLabel } from "../user/Label";
import { UserTextarea } from "../user/Textarea";
import { UserSwitch } from "../user/Switch";
import { UserSlider } from "../user/Slider";
import { UserAnimatedShape } from "../user/AnimatedShape";
import { UserChart } from "../user/Chart";
import { UserTable } from "../user/Table";
import { UserEmoji } from "../user/Emoji";
import { UserModernHero } from "../user/sections/ModernHero";
// import { UserFooter } from "../user/sections/Footer";
// import { UserNavbar } from "../user/Navbar";
// import { UserPrivateEventPopup } from "../user/sections/PrivateEventPopup";
import { MousePointerClick, TextCursorInput, ToggleRight, SlidersHorizontal, Tag, RectangleHorizontal, Sparkles, PieChart, Table as TableIcon, Smile, LayoutTemplate, PanelBottom, Lock } from "lucide-react";

type CategoryId = "text" | "media" | "layout" | "elements";

export const Toolbox = () => {
    const { connectors } = useEditor();
    const [openCategory, setOpenCategory] = React.useState<CategoryId | null>(null);

    const renderCategoryButton = (id: CategoryId, label: string, Icon: React.ComponentType<any>) => (
        <button
            type="button"
            onClick={() => setOpenCategory(openCategory === id ? null : id)}
            className="w-full flex items-center justify-between px-2 py-2 rounded-md hover:bg-gray-100 transition-colors"
        >
            <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{label}</span>
            </span>
            <span className="text-xs text-gray-400">
                {openCategory === id ? "Hide" : "Show"}
            </span>
        </button>
    );

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold">Toolbox</h2>
                <p className="text-sm text-gray-500">Drag components or view layers</p>
            </div>

            <Tabs defaultValue="components" className="flex-1 flex flex-col min-h-0">
                <div className="px-4 pt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="components">Add</TabsTrigger>
                        <TabsTrigger value="layers">Layers</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="components" className="flex-1 p-0 overflow-hidden flex flex-col min-h-0">
                    <div className="h-full w-full p-4 overflow-y-auto [&_button]:cursor-grab [&_button:active]:cursor-grabbing">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                {renderCategoryButton("text", "Text", Type)}
                                {openCategory === "text" && (
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                            ref={(ref: any) => connectors.create(ref, <Element is={UserText} custom={{ displayName: "Heading" }} text="Heading" fontSize={26} fontWeight="bold" />)}
                                        >
                                            <Type className="h-6 w-6" />
                                            <span className="text-xs">Heading</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                            ref={(ref: any) => connectors.create(ref, <Element is={UserText} custom={{ displayName: "Paragraph" }} text="Paragraph" fontSize={16} />)}
                                        >
                                            <Type className="h-4 w-4" />
                                            <span className="text-xs">Paragraph</span>
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                {renderCategoryButton("media", "Media", ImageIcon)}
                                {openCategory === "media" && (
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                            ref={(ref: any) => connectors.create(ref, <UserImage />)}
                                        >
                                            <ImageIcon className="h-6 w-6" />
                                            <span className="text-xs">Image</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                            ref={(ref: any) => connectors.create(ref, <UserVideo />)}
                                        >
                                            <Youtube className="h-6 w-6" />
                                            <span className="text-xs">Video</span>
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                {renderCategoryButton("layout", "Layout", LayoutTemplate)}
                                {openCategory === "layout" && (
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                            ref={(ref: any) => connectors.create(ref, <Element is={UserContainer} custom={{ displayName: "Container" }} canvas height="500px" width="100%" layoutMode="canvas" padding={0} />)}
                                        >
                                            <Square className="h-6 w-6" />
                                            <span className="text-xs">Container</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                            ref={(ref: any) => connectors.create(ref, <Element is={UserContainer} custom={{ displayName: "Row" }} flexDirection="row" flexWrap="wrap" width="100%" gap={0} padding={0} layoutMode="canvas" minHeight="300px" canvas />)}
                                        >
                                            <Columns className="h-6 w-6 rotate-90" />
                                            <span className="text-xs">Row</span>
                                        </Button>
                                        {/* <Button
                                            variant="outline"
                                            className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                            ref={(ref: any) => connectors.create(
                                                ref,
                                                <Element is={UserContainer} custom={{ displayName: "2 Cols" }} flexDirection="row" flexWrap="wrap" width="100%" gap={0} padding={0} canvas>
                                                    <Element is={UserContainer} width="50%" padding={0} layoutMode="canvas" minHeight="200px" canvas />
                                                    <Element is={UserContainer} width="50%" padding={0} layoutMode="canvas" minHeight="200px" canvas />
                                                </Element>
                                            )}
                                        >
                                            <Columns className="h-6 w-6" />
                                            <span className="text-xs">2 Cols</span>
                                        </Button> */}
                                        <Button
                                            variant="outline"
                                            className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                            ref={(ref: any) => connectors.create(
                                                ref,
                                                <Element is={UserContainer} custom={{ displayName: "Grid 2" }} layoutMode="grid" gridColumns={2} gap={20} width="100%" padding={20} canvas>
                                                    <Element is={UserContainer} width="100%" padding={0} layoutMode="canvas" minHeight="120px" canvas />
                                                    <Element is={UserContainer} width="100%" padding={0} layoutMode="canvas" minHeight="120px" canvas />
                                                </Element>
                                            )}
                                        >
                                            <Grid className="h-6 w-6" />
                                            <span className="text-xs">Grid 2</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                            ref={(ref: any) => connectors.create(
                                                ref,
                                                <Element is={UserContainer} custom={{ displayName: "Grid 4" }} layoutMode="grid" gridColumns={4} gap={20} width="100%" padding={20} canvas>
                                                    <Element is={UserContainer} width="100%" padding={0} layoutMode="canvas" minHeight="100px" canvas />
                                                    <Element is={UserContainer} width="100%" padding={0} layoutMode="canvas" minHeight="100px" canvas />
                                                    <Element is={UserContainer} width="100%" padding={0} layoutMode="canvas" minHeight="100px" canvas />
                                                    <Element is={UserContainer} width="100%" padding={0} layoutMode="canvas" minHeight="100px" canvas />
                                                </Element>
                                            )}
                                        >
                                            <Grid className="h-6 w-6" />
                                            <span className="text-xs">Grid 4</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                            ref={(ref: any) => connectors.create(
                                                ref,
                                                <Element is={UserContainer} custom={{ displayName: "Grid 6" }} layoutMode="grid" gridColumns={6} gap={20} width="100%" padding={20} canvas>
                                                    <Element is={UserContainer} width="100%" padding={0} layoutMode="canvas" minHeight="80px" canvas />
                                                    <Element is={UserContainer} width="100%" padding={0} layoutMode="canvas" minHeight="80px" canvas />
                                                    <Element is={UserContainer} width="100%" padding={0} layoutMode="canvas" minHeight="80px" canvas />
                                                    <Element is={UserContainer} width="100%" padding={0} layoutMode="canvas" minHeight="80px" canvas />
                                                    <Element is={UserContainer} width="100%" padding={0} layoutMode="canvas" minHeight="80px" canvas />
                                                    <Element is={UserContainer} width="100%" padding={0} layoutMode="canvas" minHeight="80px" canvas />
                                                </Element>
                                            )}
                                        >
                                            <Grid className="h-6 w-6" />
                                            <span className="text-xs">Grid 6</span>
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                {renderCategoryButton("elements", "Elements", Sparkles)}
                                {openCategory === "elements" && (
                                    <div className="mt-2 space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Form</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                                    ref={(ref: any) => connectors.create(ref, <UserInput />)}
                                                >
                                                    <TextCursorInput className="h-6 w-6" />
                                                    <span className="text-xs">Input</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                                    ref={(ref: any) => connectors.create(ref, <UserTextarea />)}
                                                >
                                                    <RectangleHorizontal className="h-6 w-6" />
                                                    <span className="text-xs">Textarea</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                                    ref={(ref: any) => connectors.create(ref, <UserLabel />)}
                                                >
                                                    <Tag className="h-6 w-6" />
                                                    <span className="text-xs">Label</span>
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Interaction</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                                    ref={(ref: any) => connectors.create(ref, <UserButton />)}
                                                >
                                                    <MousePointerClick className="h-6 w-6" />
                                                    <span className="text-xs">Button</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                                    ref={(ref: any) => connectors.create(ref, <UserSwitch />)}
                                                >
                                                    <ToggleRight className="h-6 w-6" />
                                                    <span className="text-xs">Switch</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                                    ref={(ref: any) => connectors.create(ref, <UserSlider />)}
                                                >
                                                    <SlidersHorizontal className="h-6 w-6" />
                                                    <span className="text-xs">Slider</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                                    ref={(ref: any) => connectors.create(ref, <UserPopup />)}
                                                >
                                                    <Square className="h-6 w-6" />
                                                    <span className="text-xs">Popup</span>
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Visuals & Animation</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                                    ref={(ref: any) => connectors.create(ref, <UserAnimatedShape />)}
                                                >
                                                    <Sparkles className="h-6 w-6" />
                                                    <span className="text-xs">Shape</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                                    ref={(ref: any) => connectors.create(ref, <UserEmoji />)}
                                                >
                                                    <Smile className="h-6 w-6" />
                                                    <span className="text-xs">Emoji</span>
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Data Display</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                                    ref={(ref: any) => connectors.create(ref, <UserChart />)}
                                                >
                                                    <PieChart className="h-6 w-6" />
                                                    <span className="text-xs">Chart</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                                    ref={(ref: any) => connectors.create(ref, <UserTable />)}
                                                >
                                                    <TableIcon className="h-6 w-6" />
                                                    <span className="text-xs">Table</span>
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Blocks</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {/* <Button
                                                    variant="outline"
                                                    className="flex flex-col h-20 items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                                    ref={(ref: any) => connectors.create(
                                                        ref,
                                                        <Element is={UserContainer} background="transparent" canvas width="100%" minHeight="800px" padding={20} layoutMode="canvas">
                                                            <UserText text="Wedding Events" fontSize={32} fontWeight="bold" align="center" width="100%" top={20} positionType="absolute" left={0} />
                                                            <Element is={UserAnimatedShape} shapeType="line" width={4} height={700} backgroundColor="#e5e7eb" top={80} left={400} positionType="absolute" align="center" />
                                                            <Element is={UserAnimatedShape} shapeType="circle" width={16} height={16} backgroundColor="#ef4444" top={150} left={394} positionType="absolute" />
                                                            <Element is={UserContainer} width="300px" minHeight="150px" background="white" padding={20} borderRadius={8} top={120} left={50} positionType="absolute" layoutMode="flex">
                                                                <UserText text="Mehendi Ceremony" fontSize={18} fontWeight="bold" color="#dc2626" />
                                                                <UserText text="📅 December 23, 2025" fontSize={14} color="#6b7280" />
                                                                <UserText text="🕒 4:00 PM" fontSize={14} color="#6b7280" />
                                                                <UserText text="Traditional henna ceremony with music and celebrations" fontSize={14} marginTop={10} />
                                                            </Element>
                                                            <Element is={UserAnimatedShape} shapeType="circle" width={16} height={16} backgroundColor="#ef4444" top={350} left={394} positionType="absolute" />
                                                            <Element is={UserContainer} width="300px" minHeight="150px" background="white" padding={20} borderRadius={8} top={320} left={450} positionType="absolute" layoutMode="flex">
                                                                <UserText text="Sangeet Night" fontSize={18} fontWeight="bold" color="#dc2626" />
                                                                <UserText text="📅 December 24, 2025" fontSize={14} color="#6b7280" />
                                                                <UserText text="🕒 7:00 PM" fontSize={14} color="#6b7280" />
                                                                <UserText text="An evening of music, dance, and celebration" fontSize={14} marginTop={10} />
                                                            </Element>
                                                            <Element is={UserAnimatedShape} shapeType="circle" width={16} height={16} backgroundColor="#ef4444" top={550} left={394} positionType="absolute" />
                                                            <Element is={UserContainer} width="300px" minHeight="150px" background="white" padding={20} borderRadius={8} top={520} left={50} positionType="absolute" layoutMode="flex">
                                                                <UserText text="Wedding Ceremony" fontSize={18} fontWeight="bold" color="#dc2626" />
                                                                <UserText text="📅 December 25, 2025" fontSize={14} color="#6b7280" />
                                                                <UserText text="🕒 11:00 AM" fontSize={14} color="#6b7280" />
                                                                <UserText text="The main wedding ceremony" fontSize={14} marginTop={10} />
                                                            </Element>
                                                        </Element>
                                                    )}
                                                >
                                                    <LayoutTemplate className="h-6 w-6" />
                                                    <span className="text-xs">Timeline</span>
                                                </Button> */}
                                                {/* <Button
                                                    ref={(ref: any) => connectors.create(ref, <UserNavbar />)}
                                                    variant="outline"
                                                    className="flex flex-col gap-2 h-20 hover:bg-muted"
                                                >
                                                    <PanelBottom className="w-6 h-6" />
                                                    <span className="text-xs">Navbar</span>
                                                </Button> */}
                                                <Button
                                                    ref={(ref: any) => connectors.create(ref, <UserModernHero />)}
                                                    variant="outline"
                                                    className="flex flex-col gap-2 h-20 hover:bg-muted"
                                                >
                                                    <LayoutTemplate className="w-6 h-6" />
                                                    <span className="text-xs">Modern Hero</span>
                                                </Button>
                                                {/* <Button
                                                    ref={(ref: any) => connectors.create(ref, <UserFooter />)}
                                                    variant="outline"
                                                    className="flex flex-col gap-2 h-20 hover:bg-muted"
                                                >
                                                    <PanelBottom className="w-6 h-6" />
                                                    <span className="text-xs">Footer</span>
                                                </Button>
                                                <Button
                                                    ref={(ref: any) => connectors.create(ref, <UserPrivateEventPopup />)}
                                                    variant="outline"
                                                    className="flex flex-col gap-2 h-20 hover:bg-muted"
                                                >
                                                    <Lock className="w-6 h-6" />
                                                    <span className="text-xs">Event Access</span>
                                                </Button> */}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent
                    value="layers"
                    forceMount
                    className="flex-1 p-0 overflow-hidden flex flex-col min-h-0 data-[state=inactive]:hidden"
                >
                    <div className="h-full w-full overflow-y-auto">
                        <Layers expandRootOnLoad />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
