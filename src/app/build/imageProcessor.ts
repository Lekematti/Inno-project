import { ImageRequest, OptimizedImagePrompt } from '@/types/formData'
import { BusinessType } from '@/types/business/types'

/**
 * Image processing for website generation
 */

// Default image templates by business type (used only as fallback)
const templateImageRequirements: Record<BusinessType, ImageRequest[]> = {
  restaurant: [
    {
      description: 'modern restaurant interior with ambient lighting',
      subject: 'interior',
      style: 'real',
      width: 1200,
      height: 600,
    },
    {
      description: "chef's signature dish beautifully plated",
      subject: 'food',
      style: 'artistic',
      width: 800,
      height: 600,
    },
    {
      description: 'inviting restaurant exterior with outdoor seating',
      subject: 'exterior',
      style: 'real',
      width: 1200,
      height: 600,
    },
  ],
  logistics: [
    {
      description: 'modern logistics facility with automated systems',
      subject: 'exterior',
      style: 'real',
      width: 1200,
      height: 600,
    },
    {
      description: 'fleet of delivery vehicles with professional branding',
      subject: 'product',
      style: 'real',
      width: 800,
      height: 600,
    },
    {
      description: 'logistics professionals coordinating shipments',
      subject: 'people',
      style: 'real',
      width: 800,
      height: 800,
    },
  ],
  professional: [
    {
      description: 'contemporary professional office with ergonomic workspace',
      subject: 'interior',
      style: 'real',
      width: 1200,
      height: 600,
    },
    {
      description: 'diverse business team in collaborative meeting',
      subject: 'people',
      style: 'real',
      width: 800,
      height: 800,
    },
    {
      description: 'modern office building exterior with architectural details',
      subject: 'exterior',
      style: 'real',
      width: 1200,
      height: 600,
    },
  ],
  custom: [],
}

// Quality enhancement phrases simplified
const qualityEnhancementPhrases = {
  real: 'professional photography, 4K resolution, natural lighting',
  artistic: 'high-quality digital art, detailed composition, vivid colors',
}

/**
 * Debug function to log details about the image processing
 */
function logDebug(message: string, data?: unknown) {
  console.log(`🔍 [ImageProcessor] ${message}`);
  if (data) {
    console.log(data);
  }
}

/**
 * Process image requirements based on user input and business type
 * Now optimized for the structured format from the slider UI
 */
export function processImageRequirements(
  userInput: string,
  businessType: string
): OptimizedImagePrompt[] {
  if (!userInput || userInput.trim().toLowerCase() === 'none') {
    logDebug("No user input provided, returning empty array");
    return []
  }

  // Log the raw input to help with debugging
  logDebug(`Processing image requirements for "${businessType}" with input:`, userInput);

  // Normalize business type
  const normalizedType = businessType.toLowerCase() as BusinessType
  const isValidType = ['restaurant', 'logistics', 'professional'].includes(
    normalizedType
  )

  if (!isValidType) {
    logDebug(`Invalid business type: ${businessType}, returning empty array`);
    return []
  }

  // Use default templates if requested
  if (userInput.trim().toLowerCase() === 'default') {
    logDebug("Using default images for business type");
    return getDefaultImages(normalizedType)
  }

  // Parse the numbered format from the UI (1.description1 2.description2 3.description3)
  const structuredPrompts = parseNumberedFormat(userInput, normalizedType);
  
  // If we got valid prompts, return them
  if (structuredPrompts.length > 0) {
    logDebug(`Successfully processed ${structuredPrompts.length} image descriptions`);
    return structuredPrompts;
  }
  
  // Fallback to defaults if parsing failed
  logDebug("Failed to parse image descriptions, using defaults");
  return getDefaultImages(normalizedType);
}

/**
 * Parse numbered format from the slider UI
 * Format: "1.description1 2.description2 3.description3"
 */
