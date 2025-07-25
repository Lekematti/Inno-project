import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import {
  fetchImages,
  ensureImageUrlsHaveParams,
  containsNumberedFormat,
} from '@/app/build/imageProcessor'
import { generateLayoutVariations } from '@/app/api/generatePage/utils/layout-generator'
import { getBusinessPrompt } from '@/app/templates/business-prompts'
import { buildPrompt } from '@/app/templates/prompt-builder'
import {
  CacheEntry,
  FormData,
} from '@/app/api/generatePage/types/website-generator'
import { ImageSourceType } from '@/types/formData'
import { processImagePaths, mapImageUrls } from './utils/image-path-processor'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string })

// Properly declare global variable by extending NodeJS namespace
declare global {
  // eslint-disable-next-line no-var
  var lastRequestTime: number
}

// Initialize the global variable if it doesn't exist yet
if (typeof global.lastRequestTime === 'undefined') {
  global.lastRequestTime = 0
}

// Improved cache with business type segmentation and longer TTL
const generationCache: Record<string, CacheEntry> = {}
const CACHE_TTL = 300000 // 5 minutes cache TTL for better reuse

// This flag prevents multiple concurrent generations of the same type
const generationInProgress: Record<string, boolean> = {}

export async function generateCustomPage(
  formData: FormData,
  imageSource: ImageSourceType,
  imageUrls: string[] = []
): Promise<string> {
  const { businessType, address, phone, email } = formData
  const templateType = businessType.toLowerCase()
  const answers = []

  // Include image URLs in the cache key to avoid regeneration
  const cacheKeyObj = {
    ...formData,
    imageUrlsLength: imageUrls.length,
    hasImages: imageUrls.length > 0,
  }
  const requestKey = JSON.stringify(cacheKeyObj)

  // Get the business type specific cache
  const cacheKey = templateType || 'default'
  if (!generationCache[cacheKey]) {
    generationCache[cacheKey] = {
      lastRequest: '',
      lastResult: '',
      timestamp: 0,
    }
  }

  // Return cached result if it's recent
  const now = Date.now()
  if (
    requestKey === generationCache[cacheKey].lastRequest &&
    now - generationCache[cacheKey].timestamp < CACHE_TTL
  ) {
    console.log(`🔄 Using cached result for ${cacheKey}...`)
    return generationCache[cacheKey].lastResult
  }

  // Lock generation to prevent concurrent requests for the same type
  if (generationInProgress[cacheKey]) {
    console.log(`🔄 Generation already in progress for ${cacheKey}, waiting...`)
    // Wait for the existing generation to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!generationInProgress[cacheKey]) {
          clearInterval(checkInterval)
          if (requestKey === generationCache[cacheKey].lastRequest) {
            resolve(generationCache[cacheKey].lastResult)
          } else {
            // Cache miss after waiting, trigger generation again
            resolve(generateCustomPage(formData, imageSource, imageUrls))
          }
        }
      }, 1000) // Check every second
    })
  }

  try {
    generationInProgress[cacheKey] = true

    // Gather all the answers from the form data
    for (let i = 1; i <= 10; i++) {
      const key = `question${i}`
      if (formData[key]) {
        answers.push(
          typeof formData[key] === 'string' ? formData[key] : undefined
        )
      } else {
        answers.push('') // Push empty string if answer is not provided
      }
    }

    // Start layout variation generation early (it's synchronous and fast)
    const layoutVariations = generateLayoutVariations(templateType, answers)

    // Create template-specific prompt
    const specificPrompt = getBusinessPrompt(
      templateType,
      answers,
      layoutVariations
    )

    // Build the complete prompt - include the image URLs from the beginning
    const prompt = buildPrompt(
      templateType,
      {
        name: typeof answers[0] === 'string' ? answers[0] : undefined,
        address,
        phone,
        email,
      },
      specificPrompt,
      imageUrls, // Pass the image URLs right away
      layoutVariations,
      imageSource
    )

    console.log(
      `\n🔄 Generating ${templateType} website with ${imageUrls.length} images...`
    )

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert frontend developer specializing in production-ready, visually stunning HTML5 websites using Bootstrap 5.3.2. You always follow the user's prompt exactly, returning only the HTML, with no markdown, explanations, or comments.`,
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 4096,
    })

    let htmlContent: string | null | undefined =
      completion.choices[0]?.message?.content

    if (htmlContent) {
      // Clean up any remaining markdown code blocks if present
      htmlContent = htmlContent.replace(/```html|```/g, '').trim()

      // Remove any StackPath Bootstrap 5+ links/scripts (incorrect CDN)
      htmlContent = htmlContent.replace(
        /<link[^>]+href=["']https:\/\/stackpath\.bootstrapcdn\.com\/bootstrap\/5\.[^"']+["'][^>]*>/gi,
        ''
      )
      htmlContent = htmlContent.replace(
        /<script[^>]+src=["']https:\/\/stackpath\.bootstrapcdn\.com\/bootstrap\/5\.[^"']+["'][^>]*><\/script>/gi,
        ''
      )

      // Ensure proper Bootstrap 5+ integration using jsDelivr CDN
      if (!htmlContent.includes('bootstrap.min.css')) {
        console.warn('⚠️ Warning: Bootstrap CSS link missing, adding it...')
        htmlContent = htmlContent.replace(
          '</head>',
          '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">\n</head>'
        )
      } else {
        // Replace any other Bootstrap 5+ CSS CDN with jsDelivr
        htmlContent = htmlContent.replace(
          /<link[^>]+href=["'][^"']*bootstrap[^"']*5\.[^"']*min\.css[^"']*["'][^>]*>/gi,
          '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">'
        )
      }

      if (!htmlContent.includes('bootstrap.bundle.min.js')) {
        console.warn('⚠️ Warning: Bootstrap JS missing, adding it...')
        htmlContent = htmlContent.replace(
          '</body>',
          '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>\n</body>'
        )
      } else {
        // Replace any other Bootstrap 5+ JS CDN with jsDelivr
        htmlContent = htmlContent.replace(
          /<script[^>]+src=["'][^"']*bootstrap[^"']*5\.[^"']*bundle\.min\.js[^"']*["'][^>]*><\/script>/gi,
          '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>'
        )
      }

      // Update cache with business type specific entries
      generationCache[cacheKey] = {
        lastRequest: requestKey,
        lastResult: htmlContent,
        timestamp: now,
      }

      return htmlContent
    } else {
      console.error('❌ Error: Generated content is undefined.')
      return 'Error generating content. Please try again.'
    }
  } catch (error) {
    console.error('❌ Error generating page:', error)
    return 'Error generating page. Please check your inputs and try again.'
  } finally {
    // Release the lock when done
    generationInProgress[cacheKey] = false
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { htmlContent, filePath } = await request.json()

    if (!htmlContent || !filePath) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Validate the file path to ensure it's within the gen_comp directory
    const normalizedPath = path.normalize(filePath)
    const absolutePath = path.join(process.cwd(), normalizedPath)

    // Security check to ensure we're only modifying files within gen_comp directory
    if (!absolutePath.startsWith(path.join(process.cwd(), 'gen_comp'))) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 403 })
    }

    // Write updated content to the file
    fs.writeFileSync(absolutePath, htmlContent)

    return NextResponse.json({
      success: true,
      message: 'Website content updated successfully',
    })
  } catch (error) {
    console.error('Error updating website content:', error)
    return NextResponse.json(
      { error: 'Failed to update website content' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - prevent multiple requests in quick succession
    const now = Date.now()

    // Use the properly typed global variable
    if (global.lastRequestTime && now - global.lastRequestTime < 2000) {
      console.log(
        '⚠️ Request throttled - too many requests in quick succession'
      )
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
    global.lastRequestTime = now

    const formData = await request.formData()
    const requestData = Object.fromEntries(formData.entries())

    // Extract image information
    const imageSource = requestData.imageSource as ImageSourceType
    let imageInstructions = requestData.imageInstructions as string

    // Extract image descriptions array if provided by the new UI
    let imageDescriptions: string[] = []
    if (requestData.imageDescriptions) {
      try {
        imageDescriptions = JSON.parse(requestData.imageDescriptions as string)
        console.log('Found image descriptions array:', imageDescriptions)
      } catch (error) {
        console.error('Error parsing image descriptions:', error)
      }
    }

    // Log the actual image instructions for debugging
    console.log('📝 Image Instructions:', imageInstructions)

    // Create timestamp and folder info first for consistent naming
    // Add clientId to prevent race conditions
    const clientId = (requestData.clientId as string) || randomString(6)
    const nowDate = new Date()
    const timestamp = `${nowDate.getFullYear()}-${String(
      nowDate.getMonth() + 1
    ).padStart(2, '0')}-${String(nowDate.getDate()).padStart(2, '0')}`
    const suffix = `${nowDate.getHours()}${nowDate.getMinutes()}${nowDate.getSeconds()}-${clientId}`
    const businessType =
      typeof requestData.businessType === 'string'
        ? requestData.businessType.toLowerCase()
        : 'website'

    // Create folder structure for the generated content
    const folderName = `${businessType}-${timestamp}-${suffix}`
    const outputDir = path.join(process.cwd(), 'gen_comp', folderName)
    const imagesDir = path.join(outputDir, 'images')

    console.log(`Creating folder structure at: ${outputDir}`)

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true })
    }

    // Format the form data for processing
    const processedFormData: Record<string, string | string[]> = {
      businessType: requestData.businessType as string,
      address: requestData.address as string,
      phone: requestData.phone as string,
      email: requestData.email as string,
      imageUrls: [], // Start with empty, we'll fill this after
      imageSource,
      colorScheme: requestData.colorScheme as string,
      timestamp: Date.now().toString(), // Add timestamp to avoid false cache hits
    }

    // Add image descriptions to the processed form data if available
    if (imageDescriptions.length > 0) {
      processedFormData.imageDescriptions = imageDescriptions
    }

    // Add questions to the form data
    for (let i = 1; i <= 10; i++) {
      const key = `question${i}`
      if (requestData[key]) {
        processedFormData[key] = requestData[key] as string
      }
    }

    // Process images first - we'll only generate the HTML once with the final image paths
    let localImageUrls: string[] = []

    if (imageSource === 'manual') {
      // Process uploaded images
      const files = formData.getAll('uploadedImages') as File[]

      const uploadPromises = files.map(async (file, i) => {
        try {
          const buffer = Buffer.from(await file.arrayBuffer())
          const safeFilename = `image-${i + 1}${path.extname(
            file.name
          )}`.replace(/\s+/g, '-')
          const imagePath = path.join(imagesDir, safeFilename)
          fs.writeFileSync(imagePath, buffer)
          return `./images/${safeFilename}`
        } catch (err) {
          console.error(`Error processing uploaded file ${i}:`, err)
          return null
        }
      })

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises)
      localImageUrls = results.filter(Boolean) as string[]
      console.log(`Processed ${localImageUrls.length} uploaded images`)
    } else if (imageSource === 'ai') {
      // Check if we have structured image descriptions from the new UI
      if (imageDescriptions.length > 0) {
        // Format the image descriptions into the expected numbered format
        const formattedInstructions = imageDescriptions
          .filter((desc) => desc.trim() !== '')
          .map((desc, index) => `${index + 1}.${desc.trim()}`)
          .join(' ')

        console.log(
          'Using structured image descriptions:',
          formattedInstructions
        )

        // Use our formatted instructions instead of the raw ones
        if (formattedInstructions) {
          imageInstructions = formattedInstructions
        }
      }

      // Use the improved detection logic from imageProcessor
      let containsNumberedImages = false
      if (imageInstructions) {
        containsNumberedImages = containsNumberedFormat(imageInstructions)

        // Print the full instructions for debugging
        console.log('Raw image instructions:', imageInstructions)

        // Additional debugging - explicitly check some basic patterns
        const hasDigitPeriod = /\d\./.test(imageInstructions)
        const hasDigitParen = /\d\)/.test(imageInstructions)
        const hasNewlineDigit = /\n\s*\d/.test(imageInstructions)
        console.log(
          `Contains: digit+period: ${hasDigitPeriod}, digit+paren: ${hasDigitParen}, newline+digit: ${hasNewlineDigit}`
        )
      }

      // Log whether we detected a numbered list
      console.log(
        `Image instructions ${
          containsNumberedImages ? 'CONTAIN' : 'DO NOT CONTAIN'
        } numbered format`
      )

      // Fetch AI image URLs using improved fetchImages function
      console.log('Calling fetchImages with the image instructions...')
      const aiImageUrls = await fetchImages(
        imageInstructions ?? '',
        requestData.businessType as string,
        'ai'
      )

      // Log the number of images detected
      console.log(
        `Detected ${aiImageUrls.length} image requests from instructions`
      )

      // Download all AI images in parallel
      if (aiImageUrls.length > 0) {
        console.log(`Downloading ${aiImageUrls.length} AI images...`)

        const downloadPromises = aiImageUrls.map(async (url, i) => {
          const localFilename = `image-${i + 1}.png`
          const imagePath = path.join(imagesDir, localFilename)

          try {
            console.log(
              `Fetching image ${i + 1} from URL: ${url.substring(0, 100)}...`
            )
            const response = await fetch(url)
            if (!response.ok) {
              console.error(
                `Failed to download image ${i + 1} from URL: ${url}. Status: ${
                  response.status
                }`
              )
              return null
            }

            const imageBuffer = Buffer.from(await response.arrayBuffer())
            fs.writeFileSync(imagePath, imageBuffer)
            console.log(`Successfully saved image ${i + 1} to ${localFilename}`)
            return `./images/${localFilename}`
          } catch (err) {
            console.error(`Error downloading AI image ${i + 1}:`, err)
            return null
          }
        })

        const results = await Promise.all(downloadPromises)
        localImageUrls = results.filter(Boolean) as string[]
        console.log(
          `Successfully downloaded ${localImageUrls.length} of ${aiImageUrls.length} images`
        )
      } else {
        console.warn('⚠️ No image URLs were generated from the instructions')
      }
    }

    // Generate HTML with the images paths - only once!
    console.log(`Generating HTML with ${localImageUrls.length} images...`)
    processedFormData.imageUrls = localImageUrls

    // Do a single HTML generation with all image paths included
    const finalHtml = await generateCustomPage(
      processedFormData as FormData,
      imageSource,
      localImageUrls
    )

    // Validate HTML content
    if (
      !finalHtml ||
      finalHtml ===
        'Error generating page. Please check your inputs and try again.'
    ) {
      throw new Error('Failed to generate HTML content')
    }

    // Process image paths for different output formats
    const { processedHTML, previewHTML, standaloneHTML } = processImagePaths(
      finalHtml,
      folderName,
      outputDir
    )

    // Save the HTML file
    const filePath = path.join(outputDir, 'index.html')
    // Ensure outputDir exists before writing
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    fs.writeFileSync(filePath, processedHTML)

    // Map image URLs for the response
    const mappedImageUrls = mapImageUrls(localImageUrls, folderName)

    // Fix image URLs in preview HTML
    const fixedPreviewHtml = ensureImageUrlsHaveParams(
      previewHTML,
      mappedImageUrls
    )

    // Prepare the response
    const responseData = {
      htmlContent: fixedPreviewHtml || '<p>No content was generated</p>',
      filePath: `/gen_comp/${folderName}/index.html`,
      folderPath: `/gen_comp/${folderName}`,
      imageUrls: mappedImageUrls,
      imageSource,
      standaloneHtml: standaloneHTML,
    }

    console.log('Generated website successfully saved to:', outputDir)

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error generating page:', error)
    return NextResponse.json(
      {
        error: 'Error generating page.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Helper function to generate random string
function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
