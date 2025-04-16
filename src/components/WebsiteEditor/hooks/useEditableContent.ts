import { useState, useEffect } from 'react'
import { EditableElement } from '../EditableElement'

export const useEditableContent = (
  initialHtmlContent: string,
  editableHtml: string,
  setEditableHtml: (html: string) => void
) => {
  // State for editable elements
  const [editableElements, setEditableElements] = useState<EditableElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)

  // Extract editable elements on initial load and when HTML changes
  useEffect(() => {
    if (initialHtmlContent) {
      extractEditableElements(initialHtmlContent)
    }
  }, [initialHtmlContent])

  // Function to extract editable elements from HTML
  const extractEditableElements = (htmlContent: string) => {
    setEditableHtml(htmlContent)
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')

    // Find all text elements with meaningful content
    const textElements = Array.from(
      doc.querySelectorAll(
        'p, h1, h2, h3, h4, h5, h6, li, span, div, a, button, label'
      )
    )
      .filter((el) => el.textContent && el.textContent.trim().length > 0)
      .map((el): EditableElement => {
        // Generate a unique ID for each element based on content and position
        const path = generateElementPath(el)
        return {
          id: `text-${path}`,
          content: el.textContent ?? '',
          type: 'text',
          element: el.tagName.toLowerCase(),
          path: path,
          displayName: `${el.tagName.toLowerCase()}: ${(
            el.textContent ?? ''
          ).substring(0, 20)}${
            (el.textContent?.length ?? 0) > 20 ? '...' : ''
          }`,
        }
      })

    // Find all image elements
    const imgElements = Array.from(doc.querySelectorAll('img')).map(
      (el): EditableElement => {
        const path = generateElementPath(el)
        return {
          id: `img-${path}`,
          content: el.getAttribute('src') ?? '',
          type: 'image',
          path: path,
          alt: el.getAttribute('alt') ?? '',
          displayName: el.getAttribute('alt') ?? `Image at ${path}`,
        }
      }
    )

    // Find elements with background images in inline styles
    const bgImageElements = Array.from(doc.querySelectorAll('*'))
      .filter((el) => {
        const style = el.getAttribute('style')
        return (
          style &&
          style.includes('background-image') &&
          style.includes('url(')
        )
      })
      .map((el): EditableElement => {
        const path = generateElementPath(el)
        const style = el.getAttribute('style') ?? ''
        const regex = /background-image:\s*url\(['"]?([^'"]+)['"]?\)/
        const urlMatch = regex.exec(style)
        const imageUrl = urlMatch ? urlMatch[1] : ''
        return {
          id: `bg-${path}`,
          content: imageUrl,
          type: 'backgroundImage',
          element: el.tagName.toLowerCase(),
          path: path,
          selector: generateUniqueSelector(el as HTMLElement),
          displayName: `Background: ${el.tagName.toLowerCase()}${
            el.className ? '.' + el.className.replace(/\s+/g, '.') : ''
          }`,
        }
      })

    // Add detection for service container sections
    const serviceContainers = Array.from(
      doc.querySelectorAll(
        '#services .row, .services-row, .service-container'
      )
    ).map((el): EditableElement => {
      const path = generateElementPath(el)
      return {
        id: `service-container-${path}`,
        content: 'Service Section',
        type: 'serviceContainer',
        element: el.tagName.toLowerCase(),
        path: path,
        displayName: 'Services Container',
      }
    })

    setEditableElements([
      ...textElements,
      ...imgElements,
      ...bgImageElements,
      ...serviceContainers,
    ])
  }

  // Function to generate a unique CSS selector for an element
  const generateUniqueSelector = (element: HTMLElement): string => {
    if (element.id) {
      return `#${element.id}`
    }

    if (element.className) {
      const classes = element.className.trim().split(/\s+/)
      if (classes.length > 0) {
        // Process the first class if needed
      }
    }

    // Add a data attribute to make it uniquely identifiable
    const uniqueId = `editable-${Math.random().toString(36).substring(2, 9)}`
    element.setAttribute('data-edit-id', uniqueId)

    return `[data-edit-id="${uniqueId}"]`
  }

  // Function to generate a unique path for an element
  const generateElementPath = (element: Element): string => {
    const path: string[] = []
    let current = element

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let selector = current.nodeName.toLowerCase()

      // Add ID if available
      if (current.id) {
        selector += '#' + current.id
      }
      // Otherwise add position among siblings
      else {
        let sibling = current.previousElementSibling
        let index = 0
        while (sibling) {
          if (sibling.nodeName === current.nodeName) {
            index++
          }
          sibling = sibling.previousElementSibling
        }
        selector += `:nth-of-type(${index + 1})`
      }
      path.unshift(selector)
      current = current.parentElement as Element
    }

    // Hash the path for shorter IDs
    return btoa(path.join('>')).replace(/[+/=]/g, '').substring(0, 12)
  }

  // Helper function to find an element by its path
  const findElementByPath = (
    doc: Document,
    element: EditableElement
  ): HTMLElement | null => {
    if (!element.path) return null

    // Try first with the selector if we have one
    if (element.selector) {
      try {
        const el = doc.querySelector(element.selector)
        if (el) return el as HTMLElement
      } catch (e) {
        console.error('Error with selector lookup:', e)
      }
    }

    // Otherwise use the ID to look up the element in our array
    const elementData = editableElements.find((el) => el.id === element.id)
    if (!elementData) return null

    // For text elements, we'll look up by content and tag
    if (element.type === 'text' && element.element) {
      const candidates = Array.from(
        doc.querySelectorAll(element.element)
      ).filter((el) => el.textContent?.trim() === elementData.content.trim())

      if (candidates.length === 1) {
        return candidates[0] as HTMLElement
      }
    }

    // For images, try src attribute
    if (element.type === 'image') {
      const imgUrl = elementData.content
      const candidates = Array.from(doc.querySelectorAll('img')).filter(
        (img) => img.getAttribute('src') === imgUrl
      )

      if (candidates.length === 1) {
        return candidates[0] as HTMLElement
      }
    }

    return null
  }

  // Update content functions
  const updateContent = (
    elementId: string,
    newContent: string,
    type = 'text'
  ) => {
    // Update state
    setEditableElements((prev) =>
      prev.map((el) =>
        el.id === elementId ? { ...el, content: newContent } : el
      )
    )

    // Get the element data
    const elementData = editableElements.find((el) => el.id === elementId)
    if (!elementData) return

    // Update HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(editableHtml, 'text/html')

    if (type === 'text') {
      // Find the element by its path/ID instead of index
      const element = findElementByPath(doc, elementData)
      if (element) {
        element.textContent = newContent
      }
    } else if (type === 'image') {
      // Find the element by its path/ID instead of index
      const element = findElementByPath(doc, elementData)
      if (element && element.tagName.toLowerCase() === 'img') {
        element.setAttribute('src', newContent)
      }
    } else if (type === 'backgroundImage') {
      // Find the element using the stored selector
      const element = doc.querySelector(elementData.selector ?? '')
      if (element) {
        const style = element.getAttribute('style') ?? ''

        // Update the background-image URL
        const newStyle = style.replace(
          /background-image:\s*url\(['"]?[^'"]+['"]?\)/,
          `background-image: url('${newContent}')`
        )

        element.setAttribute('style', newStyle)
      }
    }

    setEditableHtml(doc.documentElement.outerHTML)
  }

  return {
    editableElements,
    setEditableElements,
    selectedElement,
    setSelectedElement,
    updateContent,
    findElementByPath,
    generateElementPath,
    generateUniqueSelector,
  }
}