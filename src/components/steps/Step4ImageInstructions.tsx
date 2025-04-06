'use client';
import { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Tab, Tabs } from 'react-bootstrap';
import { StepWithBackProps, ImageSourceType } from '@/types/formData';
import Image from 'next/image';

export const Step4ImageInstructions: React.FC<StepWithBackProps> = ({
  formData,
  handleChange,
  handleSubmit,
  handleBack,
  error,
  setFormData
}) => {
  // Use TypeScript's type safety with ImageSourceType
  const [imageSource, setImageSource] = useState<ImageSourceType>('ai');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string>('');

  // Initialize from existing form data if available
  useEffect(() => {
    if (formData.imageSource) {
      setImageSource(formData.imageSource as ImageSourceType);
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
    
    // Validate based on image source
    if (imageSource === 'ai' && (!formData.imageInstructions || formData.imageInstructions.trim() === '')) {
      setLocalError('Please describe your image requirements or select a different option');
      return;
    }
    
    if (imageSource === 'manual' && previewUrls.length === 0) {
      setLocalError('Please upload at least one image or select a different option');
      return;
    }
    
    // Create updated form data to pass to parent
    const updatedFormData = {
      imageSource,
      imageInstructions: imageSource === 'ai' ? formData.imageInstructions : '',
      uploadedImages: imageSource === 'manual' ? uploadedImages : [],
      userImageUrls: imageSource === 'manual' ? previewUrls : []
    };
    
    // Update form data and proceed to next step
    setFormData(updatedFormData);
    handleSubmit(updatedFormData);
  };

  const handleSourceChange = (key: string | null) => {
    const newSource = (key || 'ai') as ImageSourceType;
    setImageSource(newSource);
    setLocalError('');
    
    // Update form data when image source changes
    setFormData({
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
        <Tabs
          activeKey={imageSource}
          onSelect={handleSourceChange}
          className="mb-4"
        >
          <Tab eventKey="ai" title="AI-Generated Images">
            <Card className="p-3 mt-3">
              <Form.Group className="mb-3">
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
                  disabled={imageSource !== 'ai'}
                  required={imageSource === 'ai'}
                />
              </Form.Group>
            </Card>
          </Tab>
          
          <Tab eventKey="manual" title="Upload Your Own Images">
            <Card className="p-3 mt-3">
              <Form.Group className="mb-3">
                <Form.Label htmlFor="manualImages">Upload Images</Form.Label>
                <Form.Text className="text-muted d-block mb-2">
                  Upload your own images to use on your website. Recommended formats: JPG, PNG, WebP.
                </Form.Text>
                <Form.Control
                  type="file"
                  id="manualImages"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  disabled={imageSource !== 'manual'}
                />
              </Form.Group>
              
              {previewUrls.length > 0 && (
                <div className="mt-3">
                  <h5>Uploaded Images ({previewUrls.length})</h5>
                  <div className="d-flex flex-wrap gap-3 mt-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="position-relative" style={{ width: '150px' }}>       
                        <Image 
                          src={url} 
                          alt={`Uploaded image ${index + 1}`} 
                          className="img-thumbnail" 
                          width={150} 
                          height={120} 
                          style={{ objectFit: 'cover' }}
                        />
                        <Button 
                          variant="danger" 
                          size="sm" 
                          className="position-absolute top-0 end-0"
                          onClick={() => removeImage(index)}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {imageSource === 'manual' && previewUrls.length === 0 && (
                <Alert variant="warning" className="mt-3">
                  Please upload at least one image, or switch to AI-generated images.
                </Alert>
              )}
            </Card>
          </Tab>
          
          <Tab eventKey="none" title="No Images">
            <Card className="p-3 mt-3">
              <Alert variant="info">
                Your website will be generated without custom images. Default placeholder images may be used instead.
              </Alert>
            </Card>
          </Tab>
        </Tabs>
        
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
            disabled={imageSource === 'manual' && previewUrls.length === 0}
          >
            Generate Website
          </Button>
        </div>
      </Form>
    </div>
  );
};