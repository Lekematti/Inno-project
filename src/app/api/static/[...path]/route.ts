import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest
) {
  try {
    // Get the path from the URL instead of using params
    // This avoids the Next.js error about accessing params.path
    const url = new URL(request.url);
    const pathFromUrl = url.pathname.replace('/api/static/', '');
    
    // Build the file path using the URL path
    const filePath = path.join(process.cwd(), 'gen_comp', pathFromUrl);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read file content
    const fileBuffer = fs.readFileSync(filePath);
    
    // Get the file extension to set the content type
    const ext = path.extname(filePath).toLowerCase();
    
    // Define content type based on file extension
    const contentTypeMap: Record<string, string> = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    };
    
    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    
    // Return the file content with proper headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*', // Allow cross-origin requests
      },
    });
  } catch (error) {
    console.error('Error serving static file:', error);
    return NextResponse.json({ error: 'Error serving file' }, { status: 500 });
  }
}