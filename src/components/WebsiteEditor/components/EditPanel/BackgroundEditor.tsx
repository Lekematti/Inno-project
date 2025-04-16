import React from 'react'
import { Form, Button } from 'react-bootstrap'
import { EditableElement } from '../../EditableElement'

interface BackgroundEditorProps {
  selectedElementData: EditableElement
  selectedElement: string
  updateContent: (elementId: string, newContent: string, type?: string) => void
  setSelectedElement: (id: string | null) => void
  setShowEditPanel: (show: boolean) => void
}

const BackgroundEditor: React.FC<BackgroundEditorProps> = ({
  selectedElementData,
  selectedElement,
  updateContent,
  setSelectedElement,
  setShowEditPanel,
}) => {
  return (
    <>
      <div className="text-center mb-2 border rounded bg-light p-2">
        <div
          style={{
            width: '100%',
            height: '100px',
            backgroundImage: `url(${
              selectedElementData.content || '/placeholder.png'
            })`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </div>

      <Form.Group className="mb-2">
        <Form.Label className="small fw-bold mb-1">
          Upload background image:
        </Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          size="sm"
          onChange={(e) => {
            const target = e.target as HTMLInputElement
            if (target.files?.[0]) {
              const reader = new FileReader()
              reader.onload = (event) => {
                if (event.target?.result && selectedElement) {
                  updateContent(
                    selectedElement,
                    event.target.result as string,
                    'backgroundImage'
                  )
                }
              }
              reader.readAsDataURL(target.files[0])
            }
          }}
        />
      </Form.Group>

      <div className="text-center small my-2">- or -</div>

      <Form.Group className="mb-2">
        <Form.Label className="small fw-bold mb-1">
          Background image URL:
        </Form.Label>
        <Form.Control
          type="text"
          placeholder="https://example.com/image.jpg"
          size="sm"
          value={selectedElementData.content}
          onChange={(e) =>
            updateContent(selectedElement, e.target.value, 'backgroundImage')
          }
        />
      </Form.Group>

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

export default BackgroundEditor
