import React from 'react'
import { Button } from 'react-bootstrap'

interface ServiceEditorProps {
  selectedElement: string
  handleServiceContainerSelect: (id: string) => void
  setSelectedElement: (id: string | null) => void
  setShowEditPanel: (show: boolean) => void
}

const ServiceEditor: React.FC<ServiceEditorProps> = ({
  selectedElement,
  handleServiceContainerSelect,
  setSelectedElement,
  setShowEditPanel,
}) => {
  return (
    <>
      <div className="text-center p-3 mb-3 bg-light rounded">
        <p className="mb-1">
          <i className="bi bi-grid me-2"></i>Service Container
        </p>
        <small className="text-muted">
          This is a container for service items.
        </small>
      </div>

      <Button
        variant="success"
        className="w-100 mb-3"
        onClick={() => handleServiceContainerSelect(selectedElement)}
      >
        <i className="bi bi-plus-circle me-2"></i>
        Add New Service
      </Button>

      <Button
        size="sm"
        variant="outline-primary"
        className="mt-1"
        onClick={() => {
          setSelectedElement(null)
          setShowEditPanel(false)
        }}
      >
        Done
      </Button>
    </>
  )
}

export default ServiceEditor
