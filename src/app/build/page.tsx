'use client'
import { useEffect } from 'react'
import { Container, ProgressBar } from 'react-bootstrap'
import { Header } from '@/components/Header'
import { useFormHandlers } from './useFormHandlers'
import { getQuestions } from './pageUtils'
import { Step1BasicInfo } from '@/components/steps/Step1BasicInfo'
import { Step2Questions } from '../../components/steps/Step2Questions'
import { Step3Questions } from '../../components/steps/Step3Questions'
import { Step4ImageInstructions } from '../../components/steps/Step4ImageInstructions'
import { WebsitePreview } from '@/components/WebsitePreview'
import { FormData } from '@/types/formData'

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
  } = useFormHandlers()

  //console.log('Form Data Submitted:', formData);

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
        (!formData[fieldName] || String(formData[fieldName]).trim() === '')
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
        (!formData[fieldName] || String(formData[fieldName]).trim() === '')
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
      updatedFormData?.imageSource || formData.imageSource || 'ai'

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

        {/* Rest of your component remains unchanged */}

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
          <WebsitePreview
            isLoading={isLoading}
            isReady={isReady}
            generatedHtml={generatedHtml}
            error={error}
            formData={formData}
          />
        )}
      </Container>
    </div>
  )
}
