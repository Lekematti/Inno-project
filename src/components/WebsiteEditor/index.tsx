'use client'
import { useState, useEffect } from 'react'
import { Alert } from 'react-bootstrap'
import {
  usePageRefreshHandler,
  clearFormData,
} from '@/hooks/usePageRefreshHandler'
import { WebsiteEditorProps } from './EditableElement'
import { useEditableContent } from './hooks/useEditableContent'
import EditorPreview from './components/EditorPreview'
import EditorToolbar from './components/EditorToolbar'
import { EditPanel } from './components/EditPanel'
import ImageModal from './components/ImageModal'
import ServiceModal from './components/ServiceModal'

export const WebsiteEditor: React.FC<WebsiteEditorProps> = ({
  htmlContent,
  originalHtml,
  onSave,
}) => {
  // Use originalHtml if provided, otherwise use htmlContent
  const [editableHtml, setEditableHtml] = useState<string>(htmlContent)

  // Store the original HTML for reset functionality
  const [initialHtml, setInitialHtml] = useState<string>(
    originalHtml ?? htmlContent
  )

  // Content state
  const {
    editableElements,
    setEditableElements,
    findElementByPath,
    selectedElement,
    setSelectedElement,
    updateContent,
  } = useEditableContent(htmlContent, editableHtml, setEditableHtml)

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

  // UI state
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

  // Function to handle refresh
  const handleRefresh = () => {
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
  }

  // Function to preview the website in a new tab
  const previewFullWebsite = () => {
    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.open()
      newWindow.document.body.innerHTML = editableHtml
      newWindow.document.close()
      newWindow.document.close()
    }
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

  // Handlers for service container selected
  const handleServiceContainerSelect = (id: string) => {
    setSelectedServiceContainer(id)
    setShowAddServiceModal(true)
  }

  return (
    <div className="website-editor">
      <button
        className="btn btn-success mb-3"
        onClick={() => {
          clearFormData() // Clear form-related localStorage
          // Force navigation to /build page using window.location
          // This works even if we're in an iframe context
          window.location.href = '/build'
        }}
      >
        Back to form
      </button>

      <EditorToolbar
        handleRefresh={handleRefresh}
        previewFullWebsite={previewFullWebsite}
        handleSave={handleSave}
        setShowAddImageModal={setShowAddImageModal}
      />

      <div className="row g-3">
        <div className="col-lg-8">
          {/* Preview with editable content */}
          <EditorPreview
            editableHtml={editableHtml}
            setIframeRef={setIframeRef}
            iframeRef={iframeRef}
            showTips={showTips}
            setShowTips={setShowTips}
            editableElements={editableElements}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            setShowEditPanel={setShowEditPanel}
          />

          {/* Status and save button */}
          <div className="d-flex justify-content-between align-items-center">
            <div>
              {selectedElement ? (
                <span className="bg-light px-3 py-1 rounded">
                  <i className="bi bi-pencil-square me-1"></i>
                  Editing: {selectedElementData?.displayName}
                  <button
                    className="btn btn-link p-0 ms-2"
                    onClick={() => {
                      setSelectedElement(null)
                      setShowEditPanel(false)
                    }}
                  >
                    <small>cancel</small>
                  </button>
                </span>
              ) : (
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>Click elements to
                  edit
                </small>
              )}
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
        </div>

        <div className="col-lg-4">
          {/* Edit panel */}
          {selectedElement && showEditPanel ? (
            <EditPanel
              selectedElementData={selectedElementData}
              selectedElement={selectedElement}
              updateContent={updateContent}
              setSelectedElement={setSelectedElement}
              setShowEditPanel={setShowEditPanel}
              handleServiceContainerSelect={handleServiceContainerSelect}
            />
          ) : (
            <div className="card mb-3">
              <div className="card-header bg-light py-2">
                <i className="bi bi-lightbulb me-2"></i>How to Edit
              </div>
              <div className="card-body p-3">
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
              </div>
            </div>
          )}

          {/* Quick help card */}
          <div className="card">
            <div className="card-header bg-light py-2 d-flex justify-content-between align-items-center">
              <span>
                <i className="bi bi-question-circle me-2"></i>Editing Help
              </span>
              {!showTips && (
                <button
                  className="btn btn-link p-0"
                  onClick={() => setShowTips(true)}
                >
                  <small>
                    <i className="bi bi-info-circle"></i> Show tips
                  </small>
                </button>
              )}
            </div>
            <div className="card-body p-3">
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
            </div>
          </div>
        </div>
      </div>

      {/* Modal for adding new images */}
      <ImageModal
        showAddImageModal={showAddImageModal}
        setShowAddImageModal={setShowAddImageModal}
        newImageSrc={newImageSrc}
        setNewImageSrc={setNewImageSrc}
        imageInsertLocation={imageInsertLocation}
        setImageInsertLocation={setImageInsertLocation}
        addNewImage={addNewImage}
      />

      {/* Modal for adding new service */}
      <ServiceModal
        showAddServiceModal={showAddServiceModal}
        setShowAddServiceModal={setShowAddServiceModal}
        serviceIcon={serviceIcon}
        setServiceIcon={setServiceIcon}
        serviceTitle={serviceTitle}
        setServiceTitle={setServiceTitle}
        serviceDescription={serviceDescription}
        setServiceDescription={setServiceDescription}
        addNewServiceItem={addNewServiceItem}
      />
    </div>
  )
}

export default WebsiteEditor
