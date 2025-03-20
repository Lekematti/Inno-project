import dotenv from 'dotenv';
dotenv.config();

// defined templates with optimized questions
export const templates = {
    restaurant: {
        name: "Restaurant/Food/Catering",
        questions: [
            "What is the name of your restaurant or food business?",
            "What type of cuisine or food do you specialize in? (e.g., Italian, Farm-to-Table, Fusion)",
            "Would you like to showcase your menu online? (yes/no)",
            "Do you want to include an online reservation system? (yes/no)",
            "What are your business hours? (e.g., Mon-Fri: 11am-10pm, Sat-Sun: 10am-11pm)",
            "Would you like to feature profiles of your chef and key team members? (yes/no)",
            "Would you like a professional food gallery to showcase your dishes? (yes/no)",
            "Would you like to display customer testimonials or reviews? (yes/no)",
            "What's your brand's primary color? (hex code or color name, e.g., #D4AF37 or 'burgundy')",
            "Do you offer delivery, takeout, or catering services? (Please specify which ones)"
        ]
    },
    logistics: {
        name: "Logistics/Transportation/Supply Chain",
        questions: [
            "What is the full name of your logistics or transportation company?",
            "What specific logistics services do you offer? (e.g., Freight Forwarding, Warehousing, Last-Mile Delivery)",
            "Do you want to include a shipment tracking feature for your customers? (yes/no)",
            "Would you like to showcase your fleet, facilities, or equipment? (yes/no)",
            "What geographic regions or countries do you service? (e.g., North America, Global, Southeast Asia)",
            "Would you like to feature client testimonials or detailed case studies? (yes/no)",
            "Do you want to include a service request or quote form? (yes/no)",
            "What industry certifications or compliance standards does your company maintain? (e.g., ISO 9001, C-TPAT)",
            "What's your brand's primary color? (hex code or color name, e.g., #1A5276 or 'navy blue')",
            "Would you like to display a visual map of your service areas or facility locations? (yes/no)"
        ]
    },
    professional: {
        name: "Professional Services (Legal/Financial/Consulting)",
        questions: [
            "What is the full name of your professional practice or firm?",
            "What specific professional services do you provide? (e.g., Tax Consulting, Family Law, Management Consulting)",
            "Would you like to feature professional profiles of key team members or partners? (yes/no)",
            "Would you like to showcase detailed case studies or client success stories? (yes/no)",
            "Do you offer a secure client portal for document sharing or communications? (yes/no)",
            "Do you offer complimentary consultations or assessments? (yes/no, please specify details)",
            "What professional credentials, certifications, or affiliations should be highlighted? (e.g., CPA, Bar Association)",
            "Would you like to include a detailed FAQ section addressing common client questions? (yes/no)",
            "What's your brand's primary color? (hex code or color name, e.g., #2C3E50 or 'charcoal gray')",
            "Would you like to feature a resources section with articles, guides, or industry insights? (yes/no)"
        ]
    }
};
export interface FormData {
    businessType: string;
    address: string;
    phone: string;
    email: string;
    [key: string]: string;
}
