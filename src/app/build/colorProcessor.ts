/**
 * Color processing utilities for generating harmonious color palettes
 */

import { ColorPalette } from '@/types/formData';

// =============================================================================
// Core Color Conversion Functions
// =============================================================================

/**
 * Converts a hex color string to RGB components
 * @param hex - Color in hexadecimal format (e.g. "#ff0000" or "#f00")
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Handle shorthand hex (#fff) by expanding to full form
  if (hex.length === 4) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Converts RGB components to hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
}

// Removed unused function 'rgbToHsl' to resolve the compile error

/**
 * Converts HSL values to RGB components
 */
// Removed unused function 'hslToRgb' to resolve the compile error

/**
 * Converts hex color to HSL values
 */
function hexToHSL(hex: string): {h: number, s: number, l: number} {
  const { r, g, b } = hexToRgb(hex);
  
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
      case gNorm: h = (bNorm - rNorm) / d + 2; break;
      case bNorm: h = (rNorm - gNorm) / d + 4; break;
    }
    h *= 60;
  }
  
  return { h, s, l };
}

/**
 * Converts HSL values to hex color
 */
function hslToHex(hsl: {h: number, s: number, l: number}): string {
  const { h, s, l } = hsl;
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, (h / 360 + 1/3) % 1);
    g = hue2rgb(p, q, (h / 360) % 1);
    b = hue2rgb(p, q, (h / 360 - 1/3 + 1) % 1);
  }
  
  return rgbToHex(r * 255, g * 255, b * 255);
}

// =============================================================================
// Accessibility & Color Adjustment Functions
// =============================================================================

/**
 * Calculates the contrast ratio between two colors
 * Used for ensuring text is readable against backgrounds (WCAG)
 */
function calculateContrastRatio(color1: string, color2: string): number {
  const luminance1 = calculateRelativeLuminance(color1);
  const luminance2 = calculateRelativeLuminance(color2);
  
  return luminance1 > luminance2 
    ? (luminance1 + 0.05) / (luminance2 + 0.05)
    : (luminance2 + 0.05) / (luminance1 + 0.05);
}

/**
 * Calculates the relative luminance of a color
 * Used in accessibility calculations (WCAG)
 */
