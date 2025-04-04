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
  layoutVariations: LayoutVariation
): string {
  const imageInstructions = getImageInstructions(imageUrls);
  
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

    COLOR SCHEME:
    ${layoutVariations.colorScheme}

    LAYOUT STRUCTURE:
    ${layoutVariations.layoutStructure}

    STRUCTURAL ORGANIZATION:
    ${layoutVariations.structuralElement}

    VISUAL STYLE:
    ${layoutVariations.visualStyle}

    INTERACTIVE ELEMENTS:
    ${layoutVariations.interactiveElements}

    SPECIALTY SECTION:
    ${layoutVariations.specialtySection}

    FOOTER REQUIREMENT:
    Include a footer with multiple columns:
    - Contact information (address, phone, email).
    - Quick links to sections appropriate to the business type.
    - Social media links with Font Awesome icons.

    TECHNICAL REQUIREMENTS:
    1. Use Bootstrap 5 CSS framework via CDN for styling WITHOUT integrity attributes.
    2. Embed all custom CSS directly into the <style> tag within the <head> of the HTML file.
    3. Implement a fully semantic HTML5 structure with proper hierarchy.
    4. Include comprehensive meta tags for SEO optimization.
    5. Create a fully responsive design with optimized breakpoints for all devices.
    6. Implement ARIA attributes and semantic elements for full accessibility.
    7. For icons, use ${getIconLibraryInstructions(layoutVariations.iconSet)}.
    8. Create elegant hover animations and transitions using CSS.
    9. Add schema.org JSON-LD structured data for SEO enhancement.
    10. Implement form validation with user-friendly error handling.
    11. Ensure cross-browser compatibility and optimize for page speed.
    12. IMPORTANT: Remove all integrity attributes from CDN links to prevent loading issues.
    13. IMPORTANT: Ensure all scripts and resources are properly loaded and initialized.

    ONLY return the complete HTML file with no markdown, explanations, or additional text.
    The code must be production-ready with no placeholders or TODO comments.
  `;
}

function getImageInstructions(imageUrls: string[]): string {
  return imageUrls.length > 0
    ? `CRITICAL IMAGE INSTRUCTIONS: 
  I have pre-generated these exact image URLs that MUST be used in the website:
  ${imageUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}
  
  For each image URL above:
  - Copy and paste the EXACT URL into an <img> tag
  - Example: <img src="${imageUrls[0] || 'https://example.com/image.jpg'}" alt="Description" class="img-fluid">
  - Do NOT modify the URLs in any way
  - Do NOT replace these URLs with placeholder images
  - These images will load correctly when viewed in a browser
  `
    : 'No custom images provided.';
}
