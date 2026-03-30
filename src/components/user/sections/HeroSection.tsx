"use client";
"use no memo";

import { useNode } from "@craftjs/core";
import React from "react";
import { UserText } from "../Text";
import { UserImage } from "../Image";
import { Element } from "@craftjs/core";
import { UserContainer } from "../Container";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StylesPanel } from "@/components/editor/properties/StylesPanel";
import { useAppContext } from "../../editor/AppContext";

export const HeroSectionSettings = () => {
    const { actions: { setProp }, backgroundImage, title, subtitle, date } = useNode((node) => ({
        backgroundImage: node.data.props.backgroundImage,
        title: node.data.props.title,
        subtitle: node.data.props.subtitle,
        date: node.data.props.date,
    }));

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Background Image</Label>
                <Input
                    value={backgroundImage}
                    onChange={(e) => setProp((props: any) => props.backgroundImage = e.target.value)}
                />
            </div>
            <StylesPanel />
        </div>
    );
};

export const HeroSection = ({ backgroundImage, padding, margin }: any) => {
    const { connectors: { connect, drag }, selected } = useNode((state) => ({
        selected: state.events.selected,
    }));

    const { device } = useAppContext();
    const isMobile = device === "mobile";

    return (
        <div
            ref={(ref: any) => connect(drag(ref))}
            className={`w-full relative ${isMobile ? "min-h-[400px]" : "min-h-[600px]"} flex flex-col items-center justify-center text-white ${selected ? "ring-2 ring-blue-500" : ""}`}
            style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                padding: `${padding}px`,
                margin: `${margin}px`,
            }}
        >
            <div className={`text-center ${isMobile ? "space-y-2 px-4" : "space-y-4"} z-10 w-full`}>
                <Element id="hero_title" is={UserContainer} background="transparent" layoutMode="flex" alignItems="center">
                    <UserText
                        text="Sarah & Michael"
                        fontSize={isMobile ? 32 : 64}
                        color="#ffffff"
                        fontFamily="'Playfair Display', serif"
                        fontWeight="bold"
                    />
                    <UserText
                        text="We are getting married!"
                        fontSize={isMobile ? 18 : 24}
                        color="#ffffff"
                        fontFamily="'Montserrat', sans-serif"
                    />
                    <UserText
                        text="December 25, 2026"
                        fontSize={isMobile ? 14 : 18}
                        color="#ffffff"
                        fontWeight="bold"
                    />
                </Element>

                {/* Circular Images Container */}
                <Element id="hero_images" is={UserContainer} background="transparent" layoutMode="flex" flexDirection={isMobile ? "column" : "row"} gap={isMobile ? 20 : 40} alignItems="center" justifyContent="center" padding={isMobile ? 20 : 40}>
                    <div className="flex flex-col items-center gap-2">
                        <div className={`${isMobile ? "w-24 h-24" : "w-32 h-32"} rounded-full overflow-hidden border-4 border-white/80 shadow-lg`}>
                            <Element id="bride_img" is={UserImage} width="100%" height="100%" src="https://placehold.co/150/d4a5a5/white?text=S" />
                        </div>
                        <UserText text="Sarah Johnson" fontSize={isMobile ? 16 : 20} color="#ffffff" fontFamily="'Playfair Display', serif" />
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <div className={`${isMobile ? "w-24 h-24" : "w-32 h-32"} rounded-full overflow-hidden border-4 border-white/80 shadow-lg`}>
                            <Element id="groom_img" is={UserImage} width="100%" height="100%" src="https://placehold.co/150/8da399/white?text=M" />
                        </div>
                        <UserText text="Michael Chen" fontSize={isMobile ? 16 : 20} color="#ffffff" fontFamily="'Playfair Display', serif" />
                    </div>
                </Element>
            </div>
        </div>
    );
};

HeroSection.craft = {
    displayName: "Wedding Hero",
    props: {
        backgroundImage: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
        padding: 0,
        margin: 0,
    },
    related: {
        settings: HeroSectionSettings,
    },
};
