'use client'

import React, { useState, useEffect } from 'react'
import { Card, Form, Button, Alert } from 'react-bootstrap'
import { ElementEditRequest, ElementEditInstructions } from '@/types/formData'
import styles from './EditElementForm.module.css'

interface EditElementFormProps {
  editRequest: ElementEditRequest | null
  onClose: () => void
  onSave: (instructions: ElementEditInstructions) => Promise<void>
  isSubmitting: boolean
  onDirectEditDomUpdate?: (
    elementPath: string,
    content: string,
    attributes: Record<string, string>
  ) => void // <-- Add this
}

export const EditElementForm: React.FC<EditElementFormProps> = ({
  editRequest: element,
  onClose,
  onSave,
  isSubmitting,
  onDirectEditDomUpdate,
}) => {
  const [editMode, setEditMode] = useState<'direct' | 'ai'>('direct')
  const [directContent, setDirectContent] = useState('')
  const [aiInstruction, setAiInstruction] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [editableAttributes, setEditableAttributes] = useState<
    Record<string, string>
  >({})

  // Element type-specific placeholders for AI instructions
  const aiPlaceholders: Record<string, string> = {
    heading: 'e.g., Make this heading more concise and impactful',
    paragraph:
      'e.g., Rewrite this paragraph to emphasize our expertise and use more persuasive language',
    image:
      'e.g., Replace with a higher quality image that shows our product in use',
    button:
      'e.g., Change button text to be more action-oriented and add a subtle hover effect',
    link: 'e.g., Update this link text to be more descriptive and SEO-friendly',
    card: 'e.g., Redesign this card with a cleaner layout and more engaging content',
    hero: 'e.g., Make the hero section more impactful with a stronger headline and call to action',
    content:
      'e.g., Update this content to be more aligned with our brand voice and improve readability',
  }

  // Initialize form when element changes
  useEffect(() => {
    if (element) {
      setDirectContent(element.content)

      // Initialize attributes based on element type
      const attributes: Record<string, string> = {}

      // Common attributes for all elements
      if (element.attributes?.style) {
        attributes.style = element.attributes.style
      }
      if (element.attributes?.class) {
        attributes.class = element.attributes.class
      }

      // Element-specific attributes
      switch (element.type) {
        case 'image':
          if (element.attributes?.src) attributes.src = element.attributes.src
          if (element.attributes?.alt) attributes.alt = element.attributes.alt
          break

        case 'link':
          if (element.attributes?.href)
            attributes.href = element.attributes.href
          if (element.attributes?.target)
            attributes.target = element.attributes.target
          break

        case 'button':
          if (element.attributes?.type)
            attributes.type = element.attributes.type
          break
      }

      setEditableAttributes(attributes)

      // Reset other form state
      setError(null)
      setAiInstruction('')
    }
  }, [element])

  // Handle form submission for AI-assisted editing
  const handleAiEdit = async () => {
    if (!element) return
    if (!aiInstruction.trim()) {
      setError('Please provide instructions for the AI')
      return
    }

    setError(null)

    try {
      const instructions: ElementEditInstructions = {
        elementPath: element.elementPath,
        elementType: element.type,
        tagName: element.tagName,
        elementId: element.id ?? '',
        editMode: 'advanced',
        instructions: aiInstruction,
      }

      await onSave(instructions)
      // Form will be closed by parent after successful save
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }

  // Handle form submission for direct editing
  const handleDirectEdit = async () => {
    if (!element) return

    try {
      // Call the DOM update function if provided
      if (onDirectEditDomUpdate) {
        onDirectEditDomUpdate(
          element.elementPath,
          directContent,
          editableAttributes
        )
        onClose()
        return
      }

      // Fallback: old behavior (API call)
      const instructions: ElementEditInstructions = {
        elementPath: element.elementPath,
        elementType: element.type,
        tagName: element.tagName,
        elementId: element.id ?? '',
        editMode: 'simple',
        instructions: `Replace content with: ${directContent}${
          Object.keys(editableAttributes).length > 0
            ? ` and update attributes: ${JSON.stringify(editableAttributes)}`
            : ''
        }`,
      }

      await onSave(instructions)
      // Form will be closed by parent after successful save
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }

  // Handle attribute changes
  const handleAttributeChange = (key: string, value: string) => {
    setEditableAttributes((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  if (!element) return null

  return (
    <div className={styles.editFormContainer}>
      <Card className={styles.editCard}>
        <Card.Header className={styles.editCardHeader}>
          <h5>
            Edit {element.type.charAt(0).toUpperCase() + element.type.slice(1)}
          </h5>
          <div className={styles.elementPath}>{element.elementPath}</div>
        </Card.Header>

        <Card.Body>
          <div className={styles.editModeTabs}>
            <Button
              variant={editMode === 'direct' ? 'primary' : 'outline-primary'}
              onClick={() => setEditMode('direct')}
              className={styles.editModeButton}
            >
              Direct Edit
            </Button>
            <Button
              variant={editMode === 'ai' ? 'primary' : 'outline-primary'}
              onClick={() => setEditMode('ai')}
              className={styles.editModeButton}
            >
              AI Assist
            </Button>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          {editMode === 'direct' ? (
            // Direct edit form
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Content</Form.Label>
                <Form.Control
                  as="textarea"
                  value={directContent}
                  onChange={(e) => setDirectContent(e.target.value)}
                  rows={4}
                />
              </Form.Group>

              {/* Attributes section */}
              <Form.Group className="mb-3">
                <Form.Label>Text Color</Form.Label>
                <Form.Control
                  type="color"
                  value={(() => {
                    const style = editableAttributes.style || ''
                    const match = /color:\s*([^;]+);?/i.exec(style)
                    return match ? match[1].trim() : '#000000'
                  })()}
                  onChange={(e) => {
                    let style = editableAttributes.style || ''
                    const color = e.target.value
                    if (/color:\s*[^;]+;?/i.test(style)) {
                      style = style.replace(
                        /color:\s*[^;]+;?/i,
                        `color: ${color};`
                      )
                    } else {
                      style += ` color: ${color};`
                    }
                    handleAttributeChange('style', style.trim())
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Background Color</Form.Label>
                <Form.Control
                  type="color"
                  value={(() => {
                    const style = editableAttributes.style || ''
                    const match = /background-color:\s*([^;]+);?/i.exec(style)
                    return match ? match[1].trim() : '#ffffff'
                  })()}
                  onChange={(e) => {
                    let style = editableAttributes.style || ''
                    const color = e.target.value
                    if (/background-color:\s*[^;]+;?/i.test(style)) {
                      style = style.replace(
                        /background-color:\s*[^;]+;?/i,
                        `background-color: ${color};`
                      )
                    } else {
                      style += ` background-color: ${color};`
                    }
                    handleAttributeChange('style', style.trim())
                  }}
                />
              </Form.Group>

              {/* Now render the rest of the attributes as before */}
              {Object.keys(editableAttributes).length > 0 && (
                <>
                  <h6 className="mt-4">Attributes</h6>
                  {Object.entries(editableAttributes).map(([key, value]) => {
                    if (key === 'style') {
                      // Optionally show a raw style input for advanced users
                      return (
                        <Form.Group className="mb-3" key={key}>
                          <Form.Label>Raw Style (advanced)</Form.Label>
                          <Form.Control
                            type="text"
                            value={value}
                            onChange={(e) =>
                              handleAttributeChange('style', e.target.value)
                            }
                          />
                        </Form.Group>
                      )
                    }
                    // Default for other attributes
                    return (
                      <Form.Group className="mb-3" key={key}>
                        <Form.Label>{key}</Form.Label>
                        <Form.Control
                          type="text"
                          value={value}
                          onChange={(e) =>
                            handleAttributeChange(key, e.target.value)
                          }
                        />
                      </Form.Group>
                    )
                  })}
                </>
              )}
            </Form>
          ) : (
            // AI edit form
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Instructions for AI</Form.Label>
                <Form.Control
                  as="textarea"
                  value={aiInstruction}
                  onChange={(e) => setAiInstruction(e.target.value)}
                  placeholder={
                    aiPlaceholders[element.type] ||
                    'Describe how you want this element to be improved...'
                  }
                  rows={4}
                />
              </Form.Group>

              <div className={styles.aiInstructions}>
                <p>
                  <strong>Tips for effective AI editing:</strong>
                </p>
                <ul>
                  <li>Be specific about what you want to change</li>
                  <li>
                    Mention style, tone, or branding to maintain consistency
                  </li>
                  <li>
                    For images, describe the subject, style, and mood you want
                  </li>
                  <li>
                    Specify if you want to keep certain elements of the original
                  </li>
                </ul>
              </div>
            </Form>
          )}
        </Card.Body>

        <Card.Footer className={styles.editCardFooter}>
          <Button
            variant="outline-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={editMode === 'direct' ? handleDirectEdit : handleAiEdit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Apply Changes'}
          </Button>
        </Card.Footer>
      </Card>
    </div>
  )
}
