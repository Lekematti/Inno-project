import { LayoutVariation } from '../api/generatePage/types/website-generator'

export function getBusinessPrompt(
  templateType: string,
  answers: (string | undefined)[],
  layoutVariations: LayoutVariation
): string {
  if (templateType === 'restaurant') {
    return getRestaurantPrompt(answers, layoutVariations)
  } else if (templateType === 'logistics') {
    return getLogisticsPrompt(answers, layoutVariations)
  } else {
    return getProfessionalPrompt(answers, layoutVariations)
  }
}

function getRestaurantPrompt(
  answers: (string | undefined)[],
  layoutVariations: LayoutVariation
): string {
  return `
    - Restaurant name: ${
      typeof answers[0] === 'string' ? answers[0] : 'Restaurant Name'
    }
    - Cuisine type: ${
      typeof answers[1] === 'string' ? answers[1] : 'Fine Dining'
    }
    - Online menu: ${
      answers[2] === 'yes'
        ? 'Create a premium interactive menu with elegant typography, dish categorization, sophisticated filtering, and beautiful food photography placement'
        : 'Include elegant menu section teaser with signature dishes'
    }
    - Reservation system: ${
      answers[3] === 'yes'
        ? 'Implement a luxury reservation experience with date/time selection, party size options, special requests, and confirmation animation'
        : 'Include elegant reservation call-to-action section'
    }
    - Chef/team profiles: ${
      answers[5] === 'yes'
        ? 'Create sophisticated chef profiles with elegant hover effects, professional photography placement, and culinary background stories'
        : 'Include brief team introduction section'
    }
    - Food gallery: ${
      answers[6] === 'yes'
        ? 'Design an immersive food gallery with premium grid layout, sophisticated hover effects, lightbox functionality, and elegant category filtering'
        : 'Include signature dish showcase section'
    }
    - Testimonials: ${
      answers[7] === 'yes'
        ? 'Create an elegant testimonial showcase with customer quotes, ratings visualization, and subtle animation between reviews'
        : 'Include brief testimonial highlight section'
    }
    - Primary brand color: ${
      typeof answers[8] === 'string' ? answers[8] : '#8D5524'
    }
    - Delivery/takeout info: ${
      answers[9] === 'yes'
        ? 'Implement a premium online ordering experience with delivery radius visualization, order customization options, and estimated delivery times'
        : 'Include takeout information section'
    }
    
    PREMIUM RESTAURANT WEBSITE REQUIREMENTS:
    1. Create a sophisticated, immersive dining atmosphere website that conveys the essence of ${
      typeof answers[1] === 'string' ? answers[1] : 'fine dining'
    }
    2. Implement elegant food-focused animations and visual storytelling throughout the user journey
    3. Create a premium menu presentation with proper culinary typography and dish presentation
    4. Design with a refined color palette inspired by ${
      typeof answers[8] === 'string' ? answers[8] : '#8D5524'
    } complemented by culinary-inspired accent colors
    5. Implement a sophisticated sticky header with elegant reservation/order call-to-action
    6. Add an interactive Google Maps integration with custom styling reflecting the restaurant's ambiance
    7. Include schema.org structured data with FoodEstablishment type, menu, and reservation properties
    8. ${layoutVariations.restaurantSpecifics}
    9. Create a unique visual identity that reflects the cuisine's heritage and restaurant's atmosphere
    10. Implement subtle parallax effects for background elements and elegant content reveal animations

STRICT INSTRUCTIONS:
Strictly follow all requirements in the main prompt. Do not use placeholder text, lorem ipsum, or generic content. All content must be realistic, visually appealing, and tailored to the business type. Do not include markdown, explanations, or comments. Return only the final HTML.
  `
}

