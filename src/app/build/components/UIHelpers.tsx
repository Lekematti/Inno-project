import { Button } from 'react-bootstrap'
import { FormData as GlobalFormData } from '@/types/formData'

export const ColorTips = () => (
  <div
    className="color-info alert alert-info mt-2 mb-3 p-2"
    style={{ fontSize: '0.85rem' }}
  >
    <p className="mb-1">
      <strong>🎨 Color Tips:</strong>
    </p>
    <ul className="mb-0 ps-3">
      <li>Choose colors that reflect your brand personality</li>
      <li>Industry-specific suggestions are provided as buttons</li>
      <li>Your selected color will generate a harmonious palette</li>
      <li>Good color choice improves user experience and conversions</li>
    </ul>
  </div>
)

export const LoadingIndicator = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexGrow: 1,
      textAlign: 'center',
    }}
  >
    <div>
      <p>Generating your website...</p>
      <output className="spinner-border">
        <span className="visually-hidden">Loading...</span>
      </output>
    </div>
  </div>
)

export const DownloadSection = ({
  generatedHtml,
  formData,
}: {
  generatedHtml: string
  formData: GlobalFormData

}) => {
  // Use standaloneHtml for opening in a new tab
  const handleOpenInNewTab = () => {
    const htmlToOpen = standaloneHtml ?? generatedHtml;
    
    // Check if HTML content exists
    if (!htmlToOpen || htmlToOpen.trim() === '') {
      console.error("No HTML content available");
      alert("No HTML content available to display");
      return;
    }
    
    // Create a blob with the HTML
    const blob = new Blob([htmlToOpen], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open in a new tab and clean up the URL when done
    const newWindow = window.open(url, '_blank');
    
    // Clean up the URL after the window has loaded
    if (newWindow) {
      newWindow.addEventListener('load', () => {
        // Small delay to ensure the content is properly loaded
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
    }
  };
  
  const handleShare = async () => {
    // Use standaloneHtml if available, fallback to generatedHtml
    const htmlToShare = standaloneHtml ?? generatedHtml;
    
    try {
      const blob = new Blob([generatedHtml], { type: 'text/html' })
      const file = new File(
        [blob],
        `${formData.businessType || 'website'}-site.html`,
        { type: 'text/html' }
      )

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${formData.businessType || 'Website'} - Generated Site`,
          text: 'Check out my new website created with WebWeave!',
        })
      } else {
        alert('Web Share API is not supported in your browser.')
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  return (
    <div className="mt-4 mb-5 text-center">
      <h3>Your website is ready!</h3>
      <p className="text-muted">
        You can now download or open your website in a new tab and see the
        functionality of it.
      </p>
      <div className="d-flex justify-content-center gap-3 flex-wrap">
        <Button
          variant="primary"
          onClick={() => {
            let htmlWithAbsolutePaths = generatedHtml

            htmlWithAbsolutePaths = htmlWithAbsolutePaths.replace(
              /src="\/uploads\//g,
              `src="${window.location.origin}/uploads/`
            )

            htmlWithAbsolutePaths = htmlWithAbsolutePaths.replace(
              /background-image:\s*url\(['"]?\/uploads\//g,
              `background-image: url('${window.location.origin}/uploads/`
            )

            htmlWithAbsolutePaths = htmlWithAbsolutePaths.replace(
              /content="\/uploads\//g,
              `content="${window.location.origin}/uploads/`
            )

            const blob = new Blob([htmlWithAbsolutePaths], {
              type: 'text/html',
            })
            const url = URL.createObjectURL(blob)
            window.open(url, '_blank')
          }}
        >
          Open in New Tab
        </Button>
        <Button
          variant="outline-secondary"
          onClick={() => {
            let htmlWithAbsolutePaths = generatedHtml

            htmlWithAbsolutePaths = htmlWithAbsolutePaths.replace(
              /src="\/uploads\//g,
              `src="${window.location.origin}/uploads/`
            )

            htmlWithAbsolutePaths = htmlWithAbsolutePaths.replace(
              /background-image:\s*url\(['"]?\/uploads\//g,
              `background-image: url('${window.location.origin}/uploads/`
            )

            htmlWithAbsolutePaths = htmlWithAbsolutePaths.replace(
              /content="\/uploads\//g,
              `content="${window.location.origin}/uploads/`
            )

            const blob = new Blob([htmlWithAbsolutePaths], {
              type: 'text/html',
            })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${formData.businessType || 'website'}-site.html`
            document.body.appendChild(a)
            a.click()
            URL.revokeObjectURL(url)
            document.body.removeChild(a)
          }}
        >
          Download HTML
        </Button>
        <Button variant="outline-primary" onClick={handleShare}>
          Share Website
        </Button>
      </div>
    </div>
  )
}

export const NoPage = ({
  isLoading,
  error,
}: {
  isLoading: boolean
  error: string
}) => (
  <div
    style={{
      display: 'flex',
      height: '100%',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    }}
  >
    {isLoading ? (
      <div style={{ textAlign: 'center' }}>
        <p>Generating your website...</p>
        <output className="spinner-border">
          <span className="visually-hidden">Loading...</span>
        </output>
      </div>
    ) : (
      <p>Complete all questions to generate your website</p>
    )}
    {error && <p className="text-danger mt-2">{error}</p>}
  </div>
)
