/**
 * Custom React hook that manages form state and logic for website generation
 */
import { useState, useCallback, useRef } from 'react';
import { templates} from '@/functions/inputGenerate';
import { processUserColors } from '@/app/build/colorProcessor';
import {
  type FormData,
  ImageSourceType,
  FormHandlerHook,
  defaultFormData,
} from '@/types/formData'
import { usePageRefreshHandler } from '@/functions/usePageRefreshHandler';

/**
 * Hook for managing website generation form state and operations
 */
export const useFormHandlers = (): FormHandlerHook => {
  // State management
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  
  // Add the refresh handler with form data
  const { clearSavedContent } = usePageRefreshHandler({
    currentContent: JSON.stringify(formData),
    referenceContent: JSON.stringify(defaultFormData),
    storageKey: 'website-builder-form',
    onRestore: (savedContent) => {
      try {
        const parsedData = JSON.parse(savedContent);
        setFormData(parsedData);
      } catch (err) {
        console.error('Error restoring form data:', err);
      }
    }
  });
 
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);

  const isSubmittingRef = useRef(false);

  /**
   * Validates that all required form fields are completed
   */
  const checkAllQuestionsAnswered = useCallback((): boolean => {
    if (!formData.businessType || !formData.address || !formData.phone || !formData.email) {
      return false;
    }
   
    const businessType = formData.businessType.toLowerCase();
    if (!['restaurant', 'logistics', 'professional'].includes(businessType)) {
      return false;
    }
   
    const template = templates[businessType as keyof typeof templates];
    const questions = template?.questions || [];
   
    return questions.every((_, i) => {
      const fieldName = `question${i + 1}` as keyof FormData;
      const value = formData[fieldName];
      return typeof value === 'string' && value.trim() !== '';
    });
  }, [formData]);

    /**
   * Processes all colors in form data to ensure they're web-appropriate
   */
    const processFormColors = useCallback((data: FormData): FormData => {
      const businessType = data.businessType?.toLowerCase();
      
      // Look for colors in any question field and in the colorScheme field
      let colorString = data.colorScheme as string;
      
      // If no colorScheme, try to find colors in question fields
      if (!colorString) {
        for (let i = 1; i <= 10; i++) {
          const fieldName = `question${i}` as keyof FormData;
          const value = data[fieldName];
          if (value && typeof value === 'string' && value.includes('#')) {
            colorString = value;
            break;
          }
        }
      }
      
      if (colorString && colorString.trim() !== '') {
        const colors = colorString.split(',').filter(Boolean);
        if (colors.length > 0) {
          // Process and validate the colors
          const processedColors = processUserColors(colors, businessType);
          
          // Return updated form data with processed colors
          return {
            ...data,
            colorScheme: processedColors.join(',')
          };
        }
      }
      
      return data;
    }, []);

  /**
   * Sends form data to the API endpoint to generate website
   */
  const generateWebsite = useCallback(async (): Promise<void> => {
    if (isLoading || isSubmittingRef.current) return;
   
    isSubmittingRef.current = true;
    setIsLoading(true);
    setError('');
   
    try {
      // Process colors before submission
      const processedFormData = processFormColors(formData);
      
      // Create FormData object for file uploads
      const submitData = new FormData();
      
      // Add client ID to prevent race conditions
      const clientId = localStorage.getItem('client_id') || `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      submitData.append('clientId', clientId);
      
      // Add basic fields
      submitData.append('businessType', formData.businessType);
      submitData.append('address', formData.address);
      submitData.append('phone', formData.phone);
      submitData.append('email', formData.email);
      
      // Add image source - set default to 'none' if not specified
      const imageSource = (formData.imageSource as ImageSourceType) || 'none';
      submitData.append('imageSource', imageSource);
      
      // Only include necessary image data based on source type
      if (imageSource === 'ai') {
        if (formData.imageInstructions) {
          submitData.append('imageInstructions', formData.imageInstructions);
        }
        
        // Add the image descriptions array if available
        if (Array.isArray(formData.imageDescriptions) && formData.imageDescriptions.length > 0) {
          submitData.append('imageDescriptions', JSON.stringify(formData.imageDescriptions));
        }
      } else if (imageSource === 'manual' && formData.uploadedImages && formData.uploadedImages.length > 0) {
        // Only include necessary image data to reduce payload size
        const optimizedUploads = [...formData.uploadedImages].slice(0, 10);
        for (const image of optimizedUploads) {
          submitData.append('uploadedImages', image);
        }
        console.log(`Uploading ${optimizedUploads.length} images`);
      }
      
      // Add all question answers
      Object.entries(formData).forEach(([key, value]) => {
        if (key.startsWith('question') && value) {
          submitData.append(key, value as string);
        }
      });
      
      // Add optional fields
      if (formData.businessName) {
        submitData.append('businessName', formData.businessName);
      }
      
      if (processedFormData.colorScheme) {
        submitData.append('colorScheme', processedFormData.colorScheme);
      }

      if (Array.isArray(processedFormData.colorScheme) && processedFormData.colorScheme.length > 0) {
        submitData.append('colorScheme', processedFormData.colorScheme.join(','));
      }
      
      if (formData.templateVariant) {
        submitData.append('templateVariant', formData.templateVariant);
      }
      
      // Use a timeout to handle hang prevention
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        throw new Error('Request timed out - took too long to generate');
      }, 120000); // 2 minutes timeout
      
      try {
        const response = await fetch('/api/generatePage', {
          method: 'POST',
          body: submitData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        if (data.htmlContent) {
          setGeneratedHtml(data.htmlContent);
          // Update form data with response data
          setFormData(prev => ({
            ...prev,
            filePath: data.filePath,
            generatedImageUrls: data.imageUrls ?? [],
            standaloneHtml: data.standaloneHtml ?? ''
          }));
          setIsReady(true);
          // Clear saved content after successful generation
          clearSavedContent();
        } else {
          throw new Error('No HTML content received');
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (err) {
      console.error('Error generating website:', err instanceof Error ? err.message : String(err));
      setError('Failed to generate website. Please try again.');
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  }, [formData, isLoading, processFormColors, clearSavedContent, setFormData, setGeneratedHtml, setIsReady]);


  // Add this to your return statement
  return {
    formData,
    setFormData,
    isLoading,
    setIsLoading,  // Make sure this is exposed
    isReady,
    setIsReady,    // Make sure this is exposed
    generatedHtml,
    setGeneratedHtml, // Make sure this is exposed
    error,
    setError,
    step,
    setStep,
    allQuestionsAnswered,
    setAllQuestionsAnswered,
    checkAllQuestionsAnswered,
    generateWebsite,
  }
}
