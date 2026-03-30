"use client";

import React from "react";
import { Frame, Element } from "@craftjs/core";
import { AppProvider } from "@/components/editor/AppContext";
import { EditorProvider } from "@/components/editor/EditorProvider";
import { Viewport } from "@/components/editor/Viewport";
import { UserContainer } from "@/components/user/Container";
import { UserText } from "@/components/user/Text";




export default function Home() {
  return (
    <AppProvider>
      <EditorProvider>
        <Viewport>
          <Frame>
            <Element is={UserContainer} custom={{ displayName: "Canvas" }} canvas background="#ffffff" padding={0} minHeight="100vh" width="100%" layoutMode="canvas">
            </Element>
          </Frame>
        </Viewport>
      </EditorProvider>
    </AppProvider>
  );
}
