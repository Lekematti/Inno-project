'use client';
import { Form, Button, Alert } from 'react-bootstrap';
import { getBusinessQuestions } from '@/functions/inputGenerate';
import { QuestionField } from '../QuestionField';
import { FormData, StepWithBackProps } from '@/types/formData';

export const Step3Questions: React.FC<StepWithBackProps> = ({ 
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
      <h2>Step 3: Business Details (Part 2)</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}>
        {questions.slice(5, 10).map((question, index) => {
          const actualIndex = index + 5;
          const fieldName = `question${actualIndex + 1}` as keyof FormData;
          
          return (
            <Form.Group key={question.id} className="mb-4">
              <Form.Label>{question.text}</Form.Label>
              <QuestionField
                question={question}
                fieldName={fieldName}
                formData={formData}
                handleChange={handleChange}
                setFormData={setFormData}
                index={actualIndex}
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