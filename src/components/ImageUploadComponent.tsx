'use client'
import Image from 'next/image'
import React, { useState, useRef } from 'react'
import { Button, Form, Alert } from 'react-bootstrap'

interface ImageUploadComponentProps {
  onImagesSelected: (images: File[]) => void
  maxImages?: number
}

export const ImageUploadComponent: React.FC<ImageUploadComponentProps> = ({
  onImagesSelected,
  maxImages = 5,
}) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [errorMessage, setErrorMessage] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setErrorMessage('')

    // Check file size and type
    const validFiles: File[] = []
    const invalidFiles: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileSize = file.size / 1024 / 1024 // Convert to MB
      const isImage = file.type.startsWith('image/')

      if (fileSize > 5) {
        invalidFiles.push(`${file.name} (too large, max 5MB)`)
      } else if (!isImage) {
        invalidFiles.push(`${file.name} (not an image)`)
      } else {
        validFiles.push(file)
      }
    }

    if (invalidFiles.length > 0) {
      setErrorMessage(`Invalid files: ${invalidFiles.join(', ')}`)
    }

    // Check if adding these would exceed max images
    if (selectedImages.length + validFiles.length > maxImages) {
      setErrorMessage(
        `You can only upload up to ${maxImages} images. Please remove some images.`
      )
      return
    }

    setSelectedImages((prev) => [...prev, ...validFiles])
    onImagesSelected([...selectedImages, ...validFiles])

    // Reset input to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...selectedImages]
    newImages.splice(index, 1)
    setSelectedImages(newImages)
    onImagesSelected(newImages)
  }

  return (
    <div className="mb-4">
      <h3>Upload Your Own Images</h3>
      <Form.Group className="mb-3">
        <Form.Label>Select images to upload (max {maxImages})</Form.Label>
        <Form.Control
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          disabled={selectedImages.length >= maxImages}
        />
        <Form.Text className="text-muted">
          Maximum 5MB per image. Supported formats: JPG, PNG, GIF, WebP.
        </Form.Text>
      </Form.Group>

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      {selectedImages.length > 0 && (
        <div className="mt-3">
          <h4>Selected Images ({selectedImages.length}/{maxImages})</h4>
          <div className="d-flex flex-wrap gap-2">
            {selectedImages.map((file, index) => (
              <div
                key={index}
                className="position-relative"
                style={{ width: '100px', height: '100px' }}
              >
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index}`}
                  width={100}
                  height={100}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />
                <Button
                  variant="danger"
                  size="sm"
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    padding: '0.15rem 0.4rem',
                  }}
                  onClick={() => removeImage(index)}
                >
                  &times;
                </Button>
                <small
                  className="d-block text-truncate"
                  style={{ maxWidth: '100px' }}
                >
                  {file.name}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}