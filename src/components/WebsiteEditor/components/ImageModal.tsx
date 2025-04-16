import React from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import Image from 'next/image'

interface ImageModalProps {
  showAddImageModal: boolean
  setShowAddImageModal: (show: boolean) => void
  newImageSrc: string
  setNewImageSrc: (src: string) => void
  imageInsertLocation: string
  setImageInsertLocation: (location: string) => void
  addNewImage: () => void
}

const ImageModal: React.FC<ImageModalProps> = ({
  showAddImageModal,
  setShowAddImageModal,
  newImageSrc,
  setNewImageSrc,
  imageInsertLocation,
  setImageInsertLocation,
  addNewImage,
}) => {
  return (
    <Modal show={showAddImageModal} onHide={() => setShowAddImageModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Image</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Upload image</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e) => {
              const target = e.target as HTMLInputElement
              if (target.files?.[0]) {
                const reader = new FileReader()
                reader.onload = (event) => {
                  if (event.target?.result) {
                    setNewImageSrc(event.target.result as string)
                  }
                }
                reader.readAsDataURL(target.files[0])
              }
            }}
          />
        </Form.Group>

        <div className="text-center my-2">- or -</div>

        <Form.Group className="mb-3">
          <Form.Label>Image URL</Form.Label>
          <Form.Control
            type="text"
            placeholder="https://example.com/image.jpg"
            value={newImageSrc}
            onChange={(e) => setNewImageSrc(e.target.value)}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Insert location</Form.Label>
          <Form.Select
            value={imageInsertLocation}
            onChange={(e) => setImageInsertLocation(e.target.value)}
          >
            <option value="">Select where to add the image</option>
            <option value="header">Header</option>
            <option value=".container">Main container</option>
            <option value="main">Main content</option>
            <option value="section:first-of-type">First section</option>
            <option value="section:last-of-type">Last section</option>
            <option value="footer">Footer</option>
          </Form.Select>
        </Form.Group>

        {newImageSrc && (
          <div className="mt-3 text-center">
            <p>
              <strong>Preview:</strong>
            </p>
            <Image
              src={newImageSrc || '/placeholder.png'}
              alt="Preview"
              width={200}
              height={200}
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                objectFit: 'contain',
              }}
              unoptimized
            />
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowAddImageModal(false)}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={addNewImage}
          disabled={!newImageSrc || !imageInsertLocation}
        >
          Add Image
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ImageModal
