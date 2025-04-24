import { NextRequest, NextResponse } from 'next/server';
import { EditElementRequest } from '@/types/formData';
import OpenAI from 'openai';

// Create OpenAI client with the API key
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY as string 
});

export async function POST(request: NextRequest) {
  try {
    const data: EditElementRequest = await request.json();
    const { formData, htmlContent, editInstructions } = data;
    
    if (!htmlContent || !editInstructions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a prompt based on the edit mode and instructions
    let prompt = '';
    if (editInstructions.editMode === 'simple') {
      // Direct editing mode - execute simple instructions
      prompt = `
        You are an expert HTML/CSS developer helping edit a website. 
        You are given the full HTML of a webpage and need to make a specific change to an element.
        
        The element to change is identified by this path selector: "${editInstructions.elementPath}"
        The tag name is: ${editInstructions.tagName}
        The element type is: ${editInstructions.elementType}
        ${editInstructions.elementId ? `The element id is: ${editInstructions.elementId}` : ''}
        
        The direct editing instruction is: "${editInstructions.instructions}"
        
        Please provide the full HTML with this specific change made. Maintain all existing structure, styles, and functionality.
        Only change the content or attributes of the identified element.
      `;
    } else {
      // AI-assisted editing mode - use the LLM for creative changes
      prompt = `
        You are an expert web designer and developer specializing in creating beautiful, responsive websites. 
        You're helping improve a website for a ${formData.businessType} business.
        
        You are given the full HTML of a webpage and need to improve a specific element based on user instructions.
        
        The element to improve is identified by this path selector: "${editInstructions.elementPath}"
        The tag name is: ${editInstructions.tagName}
        The element type is: ${editInstructions.elementType}
        ${editInstructions.elementId ? `The element id is: ${editInstructions.elementId}` : ''}
        
        The user's instructions for improvement are: "${editInstructions.instructions}"
        
        Please provide the full HTML with this specific improvement made. Be creative and enhance the element according to the instructions,
        but maintain compatibility with the rest of the design. Pay attention to:
        
        1. Visual consistency with the page design
        2. Improved typography, colors, and spacing if relevant
        3. Enhanced messaging and copy if relevant
        4. Better imagery description if relevant
        5. Proper HTML structure and semantic markup
        
        Return the complete HTML document with your changes integrated.
      `;
    }

    // Call OpenAI API to generate the updated HTML using the correct method
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert web developer and designer specializing in creating beautiful, responsive websites."
        },
        {
          role: "user", 
          content: prompt + "\n\nHere is the current HTML:\n\n" + htmlContent
        }
      ],
      temperature: 0.5,
      max_tokens: 4096,
    });

    const updatedHtml = completion.choices[0]?.message?.content ?? '';
    
    // Extract the HTML content from the response (in case it includes markdown code fences)
    const htmlRegex = /<!DOCTYPE html>[\s\S]*<\/html>/;
    const htmlMatch = htmlRegex.exec(updatedHtml);
    const processedHtml = htmlMatch ? htmlMatch[0] : updatedHtml;
    
    // Generate a timestamp for the file name
    const date = new Date();
    const timestamp = date.toISOString().replace(/[-:]/g, '').split('.')[0];
    
    // Create filename with business type and timestamp
    const fileName = `${formData.businessType || 'website'}-${timestamp}.html`;
    
    // Return the updated HTML and filename
    return NextResponse.json({
      htmlContent: processedHtml,
      filePath: `/gen_comp/${fileName}`,
      success: true,
    });

  } catch (error) {
    console.error('Error processing edit request:', error);
    return NextResponse.json(
      { error: 'Failed to process edit request' },
      { status: 500 }
    );
  }
}