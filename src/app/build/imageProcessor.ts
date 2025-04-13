import {
  ImageRequest,
  OptimizedImagePrompt
} from '@/types/formData';
import { BusinessType } from '@/types/business/types';

/**
 * Advanced image processing for website generation
 */

// Update the templateImageRequirements type
const templateImageRequirements: Record<BusinessType, ImageRequest[]> = {
  restaurant: [
    { description: "restaurant interior", subject: "interior", style: "real", width: 1200, height: 600 },
    { description: "signature dish", subject: "food", style: "artistic", width: 800, height: 600 },
    { description: "restaurant exterior", subject: "exterior", style: "real", width: 1200, height: 600 }
  ],
  logistics: [
    { description: "logistics facility", subject: "exterior", style: "real", width: 1200, height: 600 },
    { description: "transportation vehicles", subject: "product", style: "real", width: 800, height: 600 },
    { description: "logistics operations", subject: "interior", style: "real", width: 1200, height: 600 }
  ],
  professional: [
    { description: "professional office", subject: "interior", style: "real", width: 1200, height: 600 },
    { description: "business meeting", subject: "people", style: "real", width: 800, height: 600 },
    { description: "professional service", subject: "product", style: "artistic", width: 800, height: 600 }
  ]
};

/**
 * Process and optimize image generation requests based on user input and business type
 */
export function processImageRequirements(
  userInput: string,
  businessType: string
): OptimizedImagePrompt[] {
  if (!userInput || userInput.trim().toLowerCase() === 'none') {
    return [];
  }
  
  console.log(`🎨 Processing image requirements for ${businessType} template...`);
  
  // Normalize business type to match our template keys
  const normalizedType = businessType.toLowerCase() as BusinessType;
  const isValidType = ['restaurant', 'logistics', 'professional'].includes(normalizedType);
  
  // Extract user image requests
  const userRequests = extractImageRequests(userInput);
  
  // If no valid business type or no user requests, return empty array
  if (!isValidType || userRequests.length === 0) {
    // Fallback to default template if we have no user requests but a valid business type
    if (isValidType) {
      console.log('No valid user requests detected, using default template');
      return templateImageRequirements[normalizedType].map(req => ({
        description: createEnhancedPrompt(req.description, req.subject, req.style, normalizedType),
        style: req.style as 'real' | 'artistic',
        width: req.width,
        height: req.height
      }));
    }
    return [];
  }
  
  // Create optimized prompts based on both user requests and template needs
  const optimizedRequests = createOptimizedPrompts(userRequests, normalizedType);
  
  return optimizedRequests;
}

/**
 * Extract image requests from user's instructions
 */
function extractImageRequests(userInput: string): ImageRequest[] {
  const requests: ImageRequest[] = [];
  
  // Define patterns to look for in the user input
  const subjectPatterns = [
    {pattern: /food|dish|meal|menu|cuisine|pizza|pasta|burger|appetizer|dessert/i, subject: 'food'},
    {pattern: /interior|inside|room|dining|decor|atmosphere/i, subject: 'interior'},
    {pattern: /exterior|outside|building|storefront|facade|entrance/i, subject: 'exterior'},
    {pattern: /person|people|staff|team|employee|chef|worker|professional/i, subject: 'people'},
    {pattern: /product|item|goods|equipment|vehicle|truck|fleet/i, subject: 'product'},
    {pattern: /logo|brand|symbol|identity|banner|header/i, subject: 'logo'},
  ];
  
  // Break the input into sentences and analyze each one for potential image requests
  const sentences = userInput
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);
  
  for (const sentence of sentences) {
    // Skip sentences that don't seem to be about images
    if (!/image|photo|picture|visual|shot|scene|view|banner|logo/i.test(sentence)) {
      continue;
    }
    
    // Determine if the user is requesting a realistic or artistic style
    const styleHints = sentence.toLowerCase();
    const style: 'real' | 'artistic' = /realistic|real|photo|photograph|actual/i.test(styleHints) ? 'real' : 'artistic';
    
    // Clean up the sentence to extract a good description
    const description = sentence
      .replace(/i need|i want|please add|include|create|make|generate/gi, '')
      .replace(/an image of|a photo of|a picture of|image showing|picture showing/gi, '')
      .replace(/realistic|artistic|real|style/gi, '')
      .trim();
    
    // Determine the subject matter based on keywords
    let subject = 'general';
    for (const {pattern, subject: subjectType} of subjectPatterns) {
      if (pattern.test(sentence)) {
        subject = subjectType;
        break;
      }
    }
    
    // Add the request if we have a meaningful description
    if (description.length > 5) {
      requests.push({
        description,
        subject,
        style,
        width: 800,
        height: 600
      });
    }
  }
  
  // If no image requests were detected but the user input isn't empty,
  // try to create a generic request from the entire input
  if (requests.length === 0 && userInput.trim().length > 10) {
    // Just use the first 100 characters as a generic description
    const genericDescription = userInput.trim().substring(0, 100);
    requests.push({
      description: genericDescription,
      subject: 'general',
      style: 'artistic',
      width: 800,
      height: 600
    });
  }
  
  return requests;
}

