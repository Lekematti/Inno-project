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
        imageInstructions: '', // Single field for all image instructions
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [generatedHtml, setGeneratedHtml] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);
    const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);

    // Check if all required questions are answered
    const checkAllQuestionsAnswered = useCallback(() => {
        if (!formData.businessType || !formData.address || !formData.phone || !formData.email) {
            return false;
        }
        
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

    // Generate website with image instructions
    const generateWebsite = useCallback(async () => {
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
            throw new Error(`Server error: ${response.status}`);
          }
          
          const data = await response.json();
          setGeneratedHtml(data.htmlContent);
          setIsReady(true);
        } catch (err) {
          console.error('Error:', err instanceof Error ? err.message : String(err));
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
}
