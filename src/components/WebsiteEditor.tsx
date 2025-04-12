'use client';
import { useState, useEffect } from 'react';
import { Button, Form, Tabs, Tab, Card, Row, Col, Alert } from 'react-bootstrap';
import Image from 'next/image';
import { ColorPicker } from './ColorPicker';

interface WebsiteEditorProps {
  htmlContent: string;
  onSave: (updatedHtml: string) => void;
  standaloneHTML: string;
}

export const WebsiteEditor: React.FC<WebsiteEditorProps> = ({
  htmlContent,
  onSave,
  standaloneHTML,
}) => {
  const [editableHtml, setEditableHtml] = useState<string>(htmlContent);
  const [activeTab, setActiveTab] = useState<string>('text');
  const [editableElements, setEditableElements] = useState<{ id: string; content: string; type: string; element?: string; alt?: string }[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);
  const [colorScheme, setColorScheme] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Extract editable elements from HTML on initial load
  useEffect(() => {
    if (htmlContent) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Extract text elements (paragraphs, headings, list items)
      const textElements = Array.from(doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span.editable'));
      const editableTextElements = textElements.map((el, index) => ({
        id: `text-${index}`,
        content: el.textContent ?? '',
        type: 'text',
        element: el.tagName.toLowerCase(),
      }));

      // Extract image elements
      const imgElements = Array.from(doc.querySelectorAll('img'));
      const editableImgElements = imgElements.map((el, index) => ({
        id: `img-${index}`,
        content: el.getAttribute('src') ?? '',
        type: 'image',
        alt: el.getAttribute('alt') ?? '',
      }));

      setEditableElements([...editableTextElements, ...editableImgElements]);
    }
  }, [htmlContent]);

  // Update iframe content when editable HTML changes
  useEffect(() => {
    if (iframeRef) {
      const iframeDocument = iframeRef.contentDocument;
      if (iframeDocument) {
        iframeDocument.open();
        iframeDocument.write(editableHtml);
        iframeDocument.close();
        
        // Highlight editable elements
        highlightEditableElements(iframeDocument);
      }
    }
  }, [editableHtml, iframeRef]);

  const highlightEditableElements = (doc: Document) => {
    // Clear previous highlights
    const previouslyHighlighted = doc.querySelectorAll('.editable-highlight');
    previouslyHighlighted.forEach(el => {
      el.classList.remove('editable-highlight');
    });

    // Remove previous event listeners by cloning and replacing elements
    const elementsWithListeners = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span.editable, img');
    elementsWithListeners.forEach(el => {
      const clone = el.cloneNode(true);
      if (el.parentNode) {
        el.parentNode.replaceChild(clone, el);
      }
    });

    // Separate text and image elements for clearer indexing
    const textElements = editableElements.filter(el => el.type === 'text');
    const imageElements = editableElements.filter(el => el.type === 'image');

    // Highlight text elements
    textElements.forEach((element, index) => {
      const selector = element.element ?? 'p';
      const elements = Array.from(doc.querySelectorAll(selector));
      
      // Find the corresponding DOM element
      if (elements[index]) {
        const el = elements[index];
        el.classList.add('editable-highlight');
        el.addEventListener('click', () => {
          setSelectedElement(element.id);
          setActiveTab('text');
        });
      }
    });

    // Highlight image elements
    imageElements.forEach((element, index) => {
      const images = Array.from(doc.querySelectorAll('img'));
      
      if (images[index]) {
        const img = images[index];
        img.classList.add('editable-highlight');
        img.addEventListener('click', () => {
          setSelectedElement(element.id);
          setActiveTab('images');
        });
      }
    });

    // Add highlight styles
    let style = doc.querySelector('style#editor-highlight-styles');
    if (!style) {
      style = doc.createElement('style');
      style.id = 'editor-highlight-styles';
      doc.head.appendChild(style);
    }
    
    style.textContent = `
      .editable-highlight {
        outline: 2px dashed #5c7cfa;
        cursor: pointer;
        transition: all 0.2s;
      }
      .editable-highlight:hover {
        outline: 2px solid #4263eb;
        box-shadow: 0 0 10px rgba(66, 99, 235, 0.3);
      }
    `;
  };

  const handleTextEdit = (elementId: string, newContent: string) => {
    // Create a copy of editable elements and update the edited one
    const updatedElements = editableElements.map(el => 
      el.id === elementId ? { ...el, content: newContent } : el
    );
    setEditableElements(updatedElements);
    
    // Update the HTML with the new content
    updateHtmlContent(elementId, newContent);
  };

  const handleImageEdit = (elementId: string, newImageUrl: string) => {
    // Create a copy of editable elements and update the edited one
    const updatedElements = editableElements.map(el => 
      el.id === elementId ? { ...el, content: newImageUrl } : el
    );
    setEditableElements(updatedElements);
    
    // Update the HTML with the new image URL
    updateHtmlContent(elementId, newImageUrl, 'image');
  };

  const updateHtmlContent = (elementId: string, newContent: string, type = 'text') => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(editableHtml, 'text/html');
    
    const elementIndex = parseInt(elementId.split('-')[1], 10);

    if (type === 'text') {
      const textElements = Array.from(doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span.editable'));
      if (textElements[elementIndex]) {
        textElements[elementIndex].textContent = newContent;
      }
    } else if (type === 'image') {
      const imgElements = Array.from(doc.querySelectorAll('img'));
      if (imgElements[elementIndex]) {
        imgElements[elementIndex].setAttribute('src', newContent);
      }
    }

    setEditableHtml(doc.documentElement.outerHTML);
  };

  const handleColorChange = (newColorScheme: string) => {
    setColorScheme(newColorScheme);
    
    // Update CSS variables in the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(editableHtml, 'text/html');
    
    // Get the existing style element or create a new one
    let styleEl = doc.querySelector('style#custom-colors');
    if (!styleEl) {
      styleEl = doc.createElement('style');
      styleEl.id = 'custom-colors';
      doc.head.appendChild(styleEl);
    }
    
    // Create updated CSS variables
    const colors = newColorScheme.split(',');
    let cssVars = ':root {\n';
    if (colors.length >= 1) cssVars += `  --primary-color: ${colors[0]};\n`;
    if (colors.length >= 2) cssVars += `  --secondary-color: ${colors[1]};\n`;
    if (colors.length >= 3) cssVars += `  --accent-color: ${colors[2]};\n`;
    if (colors.length >= 4) cssVars += `  --background-color: ${colors[3]};\n`;
    cssVars += '}';
    
    styleEl.textContent = cssVars;
    setEditableHtml(doc.documentElement.outerHTML);
  };

  const handleSaveChanges = () => {
    try {
      onSave(editableHtml);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setErrorMessage('Failed to save changes. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  return (
    <div className="website-editor">
      <h3>Edit Your Website</h3>
      
      {saveSuccess && (
        <Alert variant="success">Changes saved successfully!</Alert>
      )}
      
      {errorMessage && (
        <Alert variant="danger">{errorMessage}</Alert>
      )}
      
      <Row className="mt-4">
        <Col md={8}>
          <div className="website-preview-container" style={{ height: '600px', border: '1px solid #dee2e6' }}>
            <iframe 
              ref={(ref) => setIframeRef(ref)}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Website Preview"
            ></iframe>
          </div>
          <div className="d-flex justify-content-end mt-3">
            <Button 
              variant="primary" 
              onClick={handleSaveChanges}
              className="me-2"
            >
              Save Changes
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={() => window.open(URL.createObjectURL(new Blob([standaloneHTML], {type: 'text/html'})), '_blank')}
            >
              Preview in New Tab
            </Button>
          </div>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Header>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k ?? 'text')}
                className="mb-3"
              >
                <Tab eventKey="text" title="Text">
                  <div className="p-3">
                    <Form.Group className="mb-3">
                      <Form.Label>Select Text Element</Form.Label>
                      <Form.Select 
                        value={selectedElement ?? ''}
                        onChange={(e) => setSelectedElement(e.target.value)}
                      >
                        <option value="">-- Select Element --</option>
                        {editableElements
                          .filter(el => el.type === 'text')
                          .map(el => (
                            <option key={el.id} value={el.id}>
                              {el.element}: {el.content.substring(0, 30)}...
                            </option>
                          ))
                        }
                      </Form.Select>
                    </Form.Group>
                    
                    {selectedElement && editableElements.find(el => el.id === selectedElement)?.type === 'text' && (
                      <Form.Group className="mb-3">
                        <Form.Label>Edit Content</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          value={editableElements.find(el => el.id === selectedElement)?.content ?? ''}
                          onChange={(e) => handleTextEdit(selectedElement, e.target.value)}
                        />
                      </Form.Group>
                    )}
                  </div>
                </Tab>
                
                <Tab eventKey="images" title="Images">
                  <div className="p-3">
                    <Form.Group className="mb-3">
                      <Form.Label>Select Image</Form.Label>
                      <Form.Select
                        value={selectedElement ?? ''}
                        onChange={(e) => setSelectedElement(e.target.value)}
                      >
                        <option value="">-- Select Image --</option>
                        {editableElements
                          .filter(el => el.type === 'image')
                          .map(el => (
                            <option key={el.id} value={el.id}>
                              Image: {el.alt ?? el.id}
                            </option>
                          ))
                        }
                      </Form.Select>
                    </Form.Group>
                    
                    {selectedElement && editableElements.find(el => el.id === selectedElement)?.type === 'image' && (
                      <>
                        <Form.Group className="mb-3">
                          <Form.Label>Current Image</Form.Label>
                          <div className="text-center p-2 border rounded">
                            <Image 
                              src={editableElements.find(el => el.id === selectedElement)?.content ?? ''}
                              alt="Current"
                              width={150}
                              height={150}
                              style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }}
                              unoptimized
                            />
                          </div>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Replace Image URL</Form.Label>
                          <Form.Control
                            type="text"
                            value={editableElements.find(el => el.id === selectedElement)?.content ?? ''}
                            onChange={(e) => handleImageEdit(selectedElement, e.target.value)}
                            placeholder="Enter new image URL"
                          />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Upload New Image</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const input = e.target as HTMLInputElement;
                              if (input.files?.[0]) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result && selectedElement) {
                                    handleImageEdit(selectedElement, event.target.result as string);
                                  }
                                };
                                reader.readAsDataURL((e.target as HTMLInputElement).files![0]);
                              }
                            }}
                          />
                        </Form.Group>
                      </>
                    )}
                  </div>
                </Tab>
                
                <Tab eventKey="colors" title="Colors">
                  <div className="p-3">
                    <Form.Group className="mb-3">
                      <Form.Label>Website Color Scheme</Form.Label>
                      <ColorPicker
                        index={0}
                        formData={{
                          colorScheme: colorScheme,
                          businessType: '',
                          address: '',
                          phone: '',
                          email: ''
                        }}
                        setFormData={(updater) => {
                          const updatedFormData = updater({
                            colorScheme: colorScheme,
                            businessType: '',
                            address: '',
                            phone: '',
                            email: ''
                          });
                          if (updatedFormData.colorScheme) {
                            handleColorChange(updatedFormData.colorScheme);
                          }
                        }}
                      />
                    </Form.Group>
                  </div>
                </Tab>
              </Tabs>
            </Card.Header>
          </Card>
        </Col>
      </Row>
    </div>
  );
};