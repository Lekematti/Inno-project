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
        ? 'Include an interactive, visually rich menu with elegant typography, dish photos, and filter options for dietary preferences'
        : 'No online menu needed'
    }
    - Reservation system: ${
      answers[3] === 'yes'
        ? 'Include a premium reservation experience with date/time picker, party size selection, and special requests field'
        : 'No reservation system needed'
    }
    - Business hours: ${typeof answers[4] === 'string' ? answers[4] : 'Not specified'}
    - Chef/team profiles: ${
      answers[5] === 'yes'
        ? 'Include elegant chef/team profiles with hover animations, professional bios, and culinary specialties'
        : 'No profiles needed'
    }
    - Food gallery: ${
      answers[6] === 'yes'
        ? 'Create an immersive food gallery with sophisticated hover effects, zoom functionality, and category filtering'
        : 'No gallery needed'
    }
    - Testimonials: ${
      answers[7] === 'yes'
        ? 'Include a modern testimonial showcase with customer photos, ratings, and elegant quote styling'
        : 'No testimonials section needed'
    }
    - Primary brand color: ${typeof answers[8] === 'string' ? answers[8] : '#8D5524'}
    - Delivery/takeout info: ${
      answers[9] === 'yes'
        ? 'Include a premium online ordering experience with delivery radius map and order tracking capabilities'
        : 'No delivery information needed'
    }
    
    RESTAURANT-SPECIFIC DESIGN REQUIREMENTS:
    1. Create a sophisticated, immersive dining experience design with premium aesthetics inspired by ${typeof answers[1] === 'string' ? answers[1] : 'fine dining'} cuisine
    2. Use subtle food-related animations and visual storytelling throughout the user journey
    3. Implement an elegant menu section with proper typography hierarchy and appetizing presentation
    4. Design with a refined color palette inspired by ${typeof answers[8] === 'string' ? answers[8] : '#8D5524'} with complementary food-related accent colors
    5. Include a sticky header with elegant reservation/order call-to-action buttons with micro-interactions
    6. Add an interactive Google Maps section for the restaurant location with custom styling
    7. Implement schema.org structured data specifically for restaurants (LocalBusiness with FoodEstablishment type)
    8. ${layoutVariations.restaurantSpecifics}
    9. Create a unique visual identity throughout all design elements that reflects the cuisine's heritage and the restaurant's atmosphere
    10. Implement smooth parallax effects for background images and subtle animations for content reveals
  `;
}

function getLogisticsPrompt(answers: (string | undefined)[], layoutVariations: LayoutVariation): string {
  return `
    - Company name: ${typeof answers[0] === 'string' ? answers[0] : 'Not specified'}
    - Logistics services: ${typeof answers[1] === 'string' ? answers[1] : 'Not specified'}
    - Shipment tracking: ${
      answers[2] === 'yes'
        ? 'Include a premium tracking interface with order ID input field, status visualization, and estimated delivery times'
        : 'No tracking feature needed'
    }
    - Fleet/equipment showcase: ${
      answers[3] === 'yes'
        ? 'Create a sophisticated fleet showcase with interactive details, specifications, and capabilities information'
        : 'No fleet showcase needed'
    }
    - Service areas: ${typeof answers[4] === 'string' ? answers[4] : 'Not specified'}
    - Testimonials/case studies: ${
      answers[5] === 'yes'
        ? 'Include data-driven case studies with interactive metrics, client logos, and ROI visualizations'
        : 'No testimonials section needed'
    }
    - Service request form: ${
      answers[6] === 'yes'
        ? 'Include a premium multi-step service request experience with intelligent form logic and real-time validation'
        : 'No service request form needed'
    }
    - Certifications/standards: ${typeof answers[7] === 'string' ? answers[7] : 'Not specified'}
    - Primary brand color: ${typeof answers[8] === 'string' ? answers[8] : '#1C3D5A'}
    - Service area map: ${
      answers[9] === 'yes'
        ? 'Include a sophisticated interactive map with service coverage visualization, shipping lanes, and facility locations'
        : 'No map needed'
    }
    
    LOGISTICS-SPECIFIC DESIGN REQUIREMENTS:
    1. Create a modern, trustworthy design with premium UI elements focused on reliability and precision
    2. Use subtle data visualization components and clean information architecture
    3. Implement custom animated icons for different logistics services with consistent visual language
    4. Include animated statistics with counting animations for key metrics (packages delivered, countries served, etc.)
    5. Use a sophisticated color palette focused on ${typeof answers[8] === 'string' ? answers[8] : '#1C3D5A'} with complementary colors for data visualization
    6. Create a premium sticky header with main navigation and prominent "Get Quote" call-to-action with hover effects
    7. Add an interactive process visualization showing shipment journey with animated steps
    8. ${layoutVariations.logisticsSpecifics}
    9. Implement subtle parallax scrolling for key content sections to create depth and visual hierarchy
    10. Create an innovative approach to presenting complex logistics data with clarity and visual appeal
  `;
}

function getProfessionalPrompt(answers: (string | undefined)[], layoutVariations: LayoutVariation): string {
  return `
    - Firm name: ${typeof answers[0] === 'string' ? answers[0] : 'Not specified'}
    - Professional services: ${typeof answers[1] === 'string' ? answers[1] : 'Not specified'}
    - Team profiles: ${
      answers[2] === 'yes'
        ? 'Include premium team profiles with elegant hover effects, credentials visualization, and connection animations'
        : 'No team profiles needed'
    }
    - Case studies: ${
      answers[3] === 'yes'
        ? 'Include sophisticated case studies with problem-solution-result structure, data visualization, and elegant transitions'
        : 'No case studies section needed'
    }
    - Client portal: ${
      answers[4] === 'yes'
        ? 'Include a premium client portal interface with secure access messaging and modern authentication styling'
        : 'No client portal link needed'
    }
    - Consultation info: ${
      answers[5] === 'yes'
        ? 'Feature an elegant consultation booking experience with availability calendar and appointment confirmation'
        : 'Include premium contact information presentation'
    }
    - Credentials/affiliations: ${typeof answers[6] === 'string' ? answers[6] : 'Not specified'}
    - FAQ section: ${
      answers[7] === 'yes'
        ? 'Include a modern accordion-style FAQ with smooth animations, categorized questions, and search functionality'
        : 'No FAQ section needed'
    }
    - Primary brand color: ${typeof answers[8] === 'string' ? answers[8] : '#2E5984'}
    - Blog/resources: ${
      answers[9] === 'yes'
        ? 'Include a premium resources section with categorized content cards, featured articles, and elegant typography'
        : 'No blog/resources section needed'
    }
    
    PROFESSIONAL SERVICES-SPECIFIC DESIGN REQUIREMENTS:
    1. Create a sophisticated, premium design with executive aesthetic appropriate for ${typeof answers[1] === 'string' ? answers[1] : 'professional services'}
    2. Implement refined animations and elegant transitions that reflect precision and expertise
    3. Use a refined color scheme based on ${typeof answers[8] === 'string' ? answers[8] : '#2E5984'} with complementary colors that convey authority and trustworthiness
    4. Include premium trust indicators like credentials visualization, awards carousel, and association logos with hover effects
    5. Design content sections with asymmetrical layouts, strategic whitespace, and visual hierarchy
    6. Create a sophisticated footer with comprehensive site navigation, contact details, and newsletter subscription
    7. Implement elegant testimonial showcases with client logos, avatars, and dynamically styled quotes
    8. ${layoutVariations.professionalSpecifics}
    9. Add subtle parallax scrolling effects to create depth and sophistication
    10. Create unique visual elements that differentiate the brand while maintaining professional credibility
  `;
}
