'use client';
import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Row, Col, Stack, Image, ButtonGroup } from 'react-bootstrap';
import { StepWithBackProps } from '@/types/formData';
import { ImageSourceType } from '@/types/formData';

export const Step4ImageInstructions: React.FC<StepWithBackProps> = ({
  formData,
  handleChange,
  handleSubmit,
  handleBack,
  error,
  setFormData
}) => {
  // Use TypeScript's type safety with ImageSourceType
  const [imageSource, setImageSource] = useState<ImageSourceType>(formData.imageSource || 'none');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string>('');

  // Initialize from existing form data if available
  useEffect(() => {
    if (formData.imageSource) {
      setImageSource(formData.imageSource);
    }
    
    // If we have userImageUrls in the form data, reconstruct the preview URLs
    if (formData.userImageUrls && formData.userImageUrls.length > 0) {
      setPreviewUrls(formData.userImageUrls);
    }

    // If we have uploadedImages in the form data, use them
    if (formData.uploadedImages) {
      setUploadedImages(formData.uploadedImages);
    }
  }, [formData.imageSource, formData.userImageUrls, formData.uploadedImages]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    // Create updated form data to pass to parent
    const updatedFormData = {
      ...formData,
      imageSource, // Always include the selected imageSource
    };
    
    if (imageSource === 'ai') {
      // For AI images, validate and include instructions
      if (!formData.imageInstructions || formData.imageInstructions.trim() === '') {
        setLocalError('Please describe your image requirements or select a different option');
        return;
      }
      updatedFormData.imageInstructions = formData.imageInstructions;
    } 
    else if (imageSource === 'manual') {
      // For manual upload, validate and include uploaded images
      if (previewUrls.length === 0) {
        setLocalError('Please upload at least one image or select a different option');
        return;
      }
      updatedFormData.uploadedImages = uploadedImages;
      updatedFormData.userImageUrls = previewUrls;
    }
    else if (imageSource === 'none') {
      // For "no images" option, make sure we clear any previous image data
      updatedFormData.imageInstructions = '';
      updatedFormData.uploadedImages = [];
      updatedFormData.userImageUrls = [];
    }
    
    // Update form data and proceed to next step
    setFormData(updatedFormData);
    handleSubmit(updatedFormData);
  };

  const handleSourceChange = (key: string | null) => {
    const newSource = (key ?? 'none') as ImageSourceType;
    setImageSource(newSource);
    setLocalError('');
    
    // Update form data when image source changes
    setFormData({
      ...formData,
      imageSource: newSource
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newUploadedImages = [...uploadedImages, ...files];
      setUploadedImages(newUploadedImages);
      
      // Generate preview URLs
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      const allPreviewUrls = [...previewUrls, ...newPreviewUrls];
      setPreviewUrls(allPreviewUrls);
      
      // Update the form data
      setFormData({
        ...formData,
        uploadedImages: newUploadedImages,
        userImageUrls: allPreviewUrls
      });
      
      // Clear any error if we now have images
      if (allPreviewUrls.length > 0) {
        setLocalError('');
      }
    }
  };

  const removeImage = (index: number) => {
    // Remove the image and its preview
    const newImages = [...uploadedImages];
    newImages.splice(index, 1);
    setUploadedImages(newImages);
    
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    const newPreviewUrls = [...previewUrls];
    newPreviewUrls.splice(index, 1);
    setPreviewUrls(newPreviewUrls);
    
    // Update the form data
    setFormData({
      ...formData,
      uploadedImages: newImages,
      userImageUrls: newPreviewUrls
    });
    
    // Set error if no images remain and source is manual
    if (newPreviewUrls.length === 0 && imageSource === 'manual') {
      setLocalError('Please upload at least one image or select a different option');
    }
  };

  return (
    <div className="step-container">
      <h2>Step 4: Images for Your Website</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {localError && <Alert variant="danger">{localError}</Alert>}
      
      <Form onSubmit={handleFormSubmit}>
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Choose Image Source</h5>
          </Card.Header>
          <Card.Body>
            <ButtonGroup vertical className="w-100">
              <Button 
                variant={imageSource === 'ai' ? 'primary' : 'outline-primary'}
                onClick={() => handleSourceChange('ai')}
                className="text-start py-3 mb-2"
              >
                <div className="d-flex align-items-center">
                  <div className="ms-2">
                    <strong>AI-Generated Images</strong>
                    <div className="small text-muted">Let AI create custom images based on your descriptions</div>
                  </div>
                </div>
              </Button>
              
              <Button 
                variant={imageSource === 'manual' ? 'primary' : 'outline-primary'}
                onClick={() => handleSourceChange('manual')}
                className="text-start py-3 mb-2"
              >
                <div className="d-flex align-items-center">
                  <div className="ms-2">
                    <strong>Upload Your Own Images</strong>
                    <div className="small text-muted">Use your existing photos or graphics</div>
                  </div>
                </div>
              </Button>
              
              <Button 
                variant={imageSource === 'none' ? 'primary' : 'outline-primary'}
                onClick={() => handleSourceChange('none')}
                className="text-start py-3"
              >
                <div className="d-flex align-items-center">
                  <div className="ms-2">
                    <strong>No Images</strong>
                    <div className="small text-muted">Create a text-only website</div>
                  </div>
                </div>
              </Button>
            </ButtonGroup>
          </Card.Body>
        </Card>
        
        {/* AI Image Instructions */}
        {imageSource === 'ai' && (
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Describe Your Image Requirements</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group controlId="imageInstructions" className="mb-3">
                <Form.Label>
                  <strong>What kind of images would you like?</strong>
                </Form.Label>
                <Form.Control 
                  as="textarea" 
                  name="imageInstructions"
                  placeholder="Describe the images you'd like (e.g., 'Professional photos of a modern restaurant with wooden tables and ambient lighting')"
                  value={formData.imageInstructions || ''}
                  onChange={handleChange}
                  rows={5}
                />
                <Form.Text className="text-muted">
                  Be specific about the subject, style, colors, and mood of images you want.
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>
        )}
        
        {/* Manual Image Upload */}
        {imageSource === 'manual' && (
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Upload Your Images</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group controlId="imageUpload" className="mb-3">
                <Form.Label>
                  <strong>Select images for your website</strong>
                </Form.Label>
                <Form.Control 
                  type="file" 
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
                <Form.Text className="text-muted">
                  For best results, choose high-quality images in JPG, PNG, or WebP format.
                </Form.Text>
              </Form.Group>
              
              {/* Preview uploaded images */}
              {previewUrls.length > 0 && (
                <div className="mt-4">
                  <h6>Your Uploads ({previewUrls.length}):</h6>
                  <Row xs={2} md={3} lg={4} className="g-3">
                    {previewUrls.map((url, index) => (
                      <Col key={index}>
                        <Card className="h-100">
                          <div style={{ height: '120px', overflow: 'hidden', position: 'relative' }}>
                            <Image 
                              src={url} 
                              alt={`Upload ${index + 1}`}
                              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            />
                          </div>
                          <Card.Footer className="p-2 text-center">
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => removeImage(index)}
                            >
                              Remove
                            </Button>
                          </Card.Footer>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </Card.Body>
          </Card>
        )}
        
        {/* No Images Option - Nothing additional needed */}
        
        <Stack direction="horizontal" gap={3} className="justify-content-between mt-4">
          <Button variant="outline-secondary" onClick={handleBack}>
            Back
          </Button>
          <Button variant="primary" type="submit">
            Continue
          </Button>
        </Stack>
      </Form>
    </div>
  );
};