function calculateRelativeLuminance(color: string): number {
  const { r, g, b } = hexToRgb(color);
  
  // Convert RGB to sRGB
  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;
  
  // Calculate luminance components
  const R = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
  const G = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
  const B = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

// =============================================================================
// Color Palette Definitions
// =============================================================================

/**
 * Industry-specific color palette presets
 */
type IndustryColorPreset = {
  name: string;
  primary: string;
  description: string;
};

export const industryColorPalettes: Record<string, IndustryColorPreset[]> = {
  restaurant: [
    { name: "Warm & Inviting", primary: "#B24800", description: "Creates a warm, appetizing atmosphere" },
    { name: "Fresh & Organic", primary: "#3D6E22", description: "Perfect for farm-to-table or healthy concepts" },
    { name: "Elegant Dining", primary: "#6D2959", description: "Sophisticated palette for fine dining" },
    { name: "Modern Eatery", primary: "#236370", description: "Contemporary feel for trendy establishments" }
  ],
  logistics: [
    { name: "Corporate Trust", primary: "#1A365D", description: "Projects reliability and stability" },
    { name: "High Visibility", primary: "#C04A0A", description: "Emphasizes safety and attention" },
    { name: "Global Reach", primary: "#1E503F", description: "Suggests sustainability and worldwide operations" },
    { name: "Tech Forward", primary: "#2A3B69", description: "Indicates modern tracking and logistics systems" }
  ],
  professional: [
    { name: "Executive Class", primary: "#2C3C50", description: "Traditional professional services look" },
    { name: "Modern Practice", primary: "#34608B", description: "Contemporary professional aesthetic" },
    { name: "Creative Agency", primary: "#4D3953", description: "Balanced creativity with professionalism" },
    { name: "Tech Consultancy", primary: "#245F50", description: "Forward-thinking and innovative" }
  ]
};

// =============================================================================
// Color Palette Generation
// =============================================================================

/**
 * Generates a complete color palette based on a base color and template type
 */
export function generateColorPalette(baseColor: string, templateType: string): ColorPalette {
  // Convert the base color to HSL for easier manipulation
  const baseColorHSL = hexToHSL(baseColor);
  
  // Make sure the base color isn't too bright or neon
  const adjustedHSL = { 
    h: baseColorHSL.h,
    s: Math.min(baseColorHSL.s, 75), // Limit saturation to avoid neon colors
    l: Math.min(Math.max(baseColorHSL.l, 30), 70) // Ensure reasonable lightness
  };
  
  // Template-specific color adjustments
  switch(templateType) {
    case 'restaurant':
      // Restaurants can have slightly warmer, more vibrant colors
      adjustedHSL.s = Math.min(adjustedHSL.s, 65); 
      adjustedHSL.l = Math.min(Math.max(adjustedHSL.l, 35), 65);
      break;
    case 'logistics':
      // Logistics needs more conservative, professional colors
      adjustedHSL.s = Math.min(adjustedHSL.s, 55);
      adjustedHSL.l = Math.min(Math.max(adjustedHSL.l, 30), 60);
      break;
    case 'professional':
      // Professional needs the most conservative approach
      adjustedHSL.s = Math.min(adjustedHSL.s, 50);
      adjustedHSL.l = Math.min(Math.max(adjustedHSL.l, 35), 55);
      break;
  }
  
  // Apply the adjusted HSL values to base color
  const adjustedBaseColor = hslToHex(adjustedHSL);
  
  // Generate harmonious color pairs using triadic color scheme
  const secondary = hslToHex({
    h: (adjustedHSL.h + 120) % 360,
    s: Math.min(adjustedHSL.s * 0.9, 60),
    l: adjustedHSL.l
  });
  
  const accent = hslToHex({
    h: (adjustedHSL.h + 240) % 360,
    s: Math.min(adjustedHSL.s * 0.85, 65),
    l: adjustedHSL.l
  });
  
  // Create background and text colors with appropriate contrast
  const backgroundColor = hslToHex({
    h: adjustedHSL.h,
    s: 5, // Very low saturation for backgrounds
    l: 97 // Very light for readability
  });
  
  const textColor = calculateRelativeLuminance(backgroundColor) > 0.5 ? '#000000' : '#ffffff';
  
  return {
    primary: adjustedBaseColor,
    secondary: secondary,
    accent: accent,
    text: textColor,
    background: backgroundColor,
    lightShade: hslToHex({h: adjustedHSL.h, s: 8, l: 95}),
    darkShade: hslToHex({h: adjustedHSL.h, s: 20, l: 25}),
    analogous: [secondary, accent]
  };
}

/**
 * Generates CSS variables for direct injection into HTML based on a color palette
 */
export function generateCssVariables(palette: ColorPalette) {
  // Check contrast ratio between text and background
  const textBackgroundContrast = calculateContrastRatio(palette.text, palette.background);
  
  // Adjust text color if contrast is insufficient (below 4.5:1 for WCAG AA)
  const adjustedTextColor = textBackgroundContrast < 4.5 
    ? (() => {
        const luminance = calculateRelativeLuminance(palette.background);
        return luminance > 0.5 ? '#000000' : '#ffffff';
      })()
    : palette.text;
    
  return `
  body {
    --primary-color: ${palette.primary};
    --secondary-color: ${palette.secondary};
    --accent-color: ${palette.accent};
    --text-color: ${adjustedTextColor};
    --background-color: ${palette.background};
    --light-shade: ${palette.lightShade};
    --dark-shade: ${palette.darkShade};
    --analogous-1: ${palette.analogous[0]};
    --analogous-2: ${palette.analogous[1]};
  }
  `;
}