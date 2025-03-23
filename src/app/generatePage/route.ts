import { NextRequest, NextResponse } from 'next/server';
import { generateCustomPage } from '../api/generatePage/route';
import path from 'path';
import fs from 'fs';

// Add this function after generateCustomPage but before POST

async function fetchImages(count: number, descriptions: string[], styles: string[]): Promise<string[]> {
  if (count === 0 || !descriptions.length) return [];
  
  const imageUrls: string[] = [];
  console.log("🖼️ Generating images...");
  
  try {
    for (let i = 0; i < count; i++) {
      if (i >= descriptions.length) break;
      
      const description = descriptions[i];
      const style = styles[i] || 'real';
      const width = 800; // Default width
      const height = 600; // Default height
      
      // Construct the URL for the image generation service
      const url = `https://webweave-imagegen.onrender.com/jukka/images/${encodeURIComponent(description)}.jpg?description=${encodeURIComponent(description)}&width=${width}&height=${height}&style=${style}`;
      
      // In a real implementation, you would make an actual fetch request
      // For now, we're just adding the URL that would be used
      imageUrls.push(url);
      console.log(`Generated image ${i+1}: ${url}`);
    }
    
    return imageUrls;
  } catch (error) {
    console.error("Error generating images:", error);
    return [];
  }
}

// Modify the POST function
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const { imageData, ...formData } = requestData;
    
    // Generate images if imageData is provided
    let imageUrls: string[] = [];
    if (imageData && Array.isArray(imageData.descriptions) && imageData.descriptions.length > 0) {
      const count = imageData.descriptions.length;
      imageUrls = await fetchImages(
        count,
        imageData.descriptions,
        imageData.styles || Array(count).fill('real')
      );
    }
    
    // Add imageUrls to the formData for the HTML generation
    const dataWithImages = {
      ...formData,
      imageUrls: imageUrls
    };
    
    const htmlContent = await generateCustomPage(dataWithImages);
    
    // Rest of your existing code...
    // Format the timestamp to a readable format
    const now = new Date();
    const formattedTimestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const uniqueSuffix = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}`; // Add time to ensure uniqueness
    const businessType = formData.businessType.toLowerCase();
    const fileName = `${businessType}-${formattedTimestamp}-${uniqueSuffix}.html`;
    
    // Define the output directory - adjust this path as needed
    const outputDir = path.join(process.cwd(), 'gen_comp');
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write the file
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, htmlContent);
    
    return NextResponse.json({ 
      htmlContent,
      filePath: `/gen_comp/${fileName}` // Return the relative path to access the file
    });
  } catch (error) {
    console.error('Error generating page:', error);
    return NextResponse.json(
      { error: 'Error generating page.' },
      { status: 500 }
    );
  }
}