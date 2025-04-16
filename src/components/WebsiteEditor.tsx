'use client'
import { useState, useEffect, useCallback } from 'react'
import { Button, Form, Card, Alert, Row, Col, Modal } from 'react-bootstrap'
import Image from 'next/image'
import { usePageRefreshHandler } from '@/hooks/usePageRefreshHandler'

interface WebsiteEditorProps {
  htmlContent: string
  originalHtml?: string
  onSave: (updatedHtml: string) => void
  standaloneHtml: string
}

export const WebsiteEditor: React.FC<WebsiteEditorProps> = ({
  htmlContent,
  originalHtml,
  onSave,
}) => {
  // Use originalHtml if provided, otherwise use htmlContent
  const [editableHtml, setEditableHtml] = useState<string>(htmlContent)

  // Store the original HTML for reset functionality
  const [initialHtml, setInitialHtml] = useState<string>(
    originalHtml || htmlContent
  )

  // Add the page refresh handler
  const { clearSavedContent } = usePageRefreshHandler({
    currentContent: editableHtml,
    referenceContent: initialHtml,
    storageKey: `website-editor-${btoa(initialHtml.substring(0, 50)).replace(
      /[+/=]/g,
      ''
    )}`,
    onRestore: (savedContent) => {
      setEditableHtml(savedContent)
    },
  })

  // Interface definition
  interface EditableElement {
    id: string
    content: string
    type: 'text' | 'image' | 'backgroundImage' | 'serviceContainer'
    element?: string
    alt?: string
    displayName: string
    selector?: string
    path?: string
  }

  // Component state
  const [editableElements, setEditableElements] = useState<EditableElement[]>(
    []
  )
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [showTips, setShowTips] = useState<boolean>(true)
  const [showEditPanel, setShowEditPanel] = useState<boolean>(false)

  // Image handling state
  const [showAddImageModal, setShowAddImageModal] = useState(false)
  const [imageInsertLocation, setImageInsertLocation] = useState('')
  const [newImageSrc, setNewImageSrc] = useState('')

  // Service handling state
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [serviceIcon, setServiceIcon] = useState('bi-box-seam')
  const [serviceTitle, setServiceTitle] = useState('')
  const [serviceDescription, setServiceDescription] = useState('')
  const [selectedServiceContainer, setSelectedServiceContainer] = useState<
    string | null
  >(null)

  // When initializing, store the original HTML
  useEffect(() => {
    if (originalHtml) {
      setInitialHtml(originalHtml)
    }
  }, [originalHtml])

  // Function to handle refresh - KEEP THIS ONE DEFINITION
  const handleRefresh = useCallback(() => {
    // Confirm with user before reverting changes
    if (editableHtml !== initialHtml) {
      const confirmRefresh = window.confirm(
        'This will reset all your changes to the original generated page. Continue?'
      )
      if (!confirmRefresh) return
    }

    // Reset to original HTML
    setEditableHtml(initialHtml)
    setSelectedElement(null)
    setShowEditPanel(false)

    // Feedback message
    setSaveSuccess(false)
    setErrorMessage('')
    const tempMessage = document.createElement('div')
    tempMessage.className = 'refresh-message'
    tempMessage.textContent = 'Page refreshed to original state'
    document.body.appendChild(tempMessage)
    setTimeout(() => document.body.removeChild(tempMessage), 2000)
  }, [initialHtml, editableHtml])

  // Function to preview the website in a new tab
  const previewFullWebsite = useCallback(() => {
    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(editableHtml)
      newWindow.document.close()
    }
  }, [editableHtml])

  // Extract editable elements with better identification
  useEffect(() => {
    if (htmlContent) {
      setEditableHtml(htmlContent)
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')

      // Find all text elements with meaningful content
      const textElements = Array.from(
        doc.querySelectorAll(
          'p, h1, h2, h3, h4, h5, h6, li, span, div, a, button, label'
        )
      )
        .filter((el) => el.textContent && el.textContent.trim().length > 0)
        .map((el): EditableElement => {
          // Generate a unique ID for each element based on content and position
          const path = generateElementPath(el)
          return {
            id: `text-${path}`,
            content: el.textContent ?? '',
            type: 'text',
            element: el.tagName.toLowerCase(),
            path: path,
            displayName: `${el.tagName.toLowerCase()}: ${(
              el.textContent ?? ''
            ).substring(0, 20)}${
              (el.textContent?.length ?? 0) > 20 ? '...' : ''
            }`,
          }
        })

      // Find all image elements
      const imgElements = Array.from(doc.querySelectorAll('img')).map(
        (el): EditableElement => {
          const path = generateElementPath(el)
          return {
            id: `img-${path}`,
            content: el.getAttribute('src') ?? '',
            type: 'image',
            path: path,
            alt: el.getAttribute('alt') ?? '',
            displayName: el.getAttribute('alt') ?? `Image at ${path}`,
          }
        }
      )

      // Find elements with background images in inline styles
      const bgImageElements = Array.from(doc.querySelectorAll('*'))
        .filter((el) => {
          const style = el.getAttribute('style')
          return (
            style &&
            style.includes('background-image') &&
            style.includes('url(')
          )
        })
        .map((el): EditableElement => {
          const path = generateElementPath(el)
          const style = el.getAttribute('style') ?? ''
          const regex = /background-image:\s*url\(['"]?([^'"]+)['"]?\)/
          const urlMatch = regex.exec(style)
          const imageUrl = urlMatch ? urlMatch[1] : ''
          return {
            id: `bg-${path}`,
            content: imageUrl,
            type: 'backgroundImage',
            element: el.tagName.toLowerCase(),
            path: path,
            selector: generateUniqueSelector(el as HTMLElement),
            displayName: `Background: ${el.tagName.toLowerCase()}${
              el.className ? '.' + el.className.replace(/\s+/g, '.') : ''
            }`,
          }
        })

      // Add detection for service container sections
      const serviceContainers = Array.from(
        doc.querySelectorAll(
          '#services .row, .services-row, .service-container'
        )
      ).map((el): EditableElement => {
        const path = generateElementPath(el)
        return {
          id: `service-container-${path}`,
          content: 'Service Section',
          type: 'serviceContainer',
          element: el.tagName.toLowerCase(),
          path: path,
          displayName: 'Services Container',
        }
      })

      setEditableElements([
        ...textElements,
        ...imgElements,
        ...bgImageElements,
        ...serviceContainers,
      ])
    }
  }, [htmlContent])

  // Function to generate a unique CSS selector for an element
  const generateUniqueSelector = (element: HTMLElement): string => {
    if (element.id) {
      return `#${element.id}`
    }

    if (element.className) {
      const classes = element.className.trim().split(/\s+/)
      if (classes.length > 0) {
        // Process the first class if needed
      }
    }

    // Add a data attribute to make it uniquely identifiable
    const uniqueId = `editable-${Math.random().toString(36).substring(2, 9)}`
    element.setAttribute('data-edit-id', uniqueId)

    return `[data-edit-id="${uniqueId}"]`
  }

  // Function to generate a unique path for an element
  const generateElementPath = (element: Element): string => {
    const path: string[] = []
    let current = element

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let selector = current.nodeName.toLowerCase()

      // Add ID if available
      if (current.id) {
        selector += '#' + current.id
      }
      // Otherwise add position among siblings
      else {
        let sibling = current.previousElementSibling
        let index = 0
        while (sibling) {
          if (sibling.nodeName === current.nodeName) {
            index++
          }
          sibling = sibling.previousElementSibling
        }
        selector += `:nth-of-type(${index + 1})`
      }
      path.unshift(selector)
      current = current.parentElement as Element
    }

    // Hash the path for shorter IDs
    return btoa(path.join('>')).replace(/[+/=]/g, '').substring(0, 12)
  }

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
          .bg-image-element { outline:1px dashed rgba(250,92,92,0.5); }
          .bg-image-element:hover { outline:2px dashed #fa5c5c; background:rgba(250,92,92,0.1); }
          .service-container-element { outline:1px dashed rgba(75,181,67,0.5); }
          .service-container-element:hover { outline:2px dashed #4bb543; background:rgba(75,181,67,0.1); }
          .active-element { outline:2px solid #0d6efd !important; box-shadow:0 0 0 4px rgba(13,110,253,0.25); }
          .editable-highlight::before {
            content:"Click to edit"; position:absolute; top:-30px; left:50%; transform:translateX(-50%);
            background:#0d6efd; color:white; padding:3px 8px; border-radius:4px; font-size:12px;
            white-space:nowrap; z-index:1000; pointer-events:none; opacity:0; transition: opacity 0.2s;
          }
          .service-container-element::before {
            content:"Service container - Click to add services"; 
          }
          .editable-highlight:hover::before {
            opacity:0.9;
          }
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(-20px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
          }
          
          .refresh-message {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #198754;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            animation: fadeInOut 2s ease-in-out forwards;
          }
        `
        doc.head.appendChild(style)

        // Add handlers to text elements
        editableElements
          .filter((el) => el.type === 'text')
          .forEach((element) => {
            try {
              // Find element by path instead of index
              const path = element.path
              if (!path) return

              const el = findElementByPath(doc, element)

              if (el) {
                el.classList.add('editable-highlight', 'text-element')
                if (selectedElement === element.id)
                  el.classList.add('active-element')
                el.addEventListener('click', (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelectedElement(element.id)
                  setShowEditPanel(true)
                })
              }
            } catch (err) {
              console.error('Error adding handler to text element:', err)
            }
          })

        // Add handlers to image elements
        editableElements
          .filter((el) => el.type === 'image')
          .forEach((element) => {
            try {
              const el = findElementByPath(doc, element)
              if (el) {
                el.classList.add('editable-highlight', 'image-element')
                if (selectedElement === element.id)
                  el.classList.add('active-element')
                el.addEventListener('click', (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelectedElement(element.id)
                  setShowEditPanel(true)
                })
              }
            } catch (err) {
              console.error('Error adding handler to image element:', err)
            }
          })

        // Add handlers to background image elements
        editableElements
          .filter((el) => el.type === 'backgroundImage')
          .forEach((element) => {
            try {
              if (element.selector) {
                const el = doc.querySelector(element.selector)
                if (el) {
                  el.classList.add('editable-highlight', 'bg-image-element')
                  if (selectedElement === element.id)
                    el.classList.add('active-element')
                  el.addEventListener('click', (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedElement(element.id)
                    setShowEditPanel(true)
                  })
                }
              }
            } catch (err) {
              console.error(
                'Error adding handler to background image element:',
                err
              )
            }
          })

        // Add handlers to service container elements
        editableElements
          .filter((el) => el.type === 'serviceContainer')
          .forEach((element) => {
            try {
              const el = findElementByPath(doc, element)
              if (el) {
                el.classList.add(
                  'editable-highlight',
                  'service-container-element'
                )
                if (selectedElement === element.id)
                  el.classList.add('active-element')

                el.addEventListener('click', (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelectedElement(element.id)
                  setSelectedServiceContainer(element.id)
                  setShowEditPanel(true)
                })
              }
            } catch (err) {
              console.error('Error adding handler to service container:', err)
            }
          })
      }
    }
  }, [editableHtml, iframeRef, editableElements, selectedElement])

  // Helper function to find an element by its path
  const findElementByPath = (
    doc: Document,
    element: EditableElement
  ): HTMLElement | null => {
    if (!element.path) return null

    // Try first with the selector if we have one
    if (element.selector) {
      try {
        const el = doc.querySelector(element.selector)
        if (el) return el as HTMLElement
      } catch (e) {
        console.error('Error with selector lookup:', e)
      }
    }

    // Otherwise use the ID to look up the element in our array
    const elementData = editableElements.find((el) => el.id === element.id)
    if (!elementData) return null

    // For text elements, we'll look up by content and tag
    if (element.type === 'text' && element.element) {
      const candidates = Array.from(
        doc.querySelectorAll(element.element)
      ).filter((el) => el.textContent?.trim() === elementData.content.trim())

      if (candidates.length === 1) {
        return candidates[0] as HTMLElement
      }
    }

    // For images, try src attribute
    if (element.type === 'image') {
      const imgUrl = elementData.content
      const candidates = Array.from(doc.querySelectorAll('img')).filter(
        (img) => img.getAttribute('src') === imgUrl
      )

      if (candidates.length === 1) {
        return candidates[0] as HTMLElement
      }
    }

    return null
  }

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

    // Get the element data
    const elementData = editableElements.find((el) => el.id === elementId)
    if (!elementData) return

    // Update HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(editableHtml, 'text/html')

    if (type === 'text') {
      // Find the element by its path/ID instead of index
      const element = findElementByPath(doc, elementData)
      if (element) {
        element.textContent = newContent
      }
    } else if (type === 'image') {
      // Find the element by its path/ID instead of index
      const element = findElementByPath(doc, elementData)
      if (element && element.tagName.toLowerCase() === 'img') {
        element.setAttribute('src', newContent)
      }
    } else if (type === 'backgroundImage') {
      // Find the element using the stored selector
      const element = doc.querySelector(elementData.selector || '')
      if (element) {
        const style = element.getAttribute('style') ?? ''

        // Update the background-image URL
        const newStyle = style.replace(
          /background-image:\s*url\(['"]?[^'"]+['"]?\)/,
          `background-image: url('${newContent}')`
        )

        element.setAttribute('style', newStyle)
      }
    }

    setEditableHtml(doc.documentElement.outerHTML)
  }

  // Function to add a new image
  const addNewImage = () => {
    if (!newImageSrc || !imageInsertLocation) return

    const parser = new DOMParser()
    const doc = parser.parseFromString(editableHtml, 'text/html')

    // Find the target element where we want to insert the image
    const targetElement = doc.querySelector(imageInsertLocation)
    if (!targetElement) return

    // Create a new image element
    const newImage = doc.createElement('img')
    newImage.src = newImageSrc
    newImage.alt = 'New image'
    newImage.className = 'img-fluid'

    // Insert the image
    targetElement.appendChild(newImage)

    // Update the HTML and refresh the editor
    setEditableHtml(doc.documentElement.outerHTML)

    // Update editable elements to include the new image
    const imgIndex = editableElements.filter((el) => el.type === 'image').length
    setEditableElements((prev) => [
      ...prev,
      {
        id: `img-${imgIndex}`,
        content: newImageSrc,
        type: 'image',
        alt: 'New image',
        displayName: `Image ${imgIndex + 1} (new)`,
      },
    ])

    // Reset form
    setShowAddImageModal(false)
    setNewImageSrc('')
  }

  // Function to add a new service item
  const addNewServiceItem = () => {
    if (!serviceTitle || !serviceDescription || !selectedServiceContainer)
      return

    const parser = new DOMParser()
    const doc = parser.parseFromString(editableHtml, 'text/html')

    // Find the service container element
    const containerData = editableElements.find(
      (el) => el.id === selectedServiceContainer
    )
    if (!containerData) return

    const container = findElementByPath(doc, containerData)
    if (!container) return

    // Create a new service column element
    const newServiceCol = doc.createElement('div')
    newServiceCol.className = 'col-md-4 text-center'

    // Service icon
    const iconElement = doc.createElement('i')
    iconElement.className = `bi ${serviceIcon}`
    iconElement.setAttribute('style', 'font-size: 2rem; color: #104159;')

    // Service title
    const titleElement = doc.createElement('h4')
    titleElement.textContent = serviceTitle

    // Service description
    const descElement = doc.createElement('p')
    descElement.textContent = serviceDescription

    // Add all elements to the new service column
    newServiceCol.appendChild(iconElement)
    newServiceCol.appendChild(titleElement)
    newServiceCol.appendChild(descElement)

    // Add the new service to the container
    container.appendChild(newServiceCol)

    // Update the HTML and refresh the editor
    setEditableHtml(doc.documentElement.outerHTML)

    // Reset form and close modal
    setServiceTitle('')
    setServiceDescription('')
    setServiceIcon('bi-box-seam')
    setShowAddServiceModal(false)
  }

  // Handle save
  const handleSave = () => {
    try {
      onSave(editableHtml)

      // Clear the saved content since we've officially saved
      clearSavedContent()

      // Update our reference point
      setInitialHtml(editableHtml)

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
                onClick={handleRefresh}
                title="Reset to original generated page"
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i> Reset to
                Original
              </Button>

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

          {/* Add new button for adding images */}
          <div className="mt-3 d-flex justify-content-between">
            <Button
              variant="outline-success"
              size="sm"
              onClick={() => setShowAddImageModal(true)}
            >
              <i className="bi bi-plus-circle me-1"></i> Add New Image
            </Button>

            <Button variant="primary" onClick={handleSave}>
              <i className="bi bi-save me-1"></i> Save Changes
            </Button>
          </div>

          {/* Modal for adding new images */}
          <Modal
            show={showAddImageModal}
            onHide={() => setShowAddImageModal(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Add New Image</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Upload image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement
                    if (target.files?.[0]) {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setNewImageSrc(event.target.result as string)
                        }
                      }
                      reader.readAsDataURL(target.files[0])
                    }
                  }}
                />
              </Form.Group>

              <div className="text-center my-2">- or -</div>

              <Form.Group className="mb-3">
                <Form.Label>Image URL</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={newImageSrc}
                  onChange={(e) => setNewImageSrc(e.target.value)}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Insert location</Form.Label>
                <Form.Select
                  value={imageInsertLocation}
                  onChange={(e) => setImageInsertLocation(e.target.value)}
                >
                  <option value="">Select where to add the image</option>
                  <option value="header">Header</option>
                  <option value=".container">Main container</option>
                  <option value="main">Main content</option>
                  <option value="section:first-of-type">First section</option>
                  <option value="section:last-of-type">Last section</option>
                  <option value="footer">Footer</option>
                </Form.Select>
              </Form.Group>

              {newImageSrc && (
                <div className="mt-3 text-center">
                  <p>
                    <strong>Preview:</strong>
                  </p>
                  <Image
                    src={newImageSrc || '/placeholder.png'}
                    alt="Preview"
                    width={200}
                    height={200}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain',
                    }}
                    unoptimized
                  />
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowAddImageModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={addNewImage}
                disabled={!newImageSrc || !imageInsertLocation}
              >
                Add Image
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Modal for adding new service */}
          <Modal
            show={showAddServiceModal}
            onHide={() => setShowAddServiceModal(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Add New Service</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Service Icon</Form.Label>
                <Form.Select
                  value={serviceIcon}
                  onChange={(e) => setServiceIcon(e.target.value)}
                >
                  <option value="bi-box-seam">Box (Warehousing)</option>
                  <option value="bi-truck">Truck (Transport)</option>
                  <option value="bi-globe">Globe (International)</option>
                  <option value="bi-graph-up">Graph (Analytics)</option>
                  <option value="bi-shield-check">Shield (Security)</option>
                  <option value="bi-clock-history">
                    Clock (Time-Critical)
                  </option>
                  <option value="bi-gear">Gear (Technical)</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Service Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Express Delivery"
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Service Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Describe your service in a few sentences..."
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                />
              </Form.Group>

              <div className="mt-3 p-3 bg-light rounded">
                <p className="fw-bold mb-2">Preview:</p>
                <div className="text-center p-3 border rounded">
                  <i
                    className={`bi ${serviceIcon}`}
                    style={{ fontSize: '2rem', color: '#104159' }}
                  ></i>
                  <h4>{serviceTitle || 'Service Title'}</h4>
                  <p>
                    {serviceDescription ||
                      'Service description will appear here.'}
                  </p>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowAddServiceModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={addNewServiceItem}
                disabled={!serviceTitle || !serviceDescription}
              >
                Add Service
              </Button>
            </Modal.Footer>
          </Modal>

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
              <Card.Header className="bg-primary text-white py-2 d-flex justify-content-between align-items-center">
                <div>
                  <i
                    className={`bi ${
                      selectedElementData?.type === 'text'
                        ? 'bi-pencil'
                        : selectedElementData?.type === 'image'
                        ? 'bi-image'
                        : 'bi-brush'
                    } me-2`}
                  ></i>
                  {selectedElementData?.type === 'text'
                    ? 'Edit Text'
                    : selectedElementData?.type === 'image'
                    ? 'Edit Image'
                    : selectedElementData?.type === 'backgroundImage'
                    ? 'Edit Background Image'
                    : 'Edit Service Container'}
                </div>
                <small className="text-white-50">
                  {selectedElementData?.element || selectedElementData?.type}
                </small>
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

                {selectedElementData?.type === 'backgroundImage' && (
                  <>
                    <div className="text-center mb-2 border rounded bg-light p-2">
                      <div
                        style={{
                          width: '100%',
                          height: '100px',
                          backgroundImage: `url(${
                            selectedElementData.content || '/placeholder.png'
                          })`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    </div>

                    <Form.Group className="mb-2">
                      <Form.Label className="small fw-bold mb-1">
                        Upload background image:
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
                                  'backgroundImage'
                                )
                              }
                            }
                            reader.readAsDataURL(target.files[0])
                          }
                        }}
                      />
                    </Form.Group>

                    <div className="text-center small my-2">- or -</div>

                    <Form.Group className="mb-2">
                      <Form.Label className="small fw-bold mb-1">
                        Background image URL:
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
                            'backgroundImage'
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

                {selectedElementData?.type === 'serviceContainer' && (
                  <>
                    <div className="text-center p-3 mb-3 bg-light rounded">
                      <p className="mb-1">
                        <i className="bi bi-grid me-2"></i>Service Container
                      </p>
                      <small className="text-muted">
                        This is a container for service items.
                      </small>
                    </div>

                    <Button
                      variant="success"
                      className="w-100 mb-3"
                      onClick={() => setShowAddServiceModal(true)}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Add New Service
                    </Button>

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
                <i className="bi bi-question-circle me-2"></i>Editing Help
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
                <p className="mb-1">
                  <strong>Edit backgrounds:</strong> Elements with background
                  images have red outlines
                </p>
                <p className="mb-1">
                  <strong>Add services:</strong> Click on the services container
                  (green outline)
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
