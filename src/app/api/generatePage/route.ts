import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { fetchImages } from '@/app/build/imageProcessor'
import { generateLayoutVariations } from '@/app/api/generatePage/utils/layout-generator'
import { getBusinessPrompt } from '@/app/templates/business-prompts'
import { buildPrompt } from '@/app/templates/prompt-builder'
import { CacheEntry, FormData } from '@/app/api/generatePage/types/website-generator'
import { ImageSourceType } from '@/types/formData'
import { processImagePaths, mapImageUrls } from './utils/image-path-processor';
import { writeFileSync} from 'fs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string });

// Simple cache to debounce repeated requests
const generationCache: CacheEntry = {
  lastRequest: '',
  lastResult: '',
  timestamp: 0,
};

export async function generateCustomPage(formData: FormData, imageSource: ImageSourceType): Promise<string> {
  const { businessType, address, phone, email, imageUrls = [] } = formData;
  const templateType = businessType.toLowerCase();
  const answers = [];

  // Create a cache key from the form data
  const requestKey = JSON.stringify(formData);

  // Return cached result if it's recent (within 5 seconds)
  const now = Date.now();
  if (
    requestKey === generationCache.lastRequest &&
    now - generationCache.timestamp < 5000
  ) {
    console.log('🔄 Using cached result...');
    return generationCache.lastResult
  }

  // Gather all the answers from the form data
  for (let i = 1; i <= 10; i++) {
    const key = `question${i}`;
    if (formData[key]) {
      answers.push(typeof formData[key] === 'string' ? formData[key] : undefined)
    } else {
      answers.push('') // Push empty string if answer is not provided
    }
  }

  // Generate unique website structure based on business type
  const layoutVariations = generateLayoutVariations(templateType, answers);
  
  // Create template-specific prompt
  const specificPrompt = getBusinessPrompt(templateType, answers, layoutVariations);

  // Build the complete prompt
  const prompt = buildPrompt(
    templateType, 
    { name: typeof answers[0] === 'string' ? answers[0] : undefined, address, phone, email },
    specificPrompt,
    imageUrls,
    layoutVariations,
    imageSource,
  );

  try {
    console.log('\n🔄 Generating your custom website...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
    });


    let htmlContent: string | null | undefined =
      completion.choices[0]?.message?.content;

    if (htmlContent) {
      // Clean up any remaining markdown code blocks if present
      htmlContent = htmlContent.replace(/```html|```/g, '').trim();

      // Update cache
      generationCache.lastRequest = requestKey;
      generationCache.lastResult = htmlContent;
      generationCache.timestamp = now;

      return htmlContent;
    } else {
      console.error('❌ Error: Generated content is undefined.');
      return 'Error generating content. Please try again.';
    }
  } catch (error) {
    console.error('❌ Error generating page:', error);
    return 'Error generating page. Please check your inputs and try again.';
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { htmlContent, filePath } = await request.json();
    
    if (!htmlContent || !filePath) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Validate the file path to ensure it's within the gen_comp directory
    const normalizedPath = path.normalize(filePath);
    const absolutePath = path.join(process.cwd(), normalizedPath);
    
    // Security check to ensure we're only modifying files within gen_comp directory
    if (!absolutePath.startsWith(path.join(process.cwd(), 'gen_comp'))) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 403 }
      );
    }
    
    // Write updated content to the file
    writeFileSync(absolutePath, htmlContent);
    
    return NextResponse.json({
      success: true,
      message: 'Website content updated successfully',
    });
    
  } catch (error) {
    console.error('Error updating website content:', error);
    return NextResponse.json(
      { error: 'Failed to update website content' },
      { status: 500 }
    );
  }
}

// Add error handling and validation to the POST handler

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const requestData = Object.fromEntries(formData.entries());
    
    // Extract image information
    const imageSource = requestData.imageSource as ImageSourceType;
    const imageInstructions = requestData.imageInstructions as string;
    const imageUrls: string[] = [];
    
    // Create timestamp for the folder name
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const suffix = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
    const businessType = typeof requestData.businessType === 'string' ? 
      requestData.businessType.toLowerCase() : 'website';
    
    // Create folder structure for the generated content
    const folderName = `${businessType}-${timestamp}-${suffix}`;
    const outputDir = path.join(process.cwd(), 'gen_comp', folderName);
    const imagesDir = path.join(outputDir, 'images');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    // Process images based on the source
    if (imageSource === 'manual') {
      // Process uploaded images
      const files = formData.getAll('uploadedImages') as File[];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const buffer = Buffer.from(await file.arrayBuffer());
        const safeFilename = `image-${i + 1}${path.extname(file.name)}`.replace(/\s+/g, '-');
        
        // Save directly to the website's images folder
        const imagePath = path.join(imagesDir, safeFilename);
        fs.writeFileSync(imagePath, buffer);
        
        // Use relative path for the HTML
        imageUrls.push(`./images/${safeFilename}`);
      }
    } else if (imageSource === 'ai') {
      // Use the existing AI image generation path
      const aiImageUrls = await fetchImages(imageInstructions ?? '', requestData.businessType as string);
      
      for (let i = 0; i < aiImageUrls.length; i++) {
        const remoteUrl = aiImageUrls[i];
        
        // Download and save AI-generated images
        try {
          const response = await fetch(remoteUrl);
          if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
          
          const imageBuffer = Buffer.from(await response.arrayBuffer());
          const imagePath = path.join(imagesDir, `image-${i + 1}.png`);
          fs.writeFileSync(imagePath, imageBuffer);
          
          // Use relative path for the HTML
          imageUrls.push(`./images/image-${i + 1}.png`);
        } catch (imgError) {
          console.error(`Error downloading AI image ${i+1}:`, imgError);
          // Use remote URL as fallback
          imageUrls.push(remoteUrl);
        }
      }
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

    // Add questions to the form data
    for (let i = 1; i <= 10; i++) {
      const key = `question${i}`;
      if (requestData[key]) {
        processedFormData[key] = requestData[key] as string;
      }
    }

    // Generate HTML with images
    const htmlContent = await generateCustomPage(processedFormData as FormData, imageSource);
    
    // Validate that we actually got HTML content
    if (!htmlContent || htmlContent === 'Error generating page. Please check your inputs and try again.') {
      throw new Error('Failed to generate HTML content');
    }

    // Process image paths with the output directory
    const { processedHTML, previewHTML, standaloneHTML } = processImagePaths(htmlContent, folderName, outputDir);

    // Define the file path for the HTML file
    const filePath = path.join(outputDir, 'index.html');

    // Write the processed HTML file with relative paths (for file system)
    fs.writeFileSync(filePath, processedHTML);
    
    // Verify that processed content exists
    if (!previewHTML || !standaloneHTML) {
      throw new Error('Failed to process HTML content');
    }

    // Add this line right before sending the response
    console.log("Sample image URL transformation:", 
      imageUrls[0], "→", mapImageUrls([imageUrls[0]], folderName)[0]);

    // Update the response data structure to include the folder name in image URLs
    const responseData = {
      htmlContent: previewHTML || '<p>No content was generated</p>',
      standaloneHtml: standaloneHTML || '<p>No content was generated</p>', 
      filePath: `/gen_comp/${folderName}/index.html`,
      imageUrls: mapImageUrls(imageUrls, folderName),  // Pass folderName here
      imageSource,
      outputDir,
    };

    console.log("Sending response with HTML content length:", responseData.htmlContent.length);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error generating page:', error);
    return NextResponse.json({ 
      error: 'Error generating page.', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
