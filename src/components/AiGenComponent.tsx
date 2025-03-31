import React, { useRef, useEffect, useState } from 'react';
import { PreviewProps } from '@/types/formData';

export const AiGenComponent: React.FC<PreviewProps> = ({ 
  htmlContent,
  width = '100%',
  height = '100%',
  sandboxOptions = 'allow-same-origin allow-scripts'
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    if (!htmlContent) {
      setError('No content to display');
      return;
    }

    try {
      if (iframeRef.current) {
        const iframeDoc = iframeRef.current.contentDocument || 
                         (iframeRef.current.contentWindow?.document);
        
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(`
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Website Preview</title>
              </head>
              <body>
                ${htmlContent}
              </body>
            </html>
          `);
          iframeDoc.close();
        } else {
          setError('Unable to access iframe document');
        }
      }
    } catch (err) {
      setError(`Error loading preview: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [htmlContent]);
  
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
      ref={iframeRef}
      title="Website Preview"
      style={{ 
        width, 
        height, 
        border: 'none',
        backgroundColor: 'white' 
      }}
      sandbox={sandboxOptions}
      security="restricted"
      loading="lazy"
      aria-label="Generated website preview"
    />
  );
};