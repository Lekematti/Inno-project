import { useEffect, useCallback, useRef } from 'react'

interface PageRefreshHandlerOptions {
  /**
   * Current content that should be preserved
   */
  currentContent: string

  /**
   * Unique key to identify this content in storage
   */
  storageKey?: string

  /**
   * Optional reference content to check for unsaved changes
   */
  referenceContent?: string

  /**
   * Function to restore content
   */
  onRestore?: (content: string) => void

  /**
   * Warning message to display before unload (default: standard unsaved changes message)
   */
  warningMessage?: string

  /**
   * Whether to prompt for restoration (default: true)
   */
  promptRestore?: boolean
}

/**
 * Custom hook to handle page refreshes and maintain state
 */
export const usePageRefreshHandler = ({
  currentContent,
  storageKey = 'savedContent',
  referenceContent,
  onRestore,
  warningMessage = 'You have unsaved changes. Are you sure you want to leave?',
  promptRestore = true,
}: PageRefreshHandlerOptions) => {
  // Create refs to prevent infinite loops
  const hasRestoredRef = useRef(false)
  const previousContentRef = useRef(currentContent)

  // Generate a unique storage key if a custom one isn't provided
  const getFullStorageKey = useCallback(() => {
    // If using a custom key, use it directly
    if (storageKey !== 'savedContent') {
      return storageKey
    }

    // Otherwise, create a hash from the reference content to make it unique to this page
    const contentHash = referenceContent
      ? btoa(referenceContent.substring(0, 100))
          .substring(0, 10)
          .replace(/[+/=]/g, '')
      : ''

    return `${storageKey}-${contentHash}`
  }, [storageKey, referenceContent])

  // Save the current content to localStorage when it changes
  useEffect(() => {
    if (!currentContent) return

    // Skip if this is just initialization or no real change
    if (previousContentRef.current === currentContent) return

    // Update previous content ref
    previousContentRef.current = currentContent

    // Don't save if content matches reference (nothing to save)
    if (referenceContent && currentContent === referenceContent) return

    const key = getFullStorageKey()

    try {
      localStorage.setItem(key, currentContent)

      // Update timestamp
      const now = new Date().getTime()
      localStorage.setItem(`${key}-timestamp`, now.toString())
    } catch (error) {
      console.warn('Failed to save content to localStorage:', error)

      // Attempt to clear some space if it's a quota error
      if (
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' ||
          error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
      ) {
        // Try to free up space by removing older items
        pruneLocalStorage()

        // Try one more time after pruning
        try {
          localStorage.setItem(key, currentContent)
          localStorage.setItem(
            `${key}-timestamp`,
            new Date().getTime().toString()
          )
        } catch (retryError) {
          console.error(
            'Still unable to save content after pruning localStorage:',
            retryError
          )
        }
      }
    }
  }, [currentContent, getFullStorageKey, referenceContent])

  // Add this helper function to prune localStorage when quota is exceeded
  const pruneLocalStorage = () => {
    // Get all keys
    const keys = Object.keys(localStorage)

    // Get timestamp keys and their values
    const timeEntries = keys
      .filter((key) => key.endsWith('-timestamp'))
      .map((key) => {
        const timestamp = parseInt(localStorage.getItem(key) || '0', 10)
        const baseKey = key.replace('-timestamp', '')
        return { baseKey, timestamp }
      })
      .sort((a, b) => a.timestamp - b.timestamp) // Sort oldest first

    // Remove oldest 20% of entries to free up space
    const toRemove = Math.max(1, Math.floor(timeEntries.length * 0.2))
    timeEntries.slice(0, toRemove).forEach(({ baseKey }) => {
      localStorage.removeItem(baseKey)
      localStorage.removeItem(`${baseKey}-timestamp`)
    })
  }

  // Check for unsaved content on page load
  useEffect(() => {
    // Don't run this effect if:
    // 1. We've already restored once in this session
    // 2. The user doesn't want prompts
    // 3. We don't have a restore function
    if (hasRestoredRef.current || !promptRestore || !onRestore) return

    // Skip restoration if a form was just completed
    if (localStorage.getItem('form_just_completed') === 'true') {
      return
    }

    const key = getFullStorageKey()
    const savedContent = localStorage.getItem(key)

    if (
      savedContent &&
      savedContent !== referenceContent &&
      savedContent !== currentContent
    ) {
      // Set flag to prevent this from running again
      hasRestoredRef.current = true

      // We have saved content that differs from both reference and current
      if (
        confirm(
          'We found unsaved work from your previous session. Would you like to restore it?'
        )
      ) {
        onRestore(savedContent)
      } else {
        // User declined, clean up storage
        localStorage.removeItem(key)
        localStorage.removeItem(`${key}-timestamp`)
      }
    }
  }, [
    getFullStorageKey,
    referenceContent,
    onRestore,
    promptRestore,
    currentContent,
  ])

  // Handle beforeunload event to warn users about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (referenceContent && currentContent !== referenceContent) {
        // Standard for modern browsers
        e.preventDefault()
        // For older browsers
        e.preventDefault()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [currentContent, referenceContent, warningMessage])

  // Function to clear saved content (call this after successful save)
  const clearSavedContent = useCallback(() => {
    const key = getFullStorageKey()
    try {
      localStorage.removeItem(key)
      localStorage.removeItem(`${key}-timestamp`)
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }, [getFullStorageKey])
  return { clearSavedContent }
}

/**
 * Utility function to clean up old saved states
 * Call this occasionally from your app (e.g., on app init)
 */
export const cleanupOldSavedStates = () => {
  // Only run in the browser
  if (typeof window === 'undefined') return

  const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
  const now = new Date().getTime()

  // Get all keys that might be ours
  const keysToCheck = Object.keys(localStorage).filter(
    (key) =>
      key.includes('savedContent') ||
      key.includes('website-editor') ||
      key.includes('website-preview')
  )

  // Check timestamp for each key
  keysToCheck.forEach((key) => {
    // Skip special keys like "prompts" that might match our filter
    if (key.endsWith('-timestamp')) return

    const timestampKey = `${key}-timestamp`
    const timestamp = localStorage.getItem(timestampKey)

    if (timestamp) {
      const age = now - parseInt(timestamp, 10)
      if (age > MAX_AGE_MS) {
        // Too old, clean it up
        localStorage.removeItem(key)
        localStorage.removeItem(timestampKey)
      }
    }
  })
}

/**
 * Clear all form-related localStorage data
 * Call this when a user successfully completes form submission
 */
export const clearFormData = () => {
  if (typeof window === 'undefined') return

  // Get all localStorage keys
  const keys = Object.keys(localStorage)

  // Filter keys that look like form data
  keys.forEach((key) => {
    // Clear form-related data
    if (
      key.includes('form') ||
      key.includes('input') ||
      key.includes('website-builder') ||
      key.includes('savedContent')
    ) {
      localStorage.removeItem(key)
      // Also remove any associated timestamp
      localStorage.removeItem(`${key}-timestamp`)
    }
  })

  // Set a flag to prevent restore prompts temporarily
  localStorage.setItem('form_just_completed', 'true')

  // Remove this flag after a short delay
  setTimeout(() => {
    localStorage.removeItem('form_just_completed')
  }, 3000)
}
