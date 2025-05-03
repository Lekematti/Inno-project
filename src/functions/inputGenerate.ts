import dotenv from 'dotenv';
import { BusinessType, Template } from '@/types/formData';

dotenv.config();

// Define template structure with proper typing
export const templates: Record<BusinessType, Template> = {
    custom: {
        name: "Custom Business",
        questions: [
            {
                id: 'name',
                text: "What is the name of your business?",
                type: 'text',
                placeholder: 'e.g., My Custom Business'
            },
            {
                id: 'description',
                text: "Provide a brief description of your business:",
                type: 'text',
                placeholder: 'e.g., A unique business offering tailored solutions'
            },
            {
                id: 'colorScheme',
                text: "Choose your brand's color scheme:",
                type: 'color'
            }
        ]
    },
    restaurant: {
        name: "Restaurant/Food/Catering",
        questions: [
            {
                id: 'name',
                text: "What is the name of your restaurant or food business?",
                type: 'text',
                placeholder: 'e.g., The Golden Spoon'
            },
            {
                id: 'cuisine',
                text: "What type of cuisine or food do you specialize in?",
                type: 'text',
                placeholder: 'e.g., Italian, Farm-to-Table, Fusion'
            },
            {
                id: 'atmosphere',
                text: "Describe your restaurant's atmosphere and dining experience:",
                type: 'text',
                placeholder: 'e.g., Casual family dining, Upscale bistro'
            },
            {
                id: 'specialFeatures',
                text: "Do you offer any special features or services?",
                type: 'boolean'
            },
            {
                id: 'menu',
                text: "Would you like to feature your menu items prominently?",
                type: 'boolean'
            },
            {
                id: 'reservations',
                text: "Do you want to include an online reservation system?",
                type: 'boolean'
            },
            {
                id: 'delivery',
                text: "Do you offer delivery or takeout services?",
                type: 'boolean'
            },
            {
                id: 'specialties',
                text: "List your restaurant's signature dishes or specialties:",
                type: 'text',
                placeholder: 'e.g., House-made pasta, Wood-fired pizza'
            },
            {
                id: 'hours',
                text: "What are your business hours?",
                type: 'text',
                placeholder: 'e.g., Mon-Fri: 11am-10pm, Sat-Sun: 10am-11pm'
            },
            {
                id: 'colorScheme',
                text: "Choose your brand's color scheme:",
                type: 'color'
            }
        ]
    },
    logistics: {
        name: "Logistics/Transportation/Supply Chain",
        questions: [
            {
                id: 'name',
                text: "What is your company's name?",
                type: 'text',
                placeholder: 'e.g., Swift Logistics Solutions'
            },
            {
                id: 'services',
                text: "What logistics services do you provide?",
                type: 'text',
                placeholder: 'e.g., Freight forwarding, Warehousing'
            },
            {
                id: 'tracking',
                text: "Do you want to include a shipment tracking feature?",
                type: 'boolean'
            },
            {
                id: 'fleet',
                text: "Do you want to showcase your fleet/equipment?",
                type: 'boolean'
            },
            {
                id: 'areas',
                text: "What geographic areas do you serve?",
                type: 'text',
                placeholder: 'e.g., Nationwide, North America, Global'
            },
            {
                id: 'testimonials',
                text: "Would you like to include client testimonials?",
                type: 'boolean'
            },
            {
                id: 'quote',
                text: "Include an instant quote calculator?",
                type: 'boolean'
            },
            {
                id: 'certifications',
                text: "List your certifications and compliance standards:",
                type: 'text',
                placeholder: 'e.g., ISO 9001, FMCSA'
            },
            {
                id: 'colorScheme',
                text: "Choose your brand's color scheme:",
                type: 'color'
            },
            {
                id: 'map',
                text: "Include an interactive service area map?",
                type: 'boolean'
            }
        ]
    },
    professional: {
        name: "Professional Services",
        questions: [
            {
                id: 'name',
                text: "What is your firm's name?",
                type: 'text',
                placeholder: 'e.g., Smith & Associates'
            },
            {
                id: 'services',
                text: "What professional services do you offer?",
                type: 'text',
                placeholder: 'e.g., Legal consulting, Financial planning'
            },
            {
                id: 'expertise',
                text: "What are your areas of expertise?",
                type: 'text',
                placeholder: 'e.g., Corporate law, Tax planning'
            },
            {
                id: 'team',
                text: "Would you like to showcase team profiles?",
                type: 'boolean'
            },
            {
                id: 'testimonials',
                text: "Include client testimonials section?",
                type: 'boolean'
            },
            {
                id: 'consultation',
                text: "Add online consultation booking?",
                type: 'boolean'
            },
            {
                id: 'credentials',
                text: "List your credentials and affiliations:",
                type: 'text',
                placeholder: 'e.g., Bar Association, CPA'
            },
            {
                id: 'colorScheme',
                text: "Choose your brand's color scheme:",
                type: 'color'
            },
            {
                id: 'faq',
                text: "Include a FAQ section?",
                type: 'boolean'
            },
            {
                id: 'blog',
                text: "Add a blog or resources section?",
                type: 'boolean'
            }
        ]
    }
};

// Add a helper function to get questions
export const getBusinessQuestions = (businessType: BusinessType | undefined): Template['questions'] => {
  console.log('Getting questions for business type:', businessType);
  if (!businessType) {
    console.log('No business type provided');
    return [];
  }
  const template = templates[businessType];
  console.log('Found template:', template?.name);
  return template?.questions || [];
};
