import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { fetchImages } from '@/app/build/imageProcessor'
import { generateLayoutVariations } from '@/app/api/generatePage/utils/layout-generator'
import { getBusinessPrompt } from '@/app/templates/business-prompts'
import { buildPrompt } from '@/app/templates/prompt-builder'
import { CacheEntry, FormData } from '@/app/api/generatePage/types/website-generator'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string });

// Simple cache to debounce repeated requests
const generationCache: CacheEntry = {
  lastRequest: '',
  lastResult: '',
  timestamp: 0,
};

export async function generateCustomPage(formData: FormData): Promise<string> {
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
    layoutVariations
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

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const { imageInstructions, ...formData } = requestData;

    // Process image instructions
    const imageUrls = await fetchImages(imageInstructions || '');

    // Generate HTML with images
    const htmlContent = await generateCustomPage({
      ...formData,
      imageUrls,
    });

    // Save the generated HTML
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const suffix = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
    const fileName = `${formData.businessType.toLowerCase()}-${timestamp}-${suffix}.html`;
    const outputDir = path.join(process.cwd(), 'gen_comp');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, htmlContent);

    return NextResponse.json({
      htmlContent,
      filePath: `/gen_comp/${fileName}`,
      imageUrls,
    });
  } catch (error) {
    console.error('Error generating page:', error)
    return NextResponse.json(
      { error: 'Error generating page.' },
      { status: 500 }
    )
  }
}
