import fs from 'fs'
import path from 'path'

/**
 * Process HTML to fix image paths for both server-side file and client-side preview
 * with added cache-busting for preview URLs
 */
export function processImagePaths(
  htmlContent: string,
  folderName: string,
  outputDir: string
): { processedHTML: string; previewHTML: string; standaloneHTML: string } {
  // Generate a unique cache-busting timestamp
  const cacheBuster = Date.now()

  // Create versions for different purposes
  let processedHTML = htmlContent // For file system
  let previewHTML = htmlContent // For in-app preview
  let standaloneHTML = htmlContent // For opening in new tab

  // Process paths for file system version - ensure relative paths
  processedHTML = processedHTML.replace(
    /src=["'](\.\/images\/|\/images\/|)(image-\d+\.(?:png|jpg|jpeg|gif|svg))["']/g,
    'src="./images/$2"'
  )

  // Handle background images for file system version
  processedHTML = processedHTML.replace(
    /background-image:\s*url\(['"]?(\.\/images\/|\/images\/|)(image-\d+\.(?:png|jpg|jpeg|gif|svg))['"]?\)/g,
    "background-image: url('./images/$2')"
  )

  // Process paths for preview version - use API routes with cache busting
  // First handle <img> src attributes
  previewHTML = previewHTML.replace(
    /src=["'](\.\/images\/|\/images\/|)(image-\d+\.(?:png|jpg|jpeg|gif|svg))["']/g,
    `src="/api/static/${folderName}/images/$2?v=${cacheBuster}"`
  )

  // Then handle background images in CSS
  previewHTML = previewHTML.replace(
    /background-image:\s*url\(['"]?(\.\/images\/|\/images\/|)(image-\d+\.(?:png|jpg|jpeg|gif|svg))['"]?\)/g,
    `background-image: url('/api/static/${folderName}/images/$2?v=${cacheBuster}')`
  )

  // Handle meta tags in preview HTML
  previewHTML = previewHTML.replace(
    /content=["'](\.\/images\/|\/images\/|)(image-\d+\.(?:png|jpg|jpeg|gif|svg))["']/g,
    `content="/api/static/${folderName}/images/$2?v=${cacheBuster}"`
  )

  // For standalone HTML, embed images directly as base64
  // First create a map of all image files to their data URLs
  const imageMap: Record<string, string> = {}
  const imagesDir = path.join(outputDir, 'images')

  if (fs.existsSync(imagesDir)) {
    const files = fs.readdirSync(imagesDir)
    console.log(`Found ${files.length} images in ${imagesDir}`)

    for (const file of files) {
      if (/^image-\d+\.(png|jpg|jpeg|gif|svg)$/i.test(file)) {
        const imagePath = path.join(imagesDir, file)
        try {
          const imageBuffer = fs.readFileSync(imagePath)
          const base64 = imageBuffer.toString('base64')
          const mimeType = getMimeType(file)
          imageMap[file] = `data:${mimeType};base64,${base64}`
          console.log(`Embedded image ${file} as data URL`)
        } catch (err) {
          console.error(`Error reading image ${file}:`, err)
        }
      }
    }
  }

  console.log(`Embedded ${Object.keys(imageMap).length} images as data URLs`)

  // Replace all image references in the standalone HTML
  standaloneHTML = standaloneHTML.replace(
    /src=["'](\.\/images\/|\/images\/|)(image-\d+\.(?:png|jpg|jpeg|gif|svg))["']/g,
    (match, prefix, filename) => {
      return imageMap[filename] ? `src="${imageMap[filename]}"` : match
    }
  )

  // Also handle background images in style attributes
  standaloneHTML = standaloneHTML.replace(
    /style=["']([^"']*background(?:-image)?:\s*url\(['"]?)(\.\/images\/|\/images\/|)(image-\d+\.(?:png|jpg|jpeg|gif|svg))(['"]?\))([^"']*)["']/g,
    (match, prefix, pathPrefix, filename, suffix, remaining) => {
      return imageMap[filename]
        ? `style="${prefix}url('${imageMap[filename]}')${remaining}"`
        : match
    }
  )

  // Also handle inline background-image CSS
  standaloneHTML = standaloneHTML.replace(
    /background-image:\s*url\(['"]?(\.\/images\/|\/images\/|)(image-\d+\.(?:png|jpg|jpeg|gif|svg))['"]?\)/g,
    (match, pathPrefix, filename) => {
      return imageMap[filename]
        ? `background-image: url('${imageMap[filename]}')`
        : match
    }
  )

  // Also handle meta tags with image references
  standaloneHTML = standaloneHTML.replace(
    /content=["'](\.\/images\/|\/images\/|)(image-\d+\.(?:png|jpg|jpeg|gif|svg))["']/g,
    (match, prefix, filename) => {
      return imageMap[filename] ? `content="${imageMap[filename]}"` : match
    }
  )

  return { processedHTML, previewHTML, standaloneHTML }
}

/**
 * Get MIME type from file extension
 */
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase().substring(1) // Remove the dot from extension
  switch (ext) {
    case 'png':
      return 'image/png'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'gif':
      return 'image/gif'
    case 'svg':
      return 'image/svg+xml'
    default:
      return 'application/octet-stream'
  }
}

/**
 * Maps image URLs to their public-facing paths for the response with cache busting
 */
export function mapImageUrls(
  imageUrls: string[],
  folderName: string
): string[] {
  // Add cache-busting parameter
  const cacheBuster = Date.now()

  return imageUrls.map((url) => {
    // Handle both relative and absolute paths
    if (url.startsWith('./images/')) {
      return `/api/static/${folderName}/images/${url.substring(
        './images/'.length
      )}?v=${cacheBuster}`
    } else if (url.startsWith('/images/')) {
      return `/api/static/${folderName}/images/${url.substring(
        '/images/'.length
      )}?v=${cacheBuster}`
    } else if (/^image-\d+\.(png|jpg|jpeg|gif|svg)$/i.exec(url)) {
      // Handle case when we just have the filename
      return `/api/static/${folderName}/images/${url}?v=${cacheBuster}`
    }

    // For external URLs, add cache buster only if they don't already have a query parameter
    if (url.includes('://') && !url.includes('?')) {
      return `${url}?v=${cacheBuster}`
    }

    return url // Return unchanged for other URLs
  })
}
