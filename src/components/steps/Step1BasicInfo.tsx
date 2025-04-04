'use client';
import { Form, Button, Alert } from 'react-bootstrap';
import { BaseStepProps} from '@/types/formData';
import { BusinessType } from '@/types/business/types';

export const Step1BasicInfo: React.FC<BaseStepProps> = ({ 
  formData, 
  handleChange, 
  handleSubmit, 
  error 
}) => {
  const businessTypes: { value: BusinessType; label: string }[] = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'logistics', label: 'Logistics' },
    { value: 'professional', label: 'Professional Services' },
  ];

  return (
    <div className="step-container">
      <h2>Step 1: Basic Business Information</h2>
      <p>Let&apos;s start with the essentials about your business.</p>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}>
        <Form.Group className="mb-3">
          <Form.Label>Business Type</Form.Label>
          <Form.Select
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            required
            aria-label="Select business type"
          >
            <option value="">Select business type...</option>
            {businessTypes.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Business Address</Form.Label>
          <Form.Control
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="123 Business St, City, State"
            required
            aria-label="Business address"
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(123) 456-7890"
            required
            pattern="[\d\s()-]+"
            aria-label="Phone number"
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="contact@yourbusiness.com"
            required
            aria-label="Email address"
          />
        </Form.Group>
        
        <Button 
          variant="primary" 
          type="submit" 
          className="mt-3"
        >
          Next
        </Button>
      </Form>
    </div>
  );
};