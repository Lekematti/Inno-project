'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Button, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import { WebsiteEditor } from './WebsiteEditor';

interface WebsitePreviewProps {
  htmlContent: string;
  filePath: string;
  standaloneHTML: string;
}

export const WebsitePreview: React.FC<WebsitePreviewProps> = ({
  htmlContent,
  filePath,
  standaloneHTML
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState<string>('preview');
  const [updatedHtml, setUpdatedHtml] = useState<string>(htmlContent);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Initialize the preview content when component mounts or when the content changes
  useEffect(() => {
    if (!updatedHtml && htmlContent) {
      setUpdatedHtml(htmlContent);
    }
  }, [htmlContent, updatedHtml]);

  // Update iframe content when dependencies change
  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDocument = iframe.contentDocument;
      if (iframeDocument) {
        iframeDocument.open();
        iframeDocument.write(activeTab === 'editor' ? updatedHtml : htmlContent);
        iframeDocument.close();
      }
    }
  }, [htmlContent, updatedHtml, activeTab]);
  
  // Create and cleanup blob URL for preview in new tab
  useEffect(() => {
    if (standaloneHTML) {
      const blob = new Blob([standaloneHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [standaloneHTML]);

  const handleSave = useCallback(async (newHtmlContent: string) => {
    try {
      setSaveStatus('saving');
      const response = await fetch('/api/generatePage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          htmlContent: newHtmlContent,
          filePath,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save: ${response.statusText}`);
      }

      // Update the HTML content after saving
      setUpdatedHtml(newHtmlContent);
      setSaveStatus('success');
      
      // Reset status after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error saving website:', error);
      setSaveStatus('error');
      
      // Reset error status after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  }, [filePath]);

  const handleTabChange = useCallback((key: string | null) => {
    setActiveTab(key ?? 'preview');
  }, []);

  const handleDownload = useCallback(() => {
    const blob = new Blob([standaloneHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [standaloneHTML]);

  return (
    <div className="website-preview-container">
      <Tabs
        activeKey={activeTab}
        onSelect={handleTabChange}
        className="mb-3"
      >
        <Tab eventKey="preview" title="Preview">
          <div style={{ height: '600px', border: '1px solid #dee2e6' }}>
            <iframe
              ref={iframeRef}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Website Preview"
            />
          </div>
          <div className="d-flex justify-content-between mt-3">
            <div>
              <Button
                variant="primary"
                onClick={() => setActiveTab('editor')}
                className="me-2"
              >
                Edit Website
              </Button>
              <Button
                variant="outline-primary"
                onClick={() => previewUrl && window.open(previewUrl, '_blank')}
                className="me-2"
                disabled={!previewUrl}
              >
                Open in New Tab
              </Button>
            </div>
            {saveStatus === 'saving' ? (
              <Button variant="secondary" disabled>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={handleDownload}
              >
                Download HTML
              </Button>
            )}
          </div>
          
          {saveStatus === 'success' && (
            <Alert variant="success" className="mt-3">
              Website saved successfully!
            </Alert>
          )}
          
          {saveStatus === 'error' && (
            <Alert variant="danger" className="mt-3">
              Error saving website. Please try again.
            </Alert>
          )}
        </Tab>
        <Tab eventKey="editor" title="Editor">
          <WebsiteEditor 
            htmlContent={updatedHtml} 
            onSave={handleSave} 
            standaloneHTML={standaloneHTML}
          />
        </Tab>
      </Tabs>
    </div>
  );
};