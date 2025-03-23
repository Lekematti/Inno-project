//This file contains a custom React hook that manages the state and logic for the website generation form. 
import { useState, useCallback } from 'react';
import { templates } from '@/functions/inputGenerate';

type TemplateType = 'restaurant' | 'logistics' | 'professional';

export function useFormHandlers() {
    const [formData, setFormData] = useState({
        businessType: '',
        address: '',
        phone: '',
        email: '',
        question1: '',
        question2: '',
        question3: '',
        question4: '',
        question5: '',
        question6: '',
        question7: '',
        question8: '',
        question9: '',
        question10: '',
        // image fields
        imageDescription1: '',
        imageDescription2: '',
        imageDescription3: '',
        imageDescription4: '',
        imageStyle1: 'real',
        imageStyle2: 'real',
        imageStyle3: 'real',
        imageStyle4: 'real',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [generatedHtml, setGeneratedHtml] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);
    const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);

    const checkAllQuestionsAnswered = useCallback(() => {
        if (!formData.businessType || !formData.address || !formData.phone || !formData.email) {
            return false;
        }
        // Safe type checking for businessType
        const businessType = formData.businessType.toLowerCase();
        if (businessType !== 'restaurant' && businessType !== 'logistics' && businessType !== 'professional') {
            return false;
        }
        
        const template = templates[businessType as TemplateType];
        const questions = template ? template.questions : [];
        for (let i = 0; i < questions.length; i++) {
            const fieldName = `question${i + 1}` as keyof typeof formData;
            if (!formData[fieldName] || formData[fieldName].trim() === '') {
                return false;
            }
        }
        return true;
    }, [formData]);

    // Add a function to get appropriate image count based on business type
    const getImageCount = useCallback(() => {
        if (!formData.businessType) return 0;
        
        const businessType = formData.businessType.toLowerCase() as TemplateType;
        
         // Determine image count based on business type and specific answers
         if ((businessType === 'restaurant' && formData.question7 === 'yes') || 
         (businessType === 'logistics' && formData.question4 === 'yes') ||
         (businessType === 'professional' && formData.question3 === 'yes')) {
         return 4;
     }
        return 0;
    }, [formData]);

    // Move this function inside the hook so it has access to getImageCount
    const extractImageData = useCallback(() => {
        const imageCount = getImageCount();
        const descriptions = [];
        const styles = [];
        
        for (let i = 1; i <= imageCount; i++) {
            const descField = `imageDescription${i}` as keyof typeof formData;
            const styleField = `imageStyle${i}` as keyof typeof formData;
            
            if (formData[descField] && formData[descField].trim() !== '') {
                descriptions.push(formData[descField]);
                styles.push(formData[styleField] || 'real');
            }
        }
        
        return { descriptions, styles };
    }, [formData, getImageCount]);

    // Update the generateWebsite function to use the internal extractImageData
    const generateWebsite = useCallback(async () => {
        if (isLoading) return;
        setIsLoading(true);
        setError('');
        try {
          // Use the internal function
          const imageData = extractImageData();
          
          const response = await fetch('/api/generatePage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...formData,
              imageData
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          setGeneratedHtml(data.htmlContent);
          setIsReady(true);
        } catch (err) {
          console.error('Error generating page:', err instanceof Error ? err.message : String(err));
          setError('Failed to generate website. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }, [formData, isLoading, extractImageData]);

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
        getImageCount,
    };
}
