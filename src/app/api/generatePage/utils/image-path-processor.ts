import fs from 'fs';
import path from 'path';

/**
 * Utility functions for processing image paths in HTML content
 */

/**
 * Process HTML to fix image paths for both server-side file and client-side preview
 * @param htmlContent Original HTML content from generator
 * @param folderName The generated folder name
 * @param outputDir The output directory path
 * @returns Object with processed HTML versions
 */
export function processImagePaths(
  htmlContent: string,
  folderName: string,
  outputDir: string
): { processedHTML: string; previewHTML: string; standaloneHTML: string } {
  // Create versions for different purposes
  let processedHTML = htmlContent;  // For file system
  let previewHTML = htmlContent;    // For in-app preview
  let standaloneHTML = htmlContent; // For opening in new tab
  
  // Process paths for file system version
  processedHTML = processedHTML.replace(/src=["'](\.\/images\/|\/images\/|)(image-\d+\.(?:png|jpg|jpeg|gif|svg))["']/g, 
    'src="./images/$2"');
    
  // Process paths for preview version - use API route to avoid path issues
  previewHTML = previewHTML.replace(/src=["'](\.\/images\/|\/images\/|)(image-\d+\.(?:png|jpg|jpeg|gif|svg))["']/g, 
    (match, prefix, filename) => {
      return `src="/api/images/${filename}?folder=${folderName}"`;
    });
    
  // For standalone HTML, embed images directly as base64
  // First create a map of all image files to their data URLs
  const imageMap: Record<string, string> = {};
  const imagesDir = path.join(outputDir, 'images');
  
  if (fs.existsSync(imagesDir)) {
    try {
      const files = fs.readdirSync(imagesDir);
      console.log(`Found ${files.length} images in ${imagesDir}`);
      
      for (const file of files) {
        if (/^image-\d+\.(png|jpg|jpeg|gif|svg)$/i.test(file)) {
          const imagePath = path.join(imagesDir, file);
          try {
            const imageBuffer = fs.readFileSync(imagePath);
            const base64 = imageBuffer.toString('base64');
            const mimeType = getMimeType(file);
            imageMap[file] = `data:${mimeType};base64,${base64}`;
            console.log(`Embedded image ${file} as data URL`);
          } catch (err) {
            console.error(`Error reading image ${file}:`, err);
          }
        }
      }
      
      console.log(`Embedded ${Object.keys(imageMap).length} images as data URLs`);
    } catch (err) {
      console.error(`Error reading images directory: ${imagesDir}`, err);
    }
  } else {
    console.log(`Images directory does not exist: ${imagesDir}`);
  }
  
  // Replace all image references in the standalone HTML
  standaloneHTML = standaloneHTML.replace(
    /src=["'](\.\/images\/|\/images\/|)(image-\d+\.(?:png|jpg|jpeg|gif|svg))["']/g,
    (match, prefix, filename) => {
      return imageMap[filename] ? `src="${imageMap[filename]}"` : match;
    }
  );
  
  // Also handle background images in style attributes
  standaloneHTML = standaloneHTML.replace(
    /style=["']([^"']*background(?:-image)?:\s*url\(['"]?)(\.\/images\/|\/images\/|)(image-\d+\.(?:png|jpg|jpeg|gif|svg))(['"]?\))([^"']*)["']/g,
    (match, prefix, pathPrefix, filename, suffix, remaining) => {
      return imageMap[filename] ? 
        `style="${prefix}url('${imageMap[filename]}')${remaining}"` : 
        match;
    }
  );
  
  // Also handle meta tags with image references
  standaloneHTML = standaloneHTML.replace(
    /content=["'](\.\/images\/|\/images\/|)(image-\d+\.(?:png|jpg|jpeg|gif|svg))["']/g,
    (match, prefix, filename) => {
      return imageMap[filename] ? `content="${imageMap[filename]}"` : match;
    }
  );
  
  return { processedHTML, previewHTML, standaloneHTML };
}

/**
 * Get MIME type from file extension
 */
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase().substring(1); // Remove the dot from extension
  switch (ext) {
    case 'png': return 'image/png';
    case 'jpg': return 'image/jpeg'; // Fixed MIME type for jpg
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'svg': return 'image/svg+xml';
    case 'webp': return 'image/webp'; // Added support for WebP format
    default: return 'application/octet-stream';
  }
}

/**
 * Maps image URLs to their public-facing paths for the response
 * @param imageUrls Original image URLs
 * @param folderName Generated folder name 
 * @returns Mapped image URLs
 */
export function mapImageUrls(imageUrls: string[], folderName: string): string[] {
  if (!imageUrls || !Array.isArray(imageUrls)) {
    console.warn('Invalid imageUrls provided to mapImageUrls:', imageUrls);
    return [];
  }

  console.log(`Mapping ${imageUrls.length} images with folder: ${folderName}`);

  return imageUrls.map(url => {
    if (!url || typeof url !== 'string') {
      console.warn('Invalid URL in imageUrls array:', url);
      return '';
    }
    
    // Only transform relative URLs
    if (url.startsWith('./images/') || url.startsWith('/images/')) {
      try {
        // Always include folderName as a query parameter to ensure correct image is loaded
        const basename = path.basename(url);
        const mappedUrl = `/api/images/${basename}?folder=${folderName}`;
        console.log(`Mapped: ${url} → ${mappedUrl}`);
        return mappedUrl;
      } catch (err) {
        console.error(`Error processing URL ${url}:`, err);
        return url;
      }
    }
    return url; // Return external URLs as is
  }).filter(Boolean); // Remove any empty strings
}