import {  FormData } from '@/types/formData';
import { fetchImages } from '@/app/build/imageProcessor';

/**
 * Processes images based on the image source in form data
 */
export async function processImages(formData: FormData): Promise<string[]> {
  const { imageSource, imageInstructions, businessType, userImageUrls } = formData;
  
  switch(imageSource) {
    case 'ai':
      return await fetchImages(imageInstructions || '', businessType || 'restaurant');
    case 'manual':
      return userImageUrls || [];
    case 'none':
    default:
      return [];
  }
}

/**
 * Validates image requirements based on source
 */
export function validateImageRequirements(formData: FormData): { isValid: boolean; error: string } {
  const { imageSource, imageInstructions, userImageUrls } = formData;
  
  if (imageSource === 'ai' && (!imageInstructions || imageInstructions.trim() === '')) {
    return { isValid: false, error: 'Please provide image instructions or choose a different image source' };
  }
  
  if (imageSource === 'manual' && (!userImageUrls || userImageUrls.length === 0)) {
    return { isValid: false, error: 'Please upload at least one image or choose a different image source' };
  }
  
  return { isValid: true, error: '' };
}