function getLogisticsPrompt(
  answers: (string | undefined)[],
  layoutVariations: LayoutVariation
): string {
  return `
    - Company name: ${
      typeof answers[0] === 'string' ? answers[0] : 'Logistics Solutions'
    }
    - Logistics services: ${
      typeof answers[1] === 'string'
        ? answers[1]
        : 'Global Freight & Supply Chain Management'
    }
    - Shipment tracking: ${
      answers[2] === 'yes'
        ? 'Implement a premium shipment tracking interface with order ID lookup, status visualization, delivery estimation, and real-time updates'
        : 'Include tracking system information section'
    }
    - Fleet/equipment showcase: ${
      answers[3] === 'yes'
        ? 'Create a sophisticated fleet showcase with interactive details, specifications visualization, and capabilities information'
        : 'Include fleet capability overview section'
    }
    - Service areas: ${
      typeof answers[4] === 'string' ? answers[4] : 'Global Operations'
    }
    - Testimonials/case studies: ${
      answers[5] === 'yes'
        ? 'Implement premium case studies with data visualization, measurable results, and client success stories'
        : 'Include client testimonial highlights section'
    }
    - Service request form: ${
      answers[6] === 'yes'
        ? 'Create a sophisticated multi-step service request experience with conditional logic, real-time validation, and submission confirmation'
        : 'Include streamlined contact form'
    }
    - Certifications/standards: ${
      typeof answers[7] === 'string' ? answers[7] : 'ISO 9001, CTPAT Certified'
    }
    - Primary brand color: ${
      typeof answers[8] === 'string' ? answers[8] : '#1C3D5A'
    }
    - Service area map: ${
      answers[9] === 'yes'
        ? `Implement an interactive global service map with coverage visualization, shipping routes, and facility locations. 
          If a real map cannot be embedded, create a visually appealing placeholder box styled with the primary brand color, a map icon, the business address, and the message "Service area map coming soon". Do not use a generic empty div.`
        : 'Include service region overview section'
    }
    
    PREMIUM LOGISTICS WEBSITE REQUIREMENTS:
    1. Create a sophisticated, trustworthy design that conveys global capability and precision
    2. Implement elegant data visualization for key logistics metrics and service advantages
    3. Create custom animated icons for each logistics service with consistent visual language
    4. Add animated statistics with counter effects for key metrics (packages delivered, countries served, fleet size)
    5. Use a premium color scheme based on ${
      typeof answers[8] === 'string' ? answers[8] : '#1C3D5A'
    } with strategic accent colors for data visualization
    6. Implement a premium sticky header with main navigation and prominent "Get Quote" call-to-action
    7. Create an interactive supply chain or shipping process visualization with animated progress steps
    8. ${layoutVariations.logisticsSpecifics}
    9. Implement subtle parallax scrolling for key sections to create depth and visual hierarchy
    10. Create innovative approaches to presenting complex logistics data with clarity and visual sophistication

STRICT INSTRUCTIONS:
Strictly follow all requirements in the main prompt. Do not use placeholder text, lorem ipsum, or generic content. All content must be realistic, visually appealing, and tailored to the business type. Do not include markdown, explanations, or comments. Return only the final HTML.
  `
}

function getProfessionalPrompt(
  answers: (string | undefined)[],
  layoutVariations: LayoutVariation
): string {
  return `
    - Firm name: ${
      typeof answers[0] === 'string'
        ? answers[0]
        : 'Professional Services Group'
    }
    - Professional services: ${
      typeof answers[1] === 'string'
        ? answers[1]
        : 'Legal Consulting & Advisory'
    }
    - Team profiles: ${
      answers[2] === 'yes'
        ? 'Create sophisticated team profiles with elegant hover animations, credentials visualization, and professional background stories'
        : 'Include team overview section'
    }
    - Case studies: ${
      answers[3] === 'yes'
        ? 'Implement premium case studies with problem-solution-result structure, data visualization, and client outcome highlights'
        : 'Include brief success stories section'
    }
    - Client portal: ${
      answers[4] === 'yes'
        ? 'Create an elegant client portal interface with secure login, document access preview, and client dashboard teaser'
        : 'Include client resources section'
    }
    - Consultation info: ${
      answers[5] === 'yes'
        ? 'Implement a premium consultation booking experience with availability calendar, appointment scheduling, and automated confirmation'
        : 'Include consultation information section'
    }
    - Credentials/affiliations: ${
      typeof answers[6] === 'string'
        ? answers[6]
        : 'Industry Certified, Professional Association Member'
    }
    - FAQ section: ${
      answers[7] === 'yes'
        ? 'Create a sophisticated accordion-style FAQ with smooth animations, categorized questions, and search functionality'
        : 'Include brief FAQ highlights'
    }
    - Primary brand color: ${
      typeof answers[8] === 'string' ? answers[8] : '#2E5984'
    }
    - Blog/resources: ${
      answers[9] === 'yes'
        ? 'Implement a premium resources section with categorized content, featured articles, and elegant content preview cards'
        : 'Include resources overview section'
    }
    
    PREMIUM PROFESSIONAL SERVICES WEBSITE REQUIREMENTS:
    1. Create a sophisticated, executive-level design appropriate for ${
      typeof answers[1] === 'string' ? answers[1] : 'legal consulting'
    }
    2. Implement refined animations and elegant transitions that convey expertise and precision
    3. Use a premium color scheme based on ${
      typeof answers[8] === 'string' ? answers[8] : '#2E5984'
    } with complementary colors that convey authority
    4. Include trust indicators like credentials visualization, testimonial showcases, and association logos
    5. Design content with sophisticated asymmetrical layouts and strategic whitespace
    6. Create a premium footer with comprehensive site navigation and newsletter subscription
    7. Implement elegant testimonial showcases with client logos and dynamic quotation styling
    8. ${layoutVariations.professionalSpecifics}
    9. Add subtle parallax effects for background elements to create visual depth
    10. Create unique visual elements that differentiate the brand while maintaining professional credibility

STRICT INSTRUCTIONS:
Strictly follow all requirements in the main prompt. Do not use placeholder text, lorem ipsum, or generic content. All content must be realistic, visually appealing, and tailored to the business type. Do not include markdown, explanations, or comments. Return only the final HTML.
  `
}
