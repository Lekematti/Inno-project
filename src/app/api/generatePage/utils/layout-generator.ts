import { LayoutVariation } from '../types/website-generator';

/**
 * Generate layout variations based on business type and user answers
 */
export function generateLayoutVariations(businessType: string, answers: (string | undefined)[]): LayoutVariation {
  // Base layouts that will be customized with more distinctive options
  const layouts = {
    restaurant: [
      'Food-focused vertical sections with large hero image of signature dish',
      'Menu-centric layout with elegant side navigation for cuisine categories',
      'Experience-focused design with story-telling sections and chef spotlights',
      'Immersive culinary journey with section transitions mimicking course progression'
    ],
    logistics: [
      'Efficiency-focused dashboard-style layout with service metrics and icons',
      'Global network visualization with connected hub design elements',
      'Process-oriented layout with numbered steps and timeline indicators',
      'Solution-based sections with clear service categories and industry applications'
    ],
    professional: [
      'Authority-building layout with credentials and expertise prominently featured',
      'Client-journey focused layout with clear service pathways and consultation funnels',
      'Knowledge-showcase design with resource libraries and thought leadership content',
      'Trust-centered layout with case studies and testimonials as focal points'
    ]
  };

  // Visual styles with distinctive color schemes and design elements per business
  const visualStyles = {
    restaurant: [
      'Warm earthy tones with textured backgrounds reminiscent of natural ingredients',
      'High-contrast photography-led design with artistic food presentation elements',
      'Elegant minimalism with signature color accents matching cuisine style',
      'Rich atmosphere-focused design with ambient lighting effects and mood elements'
    ],
    logistics: [
      'Modern tech-inspired interface with data visualization components and precision grid',
      'Global connectivity theme with map elements and route visualization graphics',
      'Reliability-focused design with strong geometric shapes and confidence-building elements',
      'Efficiency-themed visuals with process flow graphics and optimization indicators'
    ],
    professional: [
      'Premium executive styling with subtle luxury textures and confident typography',
      'Clean knowledge-based design with academic influences and information hierarchy',
      'Trust-focused visual language with credentials display and security elements',
      'Modern professional aesthetic with subtle gradients and authoritative spacing'
    ]
  };

  // Color palettes distinct to each business type
  const colorSchemes = {
    restaurant: [
      'Rich burgundy (#6E1C35) with gold accents and cream backgrounds',
      'Fresh herb green (#5D8C3E) with terracotta and natural wood tones',
      'Deep espresso brown (#382A21) with vibrant food color highlights',
      'Mediterranean blue (#1D6A96) with sunny yellow and white accents'
    ],
    logistics: [
      'Trustworthy navy (#0F3460) with signal orange accents and silver gray',
      'Technical slate blue (#1E2F4D) with precision red highlights and white',
      'Global teal (#006A71) with route-map yellow and night sky blue',
      'Corporate steel blue (#2C5784) with efficiency green and metallic accents'
    ],
    professional: [
      'Executive charcoal (#2D2E32) with gold leaf accents and marble white',
      'Authoritative burgundy (#541F3F) with slate gray and cream papers',
      'Institutional navy (#162447) with heritage red and serif typography',
      'Modern graphite (#303642) with selective vibrant blue highlights'
    ]
  };

  // Interactive elements appropriate for business type - expanded with unique features
  const interactiveElements = {
    restaurant: [
      'Dish gallery with ingredient hover reveals and chef recommendation badges',
      'Interactive menu with dietary filter system and wine pairing suggestions',
      'Table reservation system with interactive floor plan selection',
      'Food journey storytelling with sequential reveal animations and taste descriptions'
    ],
    logistics: [
      'Interactive service coverage map with route optimization visualizations',
      'Real-time shipment tracker with status visualization and milestone updates',
      'Dynamic quote calculator with service level comparison tools',
      'Supply chain visualization with interactive touchpoints and process animation'
    ],
    professional: [
      'Service selector with guided questionnaire and recommendation engine',
      'Interactive case studies with measurable outcome highlighting',
      'Knowledge resource library with categorized document previews',
      'Credential verification system with trust badges and certification displays'
    ]
  };

  // Specialty sections unique to each business type
  const specialtySections = {
    restaurant: [
      'Day-to-Night atmosphere transition with scrolling ambiance changes',
      'Chef\'s Table spotlight with exclusive menu and booking options',
      'Ingredient sourcing story with local producer highlights',
      'Seasonal menu preview with countdown to new dishes'
    ],
    logistics: [
      'Service Level Agreement showcase with performance metrics',
      'Industry-specific logistics solutions with vertical market focus',
      'Fleet technology innovations with efficiency statistics',
      'Sustainability commitment section with carbon footprint calculator'
    ],
    professional: [
      'Client success journey with before/after transformation stories',
      'Methodology explainer with proprietary process visualization',
      'Interactive ROI calculator for service value demonstration',
      'Expertise heat map showing specialization strengths by area'
    ]
  };

  // Structural elements unique to each business type
  const structuralElements = {
    restaurant: [
      'Culinary-inspired navigation resembling a menu with cuisine sections',
      'Time-based content organization (breakfast to dinner) with daypart theming',
      'Sensory-focused content blocks with taste, aroma, and visual descriptions',
      'Dining experience pathway from appetizers through to desserts'
    ],
    logistics: [
      'Process-flow layout with connected service stages and integration points',
      'Hub-and-spoke visual organization with central value proposition',
      'Efficiency metrics dashboard with KPI visualization elements',
      'Solution matrix organized by industry challenges and service applications'
    ],
    professional: [
      'Authority-building hierarchical structure with expertise showcase at top',
      'Client-journey based organization with progressive service depth',
      'Knowledge-resource library structure with categorized content architecture',
      'Results-first layout with case studies and metrics as primary elements'
    ]
  };

  // Business-specific unique elements - made more distinctive
  const restaurantSpecifics = [
    'Create a signature dish showcase with ingredient spotlights and chef notes',
    'Design an immersive dining atmosphere section with day/night mode toggle',
    'Build a culinary story timeline with restaurant history and milestone dishes',
    'Implement a seasonal specialties carousel with limited-time offerings'
  ];

  const logisticsSpecifics = [
    'Create an operational excellence showcase with methodology visualization',
    'Design a service territory map with interactive coverage indicators',
    'Build a client industry selector with specialized logistics solutions',
    'Implement real-time capacity indicators with service availability metrics'
  ];

  const professionalSpecifics = [
    'Create a methodological advantage section explaining proprietary processes',
    'Design a trust-building credentials wall with interactive verification',
    'Build a client transformation showcase with measurable outcome metrics',
    'Implement a specialized knowledge center with downloadable resources'
  ];

  // Icon sets to add variety - modified to prefer more reliable options
  const iconSets = [
    'Font Awesome 6',
    'Bootstrap Icons',
    'Material Icons',
    'Bootstrap Icons' // Duplicated to reduce chance of Feather Icons selection
  ];

  // Create seed from answers to ensure consistent but unique randomness
  let seed = 0;
  answers.forEach((answer, index) => {
    if (typeof answer === 'string') {
      // Use string length as part of the seed
      seed += answer.length * (index + 1);
    }
  });

  // Simple pseudorandom function using the seed
  const getRandomItem = (array: string[]) => {
    const randomIndex = seed % array.length;
    seed = (seed * 9301 + 49297) % 233280;
    return array[randomIndex];
  };

  // Get business type array or default to professional if not found
  const type = businessType.toLowerCase() as keyof typeof layouts;
  const layoutsForType = layouts[type] || layouts.professional;
  const visualStylesForType = visualStyles[type] || visualStyles.professional;
  const interactiveElementsForType = interactiveElements[type] || interactiveElements.professional;
  const colorSchemeForType = colorSchemes[type] || colorSchemes.professional;
  const specialtySectionForType = specialtySections[type] || specialtySections.professional;
  const structuralElementForType = structuralElements[type] || structuralElements.professional;
  
  // Return selected variations with expanded properties for more diversity
  return {
    layoutStructure: getRandomItem(layoutsForType),
    visualStyle: getRandomItem(visualStylesForType),
    interactiveElements: getRandomItem(interactiveElementsForType),
    colorScheme: getRandomItem(colorSchemeForType),
    specialtySection: getRandomItem(specialtySectionForType),
    structuralElement: getRandomItem(structuralElementForType),
    iconSet: getRandomItem(iconSets),
    restaurantSpecifics: getRandomItem(restaurantSpecifics),
    logisticsSpecifics: getRandomItem(logisticsSpecifics),
    professionalSpecifics: getRandomItem(professionalSpecifics)
  };
}
