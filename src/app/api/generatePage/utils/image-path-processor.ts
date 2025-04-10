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
    
  // Process paths for preview version
  previewHTML = previewHTML.replace(/src=["'](\.\/images\/|\/images\/|)(image-\d+\.(?:png|jpg|jpeg|gif|svg))["']/g, 
    `src="/gen_comp/${folderName}/images/$2"`);
    
  // For standalone HTML, embed images directly as base64
  // First create a map of all image files to their data URLs
  const imageMap: Record<string, string> = {};
  const imagesDir = path.join(outputDir, 'images');
  
  if (fs.existsSync(imagesDir)) {
    const files = fs.readdirSync(imagesDir);
    console.log(`Found ${files.length} images in ${imagesDir}`);
    
    for (const file of files) {
      if (/^image-\d+\.(png|jpg|jpeg|gif|svg)$/i.exec(file)) {
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
  }
  
  console.log(`Embedded ${Object.keys(imageMap).length} images as data URLs`);
  
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
    case 'jpg': 
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'svg': return 'image/svg+xml';
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
  return imageUrls.map(url => url.replace('./images/', `/gen_comp/${folderName}/images/`));
}