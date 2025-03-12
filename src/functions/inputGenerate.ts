import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import open from 'open';
import readline from 'readline';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Define template categories
const templates = {
    restaurant: {
        name: "Restaurant/Food/Catering",
        questions: [
            "What is the name of your restaurant or food business?",
            "What type of cuisine do you specialize in?",
            "Would you like to feature an online menu? (yes/no)",
            "Do you want to include an online reservation system? (yes/no)",
            "What are your business hours?",
            "Would you like to showcase chef/team profiles? (yes/no)",
            "Do you want a food gallery section? If so, how many dishes to display?",
            "Would you like to include customer testimonials? (yes/no)",
            "What's your restaurant's primary brand color (hex code or color name)?",
            "Do you offer delivery or takeout services? Please describe."
        ]
    },
    logistics: {
        name: "Logistics/Transportation/Supply Chain",
        questions: [
            "What is the name of your logistics company?",
            "What specific logistics services do you offer?",
            "Do you want to include a shipment tracking feature? (yes/no)",
            "Would you like to showcase your fleet/equipment? If so, how many images?",
            "What geographic areas do you service?",
            "Do you want to include client testimonials or case studies? (yes/no)",
            "Would you like a service request form on the website? (yes/no)",
            "What certifications or industry standards does your company adhere to?",
            "What's your company's primary brand color (hex code or color name)?",
            "Would you like to include a map of your service areas or locations? (yes/no)"
        ]
    },
    professional: {
        name: "Office/Legal/Professional Services",
        questions: [
            "What is the name of your professional practice or firm?",
            "What specific professional services do you offer?",
            "Would you like to include team member profiles? If so, how many?",
            "Do you want to showcase case studies or success stories? (yes/no)",
            "Would you like to include a client portal link? (yes/no)",
            "Do you offer free consultations? Please describe your booking process.",
            "What credentials, certifications, or affiliations should be highlighted?",
            "Would you like a FAQ section on the website? (yes/no)",
            "What's your firm's primary brand color (hex code or color name)?",
            "Would you like to include a blog or resources section? (yes/no)"
        ]
    }
};

async function chooseTemplate(): Promise<{ templateType: string, skipQuestions: boolean }> {
    return new Promise((resolve) => {
        console.log("\nChoose a business template:");
        console.log("1. Restaurant/Food/Catering");
        console.log("2. Logistics/Transportation/Supply Chain");
        console.log("3. Office/Legal/Professional Services");
        console.log("4. Skip questions and generate a blank website structure");
        
        rl.question("Enter template number (1-4): ", (answer) => {
            const templateNumber = parseInt(answer);
            let templateType = "";
            let skipQuestions = false;
            switch(templateNumber) {
                case 1: templateType = "restaurant"; break;
                case 2: templateType = "logistics"; break;
                case 3: templateType = "professional"; break;
                case 4: skipQuestions = true; break;
                default: 
                    console.log("Invalid choice. Defaulting to blank website structure.");
                    skipQuestions = true;
            }
            resolve({ templateType, skipQuestions });
        });
    });
}

async function askQuestions(templateType: string): Promise<string[]> {
    const selectedTemplate = templates[templateType as keyof typeof templates];
    const answers: string[] = [];
    
    console.log(`\n📝 ${selectedTemplate.name} Website Questionnaire:`);
    
    for (const question of selectedTemplate.questions) {
        answers.push(await new Promise(resolve => rl.question(question + "", resolve)));
    }
    
    return answers;
}

async function fetchImages(count: number): Promise<string[]> {
    const imageUrls: string[] = [];
    for (let i = 0; i < count; i++) {
        imageUrls.push(`https://picsum.photos/800/600?random=${i}`);
    }
    return imageUrls;
}

