/**
 * Color processing utilities for generating harmonious color palettes
 */

import { ColorPalette, ColorPreset } from '@/types/formData';

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

/**
 * Checks if two colors are harmonious based on color theory rules
 */
export function areColorsHarmonious(color1: string, color2: string): boolean {
  const hsl1 = hexToHSL(color1);
  const hsl2 = hexToHSL(color2);
  
  const hueDiff = Math.abs(hsl1.h - hsl2.h);
  
  return (
    // Complementary colors (180° apart)
    (hueDiff >= 150 && hueDiff <= 210) ||
    // Analogous colors (30° apart)
    (hueDiff >= 30 && hueDiff <= 50) ||
    // Triadic colors (120° apart)
    (hueDiff >= 115 && hueDiff <= 125) ||
    // Split complementary
    (hueDiff >= 150 && hueDiff <= 180)
  );
}

/**
 * Checks if a color combination is accessible according to WCAG standards
 */
export function isAccessibleCombination(background: string, foreground: string): boolean {
  const contrastRatio = calculateContrastRatio(background, foreground);
  return contrastRatio >= 4.5; // WCAG AA standard for normal text
}

/**
 * Suggests adjustments for better color harmony
 */
export function suggestHarmoniousAdjustment(baseColor: string, colorToAdjust: string): string {
  const baseHSL = hexToHSL(baseColor);
  const adjustHSL = hexToHSL(colorToAdjust);
  
  // Adjust hue to nearest harmonious angle
  const hueDiff = (baseHSL.h - adjustHSL.h + 360) % 360;
  let newHue = baseHSL.h;
  
  if (hueDiff < 30) {
    // Make analogous
    newHue = (baseHSL.h + 30) % 360;
  } else if (hueDiff < 120) {
    // Make triadic
    newHue = (baseHSL.h + 120) % 360;
  } else {
    // Make complementary
    newHue = (baseHSL.h + 180) % 360;
  }
  
  return hslToHex({
    h: newHue,
    s: adjustHSL.s,
    l: adjustHSL.l
  });
}

/**
 * Validates a complete color scheme for harmony and accessibility
 */
export function validateColorScheme(colors: string[]): {
  isValid: boolean;
  issues: string[];
  suggestions: { color: string; suggestion: string }[];
} {
  const issues: string[] = [];
  const suggestions: { color: string; suggestion: string }[] = [];
  
  // Check harmony between all color pairs
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      if (!areColorsHarmonious(colors[i], colors[j])) {
        issues.push(`Colors ${colors[i]} and ${colors[j]} are not harmonious`);
        suggestions.push({
          color: colors[j],
          suggestion: suggestHarmoniousAdjustment(colors[i], colors[j])
        });
      }
    }
  }
  
  // Check accessibility for text/background combinations
  const backgroundColors = colors.filter(color => {
    const hsl = hexToHSL(color);
    return hsl.l > 50; // Assume lighter colors are backgrounds
  });
  
  const textColors = colors.filter(color => {
    const hsl = hexToHSL(color);
    return hsl.l <= 50; // Assume darker colors are text
  });
  
  backgroundColors.forEach(bg => {
    textColors.forEach(text => {
      if (!isAccessibleCombination(bg, text)) {
        issues.push(`Insufficient contrast between ${bg} (background) and ${text} (text)`);
      }
    });
  });
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
}

// =============================================================================
// Color Palette Definitions
// =============================================================================

/**
 * Industry-specific color palette presets
 */

