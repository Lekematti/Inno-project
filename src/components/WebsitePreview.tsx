'use client'
import { useEffect, useState, useCallback } from 'react'
import {
  Button,
  Tabs,
  Tab,
  Spinner,
  Alert,
  Card,
  Row,
  Col,
} from 'react-bootstrap'
import { AiGenComponent } from './AiGenComponent'
import { DownloadSection } from '@/app/build/components/UIHelpers'
import { WebsiteEditor } from './WebsiteEditor'
import { WebsitePreviewProps } from '@/types/formData'

export const WebsitePreview: React.FC<WebsitePreviewProps> = ({
  isLoading,
  isReady,
  generatedHtml,
  error,
  formData,
}) => {
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [isRendering, setIsRendering] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>('preview')
  const [updatedHtml, setUpdatedHtml] = useState<string>('')
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'success' | 'error'
  >('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState<boolean>(true)

  // Get file path from formData if available
  const filePath = formData?.filePath as string
  const standaloneHtml = formData?.standaloneHtml as string

  // Initialize content when generatedHtml changes
  useEffect(() => {
    if (generatedHtml) {
      setUpdatedHtml(generatedHtml)
      setPreviewError(null)
      setIsRendering(true)
      const timer = setTimeout(() => setIsRendering(false), 500)
      return () => clearTimeout(timer)
    }
  }, [generatedHtml])

  // Create and cleanup blob URL for preview in new tab
  useEffect(() => {
    if (standaloneHtml) {
      const blob = new Blob([standaloneHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)

      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [standaloneHtml])

  // Handle edge case where htmlContent exists but has issues
  const handleRenderingError = (err: string) => {
    console.error('Rendering error:', err)
    setPreviewError(err)
  }

  // Handle saving edited content
  const handleSave = useCallback(
    async (newHtmlContent: string) => {
      if (!filePath) {
        setSaveStatus('error')
        setPreviewError('Cannot save: Missing file path')
        return
      }

      try {
        setSaveStatus('saving')
        const response = await fetch('/api/generatePage', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            htmlContent: newHtmlContent,
            filePath,
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to save: ${response.statusText}`)
        }

        // Update the HTML content after saving
        setUpdatedHtml(newHtmlContent)
        setSaveStatus('success')

        // Reset status after a delay
        setTimeout(() => {
          setSaveStatus('idle')
        }, 3000)
      } catch (error) {
        console.error('Error saving website:', error)
        setSaveStatus('error')

        // Reset error status after a delay
        setTimeout(() => {
          setSaveStatus('idle')
        }, 3000)
      }
    },
    [filePath]
  )

  // Show loader while generating
  if (isLoading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center p-5">
        <output>
          <Spinner animation="border" variant="primary" />
        </output>
        <p className="mt-3">Generating your custom website...</p>
      </div>
    )
  }

  // Show error if there is one
  if (error) {
    return <Alert variant="danger">{error}</Alert>
  }

  // Show preview error if there is one
  if (previewError && activeTab === 'preview') {
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
                standaloneHtml={standaloneHtml}
                formData={formData}
              />
            </div>
          )}
        </div>
      </Alert>
    )
  }

  // Show the content if ready
  if (isReady && (generatedHtml || updatedHtml)) {
    return (
      <div className="website-preview-container">
        <Tabs
          activeKey={activeTab}
          onSelect={(key) => {
            setActiveTab(key ?? 'preview')
            if (key === 'editor') {
              // Show help by default when switching to editor
              setShowHelp(true)
            }
          }}
          className="mb-3"
        >
          <Tab eventKey="preview" title="Preview Your Website">
            {isRendering ? (
              <div className="text-center p-3">
                <Spinner animation="border" size="sm" />
                <span className="ms-2">Rendering preview...</span>
              </div>
            ) : null}
            <div
              className="preview-container"
              style={{
                height: '70vh',
                width: '100%',
                border: '1px solid #e0e0e0',
                overflow: 'hidden',
              }}
            >
              <AiGenComponent
                htmlContent={
                  activeTab === 'preview' ? generatedHtml : updatedHtml
                }
                onError={handleRenderingError}
              />
            </div>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                <Button
                  variant="primary"
                  onClick={() => {
                    setActiveTab('editor')
                    setShowHelp(true)
                  }}
                  className="me-2"
                >
                  <i className="bi bi-pencil-square me-1"></i> Customize Website
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={() =>
                    previewUrl && window.open(previewUrl, '_blank')
                  }
                  className="me-2"
                  disabled={!previewUrl}
                >
                  <i className="bi bi-box-arrow-up-right me-1"></i> Open in New
                  Tab
                </Button>
              </div>

              <Button
                variant="success"
                onClick={() => {
                  const blob = new Blob([standaloneHtml || generatedHtml], {
                    type: 'text/html',
                  })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'my-website.html'
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }}
              >
                <i className="bi bi-download me-1"></i> Download Website
              </Button>
            </div>
            {saveStatus === 'success' && (
              <Alert variant="success" className="mt-3">
                <i className="bi bi-check-circle-fill me-2"></i>
                Website saved successfully!
              </Alert>
            )}

            {saveStatus === 'error' && (
              <Alert variant="danger" className="mt-3">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Error saving website. Please try again.
              </Alert>
            )}
          </Tab>

          <Tab eventKey="editor" title="Edit & Customize">
            {showHelp && (
              <Card className="mb-3 border-info">
                <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
                  <div>
                    <i className="bi bi-info-circle me-2"></i> How to Edit Your
                    Website
                  </div>
                  <Button
                    variant="outline-light"
                    size="sm"
                    onClick={() => setShowHelp(false)}
                  >
                    Hide
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4} className="mb-3 mb-md-0">
                      <h5>1. Select What to Edit</h5>
                      <p>
                        Use the tabs above to edit text or images. Click on an
                        item from the dropdown menu to select it.
                      </p>
                    </Col>
                    <Col md={4} className="mb-3 mb-md-0">
                      <h5>2. Make Your Changes</h5>
                      <p>
                        Type new text or upload a new image. You&apos;ll see
                        your changes reflect in the preview.
                      </p>
                    </Col>
                    <Col md={4}>
                      <h5>3. Save Your Changes</h5>
                      <p>
                        When you&apos;re happy with your edits, click the
                        &quot;Save Changes&quot; button to finalize them.
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            <WebsiteEditor
              htmlContent={updatedHtml || generatedHtml}
              onSave={handleSave}
              standaloneHtml={standaloneHtml || generatedHtml}
            />

            {!showHelp && (
              <Button
                variant="link"
                className="mt-2 text-info"
                onClick={() => setShowHelp(true)}
              >
                <i className="bi bi-question-circle me-1"></i> Show help
              </Button>
            )}
          </Tab>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="text-center p-5">
      <p>Waiting to generate your website...</p>
    </div>
  )
}
