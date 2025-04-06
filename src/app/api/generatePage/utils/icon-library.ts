/**
 * Generate specific instructions for the selected icon library
 */
export function getIconLibraryInstructions(iconSet: string): string {
  switch(iconSet) {
    case 'Font Awesome 6':
      return "Font Awesome 6 via CDN with this link: <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'>. Use icons with the appropriate prefix (fas, far, fab) based on the icon type, e.g., <i class='fas fa-envelope'></i> for solid style envelope icon."
   
    case 'Bootstrap Icons':
      return "Bootstrap Icons via CDN with this link: <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css'>. Use icons with class prefix 'bi', e.g., <i class='bi bi-envelope'></i> for envelope icon."
   
    case 'Material Icons':
      return "Material Icons via CDN with this link: <link href='https://fonts.googleapis.com/icon?family=Material+Icons' rel='stylesheet'>. Use icons by placing the icon name between span tags with class 'material-icons', e.g., <span class='material-icons'>email</span> for email icon."
   
    default:
      return "Bootstrap Icons via CDN with this link: <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css'>. Use icons with class prefix 'bi', e.g., <i class='bi bi-envelope'></i> for envelope icon."
  }
}
