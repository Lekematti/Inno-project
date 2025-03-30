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
  console.log('🔍 Parsing image instructions:', instructions);

  if (!instructions || instructions.trim().toLowerCase() === 'none') {
    console.warn('⚠️ No valid instructions provided. Returning an empty array.');
    return [];
  }

  const results = [];
  const segments = instructions
    .split(/[.;,\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  console.log('🔍 Segments extracted from instructions:', segments);

  for (const segment of segments) {
    if (!/image|photo|picture|logo|banner|gallery|visual/i.test(segment)) {
      console.log(`⏩ Skipping non-image-related segment: "${segment}"`);
      continue;
    }

    const style = /realistic|real|photo|photograph|actual/i.test(segment)
      ? 'real'
      : 'artistic';

    const description = segment
      .replace(/realistic|artistic|real|style/gi, '')
      .replace(/i need|i want|please add|include|create|make|generate/gi, '')
      .replace(/an image of|a photo of|a picture of/gi, '')
      .trim();

    if (description.length < 5) {
      console.log(`⏩ Skipping short description: "${description}"`);
      continue;
    }

    let width = 800,
      height = 600;

    if (/banner|header|cover|hero/i.test(segment)) {
      width = 1200;
      height = 400;
    } else if (/portrait|person|staff|team|employee|chef/i.test(segment)) {
      width = 600;
      height = 800;
    } else if (/logo|icon|symbol/i.test(segment)) {
      width = 400;
      height = 400;
    }

    console.log(`✅ Parsed image request: { description: "${description}", style: "${style}", width: ${width}, height: ${height} }`);
    results.push({ description, style, width, height });
  }

  if (results.length === 0 && instructions.length > 10) {
    console.warn('⚠️ No valid image requests detected. Adding fallback image request.');
    results.push({
      description: instructions.substring(0, 100).trim(),
      style: 'artistic',
      width: 800,
      height: 600,
    });
  }

  console.log('✅ Final parsed image requests:', results);
  return results;
}

/**
 * Checks if a description is too complex for real-style images
 */
export function isDescriptionTooComplex(description: string): boolean {
  // Complex concept keywords
  const complexTerms = [
    'fantasy',
    'surreal',
    'futuristic',
    'fictional',
    'magical',
    'abstract',
    'imaginary',
    'alien',
    'dragon',
    'unicorn',
    'creature',
    'mythical',
  ];

  const descLower = description.toLowerCase();

  // Check complexity indicators
  if (
    complexTerms.some((term) => descLower.includes(term)) ||
    description.length > 50 ||
    /flying .* underwater|people .* space|animals? .* driving/i.test(description)
  ) {
    return true;
  }

  return false;
}

/**
 * Generates image URLs based on user instructions
 */
export async function fetchImages(imageInstructions: string): Promise<string[]> {
  console.log('🖼️ Starting image generation with instructions:', imageInstructions);

  if (!imageInstructions || imageInstructions.trim().toLowerCase() === 'none') {
    console.warn('⚠️ No image instructions provided. Returning an empty array.');
    return [];
  }

  const imageUrls: string[] = [];
  console.log('🖼️ Parsing image instructions...');
  try {
    const imageRequests = parseImageInstructions(imageInstructions);
    console.log('🔍 Parsed image requests:', imageRequests);

    for (const { description, style, width, height } of imageRequests) {
      const finalStyle =
        style === 'real' && isDescriptionTooComplex(description)
          ? 'artistic'
          : style;

      const encodedDescription = encodeURIComponent(description);
      const url = `https://webweave-imagegen.onrender.com/jukka/images/${encodedDescription}.jpg?description=${encodedDescription}&width=${width}&height=${height}&style=${finalStyle}`;

      console.log(`🌟 Generating ${finalStyle} image for: "${description}"`);
      imageUrls.push(url);
    }

    if (imageUrls.length === 0) {
      console.warn('⚠️ No valid image URLs generated.');
    } else {
      console.log('✅ Generated image URLs:', imageUrls);
    }

    return imageUrls;
  } catch (error) {
    console.error('❌ Error generating images:', error);
    return [];
  }
}