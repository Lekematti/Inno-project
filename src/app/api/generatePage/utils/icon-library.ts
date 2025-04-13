// Enhanced icon library implementation
export function getIconLibraryInstructions(iconSet: string): string {
  // Default icon set to use if something goes wrong
  const defaultSet = {
    cdn: "<link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css'>",
    usage: "<i class='bi bi-envelope'></i>",
    prefix: "bi bi-"
  };
  
  // Map of icon libraries with their CDN links and usage examples
  const iconLibraries = {
    'Font Awesome 6': {
      cdn: "<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'>",
      usage: "<i class='fas fa-envelope'></i>",
      prefix: "fas fa-"
    },
    'Bootstrap Icons': {
      cdn: "<link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css'>",
      usage: "<i class='bi bi-envelope'></i>",
      prefix: "bi bi-"
    },
    'Material Icons': {
      cdn: "<link href='https://fonts.googleapis.com/icon?family=Material+Icons' rel='stylesheet'>",
      usage: "<span class='material-icons'>email</span>",
      prefix: "material-icons"
    }
  };
  
  // Get the selected icon set or use default
  const selected = iconLibraries[iconSet as keyof typeof iconLibraries] || defaultSet;
  
  // Common icons needed for most websites with their names in each library
  const commonIcons = {
    'envelope/email': {
      'Font Awesome 6': 'envelope',
      'Bootstrap Icons': 'envelope',
      'Material Icons': 'email'
    },
    'phone': {
      'Font Awesome 6': 'phone',
      'Bootstrap Icons': 'telephone',
      'Material Icons': 'phone'
    },
    'location': {
      'Font Awesome 6': 'location-dot',
      'Bootstrap Icons': 'geo-alt',
      'Material Icons': 'location_on'
    },
    'facebook': {
      'Font Awesome 6': 'facebook-f',
      'Bootstrap Icons': 'facebook',
      'Material Icons': 'facebook'
    },
    'instagram': {
      'Font Awesome 6': 'instagram',
      'Bootstrap Icons': 'instagram',
      'Material Icons': 'photo_camera'
    },
    'twitter': {
      'Font Awesome 6': 'twitter',
      'Bootstrap Icons': 'twitter',
      'Material Icons': 'twitter'
    }
  };
  
  // Build icon reference guide
  let iconGuide = '';
  
  if (iconSet === 'Material Icons') {
    iconGuide = `
    Common icons for this website:
    - Email: <span class='material-icons'>email</span>
    - Phone: <span class='material-icons'>phone</span>
    - Location: <span class='material-icons'>location_on</span>
    - Facebook: <span class='material-icons'>facebook</span>
    - Instagram: <span class='material-icons'>photo_camera</span>
    - Twitter: <span class='material-icons'>twitter</span>
    `;
  } else {
    const prefix = selected.prefix;
    iconGuide = `
    Common icons for this website:
    - Email: <i class='${prefix}${commonIcons['envelope/email'][iconSet as keyof typeof commonIcons['envelope/email']] || "envelope"}'></i>
    - Phone: <i class='${prefix}${commonIcons['phone'][iconSet as keyof typeof commonIcons['phone']] || "phone"}'></i>
    - Location: <i class='${prefix}${commonIcons['location'][iconSet as keyof typeof commonIcons['location']] || "map-marker"}'></i>
    - Facebook: <i class='${prefix}${commonIcons['facebook'][iconSet as keyof typeof commonIcons['facebook']] || "facebook"}'></i>
    - Instagram: <i class='${prefix}${commonIcons['instagram'][iconSet as keyof typeof commonIcons['instagram']] || "instagram"}'></i>
    - Twitter: <i class='${prefix}${commonIcons['twitter'][iconSet as keyof typeof commonIcons['twitter']] || "twitter"}'></i>
    `;
  }
  
  return `${selected.cdn} for icons. 
  Example usage: ${selected.usage}. 
  ${iconGuide}`;
}