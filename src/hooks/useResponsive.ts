import { useAppContext } from "@/components/editor/AppContext";

/**
 * Hook to get responsive values based on device type
 */
export const useResponsive = () => {
  const { device } = useAppContext();
  const isMobile = device === "mobile";

  return {
    device,
    isMobile,
    isDesktop: !isMobile,
    // Breakpoint values
    breakpoints: {
      mobile: 375,
      tablet: 768,
      desktop: 1024,
    },
  };
};

/**
 * Get responsive value based on device
 */
export const getResponsiveValue = <T,>(
  mobileValue: T,
  desktopValue: T,
  device: "mobile" | "desktop"
): T => {
  return device === "mobile" ? mobileValue : desktopValue;
};
