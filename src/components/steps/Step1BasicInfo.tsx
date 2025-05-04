'use client';
import { Form, Button, Alert } from 'react-bootstrap';
import { FaRegListAlt } from 'react-icons/fa';
import { BaseStepProps } from '@/types/formData';
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
      <div className="d-flex align-items-center mb-3">
        <div className="icon-circle bg-primary text-white me-3"><FaRegListAlt size={24} /></div>
        <h2 className="mb-0">Step 1: Basic Business Information</h2>
      </div>
      <p className="text-muted mb-4">Let&apos;s start with the essentials about your business.</p>
      {error && <Alert variant="danger">{error}</Alert>}
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="card shadow-sm p-3 h-100">
            <Form.Group>
              <Form.Label className="fw-semibold">Business Type</Form.Label>
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
              <Form.Text className="text-muted">Choose the category that best fits your business.</Form.Text>
            </Form.Group>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card shadow-sm p-3 h-100">
            <Form.Group>
              <Form.Label className="fw-semibold">Business Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Business St, City, State"
                required
                aria-label="Business address"
              />
              <Form.Text className="text-muted">Where is your business located?</Form.Text>
            </Form.Group>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card shadow-sm p-3 h-100">
            <Form.Group>
              <Form.Label className="fw-semibold">Phone Number</Form.Label>
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
              <Form.Text className="text-muted">How can customers reach you?</Form.Text>
            </Form.Group>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card shadow-sm p-3 h-100">
            <Form.Group>
              <Form.Label className="fw-semibold">Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@yourbusiness.com"
                required
                aria-label="Email address"
              />
              <Form.Text className="text-muted">For customer inquiries and contact.</Form.Text>
            </Form.Group>
          </div>
        </div>
      </div>
      <div className="text-end mt-4">
        <Button 
          variant="primary" 
          type="submit" 
          className="px-4 rounded-pill shadow-sm"
          onClick={(e) => { e.preventDefault(); handleSubmit(); }}
        >
          Next
        </Button>
      </div>
    </div>
  );
};