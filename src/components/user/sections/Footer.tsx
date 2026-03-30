"use client";
"use no memo";

import { useNode, Element } from "@craftjs/core";
import React from "react";
import { UserContainer } from "../Container";
import { UserText } from "../Text";
import { UserButton } from "../Button";
import { useAppContext } from "../../editor/AppContext";

export const UserFooter = () => {
  const { connectors: { connect, drag } } = useNode();
  const { device } = useAppContext();
  const isMobile = device === "mobile";
  
  return (
    <div ref={(ref: any) => connect(drag(ref))} className="w-full">
      <Element
        id="footer_container"
        is={UserContainer}
        canvas
        width="100%"
        background="#fcfbf9"
        padding={isMobile ? 20 : 40}
        flexDirection={isMobile ? "column" : "row"}
        alignItems="center"
        justifyContent="center"
        gap={isMobile ? 20 : 60}
      >
        <Element
            id="footer_help"
            is={UserButton}
            text="Help"
            variant="ghost"
            color="#333333"
            fontSize={16}
        />
        
        <Element
            id="footer_logo"
            is={UserText}
            text="Joy"
            fontSize={isMobile ? 32 : 42}
            fontWeight="bold"
            fontFamily="serif"
            color="#000000"
            textAlign="center"
            margin={isMobile ? { top: 0, bottom: 0, left: 20, right: 20 } : { top: 0, bottom: 0, left: 40, right: 40 }}
        />
        
        <Element
            id="footer_about"
            is={UserButton}
            text="About"
            variant="ghost"
            color="#333333"
            fontSize={16}
        />
      </Element>
    </div>
  );
};

UserFooter.craft = {
  displayName: "Footer",
  props: {},
};
