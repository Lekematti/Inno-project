'use client';
import { Form, Button, Alert } from 'react-bootstrap';
import { getBusinessQuestions } from '@/functions/inputGenerate';
import { FormData, StepWithBackProps } from '@/types/formData';
import { QuestionField } from '../QuestionField';

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
      <h2>Step 2: Business Details (Part 1)</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}>
        {questions.slice(0, 5).map((question, index) => {
          const fieldName = `question${index + 1}` as keyof FormData;
          
          return (
            <Form.Group key={question.id} className="mb-4">
              <Form.Label>{question.text}</Form.Label>
              <QuestionField
                question={question}
                fieldName={fieldName}
                formData={formData}
                handleChange={handleChange}
                setFormData={setFormData}
                index={index}
              />
            </Form.Group>
          );
        })}
        
        <div className="d-flex justify-content-between mt-4">
          <Button variant="secondary" onClick={handleBack}>
            Back
          </Button>
          <Button variant="primary" type="submit">
            Next
          </Button>
        </div>
      </Form>
    </div>
  );
};