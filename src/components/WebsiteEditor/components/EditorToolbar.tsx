import React from 'react'
import { Button } from 'react-bootstrap'

interface EditorToolbarProps {
  handleRefresh: () => void
  previewFullWebsite: () => void
  handleSave: () => void
  setShowAddImageModal: (show: boolean) => void
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  handleRefresh,
  previewFullWebsite,
  handleSave,
  setShowAddImageModal,
}) => {
  return (
    <div className="mt-3 mb-3 d-flex justify-content-between">
      <div>
        <Button
          variant="outline-success"
          size="sm"
          onClick={() => setShowAddImageModal(true)}
        >
          <i className="bi bi-plus-circle me-1"></i> Add New Image
        </Button>
      </div>

      <div>
        <Button
          variant="outline-secondary"
          size="sm"
          className="me-2"
          onClick={handleRefresh}
          title="Reset to original generated page"
        >
          <i className="bi bi-arrow-counterclockwise me-1"></i> Reset to
          Original
        </Button>

        <Button
          variant="outline-secondary"
          size="sm"
          className="me-2"
          onClick={previewFullWebsite}
        >
          <i className="bi bi-eye me-1"></i> Preview Full Site
        </Button>

        <Button variant="primary" onClick={handleSave}>
          <i className="bi bi-save me-1"></i> Save Changes
        </Button>
      </div>
    </div>
  )
}

export default EditorToolbar
