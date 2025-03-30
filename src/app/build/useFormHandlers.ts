// This file contains a custom React hook that manages the state and logic for the website generation form.
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
        imageSource: 'ai', // Default to AI
    });

    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [generatedHtml, setGeneratedHtml] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);
    const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);

    // Allowed image types and size limit
    const allowedExtensions = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    // Check if all required questions are answered
    const checkAllQuestionsAnswered = useCallback(() => {
        if (!formData.businessType || !formData.address || !formData.phone || !formData.email) {
            return false;
        }

        const businessType = formData.businessType.toLowerCase() as TemplateType;
        if (!['restaurant', 'logistics', 'professional'].includes(businessType)) {
            return false;
        }

        const template = templates[businessType];
        const questions = template ? template.questions : [];

        for (let i = 0; i < questions.length; i++) {
            const fieldName = `question${i + 1}` as keyof typeof formData;
            if (!formData[fieldName] || formData[fieldName].trim() === '') {
                return false;
            }
        }

        // Ensure valid image source selection
        if (formData.imageSource === 'ai' && !formData.imageInstructions.trim()) {
            return false;
        } else if (formData.imageSource === 'upload' && uploadedImages.length === 0) {
            return false;
        }

        return true;
    }, [formData, uploadedImages]);

    // Handle uploaded images with validation
    const handleImagesSelected = useCallback((files: File[]) => {
        const validImages = files.filter(file => {
            if (!allowedExtensions.includes(file.type)) {
                console.warn(`Invalid file type: ${file.name}`);
                return false;
            }
            if (file.size > MAX_FILE_SIZE) {
                console.warn(`File too large: ${file.name}`);
                return false;
            }
            return true;
        });

        setUploadedImages(validImages);
    }, []);

    // Generate website based on form data and image choice
    const generateWebsite = useCallback(async () => {
        if (isLoading) return;

        setIsLoading(true);
        setError('');

        try {
            let response;
            if (formData.imageSource === 'upload' && uploadedImages.length > 0) {
                // Create FormData for file upload
                const formDataToSend = new FormData();
                
                // Append form data fields
                Object.entries(formData).forEach(([key, value]) => {
                    formDataToSend.append(key, value);
                });

                // Append image files
                uploadedImages.forEach((image, index) => {
                    formDataToSend.append(`image_${index}`, image);
                });

                // Send request to upload images & generate HTML
                response = await fetch('/api/uploadImages', {
                    method: 'POST',
                    body: formDataToSend,
                });
            } else {
                // Use AI-generated images
                response = await fetch('/api/generatePage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
            }

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
    }, [formData, isLoading, uploadedImages]);

    return {
        formData,
        setFormData,
        uploadedImages,
        handleImagesSelected,
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
