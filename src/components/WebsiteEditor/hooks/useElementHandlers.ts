import { useEffect } from 'react'
import { EditableElement } from '../EditableElement'

interface UseElementHandlersProps {
  iframeRef: HTMLIFrameElement | null
  editableElements: EditableElement[]
  selectedElement: string | null
  setSelectedElement: (id: string | null) => void
  setShowEditPanel: (show: boolean) => void
  findElementByPath: (doc: Document, element: EditableElement) => HTMLElement | null
}

export const useElementHandlers = ({
  iframeRef,
  editableElements,
  selectedElement,
  setSelectedElement,
  setShowEditPanel,
  findElementByPath,
}: UseElementHandlersProps) => {
  // Add event handlers to elements in the iframe
  useEffect(() => {
    if (iframeRef) {
      const doc = iframeRef.contentDocument
      if (doc) {
        // Add styles
        const style = doc.createElement('style')
        style.textContent = `
          .editable-highlight { cursor:pointer; position:relative; transition:all 0.2s; }
          .text-element { outline:1px dashed rgba(92,124,250,0.5); }
          .text-element:hover { outline:2px dashed #5c7cfa; background:rgba(92,124,250,0.1); }
          .image-element { outline:1px dashed rgba(92,124,250,0.5); }
          .image-element:hover { outline:2px dashed #5c7cfa; filter:brightness(1.05); }
          .bg-image-element { outline:1px dashed rgba(250,92,92,0.5); }
          .bg-image-element:hover { outline:2px dashed #fa5c5c; background:rgba(250,92,92,0.1); }
          .service-container-element { outline:1px dashed rgba(75,181,67,0.5); }
          .service-container-element:hover { outline:2px dashed #4bb543; background:rgba(75,181,67,0.1); }
          .active-element { outline:2px solid #0d6efd !important; box-shadow:0 0 0 4px rgba(13,110,253,0.25); }
          .editable-highlight::before {
            content:"Click to edit"; position:absolute; top:-30px; left:50%; transform:translateX(-50%);
            background:#0d6efd; color:white; padding:3px 8px; border-radius:4px; font-size:12px;
            white-space:nowrap; z-index:1000; pointer-events:none; opacity:0; transition: opacity 0.2s;
          }
          .service-container-element::before {
            content:"Service container - Click to add services"; 
          }
          .editable-highlight:hover::before {
            opacity:0.9;
          }
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(-20px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
          }
          
          .refresh-message {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #198754;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            animation: fadeInOut 2s ease-in-out forwards;
          }
        `
        doc.head.appendChild(style)

        // Add handlers to text elements
        editableElements
          .filter((el) => el.type === 'text')
          .forEach((element) => {
            try {
              const el = findElementByPath(doc, element)

              if (el) {
                el.classList.add('editable-highlight', 'text-element')
                if (selectedElement === element.id)
                  el.classList.add('active-element')
                el.addEventListener('click', (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelectedElement(element.id)
                  setShowEditPanel(true)
                })
              }
            } catch (err) {
              console.error('Error adding handler to text element:', err)
            }
          })

        // Add handlers to image elements
        editableElements
          .filter((el) => el.type === 'image')
          .forEach((element) => {
            try {
              const el = findElementByPath(doc, element)
              if (el) {
                el.classList.add('editable-highlight', 'image-element')
                if (selectedElement === element.id)
                  el.classList.add('active-element')
                el.addEventListener('click', (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelectedElement(element.id)
                  setShowEditPanel(true)
                })
              }
            } catch (err) {
              console.error('Error adding handler to image element:', err)
            }
          })

        // Add handlers to background image elements
        editableElements
          .filter((el) => el.type === 'backgroundImage')
          .forEach((element) => {
            try {
              if (element.selector) {
                const el = doc.querySelector(element.selector)
                if (el) {
                  el.classList.add('editable-highlight', 'bg-image-element')
                  if (selectedElement === element.id)
                    el.classList.add('active-element')
                  el.addEventListener('click', (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedElement(element.id)
                    setShowEditPanel(true)
                  })
                }
              }
            } catch (err) {
              console.error(
                'Error adding handler to background image element:',
                err
              )
            }
          })

        // Add handlers to service container elements
        editableElements
          .filter((el) => el.type === 'serviceContainer')
          .forEach((element) => {
            try {
              const el = findElementByPath(doc, element)
              if (el) {
                el.classList.add(
                  'editable-highlight',
                  'service-container-element'
                )
                if (selectedElement === element.id)
                  el.classList.add('active-element')

                el.addEventListener('click', (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelectedElement(element.id)
                  setShowEditPanel(true)
                })
              }
            } catch (err) {
              console.error('Error adding handler to service container:', err)
            }
          })
      }
    }
  }, [
    iframeRef, 
    editableElements, 
    selectedElement, 
    setSelectedElement, 
    setShowEditPanel,
    findElementByPath
  ])
}