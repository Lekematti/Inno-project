'use client';
import { AiGenComponent } from './AiGenComponent';
import { Spinner, Alert } from 'react-bootstrap';
import { DownloadSection } from '@/app/build/components/UIHelpers';
import { WebsitePreviewProps } from '@/types/formData';

export const WebsitePreview: React.FC<WebsitePreviewProps> = ({
  isLoading,
  isReady,
  generatedHtml,
  error,
  formData
}) => {
  if (isLoading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center p-5">
        <output>
          <Spinner animation="border" variant="primary" />
        </output>
        <p className="mt-3">Generating your custom website...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }

  if (isReady && generatedHtml) {
    return (
      <>
        <div className="preview-container" style={{ height: '70vh', width: '100%' }}>
          <AiGenComponent htmlContent={generatedHtml} />
        </div>
        <DownloadSection generatedHtml={generatedHtml} formData={formData} />
      </>
    );
  }

  return (
    <div className="text-center p-5">
      <p>Waiting to generate your website...</p>
    </div>
  );
};