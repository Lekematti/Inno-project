'use client'
import { useEffect, useState } from 'react'
import { Container, ProgressBar } from 'react-bootstrap'
import { Header } from '@/components/Header'
import { useFormHandlers } from './useFormHandlers'
import { getQuestions } from './pageUtils'
import { Step1BasicInfo } from '@/components/steps/Step1BasicInfo'
import { Step2Questions } from '../../components/steps/Step2Questions'
import { Step3Questions } from '../../components/steps/Step3Questions'
import { Step4ImageInstructions } from '../../components/steps/Step4ImageInstructions'
import { WebsitePreview } from '@/components/WebsitePreview'
import { ElementEditInstructions, FormData } from '@/types/formData'

export default function BuildPage() {
  const {
    formData,
    setFormData,
    isLoading,
    isReady,
    generatedHtml,
    error,
    step,
    setStep,
    /*allQuestionsAnswered,*/
    setAllQuestionsAnswered,
    checkAllQuestionsAnswered,
    generateWebsite,
    setError,
    setGeneratedHtml,
  } = useFormHandlers()

  const [editingElement, setEditingElement] = useState(false)

  useEffect(() => {
    if (step === 5 && formData.businessType) {
      const hasAllAnswers = checkAllQuestionsAnswered()
      setAllQuestionsAnswered(hasAllAnswers)
      if (hasAllAnswers && !isLoading && !isReady) {
        generateWebsite()
      }
    }
  }, [
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
    const { name, value, type } = e.target
    const newVal =
      type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
          ? 'yes'
          : 'no'
        : value
    setFormData((prev) => ({ ...prev, [name]: newVal }))
  }

  const handleNext = (updatedFormData?: Partial<FormData>) => {
    const imageSource =
      updatedFormData?.imageSource || formData.imageSource || 'none'

    // If it's the image step and "none" is explicitly selected, that's valid
    // (don't treat as an error case)
    const isNoneSelected = imageSource === 'none'

    if (!isNoneSelected) {
      // Only validate non-"none" options
      if (imageSource === 'ai') {
        // For AI-generated images
        const hasInstructions =
          formData.imageInstructions || updatedFormData?.imageInstructions
        if (!hasInstructions && step === 4) {
          setError(
            'Please provide image instructions or switch to another option'
          )
          return
        }
      } else if (imageSource === 'manual') {
        // For manually uploaded images
        const uploadedImages =
          updatedFormData?.uploadedImages || formData.uploadedImages || []
        if (!uploadedImages.length) {
          setError(
            'Please upload at least one image or switch to another option'
          )
          return
        }
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

  // Handle element edits
  // Update the handleEditElement function

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
        const currentFilePath = currentFormData.filePath || ''

        console.log('Current file path:', currentFilePath)
        console.log('Saving edited HTML to file...')

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
            console.log('File saved successfully:', saveData)

            // Update form data with file path (could be same or new)
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
          // Continue with UI update even if save fails
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
              String(formData[key as keyof FormData] || '').trim() !== ''
            )
          }).length
      : 0

  // Calculate progress - ensure we don't divide by zero and don't exceed 100%
  const progress = {
    answeredQuestions,
    totalQuestions,
    percentage:
      totalQuestions > 0
        ? Math.min(Math.round((answeredQuestions / totalQuestions) * 100), 100)
        : 0,
  }

  return (
    <div>
      {/* @ts-expect-error Header component does not fully align with expected props */}
      <Header activePage="build" />
      {step < 5 && (
        <div className="bg-primary-subtle py-2 text-center">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center">
              <div className="flex-grow-1 text-center">
                <strong>Step {step}/4:</strong>{' '}
                {step === 1
                  ? 'Basic Information'
                  : step === 2
                  ? 'Business Questions'
                  : step === 3
                  ? 'Design Questions'
                  : 'Media Selection'}
              </div>
            </div>
          </div>
        </div>
      )}

      <Container className="pb-5 pt-4">
        {step < 5 && totalQuestions > 0 && (
          <div className="mb-4">
            <ProgressBar
              now={progress.percentage}
              label={`${progress.percentage}%`}
              variant="primary"
              className="mb-2"
            />
            <div className="text-muted text-center fs-6">
              <small>
                {answeredQuestions} of {totalQuestions} questions answered
              </small>
            </div>
          </div>
        )}

        {(() => {
          switch (step) {
            case 1:
              return (
                <Step1BasicInfo
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={() => setStep(2)}
                  error={error}
                />
              )
            case 2:
              return (
                <Step2Questions
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={() => setStep(3)}
                  handleBack={handleBack}
                  error={error}
                  setFormData={(data: Partial<FormData>) =>
                    setFormData(
                      (prev: FormData) => ({ ...prev, ...data } as FormData)
                    )
                  }
                />
              )
            case 3:
              return (
                <Step3Questions
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={() => setStep(4)}
                  handleBack={handleBack}
                  error={error}
                  setFormData={(data: Partial<FormData>) =>
                    setFormData(
                      (prev: FormData) => ({ ...prev, ...data } as FormData)
                    )
                  }
                />
              )
            case 4:
              return (
                <Step4ImageInstructions
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleNext}
                  handleBack={handleBack}
                  error={error}
                  setFormData={(data: Partial<FormData>) =>
                    setFormData(
                      (prev: FormData) => ({ ...prev, ...data } as FormData)
                    )
                  }
                />
              )
            case 5:
            default:
              return (
                <WebsitePreview
                  isLoading={isLoading || editingElement}
                  isReady={isReady}
                  generatedHtml={generatedHtml}
                  error={error}
                  formData={formData}
                  onEditElement={handleEditElement}
                />
              )
          }
        })()}
      </Container>
    </div>
  )
}
