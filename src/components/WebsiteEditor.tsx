'use client'
import { useState, useEffect } from 'react'
import { Button, Form, Card, Alert, Row, Col } from 'react-bootstrap'
import Image from 'next/image'

interface WebsiteEditorProps {
  htmlContent: string
  onSave: (updatedHtml: string) => void
  standaloneHtml: string
}

export const WebsiteEditor: React.FC<WebsiteEditorProps> = ({
  htmlContent,
  onSave,
  standaloneHtml,
}) => {
  // Initialize with either HTML content
  const [editableHtml, setEditableHtml] = useState<string>(htmlContent)

  // Add a function to preview the standalone HTML
  const previewFullWebsite = () => {
    const blob = new Blob([standaloneHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    // Clean up the URL object when done
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  // Rest of your component remains the same
  interface EditableElement {
    id: string
    content: string
    type: 'text' | 'image'
    element?: string // For text elements
    alt?: string // For image elements
    displayName: string
  }

  const [editableElements, setEditableElements] = useState<EditableElement[]>(
    []
  )
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [showTips, setShowTips] = useState<boolean>(true)
  const [showEditPanel, setShowEditPanel] = useState<boolean>(false)

  // Extract editable elements
  useEffect(() => {
    if (htmlContent) {
      setEditableHtml(htmlContent)
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')

      const textElements = Array.from(
        doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span.editable')
      ).map<EditableElement>((el, index) => ({
        id: `text-${index}`,
        content: el.textContent ?? '',
        type: 'text',
        element: el.tagName.toLowerCase(),
        displayName: `${el.tagName.toLowerCase()}: ${(
          el.textContent ?? ''
        ).substring(0, 20)}...`,
      }))

      const imgElements = Array.from(doc.querySelectorAll('img')).map(
        (el, index): EditableElement => ({
          id: `img-${index}`,
          content: el.getAttribute('src') ?? '',
          type: 'image',
          alt: el.getAttribute('alt') ?? '',
          displayName: el.getAttribute('alt') ?? `Image ${index + 1}`,
        })
      )

      setEditableElements([...textElements, ...imgElements])
    }
  }, [htmlContent])

  // Update iframe and add click handlers
  useEffect(() => {
    if (iframeRef) {
      const doc = iframeRef.contentDocument
      if (doc) {
        doc.open()
        doc.write(editableHtml)
        doc.close()

        // Add styles
        const style = doc.createElement('style')
        style.textContent = `
          .editable-highlight { cursor:pointer; position:relative; transition:all 0.2s; }
          .text-element { outline:1px dashed rgba(92,124,250,0.5); }
          .text-element:hover { outline:2px dashed #5c7cfa; background:rgba(92,124,250,0.1); }
          .image-element { outline:1px dashed rgba(92,124,250,0.5); }
          .image-element:hover { outline:2px dashed #5c7cfa; filter:brightness(1.05); }
          .active-element { outline:2px solid #0d6efd !important; box-shadow:0 0 0 4px rgba(13,110,253,0.25); }
          .editable-highlight:hover::before {
            content:"Click to edit"; position:absolute; top:-30px; left:50%; transform:translateX(-50%);
            background:#0d6efd; color:white; padding:3px 8px; border-radius:4px; font-size:12px;
            white-space:nowrap; z-index:1000; pointer-events:none; opacity:0.9;
          }
        `
        doc.head.appendChild(style)

        // Add handlers to text elements
        editableElements
          .filter((el) => el.type === 'text')
          .forEach((element, index) => {
            const elements = Array.from(
              doc.querySelectorAll(element.element ?? 'p')
            )
            if (elements[index]) {
              const el = elements[index]
              el.classList.add('editable-highlight', 'text-element')
              if (selectedElement === element.id)
                el.classList.add('active-element')
              el.addEventListener('click', (e) => {
                e.preventDefault()
                setSelectedElement(element.id)
                setShowEditPanel(true)
              })
            }
          })

        // Add handlers to image elements
        editableElements
          .filter((el) => el.type === 'image')
          .forEach((element, index) => {
            const images = Array.from(doc.querySelectorAll('img'))
            if (images[index]) {
              const img = images[index]
              img.classList.add('editable-highlight', 'image-element')
              if (selectedElement === element.id)
                img.classList.add('active-element')
              img.addEventListener('click', (e) => {
                e.preventDefault()
                setSelectedElement(element.id)
                setShowEditPanel(true)
              })
            }
          })
      }
    }
  }, [editableHtml, iframeRef, editableElements, selectedElement])

  // Update content functions
  const updateContent = (
    elementId: string,
    newContent: string,
    type = 'text'
  ) => {
    // Update state
    setEditableElements((prev) =>
      prev.map((el) =>
        el.id === elementId ? { ...el, content: newContent } : el
      )
    )

    // Update HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(editableHtml, 'text/html')
    const elementIndex = parseInt(elementId.split('-')[1], 10)

    if (type === 'text') {
      const elements = Array.from(
        doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span.editable')
      )
      if (elements[elementIndex])
        elements[elementIndex].textContent = newContent
    } else if (type === 'image') {
      const images = Array.from(doc.querySelectorAll('img'))
      if (images[elementIndex]) {
        // Log before update
        console.log(
          `Updating image ${elementIndex} from:`,
          images[elementIndex].getAttribute('src'),
          'to:',
          newContent
        )

        // Set the new source
        images[elementIndex].setAttribute('src', newContent)

        // For displaying images in the editor iframe, update paths for different image types
        if (newContent.startsWith('data:image')) {
          // Base64 images can be used directly
        } else if (newContent.startsWith('/api/images/')) {
          // Already using the API route
        } else if (
          !newContent.startsWith('http') &&
          !newContent.startsWith('/')
        ) {
          // Convert relative paths to use API route
          const imageFilename = newContent.split('/').pop()
          if (imageFilename) {
            images[elementIndex].setAttribute(
              'src',
              `/api/images/${imageFilename}`
            )
          }
        }
      }
    }

    setEditableHtml(doc.documentElement.outerHTML)
  }

  // Handle save
  const handleSave = () => {
    try {
      onSave(editableHtml)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setErrorMessage('Failed to save changes. Please try again.')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  // Get selected element data
  const selectedElementData = editableElements.find(
    (el) => el.id === selectedElement
  )

  return (
    <div className="website-editor">
      <Row className="g-3">
        <Col lg={8}>
          {/* Preview with editable content */}
          <div className="position-relative mb-3">
            {showTips && (
              <div className="position-absolute top-0 start-0 end-0 p-2 bg-info bg-opacity-10 text-center rounded-top d-flex justify-content-between align-items-center">
                <span>Click on any text or image to edit it</span>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0"
                  onClick={() => setShowTips(false)}
                >
                  <small>×</small>
                </Button>
              </div>
            )}

            <div
              style={{
                height: '550px',
                border: '1px solid #dee2e6',
                borderTopLeftRadius: showTips ? '0' : '0.25rem',
                borderTopRightRadius: showTips ? '0' : '0.25rem',
              }}
            >
              <iframe
                ref={(ref) => setIframeRef(ref)}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Website Preview"
              />
            </div>
          </div>

          {/* Status and save button */}
          <div className="d-flex justify-content-between align-items-center">
            <div>
              {selectedElement ? (
                <span className="bg-light px-3 py-1 rounded">
                  <i className="bi bi-pencil-square me-1"></i>
                  Editing: {selectedElementData?.displayName}
                  <Button
                    variant="link"
                    className="p-0 ms-2"
                    onClick={() => {
                      setSelectedElement(null)
                      setShowEditPanel(false)
                    }}
                  >
                    <small>cancel</small>
                  </Button>
                </span>
              ) : (
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>Click elements to
                  edit
                </small>
              )}
            </div>

            <div>
              <Button
                variant="outline-secondary"
                size="sm"
                className="me-2"
                onClick={previewFullWebsite}
              >
                <i className="bi bi-eye me-1"></i> Preview Full Site
              </Button>

              <Button variant="primary" onClick={handleSave}>
                <i className="bi bi-save me-1"></i> Save Changes
              </Button>
            </div>
          </div>

          {/* Status messages */}
          {saveSuccess && (
            <Alert variant="success" className="mt-2 py-2">
              <i className="bi bi-check-circle-fill me-2"></i>Changes saved!
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="danger" className="mt-2 py-2">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {errorMessage}
            </Alert>
          )}
        </Col>

        <Col lg={4}>
          {/* Edit panel */}
          {selectedElement && showEditPanel ? (
            <Card className="mb-3">
              <Card.Header className="bg-primary text-white py-2">
                <i className="bi bi-pencil me-2"></i>
                {selectedElementData?.type === 'text'
                  ? 'Edit Text'
                  : 'Edit Image'}
              </Card.Header>

              <Card.Body className="p-3">
                {selectedElementData?.type === 'text' && (
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={Math.min(
                        8,
                        Math.max(3, selectedElementData.content.length / 80 + 2)
                      )}
                      value={selectedElementData?.content ?? ''}
                      onChange={(e) =>
                        updateContent(selectedElement, e.target.value)
                      }
                      className="mb-2"
                    />
                    <div className="d-flex justify-content-between align-items-center">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => {
                          setSelectedElement(null)
                          setShowEditPanel(false)
                        }}
                      >
                        Done
                      </Button>
                      <small className="text-muted">
                        Changes appear as you type
                      </small>
                    </div>
                  </Form.Group>
                )}

                {selectedElementData?.type === 'image' && (
                  <>
                    <div className="text-center mb-2 border rounded bg-light p-2">
                      <Image
                        src={selectedElementData.content || '/placeholder.png'}
                        alt={selectedElementData.alt ?? 'Preview'}
                        width={150}
                        height={100}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '150px',
                          objectFit: 'contain',
                        }}
                        unoptimized
                      />
                    </div>

                    <Form.Group className="mb-2">
                      <Form.Label className="small fw-bold mb-1">
                        Upload image:
                      </Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        size="sm"
                        onChange={(e) => {
                          const target = e.target as HTMLInputElement
                          if (target.files?.[0]) {
                            const reader = new FileReader()
                            reader.onload = (event) => {
                              if (event.target?.result && selectedElement) {
                                updateContent(
                                  selectedElement,
                                  event.target.result as string,
                                  'image'
                                )
                              }
                            }
                            reader.readAsDataURL(
                              (e.target as HTMLInputElement).files![0]
                            )
                          }
                        }}
                      />
                    </Form.Group>

                    <div className="text-center small my-2">- or -</div>

                    <Form.Group className="mb-2">
                      <Form.Label className="small fw-bold mb-1">
                        Image URL:
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        size="sm"
                        value={selectedElementData.content}
                        onChange={(e) =>
                          updateContent(
                            selectedElement,
                            e.target.value,
                            'image'
                          )
                        }
                      />
                    </Form.Group>

                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="mt-1"
                      onClick={() => {
                        setSelectedElement(null)
                        setShowEditPanel(false)
                      }}
                    >
                      Done
                    </Button>
                  </>
                )}
              </Card.Body>
            </Card>
          ) : (
            <Card className="mb-3">
              <Card.Header className="bg-light py-2">
                <i className="bi bi-lightbulb me-2"></i>How to Edit
              </Card.Header>
              <Card.Body className="p-3">
                <ol className="mb-2 ps-3 small">
                  <li className="mb-1">
                    <strong>Click</strong> on any text or image
                  </li>
                  <li className="mb-1">
                    <strong>Edit</strong> in the panel that appears
                  </li>
                  <li>
                    <strong>Save</strong> when you&apos;re finished
                  </li>
                </ol>
                <div className="bg-light p-2 rounded small">
                  <i className="bi bi-info-circle me-1"></i>Hover over elements
                  to see what you can edit
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Quick help card */}
          <Card>
            <Card.Header className="bg-light py-2 d-flex justify-content-between align-items-center">
              <span>
                <i className="bi bi-question-circle me-2"></i>Help
              </span>
              {!showTips && (
                <Button
                  variant="link"
                  className="p-0"
                  onClick={() => setShowTips(true)}
                >
                  <small>
                    <i className="bi bi-info-circle"></i> Show tips
                  </small>
                </Button>
              )}
            </Card.Header>
            <Card.Body className="p-3">
              <div className="small">
                <p className="mb-1">
                  <strong>Edit text:</strong> Click any text in the preview
                </p>
                <p className="mb-1">
                  <strong>Change images:</strong> Click any image to replace it
                </p>
                <p className="mb-0">
                  <strong>Save changes:</strong> Click &quot;Save Changes&quot;
                  when done
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
