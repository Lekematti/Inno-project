import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { PreviewProps } from '@/types/formData';

export const AiGenComponent = forwardRef<HTMLIFrameElement, PreviewProps>(({
  htmlContent,
  width = '100%',
  height = '100%',
  onError,
  editMode = false,
  sandboxOptions = 'allow-same-origin allow-scripts allow-modals allow-forms',
}, ref) => {
  const [error, setError] = useState<string>('');
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);
  const internalRef = React.useRef<HTMLIFrameElement>(null);
 
  // Forward the ref while maintaining our internal ref
  useImperativeHandle(ref, () => internalRef.current!, []);

  useEffect(() => {
    if (!htmlContent) {
      setError('No content to display');
      return;
    }

    try {
      // Create a blob from the HTML content
      const processedHtml = htmlContent.replace(
        /src="\/uploads\//g,
        `src="${window.location.origin}/uploads/`
      );
      
      const blob = new Blob([`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Website Preview</title>
            <base href="${window.location.origin}/">
            <style>
              /* Disable interactions based on edit mode */
              ${!editMode ? `
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
              ` : ''}
              /* Make the body scrollable to view entire content */
              body {
                overflow-y: auto;
                cursor: ${editMode ? 'default' : 'default'} !important;
              }
              /* Prevent event bubbling */
              html, body {
                pointer-events: auto !important; /* Allow scrolling */
              }
              /* Disable all JavaScript execution during preview */
              script {
                display: none !important;
              }
            </style>
          </head>
          <body>
            ${processedHtml}
          </body>
        </html>
      `], { type: 'text/html' });
      
      // Create an object URL from the blob
      const url = URL.createObjectURL(blob);
      
      // Set the iframe src to the object URL
      if (internalRef.current) {
        internalRef.current.src = url;
        
        // Clean up the object URL when the component unmounts or content changes
        return () => {
          URL.revokeObjectURL(url);
        };
      }
    } catch (err) {
      const errorMsg = `Error loading preview: ${err instanceof Error ? err.message : String(err)}`;
      setError(errorMsg);
      if (onError) onError(errorMsg);
    }
  }, [htmlContent, onError, editMode]);
 
  if (error) {
    return (
      <div
        style={{
          width,
          height,
          border: '1px solid #f44336',
          padding: '1rem',
          backgroundColor: '#ffebee',
          color: '#d32f2f'
        }}
      >
        {error}
      </div>
    );
  }
 
  return (
    <iframe
      ref={internalRef}
      title="Website Preview"
      style={{
        width,
        height,
        border: '1px solid #e0e0e0',
        backgroundColor: 'white'
      }}
      sandbox={sandboxOptions}
      onLoad={() => setIframeLoaded(true)}
      loading="lazy"
      aria-label="Generated website preview"
    />
  );
});

// Add display name for better debugging and React DevTools
AiGenComponent.displayName = 'AiGenComponent';