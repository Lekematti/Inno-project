import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { PreviewProps } from '@/types/formData'

export const AiGenComponent = forwardRef<HTMLIFrameElement, PreviewProps>(({
  htmlContent,
  width = '100%',
  height = '100%',
  onError,
  editMode = false,
  sandboxOptions = 'allow-same-origin allow-scripts allow-modals allow-forms',
}, ref) => {
  const [error, setError] = useState<string>('');
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);
  const [loadingImages, setLoadingImages] = useState<boolean>(true)
  const internalRef = React.useRef<HTMLIFrameElement>(null);
 
  // Forward the ref while maintaining our internal ref
  useImperativeHandle(ref, () => internalRef.current!, []);

  useEffect(() => {
    if (!htmlContent) {
      setError('No content to display')
      return
    }

    try {
      // Create a blob from the HTML content
      const processedHtml = htmlContent.replace(
        /src="\/uploads\//g,
        `src="${window.location.origin}/uploads/`
      )

      // Add image loading tracking script to check when all images are loaded
      // Including tracking for CSS background images
      const htmlWithImageTracking = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Website Preview</title>
            <base href="${window.location.origin}/">
            <style>
              /* Disable interactions based on edit mode */
              ${!editMode ? `
              * {
                pointer-events: none !important;
                user-select: none !important;
              }
              /* Hide form elements */
              input, button, textarea, select, option {
                pointer-events: none !important;
                user-select: none !important;
                opacity: 0.7;
              }
              ` : ''}
              /* Make the body scrollable to view entire content */
              body {
                overflow-y: auto;
                cursor: ${editMode ? 'default' : 'default'} !important;
              }
              /* Prevent event bubbling */
              html, body {
                pointer-events: auto !important; /* Allow scrolling */
              }
              /* Disable all JavaScript execution except our loader during preview */
              script:not(#image-loader-script) {
                display: none !important;
              }
              /* Loading overlay */
              #loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(255, 255, 255, 0.8);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                transition: opacity 0.3s ease-out;
              }
              .loading-spinner {
                width: 50px;
                height: 50px;
                border: 5px solid #f3f3f3;
                border-top: 5px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              .loading-text {
                margin-top: 10px;
                font-family: Arial, sans-serif;
                color: #333;
              }
              .img-placeholder {
                background-color: #f0f0f0;
                position: relative;
                min-height: 100px;
                min-width: 100px;
              }
              .img-placeholder::before {
                content: "Loading image...";
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-family: Arial, sans-serif;
                color: #666;
                font-size: 14px;
              }
              /* Add placeholder for background image elements */
              .bg-loading {
                position: relative;
              }
              .bg-loading::before {
                content: "Loading background...";
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-family: Arial, sans-serif;
                color: white;
                background-color: rgba(0,0,0,0.5);
                padding: 5px 10px;
                border-radius: 4px;
                z-index: 5;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <!-- Loading overlay -->
            <div id="loading-overlay">
              <div class="loading-spinner"></div>
              <div class="loading-text">Loading website content...</div>
            </div>
            
            ${processedHtml}
            
            <script id="image-loader-script">
              // Image loading tracking - Enhanced to handle CSS background images
              (function() {
                // Function to preload an image and return a promise
                function preloadImage(url) {
                  return new Promise((resolve, reject) => {
                    if (!url || url === 'none' || url === 'transparent') {
                      resolve();
                      return;
                    }
                    
                    // Clean URL if it contains CSS url() syntax
                    if (url.includes('url(')) {
                      url = url.replace(/url\\(['"]?|['"]?\\)/g, '');
                    }
                    
                    // Skip data URLs
                    if (url.startsWith('data:')) {
                      resolve();
                      return;
                    }
                    
                    // Try to fix relative paths for background images
                    if (url.startsWith('./') || url.startsWith('../') || !url.startsWith('http')) {
                      // If it's a relative path to an image in gen_comp folder
                      if (url.includes('images/image-')) {
                        // Extract the filename
                        const parts = url.split('/');
                        const filename = parts[parts.length - 1];
                        
                        // Try the API static route - multiple attempts with different formats
                        const pathPattern = window.location.pathname;
                        if (pathPattern.includes('/gen_comp/')) {
                          const folderMatch = pathPattern.match(/\\/gen_comp\\/([^\\/]+)/);
                          if (folderMatch && folderMatch[1]) {
                            const folderName = folderMatch[1];
                            url = \`/api/static/\${folderName}/images/\${filename}\`;
                          }
                        } else {
                          // If we can't extract the folder, try using the API fallback
                          url = \`/api/images/\${filename}\`;
                        }
                      }
                    }
                    
                    // Create an image element to preload the image
                    const img = new Image();
                    img.onload = () => resolve(url);
                    img.onerror = () => {
                      console.error('Failed to load image:', url);
                      // Try alternate API route on error
                      if (url.includes('/images/image-')) {
                        const filename = url.split('/').pop();
                        const newUrl = \`/api/images/\${filename}\`;
                        console.log('Trying alternate URL:', newUrl);
                        const retryImg = new Image();
                        retryImg.onload = () => {
                          console.log('Successfully loaded with alternate URL:', newUrl);
                          resolve(newUrl);
                        };
                        retryImg.onerror = () => {
                          console.error('Also failed with alternate URL:', newUrl);
                          reject(new Error(\`Failed to load image: \${url}\`));
                        };
                        retryImg.src = newUrl;
                      } else {
                        reject(new Error(\`Failed to load image: \${url}\`));
                      }
                    };
                    img.src = url;
                  });
                }
                
                // Count image elements
                const allImages = document.querySelectorAll('img');
                let totalImages = allImages.length;
                let loadedImages = 0;
                let failedImages = 0;
                let backgroundImagesToLoad = 0;
                let loadedBackgrounds = 0;
                
                // Add placeholder classes to all images
                allImages.forEach(img => {
                  img.classList.add('img-placeholder');
                });
                
                // Function to extract background image URLs from computed styles
                function getBackgroundImageUrl(element) {
                  const style = window.getComputedStyle(element);
                  const backgroundImage = style.backgroundImage;
                  
                  if (backgroundImage && backgroundImage !== 'none') {
                    return backgroundImage.replace(/url\\(['"]?|['"]?\\)/g, '');
                  }
                  return null;
                }
                
                // Find all elements with background images
                const elementsWithBackgroundImage = [];
                function findElementsWithBackgroundImage(element) {
                  const url = getBackgroundImageUrl(element);
                  
                  if (url && !url.startsWith('data:')) {
                    elementsWithBackgroundImage.push({
                      element: element,
                      url: url
                    });
                    
                    // Add a loading indicator 
                    element.classList.add('bg-loading');
                  }
                  
                  // Check children recursively
                  Array.from(element.children).forEach(child => {
                    findElementsWithBackgroundImage(child);
                  });
                }
                
                // Start the search from the body
                findElementsWithBackgroundImage(document.body);
                
                // Update total count to include background images
                backgroundImagesToLoad = elementsWithBackgroundImage.length;
                console.log('Found elements with background images:', backgroundImagesToLoad);
                
                // Function to check if all images are loaded
                function checkAllImagesLoaded() {
                  if (loadedImages + failedImages >= totalImages && 
                      loadedBackgrounds >= backgroundImagesToLoad) {
                    // All images have been processed, hide loading overlay
                    document.getElementById('loading-overlay').style.opacity = '0';
                    setTimeout(() => {
                      document.getElementById('loading-overlay').style.display = 'none';
                    }, 300);
                    
                    // Send message to parent that all images are loaded
                    window.parent.postMessage({
                      type: 'IMAGES_LOADED', 
                      success: true,
                      counts: {
                        regular: { total: totalImages, loaded: loadedImages, failed: failedImages },
                        backgrounds: { total: backgroundImagesToLoad, loaded: loadedBackgrounds }
                      }
                    }, '*');
                  }
                }
                
                // Handle image element load events
                allImages.forEach(img => {
                  // For already loaded images
                  if (img.complete) {
                    loadedImages++;
                    img.classList.remove('img-placeholder');
                    checkAllImagesLoaded();
                  } else {
                    // For images still loading
                    img.addEventListener('load', function() {
                      loadedImages++;
                      img.classList.remove('img-placeholder');
                      checkAllImagesLoaded();
                    });
                    
                    // Handle image load errors
                    img.addEventListener('error', function(e) {
                      failedImages++;
                      
                      // Try to reload the image with correct path if it's a relative path error
                      if (img.src.includes('/gen_comp/') && !img.dataset.retried) {
                        img.dataset.retried = 'true';
                        
                        // Extract filename from path
                        const pathParts = img.src.split('/');
                        const filename = pathParts[pathParts.length - 1];
                        
                        // Extract folder name using regex
                        const folderMatch = img.src.match(/\\/gen_comp\\/([^\\/]+)/);
                        
                        if (folderMatch && folderMatch[1]) {
                          const folderName = folderMatch[1];
                          // Try alternate path format
                          const newSrc = \`/api/static/\${folderName}/images/\${filename}\`;
                          console.log('Retrying with path:', newSrc);
                          img.src = newSrc;
                        } else {
                          // Try API fallback
                          const newSrc = \`/api/images/\${filename}\`;
                          console.log('Retrying with fallback API path:', newSrc);
                          img.src = newSrc;
                        }
                      } else {
                        // Keep placeholder for failed images that can't be fixed
                        checkAllImagesLoaded();
                      }
                    });
                  }
                });
                
                // Preload all background images
                if (backgroundImagesToLoad > 0) {
                  elementsWithBackgroundImage.forEach(item => {
                    preloadImage(item.url)
                      .then(fixedUrl => {
                        loadedBackgrounds++;
                        item.element.classList.remove('bg-loading');
                        
                        // If we got a fixed URL back, update the style
                        if (fixedUrl && typeof fixedUrl === 'string') {
                          item.element.style.backgroundImage = \`url(\${fixedUrl})\`;
                        }
                        
                        checkAllImagesLoaded();
                      })
                      .catch(error => {
                        console.error('Background image load failed:', error);
                        loadedBackgrounds++;
                        item.element.classList.remove('bg-loading');
                        checkAllImagesLoaded();
                      });
                  });
                } else {
                  // No background images to load
                  console.log('No background images to preload');
                }
                
                // If there are no images at all, hide loading immediately
                if (totalImages === 0 && backgroundImagesToLoad === 0) {
                  document.getElementById('loading-overlay').style.display = 'none';
                  window.parent.postMessage({type: 'IMAGES_LOADED', success: true}, '*');
                }
                
                // If loading takes too long, hide overlay anyway after 15 seconds
                setTimeout(() => {
                  document.getElementById('loading-overlay').style.display = 'none';
                  window.parent.postMessage({
                    type: 'IMAGES_LOADED', 
                    success: false, 
                    timeout: true,
                    counts: {
                      regular: { total: totalImages, loaded: loadedImages, failed: failedImages },
                      backgrounds: { total: backgroundImagesToLoad, loaded: loadedBackgrounds }
                    }
                  }, '*');
                }, 15000);
              })();
            </script>
          </body>
        </html>
      `

      // Create an object URL from the blob
      const blob = new Blob([htmlWithImageTracking], { type: 'text/html' })
      const url = URL.createObjectURL(blob)

      // Set the iframe src to the object URL
      if (internalRef.current) {
        internalRef.current.src = url

        // Listen for messages from the iframe
        const handleMessage = (event: MessageEvent) => {
          // Check if the message is from our iframe
          if (event.data && event.data.type === 'IMAGES_LOADED') {
            setLoadingImages(false)
            console.log('Images loaded status:', event.data)
          }
        }

        window.addEventListener('message', handleMessage)

        // Clean up the object URL and event listener when the component unmounts or content changes
        return () => {
          URL.revokeObjectURL(url)
          window.removeEventListener('message', handleMessage)
        }
      }
    } catch (err) {
      const errorMsg = `Error loading preview: ${
        err instanceof Error ? err.message : String(err)
      }`
      setError(errorMsg)
      if (onError) onError(errorMsg)
    }
  }, [htmlContent, onError, editMode]);
 
  if (error) {
    return (
      <div
        style={{
          width,
          height,
          border: '1px solid #f44336',
          padding: '1rem',
          backgroundColor: '#ffebee',
          color: '#d32f2f',
        }}
      >
        {error}
      </div>
    )
  }

  return (
    <iframe
      ref={internalRef}
      title="Website Preview"
      style={{
        width,
        height,
        border: '1px solid #e0e0e0',
        backgroundColor: 'white'
      }}
      sandbox={sandboxOptions}
      onLoad={() => setIframeLoaded(true)}
      loading="lazy"
      aria-label="Generated website preview"
    />
  );
});

// Add display name for better debugging and React DevTools
AiGenComponent.displayName = 'AiGenComponent';