export const industryColorPalettes: Record<string, ColorPreset[]> = {
  professional: [
    {
      name: "Corporate Blue",
      colors: ['#1B4965', '#3C738B', '#62A8AC', '#8ED1CC']
    },
    {
      name: "Modern Gray",
      colors: ['#2C3E50', '#485C73', '#647D96', '#8FA3BA']
    },
    {
      name: "Tech Green",
      colors: ['#004D40', '#00695C', '#00897B', '#26A69A']
    }
  ],
  creative: [
    {
      name: "Vibrant",
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
    },
    {
      name: "Artistic",
      colors: ['#D92B5A', '#F26B9C', '#F9B8D4', '#FDE2E9']
    },
    {
      name: "Bold",
      colors: ['#7B2CBF', '#9D4EDD', '#C77DFF', '#E0AAFF']
    }
  ],
  casual: [
    {
      name: "Warm",
      colors: ['#FF9F1C', '#FFBF69', '#CBF3F0', '#2EC4B6']
    },
    {
      name: "Natural",
      colors: ['#606C38', '#8A9B68', '#DDA15E', '#BC6C25']
    },
    {
      name: "Peaceful",
      colors: ['#264653', '#2A9D8F', '#E9C46A', '#F4A261']
    }
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
  
  // Create background and text colors with appropriate contrast
  const backgroundColor = hslToHex({
    h: adjustedHSL.h,
    s: 5, // Very low saturation for backgrounds
    l: 97 // Very light for readability
  });
  
  const textColor = calculateRelativeLuminance(backgroundColor) > 0.5 ? '#000000' : '#ffffff';

  // Generate secondary and accent colors
  const secondary = hslToHex({
    h: (adjustedHSL.h + 30) % 360,
    s: Math.min(adjustedHSL.s * 0.9, 60),
    l: adjustedHSL.l
  });

  const accent = hslToHex({
    h: (adjustedHSL.h + 180) % 360,
    s: Math.min(adjustedHSL.s * 0.95, 70),
    l: Math.min(adjustedHSL.l * 1.1, 65)
  });
  
  // Generate harmonious color pairs using triadic color scheme
  const analogous1 = hslToHex({
    h: (adjustedHSL.h + 120) % 360,
    s: Math.min(adjustedHSL.s * 0.9, 60),
    l: adjustedHSL.l
  });
  
  const analogous2 = hslToHex({
    h: (adjustedHSL.h + 240) % 360,
    s: Math.min(adjustedHSL.s * 0.85, 65),
    l: adjustedHSL.l
  });

  const palette = {
    primary: adjustedBaseColor,
    secondary,
    accent,
    text: textColor,
    background: backgroundColor,
    lightShade: hslToHex({h: adjustedHSL.h, s: 8, l: 95}),
    darkShade: hslToHex({h: adjustedHSL.h, s: 20, l: 25}),
    analogous: [analogous1, analogous2] as [string, string]
  };
  
  // Validate the generated palette
  const validation = validateColorScheme([
    palette.primary,
    palette.secondary,
    palette.accent,
    palette.text,
    palette.background
  ]);
  
  if (!validation.isValid) {
    console.warn('Color palette has potential issues:', validation.issues);
    // Apply suggestions if needed
    validation.suggestions.forEach(({ color, suggestion }) => {
      if (palette.secondary === color) palette.secondary = suggestion;
      if (palette.accent === color) palette.accent = suggestion;
    });
  }
  
  return palette;
}

/**
 * Generates CSS variables for direct injection into HTML based on a color palette
 */
export function generateCssVariables(palette: ColorPalette) {
  // Validate contrast and adjust text color if needed
  const textBackgroundContrast = calculateContrastRatio(palette.text, palette.background);
  const adjustedTextColor = textBackgroundContrast < 4.5 
    ? calculateRelativeLuminance(palette.background) > 0.5 ? '#000000' : '#ffffff'
    : palette.text;

  return `
  :root {
    /* Base colors */
    --primary-color: ${palette.primary};
    --secondary-color: ${palette.secondary};
    --accent-color: ${palette.accent};
    --text-color: ${adjustedTextColor};
    --background-color: ${palette.background};
    --light-shade: ${palette.lightShade};
    --dark-shade: ${palette.darkShade};
    
    /* Component-specific colors */
    --header-bg: ${palette.primary};
    --header-text: ${calculateRelativeLuminance(palette.primary) > 0.5 ? '#000000' : '#ffffff'};
    --nav-bg: ${palette.darkShade};
    --nav-text: ${calculateRelativeLuminance(palette.darkShade) > 0.5 ? '#000000' : '#ffffff'};
    --section-bg: ${palette.lightShade};
    --section-text: ${palette.text};
    --card-bg: ${palette.background};
    --card-border: ${palette.secondary}33;
    --button-primary-bg: ${palette.primary};
    --button-primary-text: ${calculateRelativeLuminance(palette.primary) > 0.5 ? '#000000' : '#ffffff'};
    --button-secondary-bg: ${palette.secondary};
    --button-secondary-text: ${calculateRelativeLuminance(palette.secondary) > 0.5 ? '#000000' : '#ffffff'};
    --link-color: ${palette.accent};
    --link-hover: ${palette.secondary};
    
    /* Section variations */
    --section-alt-bg: ${palette.secondary}11;
    --section-highlight-bg: ${palette.accent}11;
    --section-dark-bg: ${palette.darkShade};
    --section-dark-text: ${calculateRelativeLuminance(palette.darkShade) > 0.5 ? '#000000' : '#ffffff'};
    
    /* Interactive elements */
    --hover-overlay: ${palette.primary}1A;
    --active-overlay: ${palette.primary}33;
    --focus-ring: ${palette.accent}66;
    
    /* Borders and dividers */
    --border-light: ${palette.secondary}22;
    --border-medium: ${palette.secondary}44;
    --border-strong: ${palette.secondary}66;
    
    /* Shadows */
    --shadow-color: ${palette.darkShade}33;
    --shadow-sm: 0 2px 4px var(--shadow-color);
    --shadow-md: 0 4px 8px var(--shadow-color);
    --shadow-lg: 0 8px 16px var(--shadow-color);
  }

  /* Base styles */
  body {
    color: var(--text-color);
    background-color: var(--background-color);
  }

  /* Section styles */
  .section {
    background-color: var(--section-bg);
    color: var(--section-text);
  }

  .section-alt {
    background-color: var(--section-alt-bg);
  }

  .section-highlight {
    background-color: var(--section-highlight-bg);
  }

  .section-dark {
    background-color: var(--section-dark-bg);
    color: var(--section-dark-text);
  }

  /* Component styles */
  .card {
    background-color: var(--card-bg);
    border: 1px solid var(--card-border);
    box-shadow: var(--shadow-sm);
  }

  .btn-primary {
    background-color: var(--button-primary-bg);
    color: var(--button-primary-text);
  }

  .btn-secondary {
    background-color: var(--button-secondary-bg);
    color: var(--button-secondary-text);
  }

  a {
    color: var(--link-color);
  }

  a:hover {
    color: var(--link-hover);
  }

  /* Header and navigation */
  .header {
    background-color: var(--header-bg);
    color: var(--header-text);
  }

  .nav {
    background-color: var(--nav-bg);
    color: var(--nav-text);
  }
  `;
}