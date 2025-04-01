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
  } = useFormHandlers();

  console.log('Form Data Submitted:', formData);
  
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
    formData,
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
    setFormData(prev => ({ ...prev, [name]: value }))
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
        (!formData[fieldName] || formData[fieldName].trim() === '')
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
        (!formData[fieldName] || formData[fieldName].trim() === '')
      ) {
        setError('Please answer all questions before proceeding')
        return
      }
    }
    setError('')
    setStep(4)
  }

  const handleSubmitStep4 = () => {
    if (!formData.imageInstructions || formData.imageInstructions.trim() === '') {
      setError('Please describe your image requirements or enter "none" if you don\'t need images')
      return
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
  const questions = getQuestions(formData.businessType)
  const totalQuestions = questions.length
  const answeredQuestions = Object.keys(formData).filter(
    (key) =>
      key.startsWith('question') &&
      (formData[key as keyof FormData] ?? '').trim() !== ''
  ).length
  const progress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0

  // Render the appropriate step component based on current step
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      <Container className="flex-grow-1 py-4">
        {step < 5 && (
          <div className="mb-4">
            <ProgressBar now={progress} label={`${progress}%`} />
            <p className="text-center mt-2">
              {answeredQuestions}/{totalQuestions} questions answered
            </p>
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
            setFormData={(data: Partial<FormData>) => setFormData((prev: FormData) => ({ ...prev, ...data } as FormData))}
          />
        )}

        {step === 3 && (
          <Step3Questions
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmitStep3}
            handleBack={handleBack}
            error={error}
            setFormData={(data: Partial<FormData>) => setFormData((prev: FormData) => ({ ...prev, ...data } as FormData))}
          />
        )}

        {step === 4 && (
          <Step4ImageInstructions
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmitStep4}
            handleBack={handleBack}
            error={error}
            setFormData={(data: Partial<FormData>) => setFormData((prev: FormData) => ({ ...prev, ...data } as FormData))}
          />
        )}

        {step === 5 && (
          <WebsitePreview
            isLoading={isLoading}
            isReady={isReady}
            generatedHtml={generatedHtml}
            error={error}
            formData={formData}  // Add this line to pass formData
          />
        )}
      </Container>
    </div>
  )
}
