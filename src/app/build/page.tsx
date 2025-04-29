'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Container, ProgressBar, Button, Spinner } from 'react-bootstrap'
import { Header } from '@/components/Header'
import { useFormHandlers } from './useFormHandlers'
import { getQuestions } from './pageUtils'
import { Step1BasicInfo } from '@/components/steps/Step1BasicInfo'
import { Step2Questions } from '../../components/steps/Step2Questions'
import { Step3Questions } from '../../components/steps/Step3Questions'
import { Step4ImageInstructions } from '../../components/steps/Step4ImageInstructions'
import { WebsitePreview } from '@/components/WebsitePreview'
import { FormData, ElementEditInstructions } from '@/types/formData'
import { clearFormData } from '@/functions/usePageRefreshHandler'
import { useRouter } from 'next/navigation'

// Helper functions for storage
const safelySetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
    return false;
  }
};

const getSafeFormData = (data: FormData): Partial<FormData> => {
  // Create a copy without potentially large data
  const safeData: Partial<FormData> = { ...data };
  
  // Remove binary data like uploaded images
  if (safeData.uploadedImages) {
    delete safeData.uploadedImages;
  }
  
  // Trim large strings
  Object.keys(safeData).forEach(key => {
    const typedKey = key as keyof FormData;
    const value = safeData[typedKey];
    
    if (typeof value === 'string' && value.length > 500) {
      safeData[typedKey] = (value.substring(0, 500) + '...') as any;
    }
  });
  
  return safeData;
};

// Storage manager to handle localStorage intelligently
const storageManager = {
  priorityKeys: ['form_current_step', 'client_id', 'last_submission_time'],
  
  // Save with priority (will clear lower priority items if needed)
  saveWithPriority: function(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      // If storage is full, clear space starting with non-priority items
      this.makeSpace();
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (innerError) {
        console.error(`Failed to save ${key} even after clearing space:`, innerError);
        return false;
      }
    }
  },
  
  makeSpace: function(): void {
    // First, try to remove items not in the priority list
    const keysToPreserve = new Set(this.priorityKeys);
    
    // Get all keys and sort by priority (non-priority first)
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToPreserve.has(key)) {
        allKeys.push(key);
      }
    }
    
    // Remove non-priority items first
    for (const key of allKeys) {
      localStorage.removeItem(key);
      try {
        // Test if we can store a small item now
        localStorage.setItem('test', '1');
        localStorage.removeItem('test');
        return; // We freed enough space
      } catch {
        // Continue removing items
      }
    }
  }
};

