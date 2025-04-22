import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  console.log('editSave API route triggered');
  
  try {
    const data = await request.json();
    console.log('Received data:', {
      hasFormData: !!data.formData,
      hasHtmlContent: !!data.htmlContent,
      originalFilePath: data.originalFilePath
    });
    
    const { formData, htmlContent, originalFilePath } = data;
    
    if (!htmlContent || !formData) {
      console.error('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // This will hold our final file path
    let filePath;
    let fileName;
    
    // Check if we're updating an existing file
    if (originalFilePath && originalFilePath.trim() !== '') {
      // Original file exists - update in place
      const cleanPath = originalFilePath.replace(/^\//, '');
      filePath = path.join(process.cwd(), cleanPath);
      fileName = path.basename(filePath);
      
      console.log('Updating existing file:', filePath);
    } else {
      // No original file - create new one
      // Generate a timestamp for the file name
      const date = new Date();
      const timestamp = date.toISOString().replace(/[-:]/g, '').split('.')[0];
      
      // Use business name from formData if available
      const businessName = formData.businessName || formData.question1 || formData.businessType || 'website';
      const sanitizedBusinessName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);
      
      // Create filename with business name and timestamp
      fileName = `${sanitizedBusinessName}-edited-${timestamp}.html`;
      const outputDir = path.join(process.cwd(), 'gen_comp');
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      filePath = path.join(outputDir, fileName);
      console.log('Creating new file:', filePath);
    }
    
    // Include metadata in HTML comment
    const metadataComment = `
<!-- 
  Generated website for: ${formData.businessName || formData.question1 || formData.businessType || 'Unknown business'}
  Business type: ${formData.businessType || 'Not specified'}
  Last edited: ${new Date().toISOString()}
-->
`;
    
    // Process the HTML content
    let modifiedHtml = htmlContent;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

    // Add metadata at the beginning of the <head> tag
    modifiedHtml = modifiedHtml.replace(/<head>/, `<head>${metadataComment}`);
    
    // Fix image paths
    modifiedHtml = modifiedHtml.replace(/src="\/uploads\//g, `src="${baseUrl}/uploads/`);
    modifiedHtml = modifiedHtml.replace(
      /background-image:\s*url\(['"]?\/uploads\//g,
      `background-image: url('${baseUrl}/uploads/`
    );
    modifiedHtml = modifiedHtml.replace(
      /content="\/uploads\//g,
      `content="${baseUrl}/uploads/`
    );
    
    // Write the file with error handling
    try {
      fs.writeFileSync(filePath, modifiedHtml);
      console.log('File written successfully');
    } catch (writeError) {
      console.error('Error writing file:', writeError);
      throw writeError;
    }

    // Determine the relative path for the response
    const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
    
    // Return the file path (either updated or new)
    return NextResponse.json({
      filePath: `/${relativePath}`,
      success: true,
      isUpdate: !!originalFilePath
    });
    
  } catch (error) {
    console.error('Error in editSave API route:', error);
    return NextResponse.json(
      { error: `Failed to save edited HTML: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}