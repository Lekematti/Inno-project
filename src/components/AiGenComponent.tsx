import React, { useRef, useEffect, useState } from 'react'
import { PreviewProps } from '@/types/formData'

export const AiGenComponent: React.FC<PreviewProps> = ({
  htmlContent,
  width = '100%',
  height = '100%',
  onError,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!htmlContent) {
      setError('No content to display')
      return
    }

    try {
      // Create a blob from the HTML content
      const processedHtml = htmlContent.replace(
        /src="\/uploads\//g,
        `src="${window.location.origin}/uploads/`
      )

      const blob = new Blob(
        [
          `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Website Preview</title>
            <!-- Modified Bootstrap import to prevent map file requests -->
            <style>
              /* Inline Bootstrap core styles to prevent map file requests */
              @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
              
              /* Disable all interactions */
              * {
                pointer-events: none !important;
                user-select: none !important;
              }
              /* Hide form elements */
              input, button, textarea, select, option {
                pointer-events: none !important;
                user-select: none !important;
                opacity: 0.7;
              }
              /* Make the body scrollable to view entire content */
              body {
                overflow-y: auto;
                cursor: default !important;
              }
              /* Prevent event bubbling */
              html, body {
                pointer-events: auto !important; /* Allow scrolling */
              }
              /* Disable all JavaScript execution */
              script {
                display: none !important;
              }
            </style>
            <base href="${window.location.origin}/">
          </head>
          <body>
            ${processedHtml}
          </body>
        </html>
      `,
        ],
        { type: 'text/html' }
      )

      // Create an object URL from the blob
      const url = URL.createObjectURL(blob)

      // Set the iframe src to the object URL
      if (iframeRef.current) {
        iframeRef.current.src = url

        // Clean up the object URL when the component unmounts or content changes
        return () => {
          URL.revokeObjectURL(url)
        }
      }
    } catch (err) {
      const errorMsg = `Error loading preview: ${
        err instanceof Error ? err.message : String(err)
      }`
      setError(errorMsg)
      if (onError) onError(errorMsg)
    }
  }, [htmlContent, onError])

  if (error) {
    return (
      <div
        style={{
          width,
          height,
          border: '1px solid #f44336',
          padding: '1rem',
          backgroundColor: '#ffebee',
          color: '#d32f2f',
        }}
      >
        {error}
      </div>
    )
  }

  return (
    <iframe
      ref={iframeRef}
      title="Website Preview"
      style={{
        width,
        height,
        border: '1px solid #e0e0e0',
        backgroundColor: 'white',
      }}
      sandbox="allow-scripts allow-same-origin allow-forms"
      loading="lazy"
      aria-label="Generated website preview"
    />
  )
}
