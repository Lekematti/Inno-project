/**
 * Custom React hook that manages form state and logic for website generation
 */
import { useState, useCallback, useRef } from 'react'
import { templates } from '@/functions/inputGenerate'
import { processUserColors } from '@/app/build/colorProcessor'
import {
  type FormData,
  FormHandlerHook,
  BusinessType,
  ImageSourceType,
  defaultFormData,
} from '@/types/formData'

/**
 * Hook for managing website generation form state and operations
 */
export const useFormHandlers = (): FormHandlerHook => {
  // State management
  const [formData, setFormData] = useState<FormData>(defaultFormData)

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [generatedHtml, setGeneratedHtml] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false)

  const isSubmittingRef = useRef(false)

  /**
   * Validates that all required form fields are completed
   */
  const checkAllQuestionsAnswered = useCallback((): boolean => {
    if (
      !formData.businessType ||
      !formData.address ||
      !formData.phone ||
      !formData.email
    ) {
      return false
    }

    const businessType = formData.businessType.toLowerCase() as BusinessType
    if (!['restaurant', 'logistics', 'professional'].includes(businessType)) {
      return false
    }

    const template = templates[businessType]
    const questions = template?.questions || []

    return questions.every((_, i) => {
      const fieldName = `question${i + 1}` as keyof FormData
      const value = formData[fieldName]
      return typeof value === 'string' && value.trim() !== ''
    })
  }, [formData])

  /**
   * Processes all colors in form data to ensure they're web-appropriate
   */
  const processFormColors = useCallback((data: FormData): FormData => {
    const businessType = data.businessType?.toLowerCase() as BusinessType

    // Look for colors in any question field and in the colorScheme field
    let colorString = data.colorScheme as string

    // If no colorScheme, try to find colors in question fields
    if (!colorString) {
      for (let i = 1; i <= 10; i++) {
        const fieldName = `question${i}` as keyof FormData
        const value = data[fieldName]
        if (value && typeof value === 'string' && value.includes('#')) {
          colorString = value
          break
        }
      }
    }

    if (colorString && colorString.trim() !== '') {
      const colors = colorString.split(',').filter(Boolean)
      if (colors.length > 0) {
        // Process and validate the colors
        const processedColors = processUserColors(colors, businessType)

        // Return updated form data with processed colors
        return {
          ...data,
          colorScheme: processedColors.join(','),
        }
      }
    }

    return data
  }, [])

  /**
   * Sends form data to the API endpoint to generate website with enhanced error handling
   */
  const generateWebsite = useCallback(async (): Promise<void> => {
    if (isLoading || isSubmittingRef.current) return

    isSubmittingRef.current = true
    setIsLoading(true)
    setError('')

    try {
      // Process colors before submission
      const processedFormData = processFormColors(formData)

      // Create FormData object for file uploads
      const submitData = new FormData()

      // Add basic fields
      submitData.append('businessType', formData.businessType)
      submitData.append('address', formData.address)
      submitData.append('phone', formData.phone)
      submitData.append('email', formData.email)

      // Add image source
      const imageSource = (formData.imageSource as ImageSourceType) || 'none'
      submitData.append('imageSource', imageSource)

      // Process images based on source type
      if (imageSource === 'ai' && formData.imageInstructions) {
        submitData.append('imageInstructions', formData.imageInstructions)
      } else if (
        imageSource === 'manual' &&
        formData.uploadedImages &&
        formData.uploadedImages.length > 0
      ) {
        // Add all uploaded files individually with the same field name
        for (let i = 0; i < formData.uploadedImages.length; i++) {
          submitData.append('uploadedImages', formData.uploadedImages[i])
        }

        console.log(`Uploading ${formData.uploadedImages.length} images`)
      }

      // Add all question answers
      Object.entries(formData).forEach(([key, value]) => {
        if (key.startsWith('question') && value) {
          submitData.append(key, value as string)
        }
      })

      // Add any optional fields that might be needed
      if (formData.businessName) {
        submitData.append('businessName', formData.businessName)
      }

      if (processedFormData.colorScheme) {
        submitData.append('colorScheme', processedFormData.colorScheme)
      }

      if (formData.templateVariant) {
        submitData.append('templateVariant', formData.templateVariant)
      }
      // Add design preferences for more modern results
      submitData.append(
        'designPreferences',
        JSON.stringify({
          modernDesign: true,
          useGlassmorphism: true,
          animationLevel: 'subtle',
          layoutComplexity: 'advanced',
          useCustomCssProperties: true,
        })
      )

      console.log('Submitting form data with image source:', imageSource)

      const response = await fetch('/api/generatePage', {
        method: 'POST',
        body: submitData,
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.htmlContent) {
        // Verify basic HTML structure and Bootstrap inclusion before setting
        if (
          !data.htmlContent.includes('<html') ||
          !data.htmlContent.includes('</html>')
        ) {
          console.warn(
            '⚠️ Warning: Generated HTML may be incomplete, attempting to fix...'
          )
          data.htmlContent = `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
                <title>${formData.businessName || 'Business Website'}</title>
              </head>
              <body>
                ${data.htmlContent}
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" defer></script>
              </body>
            </html>`
        }

        // Ensure Bootstrap is included
        if (!data.htmlContent.includes('bootstrap.min.css')) {
          console.warn('⚠️ Warning: Bootstrap CSS may be missing, adding it...')
          data.htmlContent = data.htmlContent.replace(
            '</head>',
            '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"></head>'
          )
        }

        if (!data.htmlContent.includes('bootstrap.bundle.min.js')) {
          console.warn('⚠️ Warning: Bootstrap JS may be missing, adding it...')
          data.htmlContent = data.htmlContent.replace(
            '</body>',
            '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" defer></script></body>'
          )
        }

        setGeneratedHtml(data.htmlContent)
        // Update form data with response data
        setFormData((prev) => ({
          ...prev,
          filePath: data.filePath,
          generatedImageUrls: data.imageUrls || [],
        }))
        setIsReady(true)
      } else {
        throw new Error('No HTML content received')
      }
    } catch (err) {
      console.error(
        'Error generating website:',
        err instanceof Error ? err.message : String(err)
      )
      setError('Failed to generate website. Please try again.')
    } finally {
      setIsLoading(false)
      isSubmittingRef.current = false
    }
  }, [formData, isLoading, processFormColors])

  return {
    formData,
    setFormData,
    isLoading,
    isReady,
    generatedHtml,
    error,
    step,
    setStep,
    allQuestionsAnswered,
    setAllQuestionsAnswered,
    checkAllQuestionsAnswered,
    generateWebsite,
    setError,
  }
}
