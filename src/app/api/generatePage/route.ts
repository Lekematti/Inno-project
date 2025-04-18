import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { fetchImages, ensureImageUrlsHaveParams } from '@/app/build/imageProcessor'
import { generateLayoutVariations } from '@/app/api/generatePage/utils/layout-generator'
import { getBusinessPrompt } from '@/app/templates/business-prompts'
import { buildPrompt } from '@/app/templates/prompt-builder'
import {
  CacheEntry,
  FormData,
} from '@/app/api/generatePage/types/website-generator'
import { ImageSourceType } from '@/types/formData'

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const requestData = Object.fromEntries(formData.entries());

    // Extract image information
    const imageSource = requestData.imageSource as ImageSourceType;
    const imageInstructions = requestData.imageInstructions as string;
    let imageUrls: string[] = [];

    // Process images based on the source
    if (imageSource === 'ai') {
      // Use the existing AI image generation path
      imageUrls = await fetchImages(
        imageInstructions || '',
        requestData.businessType as string,
        'ai' 
      );
      
      // Log the results of image generation
      console.log(`Generated ${imageUrls.length} AI images for ${requestData.businessType}`);
      if (imageUrls.length === 0) {
        console.warn('Warning: No AI images were generated. Check image generation service.');
      }
    } else if (imageSource === 'manual') {
      // Process uploaded images
      const files = formData.getAll('uploadedImages') as File[];

      // Create the uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Save each file and collect their URLs
      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        // Sanitize the filename to avoid problems
        const sanitizedFilename = file.name
          .replace(/['"]/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^a-zA-Z0-9-_.]/g, '');
        const filename = `${Date.now()}-${sanitizedFilename}`;
        const filePath = path.join(uploadsDir, filename);

        fs.writeFileSync(filePath, buffer);
        // Use an absolute URL path that includes the domain
        imageUrls.push(`/uploads/${filename}`);
      }

      console.log('Manual images saved:', imageUrls);
    }

    // Format the form data for processing
    const processedFormData: Record<string, string | string[]> = {
      businessType: requestData.businessType as string,
      address: requestData.address as string,
      phone: requestData.phone as string,
      email: requestData.email as string,
      imageUrls,
      imageSource,
      colorScheme: requestData.colorScheme as string,
    };

    // For questions 1-10, add them to the processed form data
    for (let i = 1; i <= 10; i++) {
      const key = `question${i}`;
      if (requestData[key]) {
        processedFormData[key] = requestData[key] as string;
      }
    }

    // Generate HTML with images
    const htmlContent = await generateCustomPage(
      processedFormData as FormData,
      imageSource
    );

    const fixedHtmlContent = ensureImageUrlsHaveParams(htmlContent, imageUrls);

    // Save the generated HTML
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const suffix = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
    const businessType = Array.isArray(processedFormData.businessType)
      ? processedFormData.businessType[0]
      : processedFormData.businessType;
    const fileName = `${businessType.toLowerCase()}-${timestamp}-${suffix}.html`;
    const outputDir = path.join(process.cwd(), 'gen_comp');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, fileName);

    // Modify the HTML content to ensure images have correct paths
    const modifiedHtml = (() => {
      let html = fixedHtmlContent; // Using the fixed HTML content
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
      
      html = html.replace(
        /src="\/uploads\//g,
        `src="${baseUrl}/uploads/`
      );
      
      html = html.replace(
        /background-image:\s*url\(['"]?\/uploads\//g,
        `background-image: url('${baseUrl}/uploads/`
      );
      
      html = html.replace(
        /content="\/uploads\//g,
        `content="${baseUrl}/uploads/`
      );
      
      return html;
    })();

    fs.writeFileSync(filePath, modifiedHtml);

    return NextResponse.json({
      htmlContent: modifiedHtml,
      filePath: `/gen_comp/${fileName}`,
      imageUrls,
      imageSource,
    });
  } catch (error) {
    console.error('Error generating page:', error);
    return NextResponse.json(
      { error: 'Error generating page.' },
      { status: 500 }
    );
  }
}