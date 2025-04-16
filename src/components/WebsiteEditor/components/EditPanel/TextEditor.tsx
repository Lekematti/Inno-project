import React from 'react'
import { Form, Button } from 'react-bootstrap'
import { EditableElement } from '../../EditableElement'

interface TextEditorProps {
  selectedElementData: EditableElement
  selectedElement: string
  updateContent: (elementId: string, newContent: string, type?: string) => void
  setSelectedElement: (id: string | null) => void
  setShowEditPanel: (show: boolean) => void
}

const TextEditor: React.FC<TextEditorProps> = ({
  selectedElementData,
  selectedElement,
  updateContent,
  setSelectedElement,
  setShowEditPanel,
}) => {
  return (
    <Form.Group>
      <Form.Control
        as="textarea"
        rows={Math.min(
          8,
          Math.max(3, selectedElementData.content.length / 80 + 2)
        )}
        value={selectedElementData?.content ?? ''}
        onChange={(e) => updateContent(selectedElement, e.target.value)}
        className="mb-2"
      />
      <div className="d-flex justify-content-between align-items-center">
        <Button
          size="sm"
          variant="outline-primary"
          onClick={() => {
            setSelectedElement(null)
            setShowEditPanel(false)
          }}
        >
          Done
        </Button>
        <small className="text-muted">Changes appear as you type</small>
      </div>
    </Form.Group>
  )
}

export default TextEditor
