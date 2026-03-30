import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getSpacing = (space: any) => {
  if (typeof space === "number") return `${space}px`;
  if (!space) return "0px";
  return `${space.top ?? 0}px ${space.right ?? 0}px ${space.bottom ?? 0}px ${space.left ?? 0}px`;
};

export const showToast = (message: string, color: string = "#4ade80") => {
  const toast = document.createElement("div");
  toast.innerText = message;
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    padding: "10px 20px",
    background: color,
    color: "white",
    borderRadius: "5px",
    zIndex: "1000",
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
};

/**
 * Get responsive spacing value based on device type
 * @param value - Original spacing value (number or object with top/right/bottom/left)
 * @param device - Device type ('desktop' | 'mobile')
 * @returns Adjusted spacing value
 */
export const getResponsiveSpacing = (value: any, device: "desktop" | "mobile"): any => {
  if (device === "mobile") {
    if (typeof value === "number") {
      // Reduce spacing by 50% on mobile, minimum 4px
      return Math.max(Math.round(value * 0.5), 4);
    }
    if (value && typeof value === "object") {
      return {
        top: Math.max(Math.round((value.top || 0) * 0.5), 4),
        right: Math.max(Math.round((value.right || 0) * 0.5), 4),
        bottom: Math.max(Math.round((value.bottom || 0) * 0.5), 4),
        left: Math.max(Math.round((value.left || 0) * 0.5), 4),
      };
    }
  }
  return value;
};

/**
 * Get responsive font size based on device type
 * @param fontSize - Original font size in pixels
 * @param device - Device type ('desktop' | 'mobile')
 * @returns Adjusted font size
 */
export const getResponsiveFontSize = (fontSize: number, device: "desktop" | "mobile"): number => {
  if (device === "mobile" && fontSize) {
    // Scale down font sizes on mobile more aggressively
    if (fontSize > 48) {
      return Math.max(Math.round(fontSize * 0.5), 24);
    } else if (fontSize > 32) {
      return Math.max(Math.round(fontSize * 0.6), 20);
    } else if (fontSize > 24) {
      return Math.max(Math.round(fontSize * 0.7), 18);
    } else if (fontSize > 16) {
      return Math.max(Math.round(fontSize * 0.85), 14);
    }
    return Math.max(Math.round(fontSize * 0.9), 12);
  }
  return fontSize;
};