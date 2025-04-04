/**
 * Generate specific instructions for the selected icon library
 */
export function getIconLibraryInstructions(iconSet: string): string {
  switch(iconSet) {
    case 'Font Awesome 6':
      return "Font Awesome 6 via CDN with this link: <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'>"
    
    case 'Bootstrap Icons':
      return "Bootstrap Icons via CDN with this link: <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css'>"
    
    case 'Material Icons':
      return "Material Icons via CDN with this link: <link href='https://fonts.googleapis.com/icon?family=Material+Icons' rel='stylesheet'>"
    
    case 'Feather Icons':
      return "Feather Icons with this setup: 1) Add script: <script src='https://unpkg.com/feather-icons'></script> 2) After all HTML, add: <script>document.addEventListener('DOMContentLoaded', function() { if (typeof feather !== 'undefined') { feather.replace(); } });</script>"
    
    default:
      return "Bootstrap Icons via CDN with this link: <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css'>"
  }
}
