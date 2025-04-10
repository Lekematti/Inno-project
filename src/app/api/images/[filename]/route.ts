import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    console.log(`Fallback image request for: ${filename}`);
    
    // Find the image in the most recent gen_comp folder
    const genCompDir = path.join(process.cwd(), 'gen_comp');
    
    // Check if gen_comp directory exists
    if (!fs.existsSync(genCompDir)) {
      return NextResponse.json({ error: 'No generated content found' }, { status: 404 });
    }
    
    // Get all folders in gen_comp, sorted by modification time (most recent first)
    const folders = fs.readdirSync(genCompDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .sort((a, b) => {
        const statA = fs.statSync(path.join(genCompDir, a));
        const statB = fs.statSync(path.join(genCompDir, b));
        return statB.mtime.getTime() - statA.mtime.getTime();
      });
    
    // Look for the image in each folder, starting with the most recent
    for (const folder of folders) {
      const imagePath = path.join(genCompDir, folder, 'images', filename);
      if (fs.existsSync(imagePath)) {
        console.log(`Found image in: ${folder}`);
        const fileContent = fs.readFileSync(imagePath);
        
        // Get the file extension to set the content type
        const ext = path.extname(imagePath).toLowerCase();
        const getContentType = (extension: string): string => {
          switch (extension) {
            case '.png':
              return 'image/png';
            case '.jpg':
            case '.jpeg':
              return 'image/jpeg';
            case '.gif':
              return 'image/gif';
            case '.svg':
              return 'image/svg+xml';
            default:
              return 'application/octet-stream';
          }
        };

        const contentType = getContentType(ext);
        
        // Return the file content
        return new NextResponse(fileContent, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400',
            // Add this header to help debug
            'X-Source-Folder': folder,
          },
        });
      }
    }
    
    // If no image was found in any folder
    return NextResponse.json({ error: `Image ${filename} not found in any generated content folder` }, { status: 404 });
    
  } catch (error) {
    console.error('Error handling fallback image request:', error);
    return NextResponse.json({ error: 'Error serving image' }, { status: 500 });
  }
}