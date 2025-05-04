/**
 * Color processing utilities for generating harmonious color palettes
 * with added validation for user-provided colors
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

/**
 * Converts hex color to HSL values
 */
export function hexToHSL(hex: string): {h: number, s: number, l: number} {
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
export function hslToHex(hsl: {h: number, s: number, l: number}): string {
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
// NEW: Color Validation and Adjustment Functions
// =============================================================================

/**
 * Checks if a color is too vibrant or inappropriate for professional use
 * @param color - Hex color to check
 * @param businessType - Type of business for context-appropriate validation
 * @returns Object with isValid flag and adjustedColor if needed
 */
export function validateColor(color: string, businessType: string = 'professional'): { 
  isValid: boolean; 
  adjustedColor: string;
  reason?: string;
} {
  const hsl = hexToHSL(color);
  let isValid = true;
  let reason = '';
  
  // Check for extremely high saturation (neon colors)
  if (hsl.s > 0.85) {
    isValid = false;
    reason = 'Color is too saturated (neon-like)';
  }
  
  // Check for colors that are too light or too dark
  if (hsl.l < 0.15) {
    isValid = false;
    reason = 'Color is too dark for good visibility';
  } else if (hsl.l > 0.92) {
    isValid = false;
    reason = 'Color is too light for good visibility';
  }
  
  // Business-specific validations
  if (businessType === 'professional') {
    // For professional services, colors should be more conservative
    if (hsl.s > 0.7) {
      isValid = false;
      reason = 'Color is too vibrant for professional services';
    }
  } else if (businessType === 'logistics') {
    // For logistics, avoid colors that give warning/danger impressions unless they're brand colors
    if ((hsl.h >= 0 && hsl.h <= 30) || (hsl.h >= 330 && hsl.h <= 360)) {
      if (hsl.s > 0.7 && hsl.l > 0.5) {
        isValid = false;
        reason = 'Bright red/orange may give warning impression for logistics';
      }
    }
  }
  
  // If color is invalid, adjust it to make it more appropriate
  const adjustedColor = isValid ? color : adjustColorForProfessionalUse(color, businessType);
  
  return { isValid, adjustedColor, reason };
}

/**
 * Adjusts a color to make it more appropriate for professional use
 * @param color - The original hex color
 * @param businessType - Type of business for context-appropriate adjustment
 * @returns Adjusted hex color
 */
function adjustColorForProfessionalUse(color: string, businessType: string): string {
  const hsl = hexToHSL(color);
  
  // General adjustments
  const adjustedHSL = { ...hsl };
  
  // Reduce saturation for very vibrant colors
  if (hsl.s > 0.7) {
    adjustedHSL.s = businessType === 'professional' ? 0.55 : 0.7;
  }
  
  // Adjust lightness for too dark or too light colors
  if (hsl.l < 0.15) {
    adjustedHSL.l = 0.25;
  } else if (hsl.l > 0.92) {
    adjustedHSL.l = 0.85;
  }
  
  // Business-specific adjustments
  if (businessType === 'professional') {
    // Adjust hue if it's a particularly unprofessional color
    // Move fluorescent colors toward more conservative hues
    if ((hsl.h >= 50 && hsl.h <= 70) && hsl.s > 0.7) { // Neon yellow/green
      adjustedHSL.h = 215; // More blue/corporate
      adjustedHSL.s = 0.5;
    }
  }
  
  return hslToHex(adjustedHSL);
}

/**
 * Batch validates and adjusts multiple colors
 * @param colors - Array of hex colors to check
 * @param businessType - Type of business for context-appropriate validation
 * @returns Validated and adjusted colors
 */
export function validateColorScheme(colors: string[], businessType: string = 'professional'): {
  isValid: boolean;
  adjustedColors: string[];
  issues: string[];
} {
  const issues: string[] = [];
  const adjustedColors: string[] = [];
  let isValid = true;
  
  colors.forEach((color) => {
    const validation = validateColor(color, businessType);
    
    if (!validation.isValid) {
      isValid = false;
      issues.push(`${color}: ${validation.reason}`);
    }
    
    adjustedColors.push(validation.adjustedColor);
  });
  
  // Additional check for color harmony
  const harmonyResult = checkColorHarmony(adjustedColors);
  if (!harmonyResult.isHarmonious) {
    isValid = false;
    issues.push(...harmonyResult.issues);
    return {
      isValid,
      adjustedColors: harmonizeColors(adjustedColors, businessType),
      issues
    };
  }
  
  return {
    isValid,
    adjustedColors,
    issues
  };
}

/**
 * Checks if a color combination is harmonious
 */
function checkColorHarmony(colors: string[]): {
  isHarmonious: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check harmony between all color pairs
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      if (!areColorsHarmonious(colors[i], colors[j])) {
        issues.push(`Colors ${colors[i]} and ${colors[j]} are not harmonious together`);
      }
    }
  }
  
  return {
    isHarmonious: issues.length === 0,
    issues
  };
}

