import { NextRequest, NextResponse } from 'next/server';
import { generateCustomPage } from '../../functions/inputGenerate';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    const htmlContent = await generateCustomPage(formData);
    return NextResponse.json({ htmlContent });
  } catch (error) {
    console.error('Error generating page:', error);
    return NextResponse.json(
      { error: 'Error generating page.' },
      { status: 500 }
    );
  }
}