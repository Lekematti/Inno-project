'use client';
import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Row, Col, Stack, Image, ButtonGroup } from 'react-bootstrap';
import { FaRegImage } from 'react-icons/fa';
import { StepWithBackProps } from '@/types/formData';
import { ImageSourceType } from '@/types/formData';

export const Step4ImageInstructions: React.FC<StepWithBackProps> = ({
  formData,
  handleSubmit,
  handleBack,
  error,
  setFormData
}) => {
  const [imageSource, setImageSource] = useState<ImageSourceType>(formData.imageSource || 'none');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string>('');
  const [imageDescriptions, setImageDescriptions] = useState<string[]>(
    formData.imageDescriptions || ['']
  );

  const MAX_IMAGES = 5;

  useEffect(() => {
    if (formData.imageSource) {
      setImageSource(formData.imageSource);
    }
    
    if (formData.userImageUrls && formData.userImageUrls.length > 0) {
      setPreviewUrls(formData.userImageUrls);
    }

    if (formData.uploadedImages) {
      setUploadedImages(formData.uploadedImages);
    }

    if (formData.imageDescriptions) {
      setImageDescriptions(formData.imageDescriptions);
    }
  }, [formData.imageSource, formData.userImageUrls, formData.uploadedImages, formData.imageDescriptions]);

  const validateImageRequirements = (): { isValid: boolean; error: string } => {
    if (imageSource === 'ai') {
      const validDescriptions = imageDescriptions.filter(desc => desc.trim().length > 0);
      
      if (validDescriptions.length === 0) {
        return { 
          isValid: false, 
          error: 'Please provide at least one image description or choose a different image source.' 
        };
      }
      
      for (let i = 0; i < imageDescriptions.length; i++) {
        if (!imageDescriptions[i] || imageDescriptions[i].trim() === '') {
          return {
            isValid: false,
            error: `Please provide a description for image ${i + 1} or remove it.`
          };
        }
      }
    }
    
    if (imageSource === 'manual' && (!previewUrls || previewUrls.length === 0)) {
      return { 
        isValid: false, 
        error: 'Please upload at least one image or choose a different image source' 
      };
    }
    
    return { isValid: true, error: '' };
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    const updatedFormData = {
      ...formData,
      imageSource,
    };
    
    if (imageSource === 'ai') {
      const validation = validateImageRequirements();
      
      if (!validation.isValid) {
        setLocalError(validation.error);
        return;
      }
      
      const activeDescriptions = imageDescriptions.filter(desc => desc.trim() !== '');
      
      const formattedInstructions = activeDescriptions
        .map((desc, index) => `${index + 1}.${desc.trim()}`)
        .join(' ');
      
      updatedFormData.imageInstructions = formattedInstructions;
      updatedFormData.imageDescriptions = activeDescriptions;
    } 
    else if (imageSource === 'manual') {
      if (previewUrls.length === 0) {
        setLocalError('Please upload at least one image or select a different option');
        return;
      }
      updatedFormData.uploadedImages = uploadedImages;
      updatedFormData.userImageUrls = previewUrls;
    }
    else if (imageSource === 'none') {
      updatedFormData.imageInstructions = '';
      updatedFormData.uploadedImages = [];
      updatedFormData.userImageUrls = [];
      updatedFormData.imageDescriptions = [];
    }
    
    setFormData(updatedFormData);
    handleSubmit(updatedFormData);
  };

  const handleSourceChange = (key: string | null) => {
    const newSource = (key ?? 'none') as ImageSourceType;
    setImageSource(newSource);
    setLocalError('');
    
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
      
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      const allPreviewUrls = [...previewUrls, ...newPreviewUrls];
      setPreviewUrls(allPreviewUrls);
      
      setFormData({
        ...formData,
        uploadedImages: newUploadedImages,
        userImageUrls: allPreviewUrls
      });
      
      if (allPreviewUrls.length > 0) {
        setLocalError('');
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...uploadedImages];
    newImages.splice(index, 1);
    setUploadedImages(newImages);
    
    URL.revokeObjectURL(previewUrls[index]);
    const newPreviewUrls = [...previewUrls];
    newPreviewUrls.splice(index, 1);
    setPreviewUrls(newPreviewUrls);
    
    setFormData({
      ...formData,
      uploadedImages: newImages,
      userImageUrls: newPreviewUrls
    });
    
    if (newPreviewUrls.length === 0 && imageSource === 'manual') {
      setLocalError('Please upload at least one image or select a different option');
    }
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const newDescriptions = [...imageDescriptions];
    newDescriptions[index] = value;
    setImageDescriptions(newDescriptions);
  };

  const addImageDescription = () => {
    if (imageDescriptions.length < MAX_IMAGES) {
      setImageDescriptions([...imageDescriptions, '']);
    }
  };

  const removeImageDescription = (index: number) => {
    if (imageDescriptions.length > 1) {
      const newDescriptions = [...imageDescriptions];
      newDescriptions.splice(index, 1);
      setImageDescriptions(newDescriptions);
    }
  };

  return (
    <div className="step-container">
      <div className="d-flex align-items-center mb-3">
        <div className="icon-circle bg-primary text-white me-3"><FaRegImage size={24} /></div>
        <h2 className="mb-0">Step 4: Images for Your Website</h2>
      </div>
      
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
        
        {imageSource === 'ai' && (
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Describe Your Images</h5>
              <span className="badge bg-primary">{imageDescriptions.length}/{MAX_IMAGES}</span>
            </Card.Header>
            <Card.Body>
              {imageDescriptions.map((desc, index) => (
                <Card 
                  key={`image-desc-${index}`} 
                  className="mb-3 border-light shadow-sm"
                >
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="mb-0">Image {index + 1}</h6>
                      {imageDescriptions.length > 1 && (
                        <Button 
                          variant="light" 
                          size="sm" 
                          className="text-danger p-1" 
                          onClick={() => removeImageDescription(index)}
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <span aria-hidden="true">×</span>
                        </Button>
                      )}
                    </div>
                    <Form.Control
                      type="text"
                      value={desc}
                      onChange={(e) => handleDescriptionChange(index, e.target.value)}
                      placeholder="Describe what you want in this image"
                      className="border-0 bg-light"
                    />
                  </Card.Body>
                </Card>
              ))}
              
              {imageDescriptions.length < MAX_IMAGES && (
                <div className="text-center mt-3">
                  <Button 
                    variant="outline-primary" 
                    onClick={addImageDescription}
                    className="px-4"
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Another Image
                  </Button>
                </div>
              )}
              
              <Alert variant="info" className="mt-4 p-3" style={{ fontSize: '0.9rem' }}>
                <strong>📝 Image Tips:</strong>
                <ul className="mb-0 mt-2">
                  <li>Be specific about what should appear in each image</li>
                  <li>You can specify &quot;landscape&quot;, &quot;portrait&quot;, or &quot;square&quot; for aspect ratio</li>
                  <li>Describe style preferences like &quot;professional photo&quot; or &quot;artistic rendering&quot;</li>
                  <li>Include details about lighting, colors, and mood</li>
                </ul>
              </Alert>
            </Card.Body>
          </Card>
        )}
        
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
        
        <Stack direction="horizontal" gap={3} className="justify-content-between mt-4">
          <Button variant="outline-secondary" onClick={handleBack} className="rounded-pill px-4">
            Back
          </Button>
          <Button variant="primary" type="submit" className="rounded-pill px-4">
            Continue
          </Button>
        </Stack>
      </Form>
    </div>
  );
};