export default function BuildPage() {
  const [isRestoringFromStorage, setIsRestoringFromStorage] = useState(false)
  const [editingElement, setEditingElement] = useState(false)
  const [generationProgress, setGenerationProgress] = useState({
    stage: 'starting',
    percent: 0,
  })
  const [storageWarning, setStorageWarning] = useState(false)

  const {
    formData,
    setFormData,
    isLoading,
    isReady,
    generatedHtml,
    error,
    step,
    setStep,
    setAllQuestionsAnswered,
    checkAllQuestionsAnswered,
    generateWebsite,
    setError,
    setGeneratedHtml,
    setIsReady,
  } = useFormHandlers()

  const router = useRouter()

  // Add a unique client ID for the session to prevent race conditions
  const clientId = useRef<string>(
    typeof window !== 'undefined' 
      ? localStorage.getItem('client_id') || `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      : `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  );

  // Store the client ID in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      safelySetItem('client_id', clientId.current);
    }
  }, []);

  // Modified to prevent multiple submissions and improve performance
  const modifiedGenerateWebsite = useCallback(async () => {
    setTimeout(() => {
    setGenerationProgress({ stage: 'preparing', percent: 10 });
    },1000);

    const progressIntervals = [
      { stage: 'analyzing', percent: 25, delay: 5000},
      { stage: 'generating', percent: 50, delay: 15000},
      { stage: 'optimizing', percent: 75, delay: 30000},
    ];

    progressIntervals.forEach(({ stage, percent, delay }) => {
      setTimeout(() => {
        setGenerationProgress({ stage, percent });
      }, delay);
    });

    // Store the current timestamp to prevent double submissions
    const submissionTime = Date.now();
    safelySetItem('last_submission_time', submissionTime.toString());

    try {
      await generateWebsite();
      setGenerationProgress({ stage: 'complete', percent: 100 });
    } catch (error) {
      console.error('Generation failed:', error);
      setError('Generation failed. Please try again.');
    }
  }, [generateWebsite, setGenerationProgress, setError]);

  // Check for saved state on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedHtml = localStorage.getItem('latest_generated_html')
        const savedStep = localStorage.getItem('form_current_step')
        const savedData = localStorage.getItem('form_data')

        if (savedHtml && savedStep === '5') {
          setIsRestoringFromStorage(true)
          setGeneratedHtml(savedHtml)
          setStep(5)
          setIsReady(true)

          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData)
              setFormData(parsedData)
            } catch {
              console.error('Error parsing saved form data')
            }
          }
        }
      } catch (error) {
        console.warn('Error accessing localStorage:', error);
      }
    }
  }, [setGeneratedHtml, setIsReady, setStep, setFormData]);

  // Save state whenever HTML is generated or step changes - with error handling
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Always prioritize saving the current step (it's small)
        safelySetItem('form_current_step', step.toString());
        
        // Then try to save form data (if not empty)
        if (Object.keys(formData).length > 0) {
          try {
            // Create a smaller version of the form data
            const safeData = getSafeFormData(formData);
            const formDataString = JSON.stringify(safeData);
            
            if (!safelySetItem('form_data', formDataString)) {
              // If we couldn't save the form data, set a warning flag
              setStorageWarning(true);
              
              // Try to save just the business type and basic info
              const minimalData = {
                businessType: formData.businessType,
                step: step
              };
              safelySetItem('form_data', JSON.stringify(minimalData));
            }
          } catch (error) {
            console.error('Error stringifying form data:', error);
            setStorageWarning(true);
          }
        }
        
        // Only try to save HTML last (it's likely the largest item)
        if (generatedHtml) {
          // Try to save HTML, but don't break if it fails
          const success = safelySetItem('latest_generated_html', generatedHtml);
          if (!success) {
            console.warn('Could not save generated HTML due to size limitations');
            setStorageWarning(true);
          }
        }
      } catch (error) {
        console.error('Error in storage effect:', error);
        setStorageWarning(true);
      }
    }
  }, [generatedHtml, step, formData]);

  // Run the normal generate logic only if we're not restoring
  useEffect(() => {
    if (!isRestoringFromStorage && step === 5 && formData.businessType) {
      const hasAllAnswers = checkAllQuestionsAnswered()
      setAllQuestionsAnswered(hasAllAnswers)
      if (hasAllAnswers && !isLoading && !isReady) {
        modifiedGenerateWebsite()
      }
    }
  }, [
    isRestoringFromStorage,
    step,
    formData.businessType,
    checkAllQuestionsAnswered,
    isLoading,
    isReady,
    setAllQuestionsAnswered,
    modifiedGenerateWebsite,
  ])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitStep1 = () => {
    if (
      !formData.businessType ||
      !formData.address ||
      !formData.phone ||
      !formData.email
    ) {
      setError('Please fill out all required fields')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmitStep2 = () => {
    const questions = getQuestions(formData.businessType)
    for (let i = 0; i < 5; i++) {
      const fieldName = `question${i + 1}` as keyof FormData
      if (
        i < questions.length &&
        (!formData[fieldName] ||
          (typeof formData[fieldName] === 'string' &&
            formData[fieldName].trim() === ''))
      ) {
        setError('Please answer all questions before proceeding')
        return
      }
    }
    setError('')
    setStep(3)
  }

  const handleSubmitStep3 = () => {
    const questions = getQuestions(formData.businessType)
    for (let i = 5; i < 10; i++) {
      const fieldName = `question${i + 1}` as keyof FormData
      if (
        i < questions.length &&
        (!formData[fieldName] ||
          (typeof formData[fieldName] === 'string' &&
            formData[fieldName].trim() === ''))
      ) {
        setError('Please answer all questions before proceeding')
        return
      }
    }
    setError('')
    setStep(4)
  }

  const handleSubmitStep4 = (updatedFormData?: Partial<FormData>) => {
    const imageSource =
      updatedFormData?.imageSource ?? formData.imageSource ?? 'ai'

    if (imageSource === 'ai') {
      if (
        !formData.imageInstructions ||
        String(formData.imageInstructions).trim() === ''
      ) {
        setError(
          'Please describe your image requirements or enter "none" if you don\'t need images'
        )
        return
      }
    } else if (imageSource === 'manual') {
      const uploadedImages =
        updatedFormData?.uploadedImages || formData.uploadedImages || []
      if (!uploadedImages.length) {
        setError(
          'Please upload at least one image or switch to AI-generated images'
        )
        return
      }
    }

    if (updatedFormData) {
      setFormData((prev) => ({
        ...prev,
        ...updatedFormData,
        imageInstructions:
          updatedFormData?.imageInstructions ?? prev.imageInstructions,
        uploadedImages: updatedFormData?.uploadedImages ?? prev.uploadedImages,
      }))
    }

    setError('')
    setStep(5)
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()

    // Check if there was a recent submission to prevent duplicates
    try {
      const lastSubmission = localStorage.getItem('last_submission_time');
      if (lastSubmission && Date.now() - parseInt(lastSubmission) < 5000) {
        console.log('Preventing duplicate submission');
        return;
      }
    } catch {
      // Ignore storage errors here
    }

    try {
      // Store the current timestamp
      safelySetItem('last_submission_time', Date.now().toString());
      await generateWebsite();

      // Clean up after successful submission - but handle errors
      try {
        clearFormData();
        localStorage.removeItem('latest_generated_html');
        localStorage.removeItem('form_current_step');
      } catch (storageError) {
        console.warn("Could not clear storage, but proceeding anyway:", storageError);
      }

      router.push('/results');
    } catch (error) {
      console.error('Form submission error:', error);
      setError('Submission failed. Please try again.');
    }
  }

  const handleEditElement = async (
    editInstructions: ElementEditInstructions,
    currentFormData: FormData
  ) => {
    if (!generatedHtml) return

    setEditingElement(true)
    setError('')

    try {
      const response = await fetch('/api/editElement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: currentFormData,
          htmlContent: generatedHtml,
          editInstructions,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Error updating element: ${errorText || response.status}`
        )
      }

      const data = await response.json()

      if (data.htmlContent) {
        setGeneratedHtml(data.htmlContent)

        const currentFilePath = currentFormData.filePath ?? ''

        try {
          const saveResponse = await fetch('/api/editSave', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              formData: currentFormData,
              htmlContent: data.htmlContent,
              originalFilePath: currentFilePath,
            }),
          })

          if (saveResponse.ok) {
            const saveData = await saveResponse.json()
            setFormData((prev) => ({
              ...prev,
              filePath: saveData.filePath,
            }))
            setGeneratedHtml(data.htmlContent)
          } else {
            const errorText = await saveResponse.text()
            console.error('Error saving file:', errorText)
          }
        } catch (saveErr) {
          console.error('Exception saving edited HTML:', saveErr)
        }
      } else {
        throw new Error('No HTML content received in response')
      }
    } catch (err) {
      console.error('Failed to apply edits:', err)
      setError(
        `Failed to apply edits: ${
          err instanceof Error ? err.message : String(err)
        }`
      )
    } finally {
      setEditingElement(false)
    }
  }

  const renderLoadingIndicator = () => (
    <div className="d-flex flex-column align-items-center justify-content-center p-5">
      <output className="spinner-border">
        <Spinner animation="border" variant="primary" />
      </output>
      <p className="mt-3">
        {generationProgress.stage === 'preparing' && 'Preparing your website...'}
        {generationProgress.stage === 'analyzing' && 'Analyzing your inputs...'}
        {generationProgress.stage === 'generating' &&
          'Generating your custom website...'}
        {generationProgress.stage === 'optimizing' &&
          'Optimizing your website...'}
        {generationProgress.stage === 'complete' && 'Your website is ready!'}
      </p>
      <ProgressBar now={generationProgress.percent} className="w-75 mt-2" />
    </div>
  )

  const questions = getQuestions(formData.businessType || '')

  const totalQuestions = questions.length

  const answeredQuestions =
    totalQuestions > 0
      ? Object.keys(formData)
          .filter((key) => key.startsWith('question'))
          .filter((key) => {
            const questionNum = parseInt(key.replace('question', ''))
            return (
              questionNum <= totalQuestions &&
              formData[key as keyof FormData] !== undefined &&
              typeof formData[key as keyof FormData] === 'string' &&
              (formData[key as keyof FormData] as string).trim() !== ''
            )
          }).length
      : 0

  const progress =
    totalQuestions > 0
      ? Math.min(100, Math.round((answeredQuestions / totalQuestions) * 100))
      : 0

  const stepProgress = Math.min(100, Math.round(((step - 1) / 4) * 100))

  const displayProgress = Math.max(progress, stepProgress)

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      <Container className="flex-grow-1 py-4">
        {storageWarning && (
          <div className="alert alert-warning mb-3">
            <strong>Storage Limit Warning:</strong> Some data couldn&apos;t be saved to browser storage. 
            Your progress might not be fully restored if you leave this page.
          </div>
        )}

        {step < 5 && (
          <div className="mb-4">
            <ProgressBar
              now={step === 4 ? 75 : displayProgress}
              label={`${step === 4 ? 75 : displayProgress}%`}
            />
          </div>
        )}

        {step === 1 && (
          <Step1BasicInfo
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmitStep1}
            error={error}
          />
        )}

        {step === 2 && (
          <Step2Questions
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmitStep2}
            handleBack={handleBack}
            error={error}
            setFormData={(data: Partial<FormData>) =>
              setFormData(
                (prev: FormData) => ({ ...prev, ...data } as FormData)
              )
            }
          />
        )}

        {step === 3 && (
          <Step3Questions
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmitStep3}
            handleBack={handleBack}
            error={error}
            setFormData={(data: Partial<FormData>) =>
              setFormData(
                (prev: FormData) => ({ ...prev, ...data } as FormData)
              )
            }
          />
        )}

        {step === 4 && (
          <Step4ImageInstructions
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmitStep4}
            handleBack={handleBack}
            error={error}
            setFormData={(data: Partial<FormData>) =>
              setFormData(
                (prev: FormData) => ({ ...prev, ...data } as FormData)
              )
            }
          />
        )}

        {step === 5 && (
          <>
            <WebsitePreview
              isLoading={isLoading || editingElement}
              isReady={isReady}
              generatedHtml={generatedHtml}
              error={error}
              formData={formData}
              onEditElement={handleEditElement}
              onUpdateGeneratedHtml={setGeneratedHtml}
              loadingComponent={renderLoadingIndicator()}
            />

            {!isLoading && (
              <form onSubmit={handleSubmit} className="mt-4">
                <Button
                  type="submit"
                  variant="primary"
                  onClick={() => {
                    try {
                      clearFormData();
                    } catch (e) {
                      console.warn("Could not clear form data:", e);
                    }
                  }}
                >
                  Generate Page
                </Button>
              </form>
            )}
          </>
        )}
      </Container>
    </div>
  )
}