/**
 * Harmonizes a set of colors to work better together
 */
function harmonizeColors(colors: string[], businessType: string): string[] {
  if (colors.length <= 1) return colors;
  
  // Use the first color as the base and adjust others to harmonize with it
  const baseColor = colors[0];
  const baseHSL = hexToHSL(baseColor);
  
  return colors.map((color, index) => {
    if (index === 0) return color; // Keep the first color unchanged
    
    const colorHSL = hexToHSL(color);
    
    // Calculate hue difference
    const hueDiff = Math.abs(baseHSL.h - colorHSL.h);
    
    if (!areColorsHarmonious(baseColor, color)) {
      // Adjust to nearest harmonic relationship
      let newHue = baseHSL.h;
      
      if (hueDiff < 30) {
        // Make more analogous with 30° separation
        newHue = (baseHSL.h + 30) % 360;
      } else if (hueDiff < 90) {
        // Make 90° complement
        newHue = (baseHSL.h + 90) % 360;
      } else if (hueDiff < 180) {
        // Make complementary with 180° separation
        newHue = (baseHSL.h + 180) % 360;
      } else {
        // Make triadic with 120° separation
        newHue = (baseHSL.h + 120) % 360;
      }
      
      // For professional business type, reduce saturation slightly for harmonized colors
      const newSaturation = businessType === 'professional' ? 
        Math.min(colorHSL.s, 0.6) : colorHSL.s;
      
      return hslToHex({
        h: newHue,
        s: newSaturation,
        l: colorHSL.l
      });
    }
    
    return color;
  });
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

// =============================================================================
// Color Palette Generation
// =============================================================================

/**
 * Generates random hex color in a specified range of HSL values
 * @param hueRange Range for hue [min, max]
 * @param satRange Range for saturation [min, max] as percentages
 * @param lightRange Range for lightness [min, max] as percentages
 * @returns Hex color string
 */
export function generateRandomColor(
  hueRange: [number, number] = [0, 360],
  satRange: [number, number] = [30, 70],
  lightRange: [number, number] = [30, 70]
): string {
  // Generate random HSL values within the specified ranges
  const h = Math.floor(Math.random() * (hueRange[1] - hueRange[0])) + hueRange[0];
  const s = (Math.floor(Math.random() * (satRange[1] - satRange[0])) + satRange[0]) / 100;
  const l = (Math.floor(Math.random() * (lightRange[1] - lightRange[0])) + lightRange[0]) / 100;
  
  // Convert HSL to hex
  return hslToHex({ h, s, l });
}

/**
 * Generates a set of harmonious random colors that meet WCAG standards
 * @param count Number of colors to generate (default 4)
 * @param businessType Business type for validation context
 * @returns Array of hex color strings
 */
export function generateRandomColorSet(count: number = 4, businessType: string = 'professional'): string[] {
  const colors: string[] = [];
  
  // Generate base color first with moderate saturation and lightness
  // for good readability and harmonious variations
  const baseColor = generateRandomColor(
    [0, 360],
    businessType === 'professional' ? [30, 50] : [40, 60],
    [35, 55]
  );
  
  const baseHSL = hexToHSL(baseColor);
  colors.push(baseColor);
  
  // Generate the rest based on color theory
  for (let i = 1; i < count; i++) {
    let newColor: string;
    
    // Apply color theory to create harmonious colors
    switch (i) {
      case 1: // Analogous color
        newColor = hslToHex({
          h: (baseHSL.h + 30) % 360,
          s: Math.min(baseHSL.s, 0.7),
          l: Math.min(Math.max(baseHSL.l + 0.1, 0.3), 0.7)
        });
        break;
      case 2: // Complementary variant
        newColor = hslToHex({
          h: (baseHSL.h + 180) % 360,
          s: Math.min(baseHSL.s * 0.9, 0.6),
          l: Math.min(Math.max(baseHSL.l, 0.3), 0.7)
        });
        break;
      case 3: // Triadic variant
        newColor = hslToHex({
          h: (baseHSL.h + 120) % 360,
          s: Math.min(baseHSL.s * 0.8, 0.5),
          l: Math.min(Math.max(baseHSL.l - 0.1, 0.3), 0.7)
        });
        break;
      default: // Randomized with constraints
        newColor = generateRandomColor(
          [(baseHSL.h + 60 * i) % 360, (baseHSL.h + 60 * i + 30) % 360],
          [Math.max(baseHSL.s * 100 - 10, 30), Math.min(baseHSL.s * 100 + 10, 70)],
          [Math.max(baseHSL.l * 100 - 15, 30), Math.min(baseHSL.l * 100 + 15, 70)]
        );
    }
    
    colors.push(newColor);
  }
  
  // Process the colors to ensure they meet standards
  return processUserColors(colors, businessType);
}

/**
 * Check if a set of colors passes WCAG AA contrast with standard text
 * @param colors Array of hex color strings to check
 * @returns boolean indicating if all colors pass
 */
export function checkWCAGCompliance(colors: string[]): boolean {
  // Check contrast of all colors against white and black
  // as those are common text colors
  const whiteText = '#FFFFFF';
  const blackText = '#000000';
  
  for (const color of colors) {
    const whiteContrast = calculateContrastRatio(color, whiteText);
    const blackContrast = calculateContrastRatio(color, blackText);
    
    // WCAG AA requires 4.5:1 for normal text
    if (whiteContrast < 4.5 && blackContrast < 4.5) {
      return false;
    }
  }
  
  return true;
}

/**
 * Generates a complete color palette based on a base color and template type
 */
export function generateColorPalette(baseColor: string, templateType: string): ColorPalette {
  // First validate the base color
  const validatedBase = validateColor(baseColor, templateType);
  const adjustedBaseColor = validatedBase.adjustedColor;
  
  // Convert the base color to HSL for easier manipulation
  const baseColorHSL = hexToHSL(adjustedBaseColor);
  
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
  const adjustedBaseColorFinal = hslToHex(adjustedHSL);
  
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
    primary: adjustedBaseColorFinal,
    secondary,
    accent,
    text: textColor,
    background: backgroundColor,
    lightShade: hslToHex({h: adjustedHSL.h, s: 8, l: 95}),
    darkShade: hslToHex({h: adjustedHSL.h, s: 20, l: 25}),
    analogous: [analogous1, analogous2] as [string, string]
  };
  
  return palette;
}

/**
 * Processes user-provided colors for use in the website
 * @param colors - Array of hex colors provided by user
 * @param businessType - Type of business for context-appropriate validation
 * @returns Validated and adjusted colors ready for use
 */
export function processUserColors(colors: string[], businessType: string): string[] {
  // Skip processing if no colors
  if (!colors || colors.length === 0) {
    return [];
  }
  
  // Validate and adjust the colors
  const validation = validateColorScheme(colors, businessType);
  
  // Log any issues for debugging
  if (validation.issues.length > 0) {
    console.log('⚠️ Color adjustment needed:', validation.issues);
  }
  
  return validation.adjustedColors;
}

/**
 * Generates CSS variables for direct injection into HTML based on a color palette
 */
export function generateCssVariables(palette: ColorPalette) {
  // Validate contrast and adjust text color if needed
  const textBackgroundContrast = calculateContrastRatio(palette.text, palette.background);
  const adjustedTextColor = textBackgroundContrast < 4.5 
    ? (() => {
        const luminance = calculateRelativeLuminance(palette.background);
        return luminance > 0.5 ? '#000000' : '#ffffff';
      })()
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