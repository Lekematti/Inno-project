'use client'
import { useEffect, useState } from 'react'
import { AiGenComponent } from './AiGenComponent'
import { Spinner, Alert } from 'react-bootstrap'
import { DownloadSection } from '@/app/build/components/UIHelpers'
import { WebsitePreviewProps } from '@/types/formData'
import { clearFormData } from '../functions/usePageRefreshHandler' // <-- Add this import

export const WebsitePreview: React.FC<WebsitePreviewProps> = ({
  isLoading,
  isReady,
  generatedHtml,
  error,
  formData,
}) => {
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [isRendering, setIsRendering] = useState<boolean>(false)

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
            htmlContent={generatedHtml}
            onError={handleRenderingError}
          />
        </div>

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
