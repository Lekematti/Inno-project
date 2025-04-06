// Updated buildPrompt.ts
import { getIconLibraryInstructions } from '../api/generatePage/utils/icon-library';
import { LayoutVariation } from '../api/generatePage/types/website-generator';

export function buildPrompt(
  templateType: string,
  businessDetails: {
    name?: string;
    address: string;
    phone: string;
    email: string;
  },
  specificPrompt: string,
  imageUrls: string[],
  layoutVariations: LayoutVariation,
  imageSource?: string
): string {
  const imageInstructions = getImageInstructions(imageUrls, imageSource);
 
  return `
    You are an expert frontend developer specializing in creating visually stunning, conversion-optimized websites. Create a production-ready HTML webpage using the Bootstrap 5 framework for a ${templateType} business.
    
    BUSINESS DETAILS:
    - Name: ${businessDetails.name || 'Company Name'}
    - Address: ${businessDetails.address}
    - Phone: ${businessDetails.phone}
    - Email: ${businessDetails.email}
    
    SPECIFIC CONTENT:
    ${specificPrompt}
    
    IMAGE INTEGRATION:
    ${imageInstructions}
    
    DESIGN SPECIFICATIONS:
    - Color Scheme: ${layoutVariations.colorScheme}
    - Layout Structure: ${layoutVariations.layoutStructure}
    - Structural Organization: ${layoutVariations.structuralElement}
    - Visual Style: ${layoutVariations.visualStyle}
    - Interactive Elements: ${layoutVariations.interactiveElements}
    - Specialty Section: ${layoutVariations.specialtySection}
    
    FOOTER REQUIREMENT:
    Include a professionally designed footer with multiple columns:
    - Contact information (address, phone, email) with appropriate icons
    - Quick links to sections appropriate to the business type
    - Social media links with appropriate icons from the selected icon library
    - Copyright information with current year
    
    TECHNICAL REQUIREMENTS:
    1. Use Bootstrap 5 CSS framework via CDN (latest stable version) for styling WITHOUT integrity attributes
    2. Embed all custom CSS directly into a <style> tag within the <head> of the HTML file
    3. Implement a fully semantic HTML5 structure with proper hierarchy (header, nav, main, section, article, aside, footer)
    4. Include comprehensive meta tags for SEO optimization including Open Graph and Twitter Card tags
    5. Create a fully responsive design with optimized breakpoints for all devices (mobile-first approach)
    6. Implement ARIA attributes and semantic elements for full accessibility (WCAG 2.1 AA compliance)
    7. For icons, use ${getIconLibraryInstructions(layoutVariations.iconSet)}
    8. Create elegant hover animations and transitions using CSS (subtle, professional, not flashy)
    9. Add schema.org JSON-LD structured data appropriate for the business type
    10. Implement form validation with user-friendly error handling and focus states
    11. Ensure cross-browser compatibility and optimize for page speed (minimize nested elements, avoid excessive DOM depth)
    12. IMPORTANT: Remove all integrity attributes from CDN links to prevent loading issues
    13. IMPORTANT: Use defer attribute for non-critical scripts to improve page load performance
    14. IMPORTANT: Ensure all scripts and resources are properly loaded and initialized
    15. IMPORTANT: Use relative font sizes (rem/em) for better accessibility and responsiveness
    
    ADVANCED REQUIREMENTS:
    1. Implement subtle scroll animations for key content sections using pure CSS
    2. Create a persistent, mobile-friendly navigation with smooth collapse/expand
    3. Ensure high contrast ratios between text and backgrounds (at least 4.5:1 for normal text)
    4. Include properly optimized heading hierarchy (H1-H6) for improved SEO and accessibility
    5. Add appropriate microinteractions (hover states, focus indicators, etc.) for interactive elements
    6. Build with performance in mind (avoid large DOM trees, optimize CSS selectors)
    
    ONLY return the complete HTML file with no markdown, explanations, or additional text.
    The code must be production-ready with no placeholders or TODO comments.
  `;
}

function getImageInstructions(imageUrls: string[], imageSource?: string): string {
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
    `;
  }
  
  // If we have specific image URLs, use them
  return imageUrls.length > 0
    ? `CRITICAL IMAGE INSTRUCTIONS:
  I have pre-generated these exact image URLs that MUST be used in the website:
  ${imageUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}
 
  For each image URL above:
  - Copy and paste the EXACT URL into an <img> tag
  - Example: <img src="${imageUrls[0] || 'https://example.com/image.jpg'}" alt="Descriptive text about the image content" class="img-fluid">
  - Do NOT modify the URLs in any way
  - Do NOT replace these URLs with placeholder images
  - These images will load correctly when viewed in a browser
  - Ensure all images have meaningful, descriptive alt text for accessibility
  - Use appropriate image optimization techniques (lazy loading, responsive images)
  `
    : `
    MINIMAL IMAGE INSTRUCTION:
    - Use a minimal approach with typography and layout instead of relying on images
    - Do NOT use placeholder services like placeholder.com or placehold.it
    - If absolutely necessary for the design, use free SVG illustrations or icons from the Bootstrap icon library
    - Focus on creating an elegant design through typography, spacing, and interactive elements
    `;
}