function parseNumberedFormat(
  userInput: string,
  businessType: BusinessType
): OptimizedImagePrompt[] {
  const prompts: OptimizedImagePrompt[] = [];
  
  // Quick validation - must contain numbered format
  if (!userInput || !userInput.includes('.')) {
    return prompts;
  }

  try {
    // Split by numbered prefixes - improved regex to better match the format from UI
    // This regex finds segments that start with a digit followed by a dot or parenthesis
    const regex = /(\d+[\.\)].*?)(?=\s+\d+[\.\)]|$)/g;
    const matches = userInput.match(regex);
    
    if (!matches || matches.length === 0) {
      logDebug("No matches found with primary regex, trying alternative pattern");
      
      // Try an alternative simpler regex as fallback
      const simpleRegex = /(\d+\..*?)(?=\d+\.|$)/g;
      const simpleMatches = userInput.match(simpleRegex);
      
      if (!simpleMatches || simpleMatches.length === 0) {
        logDebug("No matches found with alternative regex either");
        return prompts;
      }
      
      logDebug(`Found ${simpleMatches.length} descriptions with alternative regex`);
      
      for (const match of simpleMatches) {
        // Process each match
        const numberEndIndex = match.indexOf('.');
        if (numberEndIndex < 0) continue;
        
        // The description is everything after the number and dot
        const description = match.substring(numberEndIndex + 1).trim();
        
        if (description.length <= 3) continue;
        
        addPrompt(description, businessType, prompts);
      }
      
      return prompts;
    }
    
    logDebug(`Found ${matches.length} numbered descriptions with primary regex`);
    
    // Process each numbered description
    for (const match of matches) {
      let description = '';
      
      // Handle dot format (1.description)
      if (match.includes('.')) {
        const parts = match.split('.');
        if (parts.length < 2) continue;
        
        // The description is everything after the number and dot
        description = parts.slice(1).join('.').trim();
      } 
      // Handle parenthesis format (1)description)
      else if (match.includes(')')) {
        const parts = match.split(')');
        if (parts.length < 2) continue;
        
        // The description is everything after the number and parenthesis
        description = parts.slice(1).join(')').trim();
      }
      
      if (description.length <= 3) continue;
      
      addPrompt(description, businessType, prompts);
    }
  } catch (error) {
    logDebug(`Error parsing numbered format: ${error}`);
  }
  
  return prompts;
}

/**
 * Helper function to add a prompt to the collection with style and dimensions
 */
function addPrompt(
  description: string,
  businessType: string,
  prompts: OptimizedImagePrompt[]
): void {
  // Determine style (real or artistic)
  const style = description.toLowerCase().includes('artistic') ? 'artistic' : 'real';
  
  // Set dimensions based on content keywords
  let width = 800, height = 600;
  
  if (description.toLowerCase().includes('landscape') || 
      description.toLowerCase().includes('wide')) {
    width = 1200;
    height = 600;
  } else if (description.toLowerCase().includes('portrait') || 
            description.toLowerCase().includes('tall')) {
    width = 600;
    height = 900;
  } else if (description.toLowerCase().includes('square')) {
    width = 800;
    height = 800;
  }
  
  // Add enhanced prompt to the list
  prompts.push({
    description: enhancePrompt(description, style, businessType),
    style: style as 'real' | 'artistic',
    width,
    height
  });
}

/**
 * Get default images for a business type
 */
function getDefaultImages(businessType: BusinessType): OptimizedImagePrompt[] {
  const templates = templateImageRequirements[businessType]

  return templates.map((template) => ({
    description: enhancePrompt(
      template.description,
      template.style,
      businessType
    ),
    style: template.style as 'real' | 'artistic',
    width: template.width,
    height: template.height,
  }))
}

/**
 * Enhance a prompt with quality phrases
 */
function enhancePrompt(
  description: string,
  style: string,
  businessType: string
): string {
  // Always add business type context
  let enhancedPrompt = description.trim()
  
  // Always add the business type as context to ensure relevance
  if (!enhancedPrompt.toLowerCase().includes(businessType)) {
    enhancedPrompt += ` for ${businessType} business`
  }

  // Add quality enhancement only if appropriate
  const qualityPhrase = qualityEnhancementPhrases[style as 'real' | 'artistic']
  enhancedPrompt += `, ${qualityPhrase}`

  // Truncate if too long
  if (enhancedPrompt.length > 300) {
    enhancedPrompt = enhancedPrompt.substring(0, 297) + '...'
  }

  return enhancedPrompt
}

// Simple in-memory image URL cache
interface ImageCache {
  urls: string[]
  timestamp: number
}

const imageFetchCache = new Map<string, ImageCache>()

/**
 * Fetch images based on user instructions
 */
