import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import {
  fetchImages,
  ensureImageUrlsHaveParams,
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
import { writeFileSync } from 'fs'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string })

// Simple cache to debounce repeated requests
const generationCache: CacheEntry = {
  lastRequest: '',
  lastResult: '',
  timestamp: 0,
}

export async function generateCustomPage(
  formData: FormData,
  imageSource: ImageSourceType
): Promise<string> {
  const { businessType, address, phone, email, imageUrls = [] } = formData
  const templateType = businessType.toLowerCase()
  const answers = []

  // Create a cache key from the form data
  const requestKey = JSON.stringify(formData)

  // Return cached result if it's recent (within 5 seconds)
  const now = Date.now()
  if (
    requestKey === generationCache.lastRequest &&
    now - generationCache.timestamp < 5000
  ) {
    console.log('🔄 Using cached result...')
    return generationCache.lastResult
  }

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

  // Generate unique website structure based on business type
  const layoutVariations = generateLayoutVariations(templateType, answers)

  // Create template-specific prompt
  const specificPrompt = getBusinessPrompt(
    templateType,
    answers,
    layoutVariations
  )

  // Build the complete prompt
  const prompt = buildPrompt(
    templateType,
    {
      name: typeof answers[0] === 'string' ? answers[0] : undefined,
      address,
      phone,
      email,
    },
    specificPrompt,
    imageUrls,
    layoutVariations,
    imageSource
  )

  try {
    console.log('\n🔄 Generating your custom premium website...')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert frontend developer specializing in creating cutting-edge, visually stunning websites using Bootstrap 5.3.2. 
          You excel at creating modern designs with:
          - Clean, semantic HTML5 structure
          - Proper Bootstrap grid system implementation
          - Professional CSS styling with consistent variables
          - Responsive design for all devices
          - Elegant animations and microinteractions
          - Glass morphism and modern UI techniques
          - Accessibility and performance best practices
          
          Your code is production-ready and follows all current web standards.`,
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.75,
      max_tokens: 10000,
    })

    let htmlContent: string | null | undefined =
      completion.choices[0]?.message?.content

    if (htmlContent) {
      // Clean up any remaining markdown code blocks if present
      htmlContent = htmlContent.replace(/```html|```/g, '').trim()

      // Ensure proper Bootstrap integration
      if (!htmlContent.includes('bootstrap.min.css')) {
        console.warn('⚠️ Warning: Bootstrap CSS link missing, adding it...')
        htmlContent = htmlContent.replace(
          '</head>',
          '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"></head>'
        )
      }

      if (!htmlContent.includes('bootstrap.bundle.min.js')) {
        console.warn('⚠️ Warning: Bootstrap JS missing, adding it...')
        htmlContent = htmlContent.replace(
          '</body>',
          '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" defer></script></body>'
        )
      }

      // Update cache
      generationCache.lastRequest = requestKey
      generationCache.lastResult = htmlContent
      generationCache.timestamp = now

      return htmlContent
    } else {
      console.error('❌ Error: Generated content is undefined.')
      return 'Error generating content. Please try again.'
    }
  } catch (error) {
    console.error('❌ Error generating page:', error)
    return 'Error generating page. Please check your inputs and try again.'
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
    writeFileSync(absolutePath, htmlContent)

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
    const formData = await request.formData()
    const requestData = Object.fromEntries(formData.entries())

    // Extract image information
    const imageSource = requestData.imageSource as ImageSourceType
    const imageInstructions = requestData.imageInstructions as string
    let imageUrls: string[] = []

    // Process images based on the source
    if (imageSource === 'ai') {
      // Use the existing AI image generation path
      imageUrls = await fetchImages(
        imageInstructions || '',
        requestData.businessType as string,
        'ai'
      )

      // Log the results of image generation
      console.log(
        `Generated ${imageUrls.length} AI images for ${typeof requestData.businessType === 'string' ? requestData.businessType : ''}`
      )
      if (imageUrls.length === 0) {
        console.warn(
          'Warning: No AI images were generated. Check image generation service.'
        )
      }
    } else if (imageSource === 'manual') {
      // Process uploaded images
      const files = formData.getAll('uploadedImages') as File[]

      // Create the uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }

      // Save each file and collect their URLs
      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer())
        // Sanitize the filename to avoid problems
        const sanitizedFilename = file.name
          .replace(/['"]/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^a-zA-Z0-9-_.]/g, '')
        const filename = `${Date.now()}-${sanitizedFilename}`
        const filePath = path.join(uploadsDir, filename)

        fs.writeFileSync(filePath, buffer)
        // Use an absolute URL path that includes the domain
        imageUrls.push(`/uploads/${filename}`)
      }

      console.log('Manual images saved:', imageUrls)
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
    }

    // Add questions to the form data
    for (let i = 1; i <= 10; i++) {
      const key = `question${i}`
      if (requestData[key]) {
        processedFormData[key] = requestData[key] as string
      }
    }

    // Create timestamp and folder info first for consistent naming
    const now = new Date()
    const timestamp = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const suffix = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}`
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

    // Start multiple processes in parallel:
    // 1. Image fetching/processing
    // 2. Initial HTML generation
    const [initialHtmlPromise, imageProcessingPromise] = await Promise.all([
      // 1. Start HTML generation with initial data (no images yet)
      (async () => {
        console.log('🔄 Starting HTML generation...')
        return await generateCustomPage(
          processedFormData as FormData,
          imageSource
        )
      })(),

      // 2. Process images based on source
      (async () => {
        const downloadedImageUrls: string[] = [] // This will hold the local image paths

        if (imageSource === 'manual') {
          // Process uploaded images
          const files = formData.getAll('uploadedImages') as File[]

          const uploadPromises = files.map(async (file, i) => {
            const buffer = Buffer.from(await file.arrayBuffer())
            const safeFilename = `image-${i + 1}${path.extname(
              file.name
            )}`.replace(/\s+/g, '-')
            const imagePath = path.join(imagesDir, safeFilename)
            fs.writeFileSync(imagePath, buffer)
            return `./images/${safeFilename}`
          })

          // Wait for all uploads to complete
          const results = await Promise.all(uploadPromises)
          downloadedImageUrls.push(...results)
          console.log(`Processed ${downloadedImageUrls.length} uploaded images`)
        } else if (imageSource === 'ai') {
          // Fetch AI image URLs
          console.log('Fetching AI images...')
          const fetchedAiImageUrls = await fetchImages(
            imageInstructions ?? '',
            requestData.businessType as string,
            'ai'
          )

          console.log(`Fetched ${fetchedAiImageUrls.length} AI image URLs`)

          if (fetchedAiImageUrls.length > 0) {
            // Download all AI images in parallel
            console.log(`Downloading ${fetchedAiImageUrls.length} AI images...`)

            const downloadPromises = fetchedAiImageUrls.map(
              async (remoteUrl, i) => {
                const localFilename = `image-${i + 1}.png`
                const imagePath = path.join(imagesDir, localFilename)

                try {
                  // Fetch and save the image
                  const response = await fetch(remoteUrl)
                  if (!response.ok)
                    throw new Error(`Failed to fetch image: ${response.status}`)

                  const imageBuffer = Buffer.from(await response.arrayBuffer())
                  fs.writeFileSync(imagePath, imageBuffer)

                  console.log(`Successfully saved image ${i + 1}`)
                  return `./images/${localFilename}`
                } catch (error) {
                  console.error(`Error downloading AI image ${i + 1}:`, error)
                  return null // Return null for failed downloads
                }
              }
            )

            // Wait for all downloads to complete
            const results = await Promise.all(downloadPromises)
            const successfulDownloads = results.filter(Boolean) as string[]

            downloadedImageUrls.push(...successfulDownloads)
            console.log(
              `Successfully downloaded ${successfulDownloads.length} of ${fetchedAiImageUrls.length} images`
            )
          }
        }

        return downloadedImageUrls
      })(),
    ])

    // Now we have both the initial HTML and the processed images
    const initialHtml = initialHtmlPromise
    const downloadedImageUrls = imageProcessingPromise

    // Check if we need to regenerate HTML with image paths
    let finalHtml = initialHtml
    if (downloadedImageUrls.length > 0) {
      // Update the form data with the image paths and regenerate
      processedFormData.imageUrls = downloadedImageUrls

      console.log('Re-generating HTML with image paths...')
      finalHtml = await generateCustomPage(
        processedFormData as FormData,
        imageSource
      )
    }

    // Validate that we got HTML content
    if (
      !finalHtml ||
      finalHtml ===
        'Error generating page. Please check your inputs and try again.'
    ) {
      throw new Error('Failed to generate HTML content')
    }

    // Process image paths for different output formats
    // (file system, preview, and standalone versions)
    const { processedHTML, previewHTML } = processImagePaths(
      finalHtml,
      folderName,
      outputDir
    )

    // Save the HTML file
    const filePath = path.join(outputDir, 'index.html')
    fs.writeFileSync(filePath, processedHTML)

    // Fix image URLs in preview HTML
    const fixedPreviewHtml = ensureImageUrlsHaveParams(
      previewHTML,
      mapImageUrls(downloadedImageUrls, folderName)
    )

    // Log transformation example
    if (downloadedImageUrls.length > 0) {
      console.log(
        'Sample image URL transformation:',
        downloadedImageUrls[0],
        '→',
        mapImageUrls([downloadedImageUrls[0]], folderName)[0]
      )
    }

    // Prepare the response
    const responseData = {
      htmlContent: fixedPreviewHtml || '<p>No content was generated</p>',
      filePath: `/gen_comp/${folderName}/index.html`,
      folderPath: `/gen_comp/${folderName}`,
      imageUrls: mapImageUrls(downloadedImageUrls, folderName),
      imageSource,
    }

    console.log('Generated website successfully saved to:', outputDir)
    console.log(
      'Sending response with HTML content length:',
      responseData.htmlContent.length
    )

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
