'use client';
import { Form } from 'react-bootstrap';
import { ColorPicker } from './ColorPicker';
import { FormData, Question, StepWithBackProps } from '@/types/formData';

interface QuestionFieldProps {
  question: Question;
  fieldName: keyof FormData;
  formData: FormData;
  handleChange: StepWithBackProps['handleChange'];
  setFormData: StepWithBackProps['setFormData'];
  index: number;
}

export const QuestionField: React.FC<QuestionFieldProps> = ({
  question,
  fieldName,
  formData,
  handleChange,
  setFormData,
  index,
}) => {
  try {
    switch (question.type) {
      case 'color':
        {
          // Wrap setFormData to match the expected type
          const wrappedSetFormData = (updater: (prev: FormData) => FormData) => {
            setFormData(updater(formData));
          };

          return (
            <ColorPicker
              index={index}
              formData={formData}
              setFormData={wrappedSetFormData}
            />
          );
        }

      case 'boolean':
        return (
          <div>
            <Form.Check
              inline
              type="radio"
              id={`${fieldName}-yes`}
              name={fieldName}
              value="yes"
              label="Yes"
              checked={formData[fieldName] === 'yes' || false}
              onChange={handleChange}
              required
            />
            <Form.Check
              inline
              type="radio"
              id={`${fieldName}-no`}
              name={fieldName}
              value="no"
              label="No"
              checked={formData[fieldName] === 'no' || false}
              onChange={handleChange}
              required
            />
          </div>
        );

      default:
        if (question.type === 'text') {
          return (
            <Form.Control
              type="text"
              name={fieldName}
              value={typeof formData[fieldName] === 'string' ? formData[fieldName] : ''}
              onChange={handleChange}
              placeholder={question.placeholder}
              required
            />
          );
        }
        console.error(`Unsupported question type: ${question.type}`);
        return <div className="text-danger">Unsupported question type: {question.type}</div>;
    }
  } catch (error) {
    console.error('Error rendering QuestionField:', error);
    return (
      <div className="text-danger">
        An error occurred while rendering this field. Please try again later.
      </div>
    );
  }
};