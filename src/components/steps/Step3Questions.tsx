'use client'
import { Form, Button, Alert } from 'react-bootstrap'
import { getBusinessQuestions } from '@/functions/inputGenerate'
import { QuestionField } from '../QuestionField'
import { FormData, StepWithBackProps } from '@/types/formData'
import { FaRegEdit } from 'react-icons/fa'
import { useState } from 'react'

export const Step3Questions: React.FC<StepWithBackProps> = ({
  formData,
  handleChange,
  handleSubmit,
  handleBack,
  error,
  setFormData,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const questions = getBusinessQuestions(formData.businessType)

  if (!questions.length) {
    return (
      <Alert variant="danger">No questions found for this business type</Alert>
    )
  }

  function setError(message: string) {
    setErrorMessage(message)
  }

  return (
    <div className="step-container">
      <div className="d-flex align-items-center mb-3">
        <div className="icon-circle bg-primary text-white me-3">
          <FaRegEdit size={24} />
        </div>
        <h2 className="mb-0">Step 3: Business Details (Part 2)</h2>
      </div>

      {(error || errorMessage) && (
        <Alert variant="danger">{errorMessage ?? error}</Alert>
      )}

      <Form
        onSubmit={(e) => {
          e.preventDefault()

          // Check if any field in formData contains a color (hex code)
          const hasColor = Object.values(formData).some(
            (val) =>
              typeof val === 'string' &&
              val
                .split(',')
                .map((c) => c.trim())
                .filter(Boolean)
                .some(
                  (c) =>
                    /^#[A-Fa-f0-9]{6}$/.test(c) || /^#[A-Fa-f0-9]{3}$/.test(c)
                )
          )

          if (!hasColor) {
            setError('Please select at least one color.')
            console.log('No color found in formData:', errorMessage)
            return
          }

          // Get the questions for this step
          const stepQuestions = questions.slice(5, 10)

          for (let index = 0; index < stepQuestions.length; index++) {
            const question = stepQuestions[index]
            const actualIndex = index + 5
            const fieldName = `question${actualIndex + 1}` as keyof FormData
            const value = formData[fieldName]

            if (question.required) {
              if (
                !value ||
                (typeof value === 'string' && value.trim() === '')
              ) {
                setError('Please select at least one color.')
                return
              }
            }
          }

          setError('') // Clear error on successful validation
          handleSubmit()
        }}
      >
        <div className="row g-4">
          {questions.slice(5, 10).map((question, index) => {
            const actualIndex = index + 5
            const fieldName = `question${actualIndex + 1}` as keyof FormData

            return (
              <div className="col-12" key={question.id}>
                <div className="card shadow-sm p-3 mb-2">
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      {question.text}
                    </Form.Label>
                    <QuestionField
                      question={question}
                      fieldName={fieldName}
                      formData={formData}
                      handleChange={handleChange}
                      setFormData={setFormData}
                      index={actualIndex}
                    />
                  </Form.Group>
                </div>
              </div>
            )
          })}
        </div>

        <div className="d-flex justify-content-between mt-4">
          <Button
            variant="outline-secondary"
            onClick={handleBack}
            className="rounded-pill px-4"
          >
            Back
          </Button>
          <Button variant="primary" type="submit" className="rounded-pill px-4">
            Next
          </Button>
        </div>
      </Form>
    </div>
  )
}
