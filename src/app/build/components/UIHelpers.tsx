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
  // Function to fix both image paths and positioning issues
  const fixHtmlForStandalone = (html: string) => {
    let fixedHtml = html;
    
    // Fix standard upload paths
    fixedHtml = fixedHtml.replace(
      /src="\/uploads\//g,
      `src="${window.location.origin}/uploads/`
    );
    
    // Fix background image paths
    fixedHtml = fixedHtml.replace(
      /background-image:\s*url\(['"]?\/uploads\//g,
      `background-image: url('${window.location.origin}/uploads/`
    );
    
    // Fix meta tag content paths
    fixedHtml = fixedHtml.replace(
      /content="\/uploads\//g,
      `content="${window.location.origin}/uploads/`
    );
    
    // Fix API static paths
    fixedHtml = fixedHtml.replace(
      /src="\/api\/static\/([\w-]+)\/images\//g, 
      `src="${window.location.origin}/api/static/$1/images/`
    );
    
    // Fix relative image paths to use the fallback API
    fixedHtml = fixedHtml.replace(
      /src=["'](\.\/images\/|\/images\/)(image-\d+\.(?:png|jpg|jpeg|gif|svg))["']/g,
      `src="${window.location.origin}/api/images/$2"`
    );
    
    // Fix background images with relative paths
    fixedHtml = fixedHtml.replace(
      /background-image:\s*url\(['"]?(\.\/images\/|\/images\/)(image-\d+\.(?:png|jpg|jpeg|gif|svg))['"]?\)/g,
      `background-image: url('${window.location.origin}/api/images/$2')`
    );
    
    // Ensure all background elements have proper positioning
    fixedHtml = fixedHtml.replace(
      /<div([^>]*)style="([^"]*background-image:[^"]*)"([^>]*)>/g,
      '<div$1style="$2; background-position: center; background-size: cover; background-repeat: no-repeat"$3>'
    );
    
    // Add viewport meta tag if not present
    if (!fixedHtml.includes('viewport')) {
      fixedHtml = fixedHtml.replace(
        /<head>/i,
        '<head>\n<meta name="viewport" content="width=device-width, initial-scale=1.0">'
      );
    }
    
    // Add consistent container styles
    fixedHtml = fixedHtml.replace(
      /<body([^>]*)>/i,
      '<body$1>\n<style>\n' +
      '  html, body { margin: 0; padding: 0; height: 100%; width: 100%; }\n' +
      '  .container, .container-fluid { max-width: 100%; overflow-x: hidden; }\n' +
      '  [class*="bg-"], .hero-section, .hero-image, [style*="background-image"] { background-position: center !important; background-size: cover !important; }\n' +
      '  img { max-width: 100%; height: auto; }\n' +
      '</style>\n'
    );
    
    // Special fix for hero sections
    fixedHtml = fixedHtml.replace(
      /<section([^>]*)(class="[^"]*hero[^"]*")([^>]*)>/gi,
      '<section$1$2$3 style="background-position: center !important; background-size: cover !important">'
    );
    
    // Fix image dimensions and positioning
    fixedHtml = fixedHtml.replace(
      /<img([^>]*)>/gi,
      '<img$1 style="max-width: 100%; height: auto; display: block;">'
    );
    
    return fixedHtml;
  };

  const handleShare = async () => {
    try {
      // Use standaloneHtml for sharing if available
      let htmlToShare = formData.standaloneHtml || generatedHtml;
      
      // If not using standaloneHtml, fix the paths and positioning
      if (!formData.standaloneHtml) {
        htmlToShare = fixHtmlForStandalone(htmlToShare);
      }
      
      const blob = new Blob([htmlToShare], { type: 'text/html' })
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
            // Use the standaloneHtml which has embedded base64 images if available
            let htmlToDisplay = formData.standaloneHtml || generatedHtml;
            
            // If not using standaloneHtml, fix the paths and positioning
            if (!formData.standaloneHtml) {
              htmlToDisplay = fixHtmlForStandalone(htmlToDisplay);
            }
            
            const blob = new Blob([htmlToDisplay], {
              type: 'text/html',
            });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
          }}
        >
          Open in New Tab
        </Button>
        <Button
          variant="outline-secondary"
          onClick={() => {
            // Use the standaloneHtml for downloading if available
            let htmlToDownload = formData.standaloneHtml || generatedHtml;
            
            // If not using standaloneHtml, fix the paths and positioning
            if (!formData.standaloneHtml) {
              htmlToDownload = fixHtmlForStandalone(htmlToDownload);
            }
            
            const blob = new Blob([htmlToDownload], {
              type: 'text/html',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${formData.businessType || 'website'}-site.html`;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
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