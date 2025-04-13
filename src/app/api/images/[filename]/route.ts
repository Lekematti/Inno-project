import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    // Fix: Await params before accessing
    const { filename } = await params;
    
    // Debug: Log the request with timestamp to track ordering
    const requestTime = new Date().toISOString();
    console.log(`[${requestTime}] Image request for: ${filename}`);

    // 2. Get the timestamp from the request query or URL param to ensure we use the right folder
    const url = new URL(request.url);
    const folderParam = url.searchParams.get('folder');
    
    // Find the image in the most recent gen_comp folder
    const genCompDir = path.join(process.cwd(), 'gen_comp');
    
    // Check if gen_comp directory exists
    if (!fs.existsSync(genCompDir)) {
      return NextResponse.json({ error: 'No generated content found' }, { status: 404 });
    }
    
    // Get all folders in gen_comp
    const folders = fs.readdirSync(genCompDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
      
    // If a specific folder was requested, try that first
    if (folderParam && folders.includes(folderParam)) {
      const imagePath = path.join(genCompDir, folderParam, 'images', filename);
      if (fs.existsSync(imagePath)) {
        console.log(`Found image in specified folder: ${folderParam}`);
        return serveImage(imagePath, folderParam);
      }
    }
    
    // Otherwise sort by modification time (most recent first)
    const sortedFolders = folders.toSorted((a, b) => {
      const statA = fs.statSync(path.join(genCompDir, a));
      const statB = fs.statSync(path.join(genCompDir, b));
      return statB.mtime.getTime() - statA.mtime.getTime();
    });
    
    // Look for the image in each folder, starting with the most recent
    for (const folder of sortedFolders) {
      const imagePath = path.join(genCompDir, folder, 'images', filename);
      if (fs.existsSync(imagePath)) {
        console.log(`Found image in: ${folder}`);
        return serveImage(imagePath, folder);
      }
    }
    
    // If no image was found in any folder
    console.log(`Image ${filename} not found in any folders`);
    return NextResponse.json({ 
      error: `Image ${filename} not found in any generated content folder`,
      searchedFolders: sortedFolders
    }, { status: 404 });
    
  } catch (error) {
    console.error('Error handling image request:', error);
    return NextResponse.json({ error: 'Error serving image' }, { status: 500 });
  }
}

// Helper function to serve an image file
function serveImage(imagePath: string, folder: string) {
  try {
    const fileContent = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    
    // Get content type based on file extension
    const contentType = (() => {
      switch (ext) {
        case '.png': return 'image/png';
        case '.jpg':
        case '.jpeg': return 'image/jpeg';
        case '.gif': return 'image/gif';
        case '.svg': return 'image/svg+xml';
        default: return 'application/octet-stream';
      }
    })();
    
    // Return the file content with proper headers
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate', // Prevent caching issues
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Source-Folder': folder,
      },
    });
  } catch (err) {
    console.error(`Error serving image ${imagePath}:`, err);
    throw err;
  }
}