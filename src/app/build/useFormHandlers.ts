/**
 * Custom React hook that manages form state and logic for website generation
 */
import { useState, useCallback } from 'react';
import { templates } from '@/functions/inputGenerate';
import { 
  FormData,
  FormHandlerHook, 
  BusinessType,
  defaultFormData 
} from '@/types/formData';

/**
 * Hook for managing website generation form state and operations
 */
export const useFormHandlers = (): FormHandlerHook => {
  // State management
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);

  /**
   * Validates that all required form fields are completed
   */
  const checkAllQuestionsAnswered = useCallback((): boolean => {
    if (!formData.businessType || !formData.address || !formData.phone || !formData.email) {
      return false;
    }
    
    const businessType = formData.businessType.toLowerCase() as BusinessType;
    if (!['restaurant', 'logistics', 'professional'].includes(businessType)) {
      return false;
    }
    
    const template = templates[businessType];
    const questions = template?.questions || [];
    
    return questions.every((_, i) => {
      const fieldName = `question${i + 1}` as keyof FormData;
      return formData[fieldName]?.trim() !== '';
    });
  }, [formData]);

  /**
   * Sends form data to the API endpoint to generate website
   */
  const generateWebsite = useCallback(async (): Promise<void> => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/generatePage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.htmlContent) {
        setGeneratedHtml(data.htmlContent);
        setFormData(prev => ({
          ...prev,
          filePath: data.filePath
        }));
        setIsReady(true);
      } else {
        throw new Error('No HTML content received');
      }
    } catch (err) {
      console.error('Error generating website:', err instanceof Error ? err.message : String(err));
      setError('Failed to generate website. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, isLoading]);

  return {
    formData,
    setFormData,
    isLoading,
    isReady,
    generatedHtml,
    error,
    step,
    setStep,
    allQuestionsAnswered,
    setAllQuestionsAnswered,
    checkAllQuestionsAnswered,
    generateWebsite,
    setError,
  };
};