/**
 * Create optimized prompts based on user requests and business type
 */
function createOptimizedPrompts(
  userRequests: ImageRequest[],
  businessType: BusinessType
): OptimizedImagePrompt[] {
  const optimizedPrompts: OptimizedImagePrompt[] = [];
  
  // Get default requirements for this business type
  const defaultRequirements = templateImageRequirements[businessType] || [];
  
  // Track which subjects we've already covered
  const coveredSubjects = new Set<string>();
  
  // First, process user requests
  for (const request of userRequests) {
    const { description, subject, style } = request;
    
    // Set dimensions based on subject type
    let width = 800, height = 600;
    
    if (subject === 'exterior' || subject === 'interior') {
      width = 1200;
    } else if (subject === 'people') {
      width = 600;
      height = 800;
    } else if (subject === 'logo') {
      width = 400;
      height = 400;
    }
    
    // Create an optimized prompt based on the subject and style
    const optimizedDescription = createEnhancedPrompt(description, subject, style, businessType);
    
    // Add to our list and mark this subject as covered
    optimizedPrompts.push({
      description: optimizedDescription,
      style: style as 'real' | 'artistic',
      width,
      height
    });
    
    coveredSubjects.add(subject);
  }
  
  // Fill in with defaults if we don't have enough images
  // Only do this if user provided fewer than 3 clear image requests
  if (optimizedPrompts.length < 3) {
    for (const defaultReq of defaultRequirements) {
      // Skip if we already have this subject covered
      if (coveredSubjects.has(defaultReq.subject)) {
        continue;
      }
      
      // Add this default requirement
      optimizedPrompts.push({
        description: createEnhancedPrompt(
          defaultReq.description, 
          defaultReq.subject, 
          defaultReq.style, 
          businessType
        ),
        style: defaultReq.style as 'real' | 'artistic',
        width: defaultReq.width,
        height: defaultReq.height
      });
      
      coveredSubjects.add(defaultReq.subject);
      
      // Stop once we have enough images
      if (optimizedPrompts.length >= 3) {
        break;
      }
    }
  }
  
  // Ensure we don't have duplicate descriptions
  const uniquePrompts = Array.from(
    new Map(
      optimizedPrompts.map(item => [item.description.toLowerCase(), item])
    ).values()
  );
  
  return uniquePrompts;
}

/**
 * Creates an enhanced, AI-friendly prompt from a user description
 */
function createEnhancedPrompt(
  description: string, 
  subject: string, 
  style: string,
  businessType: BusinessType
): string {
  let enhancedPrompt = description.trim();
  
  // Add business type context if not already present
  if (!enhancedPrompt.toLowerCase().includes(businessType)) {
    enhancedPrompt += ` for ${businessType} business`;
  }
  
  // Add quality indicators
  if (style === 'real') {
    enhancedPrompt += ", professional photography, high quality";
    
    // Add specific enhancements based on subject
    switch (subject) {
      case "food":
        enhancedPrompt += ", professional food photography, appetizing, well-lit, high-resolution";
        if (businessType === 'restaurant') {
          enhancedPrompt += ", gourmet presentation, restaurant quality";
        }
        break;
      case "interior":
        enhancedPrompt += ", interior design photography, well-lit space";
        if (businessType === 'restaurant') {
          enhancedPrompt += ", restaurant ambiance, dining atmosphere";
        } else if (businessType === 'professional') {
          enhancedPrompt += ", professional office, business environment";
        } else if (businessType === 'logistics') {
          enhancedPrompt += ", logistics facility, organized workspace";
        }
        break;
      case "exterior":
        enhancedPrompt += ", professional architecture photography, good lighting, clear view";
        if (businessType === 'restaurant') {
          enhancedPrompt += ", restaurant storefront, inviting entrance";
        } else if (businessType === 'professional') {
          enhancedPrompt += ", professional office building, business headquarters";
        } else if (businessType === 'logistics') {
          enhancedPrompt += ", logistics center, warehouse exterior";
        }
        break;
      case "people":
        enhancedPrompt += ", professional portrait, business setting";
        if (businessType === 'restaurant') {
          enhancedPrompt += ", restaurant staff, chefs in kitchen, professional attire";
        } else if (businessType === 'professional') {
          enhancedPrompt += ", business professionals, corporate team, formal attire";
        } else if (businessType === 'logistics') {
          enhancedPrompt += ", logistics team, warehouse staff, delivery professionals";
        }
        break;
      case "product":
        enhancedPrompt += ", product photography, studio lighting";
        if (businessType === 'restaurant') {
          enhancedPrompt += ", culinary presentation, food styling";
        } else if (businessType === 'logistics') {
          enhancedPrompt += ", logistics equipment, transportation vehicles";
        }
        break;
    }
  } else {
    // For artistic style
    enhancedPrompt += ", high quality artistic rendering, detailed";
    
    switch (subject) {
      case "food":
        enhancedPrompt += ", vibrant colors, appetizing presentation";
        break;
      case "interior":
        enhancedPrompt += ", stylized interior design, appealing atmosphere";
        break;
      case "exterior":
        enhancedPrompt += ", attractive architecture, inviting atmosphere";
        break;
      case "people":
        enhancedPrompt += ", professional stylized portrait, business setting";
        break;
      case "logo":
        enhancedPrompt += ", clean design, professional, vector style";
        break;
    }
  }
  
  return enhancedPrompt;
}

