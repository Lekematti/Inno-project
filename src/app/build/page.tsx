'use client'
import { useEffect, useState } from 'react' // Add useState
import { Container, ProgressBar, Button } from 'react-bootstrap'
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

export default function BuildPage() {
  // Add state to track if we're restoring from storage
  const [isRestoringFromStorage, setIsRestoringFromStorage] = useState(false)
  const [editingElement, setEditingElement] = useState(false)

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
    setGeneratedHtml, // Make sure this is exposed in useFormHandlers
    setIsReady, // Make sure this is exposed in useFormHandlers
  } = useFormHandlers()

  const router = useRouter()

  // Check for saved state on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHtml = localStorage.getItem('latest_generated_html')
      const savedStep = localStorage.getItem('form_current_step')

      if (savedHtml && savedStep === '5') {
        // We have saved HTML and we were on step 5
        setIsRestoringFromStorage(true)
        setGeneratedHtml(savedHtml)
        setStep(5)
        setIsReady(true)
      }
    }
  }, [setGeneratedHtml, setIsReady, setStep])

  // Save state whenever HTML is generated or step changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (generatedHtml) {
        localStorage.setItem('latest_generated_html', generatedHtml)
      }

      localStorage.setItem('form_current_step', step.toString())
    }
  }, [generatedHtml, step])

  // Run the normal generate logic only if we're not restoring
  useEffect(() => {
    if (!isRestoringFromStorage && step === 5 && formData.businessType) {
      const hasAllAnswers = checkAllQuestionsAnswered()
      setAllQuestionsAnswered(hasAllAnswers)
      if (hasAllAnswers && !isLoading && !isReady) {
        generateWebsite()
      }
    }
  }, [
    isRestoringFromStorage,
    step,
    formData.businessType,
    checkAllQuestionsAnswered,
    generateWebsite,
    isLoading,
    isReady,
    setAllQuestionsAnswered,
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
    // Check image source and validate accordingly
    const imageSource =
      updatedFormData?.imageSource ?? formData.imageSource ?? 'ai'

    if (imageSource === 'ai') {
      // For AI-generated images
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
      // For manually uploaded images
      const uploadedImages =
        updatedFormData?.uploadedImages || formData.uploadedImages || []
      if (!uploadedImages.length) {
        setError(
          'Please upload at least one image or switch to AI-generated images'
        )
        return
      }
    }

    // If updatedFormData is provided, merge it with the current formData
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

  // Modify the handleSubmit function to clear localStorage when navigating away
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()

    try {
      // Your existing form submission code
      await generateWebsite()

      // Clear form data right after successful submission
      clearFormData()

      // Also clear our saved state since we're moving to results
      localStorage.removeItem('latest_generated_html')
      localStorage.removeItem('form_current_step')

      // Navigate to results or next page
      router.push('/results')
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  // Handle element edits
  const handleEditElement = async (
    editInstructions: ElementEditInstructions,
    currentFormData: FormData
  ) => {
    if (!generatedHtml) return

    setEditingElement(true)
    setError('')

    try {
      // First step: Apply the edits to the HTML
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
        // Update the generated HTML with the edited version
        setGeneratedHtml(data.htmlContent)

        // Get the current file path from form data
        const currentFilePath = currentFormData.filePath ?? ''

        // Second step: Save the edited HTML back to the file
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

  // Progress calculation
  const questions = getQuestions(formData.businessType || '')

  // Get total number of questions across all steps (excluding the current step if it's the image step)
  const totalQuestions = questions.length

  // Count how many questions have been answered so far
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
              typeof formData[key as keyof FormData] === 'string' &&
              (formData[key as keyof FormData] as string).trim() !== ''
            )
          }).length
      : 0

  // Calculate progress - ensure we don't divide by zero and don't exceed 100%
  const progress =
    totalQuestions > 0
      ? Math.min(100, Math.round((answeredQuestions / totalQuestions) * 100))
      : 0

  // Calculate step-based progress - each step contributes to overall completion
  const stepProgress = Math.min(100, Math.round(((step - 1) / 4) * 100))

  // Use the larger of question-based or step-based progress
  const displayProgress = Math.max(progress, stepProgress)

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      <Container className="flex-grow-1 py-4">
        {step < 5 && (
          <div className="mb-4">
            <ProgressBar
              now={step === 4 ? 75 : displayProgress}
              label={`${step === 4 ? 75 : displayProgress}%`}
            />
          </div>
        )}

        {/* Step components remain the same */}

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
            />

            {/* Only show Generate button in step 5 and only when not loading */}
            {!isLoading && (
              <form onSubmit={handleSubmit} className="mt-4">
                <Button
                  type="submit"
                  variant="primary"
                  onClick={() => {
                    clearFormData()
                  }}
                >
                  Generate Page
                </Button>
              </form>
            )}
          </>
        )}

        {/* Remove the form that was outside the step conditionals */}
      </Container>
    </div>
  )
}
