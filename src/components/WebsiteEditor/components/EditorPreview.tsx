import React, { useEffect } from 'react'
import { Button } from 'react-bootstrap'
import { EditableElement } from '../EditableElement'
import { useElementHandlers } from '../hooks/useElementHandlers'

interface EditorPreviewProps {
  editableHtml: string
  iframeRef: HTMLIFrameElement | null
  setIframeRef: (ref: HTMLIFrameElement | null) => void
  showTips: boolean
  setShowTips: (show: boolean) => void
  editableElements: EditableElement[]
  selectedElement: string | null
  setSelectedElement: (id: string | null) => void
  setShowEditPanel: (show: boolean) => void
  findElementByPath?: (
    doc: Document,
    element: EditableElement
  ) => HTMLElement | null
}

const EditorPreview: React.FC<EditorPreviewProps> = ({
  editableHtml,
  iframeRef,
  setIframeRef,
  showTips,
  setShowTips,
  editableElements,
  selectedElement,
  setSelectedElement,
  setShowEditPanel,
  findElementByPath,
}) => {
  // Update iframe content when HTML changes
  useEffect(() => {
    if (iframeRef && editableHtml) {
      const doc = iframeRef.contentDocument
      if (doc) {
        doc.open()
        // Write the HTML as a complete document
        doc.write(editableHtml)
        doc.close()
      }
    }
  }, [editableHtml, iframeRef])

  // Use the element handlers hook
  useElementHandlers({
    iframeRef,
    editableElements,
    selectedElement,
    setSelectedElement,
    setShowEditPanel,
    findElementByPath: findElementByPath || (() => null),
  })

  return (
    <div className="position-relative mb-3">
      {showTips && (
        <div className="position-absolute top-0 start-0 end-0 p-2 bg-info bg-opacity-10 text-center rounded-top d-flex justify-content-between align-items-center">
          <span>Click on any text or image to edit it</span>
          <Button
            variant="link"
            size="sm"
            className="p-0"
            onClick={() => setShowTips(false)}
          >
            <small>×</small>
          </Button>
        </div>
      )}

      <div
        style={{
          height: '550px',
          border: '1px solid #dee2e6',
          borderTopLeftRadius: showTips ? '0' : '0.25rem',
          borderTopRightRadius: showTips ? '0' : '0.25rem',
        }}
      >
        <iframe
          ref={(ref) => setIframeRef(ref)}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Website Preview"
        />
      </div>
    </div>
  )
}

export default EditorPreview
