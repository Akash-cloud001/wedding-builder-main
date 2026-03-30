"use client";

import React, { createContext, useContext, useState } from "react";

type DeviceType = "desktop" | "mobile";

interface AppContextType {
    device: DeviceType;
    setDevice: (device: DeviceType) => void;
    preview: boolean;
    setPreview: (preview: boolean) => void;
    currentSection: string;
    setCurrentSection: (section: string) => void;
    saveSection: (section: string, json: string) => void;
    loadSection: (section: string) => string | null;
    sections: Record<string, string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [device, setDevice] = useState<DeviceType>("desktop");
    const [preview, setPreview] = useState(false);
    const [currentSection, setCurrentSection] = useState("Home");
    const [sections, setSections] = useState<Record<string, string>>({});

    const saveSection = (section: string, json: string) => {
        setSections((prev) => ({
            ...prev,
            [section]: json,
        }));
    };

    const loadSection = (section: string) => {
        return sections[section] || null;
    };

    return (
        <AppContext.Provider value={{
            device,
            setDevice,
            preview,
            setPreview,
            currentSection,
            setCurrentSection,
            saveSection,
            loadSection,
            sections
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};
