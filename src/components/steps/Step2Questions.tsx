'use client';
import { Form, Button, Alert } from 'react-bootstrap';
import { getBusinessQuestions } from '@/functions/inputGenerate';
import { FormData, StepWithBackProps } from '@/types/formData';
import { QuestionField } from '../QuestionField';
import { FaRegEdit } from 'react-icons/fa';

export const Step2Questions: React.FC<StepWithBackProps> = ({ 
  formData, 
  handleChange, 
  handleSubmit, 
  handleBack, 
  error,
  setFormData 
}) => {
  const questions = getBusinessQuestions(formData.businessType);
  
  if (!questions.length) {
    return <Alert variant="danger">No questions found for this business type</Alert>;
  }

  return (
    <div className="step-container">
      <div className="d-flex align-items-center mb-3">
        <div className="icon-circle bg-primary text-white me-3"><FaRegEdit size={24} /></div>
        <h2 className="mb-0">Step 2: Business Details (Part 1)</h2>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}>
        <div className="row g-4">
          {questions.slice(0, 5).map((question, index) => {
            const fieldName = `question${index + 1}` as keyof FormData;
            
            return (
              <div className="col-12" key={question.id}>
                <div className="card shadow-sm p-3 mb-2">
                  <Form.Group>
                    <Form.Label className="fw-semibold">{question.text}</Form.Label>
                    <QuestionField
                      question={question}
                      fieldName={fieldName}
                      formData={formData}
                      handleChange={handleChange}
                      setFormData={setFormData}
                      index={index}
                    />
                  </Form.Group>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="d-flex justify-content-between mt-4">
          <Button variant="outline-secondary" onClick={handleBack} className="rounded-pill px-4">
            Back
          </Button>
          <Button variant="primary" type="submit" className="rounded-pill px-4">
            Next
          </Button>
        </div>
      </Form>
    </div>
  );
};