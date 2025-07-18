'use client'
import React, { useState, useEffect, useRef } from 'react'
import { ElementEditRequest } from '@/types/formData'
import styles from './EditModeOverlay.module.css'

interface EditModeOverlayProps {
  isActive: boolean
  onExit: () => void
  onElementSelect: (element: ElementEditRequest) => void
  iframeRef: React.RefObject<HTMLIFrameElement>
}

export const EditModeOverlay: React.FC<EditModeOverlayProps> = ({
  isActive,
  onElementSelect,
  iframeRef,
}) => {
  const [highlightPosition, setHighlightPosition] = useState<{
    top: number
    left: number
    width: number
    height: number
    display: string
  }>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    display: 'none',
  })
  const [elementInfo, setElementInfo] = useState<{
    type: string
    content: string
  } | null>(null)
  const [showInstructions, setShowInstructions] = useState<boolean>(true)
  const hoveredElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isActive || !iframeRef.current) return

    const iframe = iframeRef.current

    const onIframeLoad = () => {
      const iframeWindow = iframe.contentWindow
      const iframeDocument = iframe.contentDocument || iframeWindow?.document
      if (!iframeDocument) return

      // Wait a moment for the iframe to fully initialize
      const initTimeout = setTimeout(() => {
        try {
          console.log(
            'Edit mode initialized, attaching event listeners to iframe'
          )

          // Prevent navigation for all <a> tags in the iframe
          const preventLinkNavigation = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (target?.tagName?.toLowerCase() === 'a') {
              e.preventDefault()
              e.stopPropagation()
            }
          }
          iframeDocument.addEventListener('click', preventLinkNavigation, true)

          // Initialize event listeners
          const handleMouseMove = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (!target || target === hoveredElementRef.current) return

            // Skip the html and body elements
            if (
              target.tagName.toLowerCase() === 'html' ||
              target.tagName.toLowerCase() === 'body'
            ) {
              return
            }

            hoveredElementRef.current = target

            // Get element position and size
            const rect = target.getBoundingClientRect()
            const iframeRect = iframe.getBoundingClientRect()

            setHighlightPosition({
              top: iframeRect.top + rect.top,
              left: iframeRect.left + rect.left,
              width: rect.width,
              height: rect.height,
              display: 'block',
            })

            // Determine the content type and extract relevant info
            let elementType = 'content'
            if (/^H[1-6]$/i.exec(target.tagName)) {
              elementType = 'heading'
            } else if (target.tagName.toLowerCase() === 'p') {
              elementType = 'paragraph'
            } else if (target.tagName.toLowerCase() === 'img') {
              elementType = 'image'
            } else if (target.tagName.toLowerCase() === 'a') {
              elementType = 'link'
            } else if (target.tagName.toLowerCase() === 'button') {
              elementType = 'button'
            } else if (
              target.classList.contains('card') ||
              target.closest('.card')
            ) {
              elementType = 'card'
            } else if (
              target.classList.contains('hero') ||
              target.closest('.hero') ||
              target.closest('header')
            ) {
              elementType = 'hero'
            }

            setElementInfo({
              type: elementType,
              content: target.innerText ?? target.textContent ?? '',
            })
          }

          const handleClick = (e: MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            const hoveredElement = hoveredElementRef.current
            if (!hoveredElement) return

            console.log('Element clicked in iframe', e.target)

            // Create a path to identify the element uniquely
            const path = []
            let currentElement: HTMLElement | null = hoveredElement
            while (
              currentElement &&
              currentElement.tagName.toLowerCase() !== 'body'
            ) {
              let selector = currentElement.tagName.toLowerCase()
              if (currentElement.id) {
                selector += `#${currentElement.id}`
              } else if (currentElement.classList.length) {
                selector += `.${Array.from(currentElement.classList).join('.')}`
              }
              path.unshift(selector)
              currentElement = currentElement.parentElement
              if (!currentElement) break
            }

            const elementPath = path.join(' > ')
            const attributes: Record<string, string> = {}

            // Extract relevant attributes based on element type
            if (hoveredElement.tagName.toLowerCase() === 'img') {
              attributes.src = hoveredElement.getAttribute('src') ?? ''
              attributes.alt = hoveredElement.getAttribute('alt') ?? ''
            } else if (hoveredElement.tagName.toLowerCase() === 'a') {
              attributes.href = hoveredElement.getAttribute('href') ?? ''
              attributes.target = hoveredElement.getAttribute('target') ?? ''
            }

            // Add style and class attributes for all elements if they exist
            if (hoveredElement.getAttribute('style')) {
              attributes.style = hoveredElement.getAttribute('style') ?? ''
            }
            if (hoveredElement.getAttribute('class')) {
              attributes.class = hoveredElement.getAttribute('class') ?? ''
            }

            // Create the edit request
            const editRequest: ElementEditRequest = {
              tagName: hoveredElement.tagName.toLowerCase(),
              classList: Array.from(hoveredElement.classList),
              id: hoveredElement.id || undefined,
              elementPath,
              content:
                hoveredElement.innerText ?? hoveredElement.textContent ?? '',
              attributes,
              type: elementInfo?.type ?? 'content',
            }

            onElementSelect(editRequest)
          }

          const handleMouseLeave = () => {
            hoveredElementRef.current = null
            setHighlightPosition((prev) => ({ ...prev, display: 'none' }))
            setElementInfo(null)
          }

          // Add event listeners
          iframeDocument.addEventListener('mousemove', handleMouseMove)
          iframeDocument.addEventListener('click', handleClick)
          iframeDocument.addEventListener('mouseleave', handleMouseLeave)

          // Cleanup function
          return () => {
            iframeDocument.removeEventListener('mousemove', handleMouseMove)
            iframeDocument.removeEventListener('click', handleClick)
            iframeDocument.removeEventListener('mouseleave', handleMouseLeave)
            iframeDocument.removeEventListener(
              'click',
              preventLinkNavigation,
              true
            )
            console.log('Edit mode event listeners removed from iframe')
          }
        } catch (error) {
          console.error('Error setting up iframe event handlers:', error)
        }
      }, 500) // Give iframe time to load

      return () => {
        clearTimeout(initTimeout)
      }
    }

    iframe.addEventListener('load', onIframeLoad)

    // If the iframe is already loaded, call immediately
    if (iframe.contentDocument?.readyState === 'complete') {
      onIframeLoad()
    }

    return () => {
      iframe.removeEventListener('load', onIframeLoad)
      // You may want to also remove listeners from the iframeDocument if needed
    }
  }, [isActive, iframeRef, onElementSelect, elementInfo?.type])

  useEffect(() => {
    if (!isActive || !iframeRef.current) return

    // ...rest of your code...
  }, [isActive, iframeRef])

  if (!isActive) return null

  return (
    <div className={styles.overlayContainer}>
      {/* Highlight box */}
      <div
        className={styles.highlight}
        style={{
          top: `${highlightPosition.top}px`,
          left: `${highlightPosition.left}px`,
          width: `${highlightPosition.width}px`,
          height: `${highlightPosition.height}px`,
          display: highlightPosition.display,
        }}
      />

      {/* Element info tooltip */}
      {elementInfo && highlightPosition.display === 'block' && (
        <div
          className={styles.tooltip}
          style={{
            top: `${highlightPosition.top + highlightPosition.height}px`,
            left: `${highlightPosition.left}px`,
          }}
        >
          <div className={styles.tooltipType}>{elementInfo.type}</div>
          <div className={styles.tooltipContent}>
            {elementInfo.content.substring(0, 40)}
            {elementInfo.content.length > 40 ? '...' : ''}
          </div>
          <div className={styles.tooltipInstructions}>
            Click to edit this element
          </div>
        </div>
      )}

      {/* Instructions modal - show initially */}
      {showInstructions && (
        <div className={styles.instructions}>
          <div className={styles.instructionsContent}>
            <h5>Website Edit Mode</h5>
            <ul>
              <li>Hover over any element you want to modify</li>
              <li>Click on the element to open the editor</li>
              <li>You can edit text, images, links, and more</li>
              <li>
                Use &quot;Direct Edit&quot; for simple changes or &quot;AI
                Assist&quot; for advanced improvements
              </li>
            </ul>
            <button
              className={styles.closeInstructionsButton}
              onClick={() => setShowInstructions(false)}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