/**
 * Checks if a description is too complex for real-style images
 */
export function isDescriptionTooComplex(description: string): boolean {
  // Complex concept keywords
  const complexTerms = ['fantasy', 'surreal', 'futuristic', 'fictional', 
    'magical', 'abstract', 'imaginary', 'alien', 'dragon', 'unicorn', 
    'creature', 'mythical'];
  
  const descLower = description.toLowerCase();
  
  // Check complexity indicators
  if (complexTerms.some(term => descLower.includes(term)) || 
      description.length > 80 ||
      /flying .* underwater|people .* space|animals? .* driving/i.test(description)) {
    return true;
  }
  
  return false;
}

/**
 * Generates image URLs based on user instructions and business type
 */
export async function fetchImages(
  imageInstructions: string, 
  businessType: string = 'restaurant',
  imageSource: 'ai' | 'manual' | 'none' = 'ai'
): Promise<string[]> {
  // If image source is 'none' or no instructions for AI, return empty array
  if (
    imageSource === 'none' || 
    (imageSource === 'ai' && (!imageInstructions || imageInstructions.trim().toLowerCase() === 'none'))
  ) {
    return [];
  }
  
  // If manual images, the URLs will be handled by the POST route
  if (imageSource === 'manual') {
    return [];
  }
  
  const imageUrls: string[] = [];
  console.log(`🖼️ Processing AI image instructions for ${businessType}...`);
  
  try {
    // Process the requirements based on user input and business type
    const imageRequests = processImageRequirements(imageInstructions, businessType);
    
    // Check if we got any requests
    if (imageRequests.length === 0) {
      console.log('No valid image requests processed. Using default template.');
      // Get the default template for this business type
      const normalizedType = businessType.toLowerCase() as BusinessType;
      if (['restaurant', 'logistics', 'professional'].includes(normalizedType)) {
        // Use default template images
        const defaultRequests = templateImageRequirements[normalizedType].map(req => ({
          description: createEnhancedPrompt(req.description, req.subject, req.style, normalizedType),
          style: req.style as 'real' | 'artistic',
          width: req.width,
          height: req.height
        }));
        
        // Use these default requests as our processed requests
        for (const req of defaultRequests) {
          imageRequests.push(req);
        }
      }
    }
    
    // Generate unique identifiers for the image URLs
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    
    for (let i = 0; i < imageRequests.length; i++) {
      const { description, style, width, height } = imageRequests[i];
      
      // Adjust style if needed
      const finalStyle = (style === 'real' && isDescriptionTooComplex(description)) 
        ? 'artistic' 
        : style;
      
      // Create a hash-like value from the description for additional uniqueness
      const descHash = description
        .split('')
        .reduce((acc, char) => (acc + char.charCodeAt(0)), 0)
        .toString(16)
        .substring(0, 6);
      
      // Generate a unique filename using multiple uniqueness factors
      const uniqueId = `${timestamp}-${randomId}-${i+1}-${descHash}`;
      
      // Create sanitized description with proper URL encoding
      const encodedDescription = encodeURIComponent(description);
      
      // Create URL with unique filename but keep description in query params for generation
      const url = `https://webweave-imagegen.onrender.com/jukka/images/${uniqueId}-${encodeURIComponent(description.substring(0, 30))}.jpg?description=${encodedDescription}&width=${width}&height=${height}&style=${finalStyle}`;
      
      console.log(`Generating ${finalStyle} image (${i+1}/${imageRequests.length}): "${description.substring(0, 60)}${description.length > 60 ? '...' : ''}"`);
      imageUrls.push(url);
    }
    
    return imageUrls;
  } catch (error) {
    console.error("Error generating images:", error);
    return [];
  }
}