async function generateCustomPage(): Promise<void> {
    console.log("Welcome to the Business Website Generator!");
    const { templateType, skipQuestions } = await chooseTemplate();
    const answers = skipQuestions ? Array(templates[templateType as keyof typeof templates]?.questions.length || 0).fill('') : await askQuestions(templateType);
    rl.close();
    
    // Determine number of images based on template type and answers
    let imageCount = 4; // Default
    if (templateType === "restaurant" && answers[6]) {
        const dishCountMatch = answers[6].match(/\d+/);
        if (dishCountMatch) imageCount = parseInt(dishCountMatch[0]);
    } else if (templateType === "logistics" && answers[3]) {
        const fleetCountMatch = answers[3].match(/\d+/);
        if (fleetCountMatch) imageCount = parseInt(fleetCountMatch[0]);
    } else if (templateType === "professional" && answers[2]) {
        const teamCountMatch = answers[2].match(/\d+/);
        if (teamCountMatch) imageCount = parseInt(teamCountMatch[0]);
    }
    
    const imageUrls = await fetchImages(imageCount);
    
    // Create template-specific prompt
    let specificPrompt = "";
    if (skipQuestions) {
        specificPrompt = `
        Create a blank HTML website structure with semantic elements ready to use.
        
        GENERAL REQUIREMENTS:
        1. Use Bootstrap 5 CSS framework for styling (include the CDN link)
        2. Create fully semantic HTML5 structure (header, nav, section, article, footer, etc.)
        3. Include meta tags for SEO and viewport
        4. Make the site fully responsive across all devices
        5. Create a navigation bar with a mobile-friendly toggler menu
        6. Add appropriate ARIA attributes for accessibility
        7. Include Bootstrap icons or Font Awesome icons where appropriate (via CDN)
        8. Implement smooth scrolling for navigation links
        9. Add minimal custom CSS only when necessary and place it in a <style> tag in the head
        10. Ensure the site loads quickly and efficiently
        11. Create clean, indented, and properly formatted code
        
        DO NOT include any AI-generated comments or placeholder text. All content should be production-ready.
        DO NOT add instructional comments about how the code works.
        ONLY return the complete HTML file with no markdown, explanations, or additional text.
        `;
    } else if (templateType === "restaurant") {
        specificPrompt = `
        - Restaurant name: ${answers[0]}
        - Cuisine type: ${answers[1]}
        - Online menu: ${answers[2] === 'yes' ? 'Include an attractive online menu section' : 'No online menu needed'}
        - Reservation system: ${answers[3] === 'yes' ? 'Include a reservation form or system' : 'No reservation system needed'}
        - Business hours: ${answers[4]}
        - Chef/team profiles: ${answers[5] === 'yes' ? 'Include profiles for key staff members' : 'No profiles needed'}
        - Food gallery: ${answers[6]}
        - Testimonials: ${answers[7] === 'yes' ? 'Include a customer testimonials section' : 'No testimonials section needed'}
        - Delivery/takeout info: ${answers[9]}
        
        ADDITIONAL REQUIREMENTS:
        1. Create a mouth-watering, appetizing design appropriate for food businesses
        2. Emphasize high-quality food imagery
        3. Make the menu section easily readable and visually appealing
        4. Include a prominent call-to-action for reservations or ordering
        5. Ensure the business hours are clearly visible
        `;
    } else if (templateType === "logistics") {
        specificPrompt = `
        - Company name: ${answers[0]}
        - Logistics services: ${answers[1]}
        - Shipment tracking: ${answers[2] === 'yes' ? 'Include a tracking feature or link' : 'No tracking feature needed'}
        - Fleet/equipment showcase: ${answers[3]}
        - Service areas: ${answers[4]}
        - Testimonials/case studies: ${answers[5] === 'yes' ? 'Include a client testimonials or case studies section' : 'No testimonials section needed'}
        - Service request form: ${answers[6] === 'yes' ? 'Include a service request form' : 'No service request form needed'}
        - Certifications/standards: ${answers[7]}
        - Service area map: ${answers[9] === 'yes' ? 'Include a map section showing service areas' : 'No map needed'}
        
        ADDITIONAL REQUIREMENTS:
        1. Create a professional, trustworthy design appropriate for logistics businesses
        2. Emphasize reliability, efficiency, and global/regional reach
        3. Use icons or graphics to represent different logistics services
        4. Include a prominent call-to-action for quote requests
        5. If including a map, use a placeholder image with caption "Interactive map would be placed here"
        `;
    } else { // professional
        specificPrompt = `
        - Firm name: ${answers[0]}
        - Professional services: ${answers[1]}
        - Team profiles: ${answers[2]}
        - Case studies: ${answers[3] === 'yes' ? 'Include a case studies or success stories section' : 'No case studies section needed'}
        - Client portal: ${answers[4] === 'yes' ? 'Include a prominent link to a client portal' : 'No client portal link needed'}
        - Consultation info: ${answers[5]}
        - Credentials/affiliations: ${answers[6]}
        - FAQ section: ${answers[7] === 'yes' ? 'Include a FAQ section' : 'No FAQ section needed'}
        - Blog/resources: ${answers[9] === 'yes' ? 'Include a blog or resources section' : 'No blog/resources section needed'}
        
        ADDITIONAL REQUIREMENTS:
        1. Create a sophisticated, professional design appropriate for business services
        2. Emphasize expertise, trust, and professionalism
        3. Use a clean, minimal layout with adequate whitespace
        4. Include a prominent call-to-action for consultations
        5. Ensure credentials and qualifications are clearly displayed
        `;
    }
    
    const prompt = `
    Create a professional, production-ready HTML webpage using the Bootstrap 5 CSS framework (https://getbootstrap.com/) for a ${skipQuestions ? "blank" : templates[templateType as keyof typeof templates].name} business.

    SPECIFICATIONS:
    ${specificPrompt}
    - Primary brand color: ${answers[8]}
    - Gallery images: ${imageUrls.join(', ')}

    GENERAL REQUIREMENTS:
    1. Use Bootstrap 5 CSS framework for styling (include the CDN link)
    2. Create fully semantic HTML5 structure (header, nav, section, article, footer, etc.)
    3. Include meta tags for SEO and viewport
    4. Make the site fully responsive across all devices
    5. Create a navigation bar with a mobile-friendly toggler menu
    6. Add appropriate ARIA attributes for accessibility
    7. Include Bootstrap icons or Font Awesome icons where appropriate (via CDN)
    8. Implement smooth scrolling for navigation links
    9. Add minimal custom CSS only when necessary and place it in a <style> tag in the head
    10. Ensure the site loads quickly and efficiently
    11. Create clean, indented, and properly formatted code
    
    DO NOT include any AI-generated comments or placeholder text. All content should be production-ready.
    DO NOT add instructional comments about how the code works.
    ONLY return the complete HTML file with no markdown, explanations, or additional text.
    `;

    try {
        console.log("\n🔄 Generating your custom website...");
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 4000,
        });
       
        let htmlContent: string | null | undefined = completion.choices[0]?.message?.content;
       
        if (htmlContent) {
            // Clean up any remaining markdown code blocks if present
            htmlContent = htmlContent.replace(/```html|```/g, "").trim();
             // Ensure the 'gen_comp' directory exists
             const gen_comp = 'gen_comp'; // Define the directory path
             if (!fs.existsSync(gen_comp)) {
                 fs.mkdirSync(gen_comp);
             }
            //const filename = `${templateType}_website.html`; 
            // Write the HTML content to the 'gen_comp' directory
            const filename = `${gen_comp}/${templateType || "blank"}_website.html`;
          
            fs.writeFileSync(filename, htmlContent);
            console.log(`\n✅ Professional ${skipQuestions ? "blank" : templates[templateType as keyof typeof templates].name} website generated successfully: ${filename}`);
           
            await open(filename);
        } else {
            console.error("❌ Error: Generated content is undefined.");
        }
    } catch (error) {
        console.error("❌ Error generating page:", error);
    }
}

generateCustomPage();