import React from 'react'
import { Card } from 'react-bootstrap'
import { EditableElement } from '../../EditableElement'
import TextEditor from './TextEditor'
import ImageEditor from './ImageEditor'
import BackgroundEditor from './BackgroundEditor'
import ServiceEditor from './ServiceEditor'

interface EditPanelProps {
  selectedElementData: EditableElement | undefined
  selectedElement: string
  updateContent: (elementId: string, newContent: string, type?: string) => void
  setSelectedElement: (id: string | null) => void
  setShowEditPanel: (show: boolean) => void
  handleServiceContainerSelect: (id: string) => void
}

export const EditPanel: React.FC<EditPanelProps> = ({
  selectedElementData,
  selectedElement,
  updateContent,
  setSelectedElement,
  setShowEditPanel,
  handleServiceContainerSelect,
}) => {
  if (!selectedElementData) return null

  return (
    <Card className="mb-3">
      <Card.Header className="bg-primary text-white py-2 d-flex justify-content-between align-items-center">
        <div>
          <i
            className={`bi ${
              selectedElementData?.type === 'text'
                ? 'bi-pencil'
                : selectedElementData?.type === 'image'
                ? 'bi-image'
                : selectedElementData?.type === 'backgroundImage'
                ? 'bi-brush'
                : 'bi-grid'
            } me-2`}
          ></i>
          {selectedElementData?.type === 'text'
            ? 'Edit Text'
            : selectedElementData?.type === 'image'
            ? 'Edit Image'
            : selectedElementData?.type === 'backgroundImage'
            ? 'Edit Background Image'
            : 'Edit Service Container'}
        </div>
        <small className="text-white-50">
          {selectedElementData?.element || selectedElementData?.type}
        </small>
      </Card.Header>

      <Card.Body className="p-3">
        {selectedElementData.type === 'text' && (
          <TextEditor
            selectedElementData={selectedElementData}
            selectedElement={selectedElement}
            updateContent={updateContent}
            setSelectedElement={setSelectedElement}
            setShowEditPanel={setShowEditPanel}
          />
        )}

        {selectedElementData.type === 'image' && (
          <ImageEditor
            selectedElementData={selectedElementData}
            selectedElement={selectedElement}
            updateContent={updateContent}
            setSelectedElement={setSelectedElement}
            setShowEditPanel={setShowEditPanel}
          />
        )}

        {selectedElementData.type === 'backgroundImage' && (
          <BackgroundEditor
            selectedElementData={selectedElementData}
            selectedElement={selectedElement}
            updateContent={updateContent}
            setSelectedElement={setSelectedElement}
            setShowEditPanel={setShowEditPanel}
          />
        )}

        {selectedElementData.type === 'serviceContainer' && (
          <ServiceEditor
            selectedElement={selectedElement}
            handleServiceContainerSelect={handleServiceContainerSelect}
            setSelectedElement={setSelectedElement}
            setShowEditPanel={setShowEditPanel}
          />
        )}
      </Card.Body>
    </Card>
  )
}
