/**
 * Handles image processing for website generation
 */

/**
 * Parses user instructions into structured image requests
 */
export function parseImageInstructions(instructions: string): Array<{
  description: string;
  style: string;
  width: number;
  height: number;
}> {
  if (!instructions || instructions.trim().toLowerCase() === 'none') {
    return [];
  }
  
  const results = [];
  const segments = instructions
    .split(/[.;,\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);
  
  for (const segment of segments) {
    // Skip segments that don't seem to describe images
    if (!/image|photo|picture|logo|banner|gallery|visual/i.test(segment)) {
      continue;
    }
    
    // Determine style based on keywords
    const style = /realistic|real|photo|photograph|actual/i.test(segment) ? 'real' : 'artistic';
    
    // Clean up the description
    const description = segment
      .replace(/realistic|artistic|real|style/gi, '')
      .replace(/i need|i want|please add|include|create|make|generate/gi, '')
      .replace(/an image of|a photo of|a picture of/gi, '')
      .trim();
    
    if (description.length < 5) continue;
    
    // Set dimensions based on content type
    let width = 800, height = 600;
    
    if (/banner|header|cover|hero/i.test(segment)) {
      width = 1200; height = 400;
    } else if (/portrait|person|staff|team|employee|chef/i.test(segment)) {
      width = 600; height = 800;
    } else if (/logo|icon|symbol/i.test(segment)) {
      width = 400; height = 400;
    }
    
    results.push({ description, style, width, height });
  }
  
  // Fallback if no images were detected
  if (results.length === 0 && instructions.length > 10) {
    results.push({
      description: instructions.substring(0, 100).trim(),
      style: 'artistic',
      width: 800, height: 600
    });
  }
  
  return results;
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
      description.length > 50 ||
      /flying .* underwater|people .* space|animals? .* driving/i.test(description)) {
    return true;
  }
  
  return false;
}

/**
 * Generates image URLs based on user instructions
 */
export async function fetchImages(imageInstructions: string): Promise<string[]> {
  if (!imageInstructions || imageInstructions.trim().toLowerCase() === 'none') {
    return [];
  }
  
  const imageUrls: string[] = [];
  console.log("🖼️ Parsing image instructions...");
  
  try {
    // Parse the instructions into image requests
    const imageRequests = parseImageInstructions(imageInstructions);
    
    for (const { description, style, width, height } of imageRequests) {
      // Adjust style if needed
      const finalStyle = (style === 'real' && isDescriptionTooComplex(description)) 
        ? 'artistic' 
        : style;
      
      // Generate the image URL
      const encodedDescription = encodeURIComponent(description);
      const url = `https://webweave-imagegen.onrender.com/jukka/images/${encodedDescription}.jpg?description=${encodedDescription}&width=${width}&height=${height}&style=${finalStyle}`;
      
      console.log(`Generating ${finalStyle} image for: ${description}`);
      imageUrls.push(url);
    }
    
    return imageUrls;
  } catch (error) {
    console.error("Error generating images:", error);
    return [];
  }
}