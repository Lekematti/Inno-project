import React from 'react';

interface AiGenComponentProps {
  htmlContent: string;
}

export const AiGenComponent: React.FC<AiGenComponentProps> = ({ htmlContent }) => {
  // Don't render if no content is provided
  if (!htmlContent) {
    return <div>No content to display</div>;
  }
  
  const template = { __html: htmlContent };
  return (
    <div dangerouslySetInnerHTML={template} style={{ height: '100%' }} />
  );
};