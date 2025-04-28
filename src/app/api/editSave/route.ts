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

    // Determine output directory from originalFilePath
    let outputDir: string;
    let filePath: string;
    if (originalFilePath && originalFilePath.trim() !== '') {
      // Remove leading slash and split path
      const cleanPath = originalFilePath.replace(/^\//, '');
      // Get the path after 'gen_comp/'
      const genCompIndex = cleanPath.indexOf('gen_comp/');
      let relToGenComp = '';
      if (genCompIndex !== -1) {
        relToGenComp = cleanPath.substring('gen_comp/'.length);
      } else {
        relToGenComp = cleanPath;
      }
      // Remove the filename to get the folder
      const relDir = path.dirname(relToGenComp);
      outputDir = path.join(process.cwd(), 'gen_comp', relDir);
      filePath = path.join(outputDir, 'index.html');
    } else {
      outputDir = path.join(process.cwd(), 'gen_comp');
      filePath = path.join(outputDir, 'index.html');
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // If index.html exists, rename it to index_old.html
    const oldFilePath = path.join(outputDir, 'index_old.html');
    if (fs.existsSync(filePath)) {
      // Remove previous index_old.html if it exists
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      fs.renameSync(filePath, oldFilePath);
    }

    // Include metadata in HTML comment
    const metadataComment = `
<!-- 
  Generated website for: ${formData.businessName ?? formData.question1 ?? formData.businessType ?? 'Unknown business'}
  Business type: ${formData.businessType ?? 'Not specified'}
  Last edited: ${new Date().toISOString()}
-->
`;
    
    // Process the HTML content
    let modifiedHtml = htmlContent;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';

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
    
    // Return the file path (always /gen_comp/.../index.html)
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