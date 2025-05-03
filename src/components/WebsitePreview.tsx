'use client'
import { useEffect, useState, useRef } from 'react'
import { AiGenComponent } from './AiGenComponent'
import { Spinner, Alert, Button } from 'react-bootstrap'
import { DownloadSection } from '@/app/build/components/UIHelpers'
import {
  WebsitePreviewProps,
  ElementEditRequest,
  ElementEditInstructions,
} from '@/types/formData'
import { clearFormData } from '../functions/usePageRefreshHandler' // <-- Add this import
import { EditModeOverlay } from './EditModeOverlay'
import { EditElementForm } from './EditElementForm'

export const WebsitePreview: React.FC<WebsitePreviewProps> = ({
  isLoading,
  isReady,
  generatedHtml,
  error,
  formData,
  onEditElement,
  onUpdateGeneratedHtml,
  loadingComponent, // New prop for custom loading indicator
}) => {
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [isRendering, setIsRendering] = useState<boolean>(false)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [selectedElement, setSelectedElement] =
    useState<ElementEditRequest | null>(null)
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false)
  const iframeRef = useRef<HTMLIFrameElement>(
    null
  ) as React.RefObject<HTMLIFrameElement>

  useEffect(() => {
    // Reset error state when new content arrives
    if (generatedHtml) {
      setPreviewError(null)
      // Set a rendering state to help with potential timing issues
      setIsRendering(true)
      const timer = setTimeout(() => setIsRendering(false), 500)
      return () => clearTimeout(timer)
    }
  }, [generatedHtml])

  // Handle edge case where htmlContent exists but has issues
  const handleRenderingError = (err: string) => {
    console.error('Rendering error:', err)
    setPreviewError(err)
  }

  const handleElementSelect = (element: ElementEditRequest) => {
    setSelectedElement(element)
  }

  const handleEditSave = async (instructions: ElementEditInstructions) => {
    setIsSubmittingEdit(true)
    try {
      if (onEditElement) {
        await onEditElement(instructions, formData)
        // Successfully edited and saved - reset UI state
        setSelectedElement(null)
      }
    } catch (err) {
      console.error('Error applying edits:', err)
      setPreviewError(
        `Failed to apply edits: ${
          err instanceof Error ? err.message : String(err)
        }`
      )
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  const toggleEditMode = () => {
    setEditMode(!editMode)
    // Reset selected element when toggling edit mode
    if (selectedElement) {
      setSelectedElement(null)
    }
  }

  const handleDirectEditDomUpdate = (
    elementPath: string,
    content: string,
    attributes: Record<string, string>
  ) => {
    const iframe = iframeRef.current
    if (!iframe) return
    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) return

    try {
      const el = doc.querySelector(elementPath)
      if (el) {
        // Update attributes (style, class, etc.)
        Object.entries(attributes).forEach(([key, value]) => {
          if (key === 'style') {
            el.setAttribute('style', value)
          } else if (key === 'class') {
            el.setAttribute('class', value)
          } else if (value) {
            el.setAttribute(key, value)
          } else {
            el.removeAttribute(key)
          }
        })

        // Only update text if it has changed
        if (typeof content === 'string' && content.trim() !== '') {
          // If the element has no child elements, update textContent
          if (!el.children || el.children.length === 0) {
            el.textContent = content
          } else {
            // If the element has children, only update the first text node
            let textNodeFound = false
            el.childNodes.forEach((node) => {
              if (node.nodeType === Node.TEXT_NODE && !textNodeFound) {
                node.textContent = content
                textNodeFound = true
              }
            })
            // If no text node found, optionally insert one at the start
            if (!textNodeFound) {
              el.insertBefore(doc.createTextNode(content), el.firstChild)
            }
          }
        }
        // Update the HTML in parent state
        if (typeof onUpdateGeneratedHtml === 'function') {
          onUpdateGeneratedHtml(doc.documentElement.outerHTML)
        }
      }
    } catch (err) {
      console.error('Failed to update element in iframe:', err)
    }
  }

  if (isLoading) {
    // Use custom loading component if provided, otherwise use default
    return loadingComponent || (
      <div className="d-flex flex-column align-items-center justify-content-center p-5">
        <output className="spinner-border">
          <Spinner animation="border" variant="primary" />
        </output>
        <p className="mt-3">Generating your custom website...</p>
      </div>
    )
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>
  }

  if (previewError) {
    return (
      <Alert variant="warning">
        <h5>Preview Error</h5>
        <p>{previewError}</p>
        <div className="mt-3">
          <small>
            You can still download the HTML even though it can&apos;t be
            previewed.
          </small>
          {generatedHtml && (
            <div className="mt-2">
              <DownloadSection
                generatedHtml={generatedHtml}
                formData={formData}
              />
            </div>
          )}
        </div>
        <button
          className="btn btn-success mt-3"
          onClick={() => {
            clearFormData()
            window.location.href = '/build'
          }}
        >
          Back to form
        </button>
      </Alert>
    )
  }

  if (isReady && generatedHtml) {
    return (
      <>
        <button
          className="btn btn-success mb-3"
          onClick={() => {
            clearFormData()
            window.location.href = '/build'
          }}
        >
          Back to form
        </button>

        {isRendering ? (
          <div className="text-center p-3">
            <Spinner animation="border" size="sm" />
            <span className="ms-2">Rendering preview...</span>
          </div>
        ) : null}

        <div className="d-flex justify-content-end mb-2">
          <Button
            variant={editMode ? 'warning' : 'outline-primary'}
            size="sm"
            onClick={toggleEditMode}
            className="d-flex align-items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-pencil-square me-1"
              viewBox="0 0 16 16"
            >
              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
              <path
                fillRule="evenodd"
                d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
              />
            </svg>
            {editMode ? 'Exit Edit Mode' : 'Edit Website'}
          </Button>
        </div>

        <div
          className="preview-container position-relative"
          style={{
            height: '70vh',
            width: '100%',
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
          }}
        >
          <AiGenComponent
            htmlContent={generatedHtml}
            onError={handleRenderingError}
            editMode={editMode}
            ref={iframeRef}
          />

          {editMode && (
            <EditModeOverlay
              isActive={editMode}
              onExit={toggleEditMode}
              onElementSelect={handleElementSelect}
              iframeRef={iframeRef}
            />
          )}
        </div>

        {selectedElement && (
          <EditElementForm
            editRequest={selectedElement}
            onClose={() => setSelectedElement(null)}
            onSave={handleEditSave}
            isSubmitting={isSubmittingEdit}
            onDirectEditDomUpdate={handleDirectEditDomUpdate} // <-- Add this prop
          />
        )}

        <div className="mt-4">
          <DownloadSection generatedHtml={generatedHtml} formData={formData} />
        </div>
      </>
    )
  }

  return (
    <div className="text-center p-5">
      <p>Waiting to generate your website...</p>
    </div>
  )
}
