/**
 * Type definitions for the Website Editor component
 */

export interface WebsiteEditorProps {
  htmlContent: string
  originalHtml?: string
  onSave: (updatedHtml: string) => void
  standaloneHtml: string
}

export interface EditableElement {
  id: string
  content: string
  type: 'text' | 'image' | 'backgroundImage' | 'serviceContainer'
  element?: string
  alt?: string
  displayName: string
  selector?: string
  path?: string
}