//import { getIconLibraryInstructions } from '../api/generatePage/utils/icon-library'
import { LayoutVariation } from '../api/generatePage/types/website-generator'
import {
  generateColorPalette,
  generateCssVariables,
} from '../build/colorProcessor'

export function buildPrompt(
  templateType: string,
  businessDetails: {
    name?: string
    address: string
    phone: string
    email: string
  },
  specificPrompt: string,
  imageUrls: string[],
  layoutVariations: LayoutVariation,
  imageSource?: string
): string {
  // Strict image usage instructions
  let imageInstruction = '';
  if (imageSource === 'none' || !imageUrls || imageUrls.length === 0) {
    imageInstruction = `NO IMAGES: Do not include any <img> tags, background images, or references to images. The website must be visually appealing using only text, color, layout, gradients, SVG, and CSS. Do not reference any image filenames or stock photos.`;
  } else {
    imageInstruction = `IMAGE USAGE: Use ONLY these image files for all images in the website: ${imageUrls.join(', ')}. Do not reference any other images or filenames. If you need more images than provided, reuse these or leave the image blank. Do not invent filenames. All <img> and background-image URLs must be from this list.`;
  }

  const colorGuidance = layoutVariations.colorScheme
    ? processColorScheme(layoutVariations.colorScheme, templateType)
    : 'Use a professional color scheme aligned with 2025 design trends, ensuring WCAG AA contrast compliance'

  return `
You are an expert frontend developer and designer. Generate a complete, production-ready HTML5 website for a real business, using Bootstrap 5.3.2 and modern best practices.

BUSINESS DETAILS:
- Name: ${businessDetails.name ?? 'Company Name'}
- Address: ${businessDetails.address}
- Phone: ${businessDetails.phone}
- Email: ${businessDetails.email}

SPECIFIC CONTENT REQUIREMENTS:
${specificPrompt}

${imageInstruction}

DESIGN SPECIFICATIONS:
- Color Scheme: ${colorGuidance}
- Layout Structure: ${layoutVariations.layoutStructure}
- Structural Organization: ${layoutVariations.structuralElement}
- Visual Style: ${layoutVariations.visualStyle}
- Interactive Elements: ${layoutVariations.interactiveElements}
- Specialty Section: ${layoutVariations.specialtySection}

STRICT REQUIREMENTS:
- Use only valid, semantic HTML5.
- Use Bootstrap 5.3.2 for layout, grid, and components. Do not use deprecated or custom frameworks.
- Use a visually appealing, modern, and professional design. Use a harmonious color palette and consistent spacing.
- Use real, plausible business content and copywriting. Do not use placeholder text like "Lorem Ipsum" or generic dish names. Use realistic menu items, chef names, testimonials, and business details.
- Include a responsive navigation bar with a logo, business name, and links to all main sections. On mobile, use a hamburger menu.
- The hero section must have a visually striking background image (if images are provided) or a premium gradient background (if not).
- Menu section: List at least 6 real, creative dishes with descriptions and prices, using Bootstrap cards or grid.
- Reservation section: Include a real, working reservation form with fields for name, email, date, time, party size, and special requests.
- Chefs section: Show at least 2 chef profiles with real names, photos (from provided images if available), and short bios.
- Gallery: Use a Bootstrap carousel with provided images (if any).
- Testimonials: Show at least 2 real-sounding customer reviews with names and (if images are available) photos.
- Contact section: Show real business address, phone, email, and a Google Maps embed (use a real embed code or a placeholder div).
- Footer: Include business info, social media links (with real icons), and copyright.
- Use visually appealing CSS variables for colors, spacing, and transitions. All colors must be accessible (WCAG AA).
- Add subtle animations (e.g., fade-in, hover effects) using Bootstrap and CSS.
- All images must use the provided image filenames only.
- Do not use any placeholder or generic text. All content must be realistic and tailored to the business type.
- Do not include any markdown, explanations, or comments. Return only the final HTML.

ONLY return the complete HTML file with no markdown, explanations, or additional text.
The code must be production-ready with absolutely no placeholder content, lorem ipsum text, or TODO comments.
  `
}

/**
 * Enhanced image instructions for premium websites
 */