export async function fetchImages(
  imageInstructions: string,
  businessType: string = 'restaurant',
  imageSource: 'ai' | 'manual' | 'none' = 'ai'
): Promise<string[]> {
  // Quick exit conditions
  if (
    imageSource === 'none' ||
    (imageSource === 'ai' &&
      (!imageInstructions || imageInstructions.trim().toLowerCase() === 'none'))
  ) {
    return []
  }

  // If manual images, the URLs will be handled by the POST route
  if (imageSource === 'manual') {
    return []
  }

  // Check for character names to handle specially
  const containsCharacterNames = /gimli|legolas|aragorn|gandalf|frodo|character|specific/i.test(imageInstructions);
  const forceRefresh = containsNumberedFormat(imageInstructions);
  
  // Use cache for non-character requests
  if (!containsCharacterNames && !forceRefresh) {
    const cacheKey = `${businessType}-${imageInstructions.slice(0, 100)}`
    const cachedResult = imageFetchCache.get(cacheKey)
    if (cachedResult && Date.now() - cachedResult.timestamp < 900000) { // 15 minutes
      logDebug('Using cached image URLs');
      return cachedResult.urls
    }
  }

  try {
    // Process the requirements with prompt engineering
    logDebug("Processing image requirements", imageInstructions);
    const imageRequests = processImageRequirements(
      imageInstructions,
      businessType
    )
    
    logDebug(`Generated ${imageRequests.length} image requests`);

    // Generate URLs for the image API
    const imageUrls = imageRequests.map((req, i) => {
      const uniqueId = `img-${Date.now()}-${i}`
      const sanitizedDesc = req.description
        .substring(0, 20)
        .replace(/[^a-zA-Z0-9]/g, '-')

      return `https://webweave-imagegen.onrender.com/jukka/images/${uniqueId}-${sanitizedDesc}.jpg?description=${encodeURIComponent(
        req.description
      )}&width=${req.width}&height=${req.height}&style=${
        req.style
      }&seed=${Math.floor(Math.random() * 1000000)}`
    })
    
    logDebug(`Created ${imageUrls.length} image URLs`);

    // Cache the results if appropriate
    if (!containsCharacterNames) {
      const cacheKey = `${businessType}-${imageInstructions.slice(0, 100)}`
      imageFetchCache.set(cacheKey, {
        urls: imageUrls,
        timestamp: Date.now(),
      })
    }

    return imageUrls
  } catch (error) {
    console.error('Error generating images:', error)
    return []
  }
}

/**
 * Helper function to check if image instructions contain a numbered format
 */
export function containsNumberedFormat(text: string | undefined): boolean {
  if (!text) return false;
  
  // Check for common numbered patterns
  const hasNumberedFormat = 
    /\d+\./.test(text) || // Matches "1." format
    /\d+\)/.test(text) || // Matches "1)" format
    /\n\s*\d+\./.test(text) || // Matches newline + "1." format
    /\n\s*\d+\)/.test(text); // Matches newline + "1)" format
  
  console.log(`Checking numbered format in text: "${text.substring(0, 50)}..." Result: ${hasNumberedFormat}`);
  return hasNumberedFormat;
}

/**
 * Ensure all image URLs in HTML have query parameters
 */
export function ensureImageUrlsHaveParams(
  htmlContent: string,
  imageUrls: string[]
): string {
  if (!htmlContent || !imageUrls.length) return htmlContent

  let fixedHtml = htmlContent

  // Create a map of base URLs to full URLs with parameters
  const urlMap = new Map()
  imageUrls.forEach((fullUrl) => {
    const baseUrl = fullUrl.split('?')[0]
    urlMap.set(baseUrl, fullUrl)
  })

  // Fix image src URLs
  fixedHtml = fixedHtml.replace(
    /src=["'](https:\/\/webweave-imagegen\.onrender\.com\/[^?"']+)["']/g,
    (match, url) => {
      const fullUrl =
        urlMap.get(url) ||
        `${url}?description=image&width=800&height=600&style=real`
      return `src="${fullUrl}"`
    }
  )

  // Fix background image URLs
  fixedHtml = fixedHtml.replace(
    /background-image:\s*url\(['"]?(https:\/\/webweave-imagegen\.onrender\.com\/[^?'"]+)['"]?\)/g,
    (match, url) => {
      const fullUrl =
        urlMap.get(url) ||
        `${url}?description=image&width=800&height=600&style=real`
      return `background-image: url('${fullUrl}')`
    }
  )

  return fixedHtml
}