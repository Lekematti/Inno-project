import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { generateCustomPage } from '../generatePage/route';

// Helper function to save uploaded files securely
async function saveFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Validate file type
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
  const ext = path.extname(file.name).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    throw new Error('Invalid file type. Only PNG, JPG, JPEG, WEBP, and GIF are allowed.');
  }

  // Limit file size (5MB max)
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error('File size exceeds the 5MB limit.');
  }

  // Ensure the upload directory exists
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.promises.mkdir(uploadDir, { recursive: true });

  // Generate a secure and unique filename
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const filename = `${uniqueSuffix}${ext}`;
  const filepath = path.join(uploadDir, filename);

  // Save the file asynchronously
  await fs.promises.writeFile(filepath, buffer);

  return `/uploads/${filename}`; // Return public URL
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract non-file fields from form data
    const formDataObj: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (!(value instanceof File) || !key.startsWith('image_')) {
        formDataObj[key] = value;
      }
    }

    // Process uploaded images concurrently
    const imagePromises: Promise<string>[] = [];
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && key.startsWith('image_')) {
        imagePromises.push(saveFile(value));
      }
    }

    const userImages = await Promise.all(imagePromises);
    console.log(`📸 Processed ${userImages.length} user-uploaded images`);

    // Generate HTML with only user-uploaded images
    const htmlContent = await generateCustomPage({
      businessType: formDataObj.businessType || 'defaultBusinessType',
      address: formDataObj.address || 'defaultAddress',
      phone: formDataObj.phone || 'defaultPhone',
      email: formDataObj.email || 'defaultEmail',
      ...formDataObj,
      userImages, // Only user images, no AI images
      useAIImages: false, // Disable AI images explicitly
    });

    // Generate a timestamped filename for the HTML output
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const suffix = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
    const safeBusinessType = (formDataObj.businessType || 'defaultBusinessType').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const fileName = `${safeBusinessType}-${timestamp}-${suffix}.html`;

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'gen_comp');
    await fs.promises.mkdir(outputDir, { recursive: true });

    // Save the generated HTML file
    const filePath = path.join(outputDir, fileName);
    await fs.promises.writeFile(filePath, htmlContent);

    // Return response with file and image URLs
    return NextResponse.json({
      htmlContent,
      imageUrls: userImages, // Only user-uploaded images
      filePath: `/gen_comp/${fileName}`,
      message: 'Images uploaded and HTML generated successfully.',
      imageSource: 'user',
    });

  } catch (error) {
    console.error('Error processing uploaded images:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error processing uploaded images.' },
      { status: 500 }
    );
  }
}
