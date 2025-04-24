import { getIconLibraryInstructions } from '../api/generatePage/utils/icon-library'
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
  const imageInstructions = getImageInstructions(imageUrls, imageSource)

  // Generate color scheme guidance from the layout variations
  const colorGuidance = layoutVariations.colorScheme
    ? processColorScheme(layoutVariations.colorScheme, templateType)
    : 'Use a professional, business-appropriate color scheme with good contrast and readability'

  return `
    You are an expert frontend developer specializing in creating modern, visually stunning, conversion-optimized websites. Create a production-ready HTML webpage using the Bootstrap 5.3.2 framework for a ${templateType} business.
    
    BUSINESS DETAILS:
    - Name: ${businessDetails.name ?? 'Company Name'}
    - Address: ${businessDetails.address}
    - Phone: ${businessDetails.phone}
    - Email: ${businessDetails.email}
    
    SPECIFIC CONTENT:
    ${specificPrompt}
    
    IMAGE INTEGRATION:
    ${imageInstructions}
    
    DESIGN SPECIFICATIONS:
    - Color Scheme: ${colorGuidance}
    - Layout Structure: ${layoutVariations.layoutStructure}
    - Structural Organization: ${layoutVariations.structuralElement}
    - Visual Style: ${layoutVariations.visualStyle}
    - Interactive Elements: ${layoutVariations.interactiveElements}
    - Specialty Section: ${layoutVariations.specialtySection}
    
    BOOTSTRAP INTEGRATION:
    1. Use the following exact CDN links in the <head> section:
       <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
       <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" defer></script>
    2. For additional interactivity, include:
       <script src="https://code.jquery.com/jquery-3.7.1.slim.min.js" defer></script>
    3. Ensure Bootstrap classes are applied consistently throughout the document
    4. Leverage Bootstrap's utility classes (flex, spacing, etc.) for modern layouts
    5. Use Bootstrap components like cards, modals, and accordions where appropriate
    
    MODERN DESIGN REQUIREMENTS:
    1. Create a hero section with compelling headline and clear value proposition
    2. Use clean, minimalist design with strategic use of whitespace
    3. Implement a consistent vertical rhythm with proper spacing between sections
    4. Use card-based layouts for content grouping where appropriate
    5. Create balanced, asymmetrical layouts for visual interest
    6. Implement subtle parallax or scroll effects for key sections
    7. Use gradient overlays for image-based sections to ensure text readability

    IMPORTANT GRADIENT USAGE INSTRUCTION:
    - When using CSS gradients, use \`background: linear-gradient(...)\` or \`background-image: linear-gradient(...)\` directly, NOT inside \`url()\`, and never as an <img src>.
    - Do NOT use \`linear-gradient(...)\` as a value for \`src\` attributes or inside \`url()\`.
    
    FOOTER REQUIREMENT:
    Include a professionally designed footer with multiple columns:
    - Contact information (address, phone, email) with appropriate icons
    - Quick links to sections appropriate to the business type
    - Social media links with appropriate icons from the selected icon library
    - Copyright information with current year (2025)
    - Newsletter subscription field with proper validation
    
    TECHNICAL REQUIREMENTS:
    1. Implement a fully semantic HTML5 structure (header, nav, main, section, article, aside, footer)
    2. Embed all custom CSS directly into a <style> tag within the <head> of the HTML file
    3. Include comprehensive meta tags for SEO optimization including Open Graph and Twitter Card tags
    4. Create a fully responsive design with optimized breakpoints for all devices (mobile-first approach)
    5. Implement ARIA attributes and semantic elements for full accessibility (WCAG 2.1 AA compliance)
    6. For icons, use ${getIconLibraryInstructions(layoutVariations.iconSet)}
    7. Create elegant hover animations and transitions using CSS (subtle, professional, not flashy)
    8. Add schema.org JSON-LD structured data appropriate for the business type
    9. Implement form validation with user-friendly error handling and focus states
    10. Use defer attribute for non-critical scripts to improve page load performance
    11. Use relative font sizes (rem/em) for better accessibility and responsiveness
    12. Implement CSS custom properties for color themes and consistent styling
    
    ADVANCED FEATURES:
    1. Create a sticky header that minimizes on scroll
    2. Implement lazy loading for images with the loading="lazy" attribute
    3. Add subtle scroll animations for key content elements using Intersection Observer API
    4. Implement a mobile-friendly hamburger menu with smooth transitions
    5. Create microinteractions for buttons and interactive elements
    6. Use CSS Grid for complex layout sections alongside Bootstrap's grid system
    7. Implement color mode toggle (light/dark) using CSS variables if appropriate for the business
    
    CUTTING-EDGE ELEMENTS:
    1. Use CSS clip-path for creating unique section dividers and shapes
    2. Implement subtle background animations using CSS
    3. Use modern CSS techniques like backdrop-filter for frosted glass effects
    4. Create depth with subtle shadows and layering techniques
    5. Implement CSS scroll-snap for certain scrollable sections if appropriate
    
    ONLY return the complete HTML file with no markdown, explanations, or additional text.
    The code must be production-ready with no placeholders or TODO comments.
  `
}

