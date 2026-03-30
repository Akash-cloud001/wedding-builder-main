"use client";
"use no memo";

import { useNode, useEditor, Element } from "@craftjs/core";
import React, { useState } from "react";
import { UserContainer } from "./Container";
import { UserButton } from "./Button";
import { UserText } from "./Text";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { StylesPanel } from "../editor/properties/StylesPanel";
import { useAppContext } from "../editor/AppContext";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const NavbarSettings = () => {
    const { actions: { setProp }, logo, links, backgroundColor, textColor } = useNode((node) => ({
        logo: node.data.props.logo,
        links: node.data.props.links,
        backgroundColor: node.data.props.backgroundColor,
        textColor: node.data.props.textColor,
    }));

    const handleLinksChange = (value: string) => {
        try {
            const parsed = JSON.parse(value);
            setProp((props: any) => props.links = parsed);
        } catch {
            // Invalid JSON, ignore
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Logo Text</Label>
                <Input
                    value={logo || ""}
                    onChange={(e) => setProp((props: any) => props.logo = e.target.value)}
                    placeholder="Your Logo"
                />
            </div>
            <div className="space-y-2">
                <Label>Links (JSON array)</Label>
                <Input
                    value={JSON.stringify(links || [])}
                    onChange={(e) => handleLinksChange(e.target.value)}
                    placeholder='[{"text":"Home","url":"/"}]'
                />
            </div>
            <div className="space-y-2">
                <Label>Background Color</Label>
                <Input
                    type="color"
                    value={backgroundColor || "#ffffff"}
                    onChange={(e) => setProp((props: any) => props.backgroundColor = e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label>Text Color</Label>
                <Input
                    type="color"
                    value={textColor || "#000000"}
                    onChange={(e) => setProp((props: any) => props.textColor = e.target.value)}
                />
            </div>
            <StylesPanel />
        </div>
    );
};

export const UserNavbar = ({ 
    logo = "Logo", 
    links = [{ text: "Home", url: "/" }, { text: "About", url: "/about" }],
    backgroundColor = "#ffffff",
    textColor = "#000000",
    padding = 20,
    margin = 0
}: any) => {
    const { connectors: { connect, drag }, selected } = useNode((state) => ({
        selected: state.events.selected,
    }));

    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled,
    }));

    const { device } = useAppContext();
    const isMobile = device === "mobile";
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <motion.nav
            ref={(ref: any) => connect(drag(ref))}
            className={`w-full ${selected ? "ring-2 ring-blue-500" : ""}`}
            style={{
                backgroundColor,
                padding: `${padding}px`,
                margin: `${margin}px`,
                position: "sticky",
                top: 0,
                zIndex: 1000,
            }}
            initial="initial"
            animate="animate"
        >
            <div className="flex items-center justify-between w-full">
                {/* Logo */}
                <Element
                    id="navbar_logo"
                    is={UserText}
                    text={logo}
                    fontSize={isMobile ? 20 : 24}
                    fontWeight="bold"
                    color={textColor}
                />

                {/* Desktop Menu */}
                {!isMobile && (
                    <Element
                        id="navbar_links"
                        is={UserContainer}
                        canvas
                        layoutMode="flex"
                        flexDirection="row"
                        gap={20}
                        alignItems="center"
                        background="transparent"
                        padding={0}
                    >
                        {links.map((link: any, index: number) => (
                            <Element
                                key={index}
                                id={`navbar_link_${index}`}
                                is={UserButton}
                                text={link.text}
                                url={link.url}
                                variant="ghost"
                                color={textColor}
                                fontSize={isMobile ? 14 : 16}
                            />
                        ))}
                    </Element>
                )}

                {/* Mobile Hamburger Menu */}
                {isMobile && !enabled && (
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2"
                        style={{ color: textColor }}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                )}

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobile && mobileMenuOpen && !enabled && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 right-0 w-full"
                            style={{
                                backgroundColor,
                                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                            }}
                        >
                            <div className="flex flex-col p-4 gap-2">
                                {links.map((link: any, index: number) => (
                                    <a
                                        key={index}
                                        href={link.url}
                                        className="py-2 px-4 hover:bg-gray-100 rounded"
                                        style={{ color: textColor }}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {link.text}
                                    </a>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.nav>
    );
};

UserNavbar.craft = {
    displayName: "Navbar",
    props: {
        logo: "Logo",
        links: [{ text: "Home", url: "/" }, { text: "About", url: "/about" }],
        backgroundColor: "#ffffff",
        textColor: "#000000",
        padding: 20,
        margin: 0,
    },
    related: {
        settings: NavbarSettings,
    },
};
