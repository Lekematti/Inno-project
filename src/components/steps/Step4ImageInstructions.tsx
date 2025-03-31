'use client';
import { Form, Button, Alert } from 'react-bootstrap';
import { StepWithBackProps } from '@/types/formData';

export const Step4ImageInstructions: React.FC<StepWithBackProps> = ({ 
  formData, 
  handleChange, 
  handleSubmit, 
  handleBack, 
  error 
}) => {
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="step-container">
      <h2>Step 4: Image Instructions</h2>
      <p>Describe the images you&apos;d like to include on your website.</p>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleFormSubmit}>
        <Form.Group className="mb-4">
          <Form.Label htmlFor="imageInstructions">Image Instructions</Form.Label>
          <Form.Text id="imageInstructionsHelp" className="text-muted d-block mb-2">
            Describe what kinds of images you&apos;d like on your website. Be specific about style, content, and placement.
            For example: &quot;Professional photos of modern office spaces, team members in business attire, and a cityscape header image.&quot;
          </Form.Text>
          <Form.Control
            as="textarea"
            rows={5}
            id="imageInstructions"
            name="imageInstructions"
            value={formData.imageInstructions ?? ''}
            onChange={handleChange}
            placeholder="Describe your image requirements or type 'none' if you don't need custom images"
            aria-describedby="imageInstructionsHelp"
            required
          />
        </Form.Group>
        
        <div className="d-flex justify-content-between mt-4">
          <Button 
            variant="secondary" 
            onClick={handleBack}
            type="button"
            aria-label="Go back to previous step"
          >
            Back
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            aria-label="Generate website with specified images"
          >
            Generate Website
          </Button>
        </div>
      </Form>
    </div>
  );
};