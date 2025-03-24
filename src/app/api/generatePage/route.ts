import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fetchImages } from '@/app/buildpage/imageProcessor';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string });

// Add a simple debounce mechanism using a cache
const generationCache = {
  lastRequest: '',
  lastResult: '',
  timestamp: 0
};

export async function generateCustomPage(formData: {
  businessType: string;
  address: string;
  phone: string;
  email: string;
  imageUrls?: string[];
  [key: string]: unknown;
}): Promise<string> {
    const { businessType, address, phone, email, imageUrls = [] } = formData;
    const templateType = businessType.toLowerCase();
    const answers = [];
    
    // Create a cache key from the form data
    const requestKey = JSON.stringify(formData);
    
    // Return cached result if it's recent (within 5 seconds)
    const now = Date.now();
    if (requestKey === generationCache.lastRequest && (now - generationCache.timestamp) < 5000) {
      console.log("🔄 Using cached result...");
      return generationCache.lastResult;
    }
    
    // Gather all the answers from the form data
    for (let i = 1; i <= 10; i++) {
        const key = `question${i}`;
        if (formData[key]) {
            answers.push(formData[key]);
        } else {
            answers.push(''); // Push empty string if answer is not provided
        }
    }

    // Create template-specific prompt
    let specificPrompt = "";
    if (templateType === "restaurant") {
        specificPrompt = `
        - Restaurant name: ${typeof answers[0] === 'string' ? answers[0] : address}
        - Cuisine type: ${typeof answers[1] === 'string' ? answers[1] : 'Not specified'}
        - Online menu: ${answers[2] === 'yes' ? 'Include an attractive, well-structured online menu with sections for appetizers, main courses, desserts, and beverages' : 'No online menu needed'}
        - Reservation system: ${answers[3] === 'yes' ? 'Include an elegant reservation form with date/time picker and party size selection' : 'No reservation system needed'}
        - Business hours: ${typeof answers[4] === 'string' ? answers[4] : 'Not specified'}
        - Chef/team profiles: ${answers[5] === 'yes' ? 'Include professional profiles for key staff with high-quality image placeholders' : 'No profiles needed'}
        - Food gallery: ${answers[6] === 'yes' ? 'Create a visually appealing masonry-style gallery with lightbox functionality' : 'No gallery needed'}
        - Testimonials: ${answers[7] === 'yes' ? 'Include a testimonials carousel with customer quotes and ratings' : 'No testimonials section needed'}
        - Primary brand color: ${typeof answers[8] === 'string' ? answers[8] : '#8D5524'}
        - Delivery/takeout info: ${answers[9] === 'yes' ? 'Include an online ordering section with delivery radius information' : 'No delivery information needed'}
        
        ADDITIONAL REQUIREMENTS:
        1. Create a sophisticated, mouth-watering design with premium aesthetics
        2. Incorporate high-quality food imagery placeholders with appropriate alt text
        3. Implement an elegant menu section with proper typography hierarchy and visual separators
        4. Use subtle animations for hover effects and transitions
        5. Include a sticky header with prominent call-to-action buttons
        6. Ensure all contact information is easily accessible
        7. Add a Google Maps placeholder for the restaurant location
        8. Implement schema.org structured data for restaurants (LocalBusiness)
        `;
    } else if (templateType === "logistics") {
        specificPrompt = `
        - Company name: ${typeof answers[0] === 'string' ? answers[0] : address}
        - Logistics services: ${typeof answers[1] === 'string' ? answers[1] : 'Not specified'}
        - Shipment tracking: ${answers[2] === 'yes' ? 'Include a professional tracking interface with order ID input field' : 'No tracking feature needed'}
        - Fleet/equipment showcase: ${answers[3] === 'yes' ? 'Create a visually appealing carousel showcasing transportation assets' : 'No fleet showcase needed'}
        - Service areas: ${typeof answers[4] === 'string' ? answers[4] : 'Not specified'}
        - Testimonials/case studies: ${answers[5] === 'yes' ? 'Include a metrics-focused case studies section with client logos and quantifiable results' : 'No testimonials section needed'}
        - Service request form: ${answers[6] === 'yes' ? 'Include a multi-step service request form with shipment details fields' : 'No service request form needed'}
        - Certifications/standards: ${typeof answers[7] === 'string' ? answers[7] : 'Not specified'}
        - Primary brand color: ${typeof answers[8] === 'string' ? answers[8] : '#1C3D5A'}
        - Service area map: ${answers[9] === 'yes' ? 'Include an interactive map visualization with service coverage highlighting' : 'No map needed'}
        
        ADDITIONAL REQUIREMENTS:
        1. Create a professional, trustworthy design with a focus on reliability and precision
        2. Use a modern, clean interface with strategic whitespace
        3. Implement custom icons for different logistics services and capabilities
        4. Include animated statistics or counters for key metrics (packages delivered, countries served, etc.)
        5. Add a prominent "Get Quote" call-to-action in the header
        6. Create a sticky header with main navigation and contact information
        7. Implement schema.org structured data for local business and services
        8. Add a timeline or process visualization for how shipments are handled
        `;
    } else if (templateType === "professional") {
        specificPrompt = `
        - Firm name: ${typeof answers[0] === 'string' ? answers[0] : address}
        - Professional services: ${typeof answers[1] === 'string' ? answers[1] : 'Not specified'}
        - Team profiles: ${answers[2] === 'yes' ? 'Include elegant team profiles with professional headshots, credentials, and specialties' : 'No team profiles needed'}
        - Case studies: ${answers[3] === 'yes' ? 'Include detailed case studies with problem-solution-result structure' : 'No case studies section needed'}
        - Client portal: ${answers[4] === 'yes' ? 'Include a sophisticated client portal login section with secure access messaging' : 'No client portal link needed'}
        - Consultation info: ${answers[5] === 'yes' ? 'Feature a prominent consultation booking system with availability calendar' : 'Include standard contact information'}
        - Credentials/affiliations: ${typeof answers[6] === 'string' ? answers[6] : 'Not specified'}
        - FAQ section: ${answers[7] === 'yes' ? 'Include an accordion-style FAQ section with comprehensive information' : 'No FAQ section needed'}
        - Primary brand color: ${typeof answers[8] === 'string' ? answers[8] : '#2E5984'}
        - Blog/resources: ${answers[9] === 'yes' ? 'Include a content-rich resources section with categorized articles' : 'No blog/resources section needed'}
        
        ADDITIONAL REQUIREMENTS:
        1. Create a sophisticated, premium design with executive aesthetic
        2. Implement subtle animations and transitions for interactive elements
        3. Use high-quality stock imagery placeholders appropriate for professional services
        4. Include trust indicators like credentials, awards, and association logos
        5. Create a sticky header with prominent consultation call-to-action
        6. Implement testimonial showcases from notable clients
        7. Add schema.org structured data for professional services and organization
        8. Create a polished footer with comprehensive site navigation and contact details
        `;
    }
    
    const currentYear = new Date().getFullYear();
    const imageInstructions = imageUrls.length > 0 ? `CRITICAL IMAGE INSTRUCTIONS: 
    I have pre-generated these exact image URLs that MUST be used in the website:
    ${imageUrls.map((url, i) => `${i+1}. ${url}`).join('\n')}
    
    For each image URL above:
    - Copy and paste the EXACT URL into an <img> tag
    - Example: <img src="${imageUrls[0] || 'https://example.com/image.jpg'}" alt="Description" class="img-fluid">
    - Do NOT modify the URLs in any way
    - Do NOT replace these URLs with placeholder images
    - These images will load correctly when viewed in a browser
    `
      : 'No custom images provided.';
    const prompt = `
    You are an expert frontend developer specializing in creating visually stunning, conversion-optimized websites. Create a production-ready HTML webpage using the Bootstrap 5 framework for a ${templateType} business.

    BUSINESS DETAILS:
    - Name: ${typeof answers[0] === 'string' ? answers[0] : "Company Name"}
    - Address: ${address}
    - Phone: ${phone}
    - Email: ${email}

    SPECIFIC CONTENT:
    ${specificPrompt}

    IMAGE INTEGRATION:
    ${imageInstructions}

    FOOTER REQUIREMENT:
    Include a footer with copyright information: © ${currentYear} [Company Name]. All rights reserved.

    SPECIFICATIONS:
    ${specificPrompt}
    
    TECHNICAL REQUIREMENTS:
    1. Use Bootstrap 5 CSS framework with custom CSS enhancements where needed
    2. Implement a fully semantic HTML5 structure with proper hierarchy
    3. Include comprehensive meta tags for SEO optimization (title, description, OG tags)
    4. Create a fully responsive design with optimized breakpoints for all devices
    5. Design a sleek navigation system with smooth scrolling and mobile-friendly dropdown
    6. Implement ARIA attributes and semantic elements for full accessibility
    7. Use Font Awesome 6 or Bootstrap Icons via CDN for visual elements
    8. Create elegant hover animations and transitions using CSS
    9. Incorporate subtle parallax effects for background elements
    10. Add schema.org JSON-LD structured data for SEO enhancement
    11. Implement form validation with user-friendly error handling
    12. Ensure cross-browser compatibility
    13. Optimize for page speed (lightweight assets, proper resource loading)
    14. Ensure full keyboard navigation support for accessibility

    CODE QUALITY REQUIREMENTS:
    1. Write clean, properly indented HTML with logical structure
    2. Use semantic class names and BEM methodology for custom CSS
    3. Include proper HTML lang attribute and document type
    4. Structure CSS for readability and maintainability
    5. Properly nest HTML elements according to specifications
    6. Use HTML5 input types with appropriate attributes
    7. Create CSS variables for consistent color and typography usage
    8. Implement CSS animations using best practices

    ONLY return the complete HTML file with no markdown, explanations, or additional text.
    The code must be production-ready with no placeholders or TODO comments.
    `;

    try {
        console.log("\n🔄 Generating your custom website...");
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 4000,
        });
       
        let htmlContent: string | null | undefined = completion.choices[0]?.message?.content;
       
        if (htmlContent) {
          // Clean up any remaining markdown code blocks if present
          htmlContent = htmlContent.replace(/```html|```/g, "").trim();
      
          // Update cache
          generationCache.lastRequest = requestKey;
          generationCache.lastResult = htmlContent;
          generationCache.timestamp = now;
          
          return htmlContent;
      } else {
            console.error("❌ Error: Generated content is undefined.");
            return "Error generating content. Please try again.";
        }
    } catch (error) {
        console.error("❌ Error generating page:", error);
        return "Error generating page. Please check your inputs and try again.";
    }
}

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const { imageInstructions, ...formData } = requestData;
    
    // Process image instructions
    const imageUrls = await fetchImages(imageInstructions || '');
    
    // Generate HTML with images
    const htmlContent = await generateCustomPage({
      ...formData,
      imageUrls
    });
    
    // Save the generated HTML
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const suffix = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}`; 
    const fileName = `${formData.businessType.toLowerCase()}-${timestamp}-${suffix}.html`;
    
    const outputDir = path.join(process.cwd(), 'gen_comp');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, htmlContent);
    
    return NextResponse.json({ 
      htmlContent,
      filePath: `/gen_comp/${fileName}`,
      imageUrls
    });
  } catch (error) {
    console.error('Error generating page:', error);
    return NextResponse.json(
      { error: 'Error generating page.' },
      { status: 500 }
    );
  }
}
