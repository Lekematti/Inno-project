import { LayoutVariation } from '../api/generatePage/types/website-generator';

export function getBusinessPrompt(
  templateType: string, 
  answers: (string | undefined)[], 
  layoutVariations: LayoutVariation
): string {
  if (templateType === 'restaurant') {
    return getRestaurantPrompt(answers, layoutVariations);
  } else if (templateType === 'logistics') {
    return getLogisticsPrompt(answers, layoutVariations);
  } else {
    return getProfessionalPrompt(answers, layoutVariations);
  }
}

function getRestaurantPrompt(answers: (string | undefined)[], layoutVariations: LayoutVariation): string {
  return `
    - Restaurant name: ${typeof answers[0] === 'string' ? answers[0] : 'Not specified'}
    - Cuisine type: ${typeof answers[1] === 'string' ? answers[1] : 'Not specified'}
    - Online menu: ${
      answers[2] === 'yes'
        ? 'Include an attractive, well-structured online menu with sections for appetizers, main courses, desserts, and beverages'
        : 'No online menu needed'
    }
    - Reservation system: ${
      answers[3] === 'yes'
        ? 'Include an elegant reservation form with date/time picker and party size selection'
        : 'No reservation system needed'
    }
    - Business hours: ${typeof answers[4] === 'string' ? answers[4] : 'Not specified'}
    - Chef/team profiles: ${
      answers[5] === 'yes'
        ? 'Include professional profiles for key staff with high-quality image placeholders'
        : 'No profiles needed'
    }
    - Food gallery: ${
      answers[6] === 'yes'
        ? 'Create a visually appealing masonry-style gallery with lightbox functionality'
        : 'No gallery needed'
    }
    - Testimonials: ${
      answers[7] === 'yes'
        ? 'Include a testimonials carousel with customer quotes and ratings'
        : 'No testimonials section needed'
    }
    - Primary brand color: ${typeof answers[8] === 'string' ? answers[8] : '#8D5524'}
    - Delivery/takeout info: ${
      answers[9] === 'yes'
        ? 'Include an online ordering section with delivery radius information'
        : 'No delivery information needed'
    }
    
    RESTAURANT-SPECIFIC DESIGN REQUIREMENTS:
    1. Create a sophisticated, mouth-watering design with premium aesthetics inspired by ${typeof answers[1] === 'string' ? answers[1] : 'fine dining'} cuisine
    2. Use food-related visual elements and motifs throughout the design
    3. Implement an elegant menu section with proper typography hierarchy and visual separators
    4. Design with a color palette inspired by ${typeof answers[8] === 'string' ? answers[8] : '#8D5524'} and complementary food-related colors
    5. Include a sticky header with prominent reservation/order call-to-action buttons
    6. Add a Google Maps section for the restaurant location
    7. Implement schema.org structured data specifically for restaurants (LocalBusiness)
    8. ${layoutVariations.restaurantSpecifics}
  `;
}

function getLogisticsPrompt(answers: (string | undefined)[], layoutVariations: LayoutVariation): string {
  return `
    - Company name: ${typeof answers[0] === 'string' ? answers[0] : 'Not specified'}
    - Logistics services: ${typeof answers[1] === 'string' ? answers[1] : 'Not specified'}
    - Shipment tracking: ${
      answers[2] === 'yes'
        ? 'Include a professional tracking interface with order ID input field'
        : 'No tracking feature needed'
    }
    - Fleet/equipment showcase: ${
      answers[3] === 'yes'
        ? 'Create a visually appealing carousel showcasing transportation assets'
        : 'No fleet showcase needed'
    }
    - Service areas: ${typeof answers[4] === 'string' ? answers[4] : 'Not specified'}
    - Testimonials/case studies: ${
      answers[5] === 'yes'
        ? 'Include a metrics-focused case studies section with client logos and quantifiable results'
        : 'No testimonials section needed'
    }
    - Service request form: ${
      answers[6] === 'yes'
        ? 'Include a multi-step service request form with shipment details fields'
        : 'No service request form needed'
    }
    - Certifications/standards: ${typeof answers[7] === 'string' ? answers[7] : 'Not specified'}
    - Primary brand color: ${typeof answers[8] === 'string' ? answers[8] : '#1C3D5A'}
    - Service area map: ${
      answers[9] === 'yes'
        ? 'Include an interactive map visualization with service coverage highlighting'
        : 'No map needed'
    }
    
    LOGISTICS-SPECIFIC DESIGN REQUIREMENTS:
    1. Create a professional, trustworthy design with a focus on reliability and precision
    2. Use modern interface elements with strategic whitespace and clean lines
    3. Implement custom icons for different logistics services mentioned in the answers
    4. Include animated statistics or counters for key metrics (packages delivered, countries served, etc.)
    5. Use a color palette focused on ${typeof answers[8] === 'string' ? answers[8] : '#1C3D5A'} with complementary colors that convey trust and efficiency
    6. Create a sticky header with main navigation and prominent "Get Quote" call-to-action
    7. Add a timeline or process visualization for how shipments are handled
    8. ${layoutVariations.logisticsSpecifics}
  `;
}

function getProfessionalPrompt(answers: (string | undefined)[], layoutVariations: LayoutVariation): string {
  return `
    - Firm name: ${typeof answers[0] === 'string' ? answers[0] : 'Not specified'}
    - Professional services: ${typeof answers[1] === 'string' ? answers[1] : 'Not specified'}
    - Team profiles: ${
      answers[2] === 'yes'
        ? 'Include elegant team profiles with professional headshots, credentials, and specialties'
        : 'No team profiles needed'
    }
    - Case studies: ${
      answers[3] === 'yes'
        ? 'Include detailed case studies with problem-solution-result structure'
        : 'No case studies section needed'
    }
    - Client portal: ${
      answers[4] === 'yes'
        ? 'Include a sophisticated client portal login section with secure access messaging'
        : 'No client portal link needed'
    }
    - Consultation info: ${
      answers[5] === 'yes'
        ? 'Feature a prominent consultation booking system with availability calendar'
        : 'Include standard contact information'
    }
    - Credentials/affiliations: ${typeof answers[6] === 'string' ? answers[6] : 'Not specified'}
    - FAQ section: ${
      answers[7] === 'yes'
        ? 'Include an accordion-style FAQ section with comprehensive information'
        : 'No FAQ section needed'
    }
    - Primary brand color: ${typeof answers[8] === 'string' ? answers[8] : '#2E5984'}
    - Blog/resources: ${
      answers[9] === 'yes'
        ? 'Include a content-rich resources section with categorized articles'
        : 'No blog/resources section needed'
    }
    
    PROFESSIONAL SERVICES-SPECIFIC DESIGN REQUIREMENTS:
    1. Create a sophisticated, premium design with executive aesthetic appropriate for ${typeof answers[1] === 'string' ? answers[1] : 'professional services'}
    2. Implement subtle animations and transitions for interactive elements
    3. Use a color scheme based on ${typeof answers[8] === 'string' ? answers[8] : '#2E5984'} with complementary colors that convey expertise and trust
    4. Include trust indicators like credentials (${typeof answers[6] === 'string' ? answers[6] : 'professional certifications'}), awards, and association logos
    5. Design content sections that highlight expertise and thought leadership
    6. Create a polished footer with comprehensive site navigation and contact details
    7. Implement testimonial showcases that emphasize client results and satisfaction
    8. ${layoutVariations.professionalSpecifics}
  `;
}