/**
 * Processes color scheme information for the AI generator
 * @param colorScheme - Raw color scheme from form data
 * @param templateType - Business template type
 * @returns Formatted color guidance for the AI
 */
function processColorScheme(colorScheme: string, templateType: string): string {
  // If we have a list of user-provided colors
  if (colorScheme?.includes(',')) {
    const colors = colorScheme.split(',').filter(Boolean)

    // If we have valid colors, generate specific CSS variable guidance
    if (colors.length > 0) {
      // Use the first color as primary
      const palette = generateColorPalette(colors[0], templateType)
      const cssVariables = generateCssVariables(palette)

      return `
        Use this specific CSS variables setup in your design:
        \`\`\`css
        ${cssVariables}
        \`\`\`
        
        These variables are professionally designed to ensure proper contrast and color harmony.
        
        Base the site's color scheme around these primary colors: ${colors.join(
          ', '
        )}
      `
    }
  }

  // Default color guidance based on business type
  switch (templateType.toLowerCase()) {
    case 'restaurant':
      return 'Use warm, appetizing colors that evoke the dining experience while maintaining readability. Consider rich reds, warm earthy tones, or colors that complement food photography.'
    case 'logistics':
      return 'Use a professional, trustworthy color scheme with blues, grays, and subtle accent colors that convey reliability and efficiency. Maintain high contrast for readability.'
    case 'professional':
      return 'Use a sophisticated, executive color palette with deep blues, charcoal grays, and understated accent colors that convey expertise and professionalism.'
    default:
      return 'Use a balanced color scheme with good contrast, professional appearance, and industry-appropriate colors.'
  }
}

function getImageInstructions(
  imageUrls: string[],
  imageSource?: string
): string {
  // If imageSource is 'none', explicitly instruct not to use any images
  if (imageSource === 'none') {
    return `
    NO IMAGES INSTRUCTION:
    - Do NOT use any images or create image placeholders in the design
    - Instead, focus on creating an elegant, typography-focused design with:
      - Creative use of color blocks and gradients
      - Thoughtful whitespace and layout composition
      - Strong typography hierarchy with varied weights and sizes
      - Subtle background patterns or shapes where appropriate
      - Icon-based visual elements instead of photographs
    - Do NOT include any <img> tags or empty image containers
    - Do NOT use any stock photos or placeholder services like placeholder.com
    `
  }

  // Enhanced instructions for user-uploaded (manual) images
  if (imageSource === 'manual' && imageUrls.length > 0) {
    return `
    MANDATORY USER UPLOADED IMAGES - CRITICAL INSTRUCTIONS:
    I have uploaded ${
      imageUrls.length
    } custom image(s) that MUST be used prominently in the website:
    ${imageUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}
    
    THESE INSTRUCTIONS ARE MANDATORY:
    - The first image (${
      imageUrls[0]
    }) MUST BE USED as the hero/banner background at the top of the page
    - You MUST use background-image: url('${imageUrls[0]}') for the hero section
    - You MUST use ALL provided images in prominent positions
    - DO NOT substitute or ignore these images
    - DO NOT use any placeholder images or AI-generated images
    - Do not modify or change these image paths in any way
    
    For hero/banner image implementation, use this exact pattern:
    \`\`\`html
    <section class="hero" style="background-image: url('${
      imageUrls[0]
    }'); background-size: cover; background-position: center;">
      <!-- Hero content here -->
    </section>
    \`\`\`
    
    For other images, use:
    \`\`\`html
    <img src="${
      imageUrls.length > 1 ? imageUrls[1] : imageUrls[0]
    }" alt="Descriptive text" class="img-fluid">
    \`\`\`
    
    The website design MUST feature these exact images prominently - this is a strict requirement.
    `
  }

  // If we have AI-generated image URLs, use them
  if (imageUrls.length > 0) {
    return `CRITICAL IMAGE INSTRUCTIONS:
  I have pre-generated these exact image URLs that MUST be used in the website:
  ${imageUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}
 
  MANDATORY IMPLEMENTATION:
  - The first image (${imageUrls[0]}) MUST be used as the hero/banner background
  - Implement the hero section with: background-image: url('${imageUrls[0]}')
  - You MUST use ALL provided images in the website
  - Copy and paste the EXACT URLs as provided
  - DO NOT modify the URLs in any way
  - DO NOT replace these URLs with placeholder images
  - All images must be implemented either as <img> tags or CSS background images
  - These images will load correctly when viewed in a browser
  - Ensure all images have meaningful, descriptive alt text for accessibility
  - Use appropriate image optimization techniques (lazy loading, responsive images)
  `
  }

  // Default case with no images
  return `
  MINIMAL IMAGE INSTRUCTION:
  - Use a minimal approach with typography and layout instead of relying on images
  - Do NOT use placeholder services like placeholder.com or placehold.it
  - If absolutely necessary for the design, use free SVG illustrations or icons from the Bootstrap icon library
  - Focus on creating an elegant design through typography, spacing, and interactive elements
  `
}
