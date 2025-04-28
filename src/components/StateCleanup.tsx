'use client'

import { useEffect } from 'react'
import { cleanupOldSavedStates } from '../functions/usePageRefreshHandler'

export function StateCleanup() {
  useEffect(() => {
    // Check if a form was just completed
    const formJustCompleted =
      localStorage.getItem('form_just_completed') === 'true'

    // Check if we have a saved preview state
    const hasSavedPreview =
      localStorage.getItem('latest_generated_html') !== null

    // If a form was just completed or we're in preview mode, skip cleanup
    if (formJustCompleted || hasSavedPreview) {
      return
    }

    // Clean up old saved states on app init
    cleanupOldSavedStates()

    // Rest of your cleanup code...
  }, [])

  return null // This component doesn't render anything
}
