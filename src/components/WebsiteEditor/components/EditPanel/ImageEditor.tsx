import React from 'react'
import { Form, Button } from 'react-bootstrap'
import Image from 'next/image'
import { EditableElement } from '../../EditableElement'

interface ImageEditorProps {
  selectedElementData: EditableElement
  selectedElement: string
  updateContent: (elementId: string, newContent: string, type?: string) => void
  setSelectedElement: (id: string | null) => void
  setShowEditPanel: (show: boolean) => void
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  selectedElementData,
  selectedElement,
  updateContent,
  setSelectedElement,
  setShowEditPanel,
}) => {
  return (
    <>
      <div className="text-center mb-2 border rounded bg-light p-2">
        <Image
          src={selectedElementData.content || '/placeholder.png'}
          alt={selectedElementData.alt ?? 'Preview'}
          width={150}
          height={100}
          style={{
            maxWidth: '100%',
            maxHeight: '150px',
            objectFit: 'contain',
          }}
          unoptimized
        />
      </div>

      <Form.Group className="mb-2">
        <Form.Label className="small fw-bold mb-1">Upload image:</Form.Label>
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
                    'image'
                  )
                }
              }
              reader.readAsDataURL((e.target as HTMLInputElement).files![0])
            }
          }}
        />
      </Form.Group>

      <div className="text-center small my-2">- or -</div>

      <Form.Group className="mb-2">
        <Form.Label className="small fw-bold mb-1">Image URL:</Form.Label>
        <Form.Control
          type="text"
          placeholder="https://example.com/image.jpg"
          size="sm"
          value={selectedElementData.content}
          onChange={(e) =>
            updateContent(selectedElement, e.target.value, 'image')
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

export default ImageEditor