function getImageInstructions(
  imageUrls: string[],
  imageSource?: string
): string {
  // No images case
  if (imageSource === 'none') {
    return `
    SOPHISTICATED NO-IMAGE DESIGN APPROACH:
    - Create a premium typography-focused design that uses color, shape, and whitespace instead of images
    - Implement creative CSS-based visual elements including:
      - Sophisticated gradient backgrounds with multiple color stops
      - Elegant geometric shapes and patterns using CSS
      - Custom animated SVG illustrations for visual interest
      - Interactive text effects and animations
      - Advanced border treatments and decorative elements
    - Emphasize premium typography with variable fonts and advanced text styling
    - Use strategic white space to create visual breathing room and hierarchy
    - NO image elements, placeholders, or stock photo references should be included
    `
  }

  // User uploaded images
  if (imageSource === 'manual' && imageUrls.length > 0) {
    return `
    PREMIUM CUSTOM IMAGE INTEGRATION:
    I've uploaded ${
      imageUrls.length
    } high-quality images that must be featured prominently:
    ${imageUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}
    
    IMPLEMENT WITH THESE PREMIUM TECHNIQUES:
    - The first image (${imageUrls[0]}) MUST BE the hero background with:
      - Proper image optimization attributes (loading="lazy", fetchpriority="high")
      - Strategic gradient overlay for text contrast
      - Subtle parallax effect on scroll
    - Secondary images must be implemented with:
      - Art-directed responsive images using picture/source elements
      - Modern aspect-ratio preservation techniques
      - Elegant hover animations and transitions
      - Strategic cropping and positioning for maximum impact
    
    Example hero implementation:
    \`\`\`html
    <section class="hero" style="background-image: url('${
      imageUrls[0]
    }'); background-size: cover; background-position: center;">
      <div class="hero-gradient-overlay"></div>
      <!-- Hero content -->
    </section>
    \`\`\`
    
    Example content image implementation:
    \`\`\`html
    <picture>
      <source media="(max-width: 768px)" srcset="${
        imageUrls.length > 1 ? imageUrls[1] : imageUrls[0]
      }">
      <img src="${
        imageUrls.length > 1 ? imageUrls[1] : imageUrls[0]
      }" alt="[Descriptive text]" loading="lazy" class="premium-image">
    </picture>
    \`\`\`
    
    These exact images MUST be integrated with premium presentation techniques.
    `
  }

  // AI-generated images
  if (imageUrls.length > 0) {
    return `
    PREMIUM AI-GENERATED IMAGE INTEGRATION:
    I've created these professional images specifically for this website:
    ${imageUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}
 
    IMPLEMENT USING THESE TECHNIQUES:
    - The first image (${imageUrls[0]}) MUST be the hero background with:
      - Advanced CSS background techniques (multiple layers, blend modes)
      - Strategic text positioning for maximum impact
      - Subtle animation effects on page load
    - All provided images must be implemented with:
      - Modern lazy loading and priority hints
      - Subtle hover effects and transitions
      - Art-directed responsive design via picture element
      - Strategic cropping and focal points
    
    All image URLs must be implemented exactly as provided, with proper alt text for accessibility.
    `
  }

  // Default with minimal images
  return `
  PREMIUM DESIGN WITHOUT IMAGES:
  - Create a sophisticated design that leverages modern CSS techniques instead of relying on photos
  - Implement visual interest through:
    - Custom animated SVG illustrations and icons
    - Sophisticated gradient backgrounds and color transitions
    - Strategic use of whitespace and typography
    - Decorative geometric shapes and patterns
    - Subtle animated elements and micro-interactions
  - Focus on creating an impressive experience through layout, typography, and animation
  `
}

/**
 * Advanced color scheme processor that generates sophisticated palettes
 */
function processColorScheme(colorScheme: string, templateType: string): string {
  // If we have user-provided colors
  if (colorScheme?.includes(',')) {
    const colors = colorScheme.split(',').filter(Boolean)

    // Generate professional palette with color theory principles
    if (colors.length > 0) {
      const palette = generateColorPalette(colors[0], templateType)
      const cssVariables = generateCssVariables(palette)

      return `
        Implement this premium color system with CSS variables:
        \`\`\`css
        ${cssVariables}
        \`\`\`
        
        Use these variables to create a sophisticated color system with:
        - Strategic color hierarchy (primary, secondary, accent)
        - Proper contrast ratios for accessibility (WCAG AA)
        - Elegant color transitions and hover states
        - Subtle gradient variations using the primary colors: ${colors.join(
          ', '
        )}
      `
    }
  }

  // Enhanced industry-specific color guidance
  switch (templateType.toLowerCase()) {
    case 'restaurant':
      return 'Create a sophisticated culinary-inspired color scheme with rich, appetizing colors that evoke the dining experience. Balance warm tones that highlight food photography with elegant neutrals for readability, with strategic accent colors that reflect the cuisine style.'

    case 'logistics':
      return 'Implement a premium, trustworthy color scheme with deep blues, strategic accent colors, and data visualization-optimized secondary palette. Create color hierarchy that conveys reliability, efficiency, and global capability while ensuring excellent readability.'

    case 'professional':
      return 'Design an executive-level color system with sophisticated blues, elegant neutrals, and refined accent colors that convey authority and expertise. Use color strategically to highlight key information and create visual hierarchy while maintaining a premium aesthetic.'

    default:
      return 'Implement a premium color scheme with strategic primary, secondary, and accent colors that create visual hierarchy, ensure accessibility, and convey brand personality through thoughtful application.'
  }
}
