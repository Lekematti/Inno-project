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

const questions = [
    "What is the main theme of the website?",
    "What title should appear in the header?",
    "What sections should be included (e.g., Home, About, Contact)?",
    "Should there be a hero section with a message? If so, describe it.",
    "How many images should the gallery have?",
    "Should the gallery have a carousel feature? (yes/no)",
    "What kind of footer information should be displayed?",
    "What's your primary brand color (hex code or color name)?",
    "Do you need a contact form? (yes/no)",
];

async function askQuestions(): Promise<string[]> {
    const answers: string[] = [];
    for (const question of questions) {
        answers.push(await new Promise(resolve => rl.question(question + " ", resolve)));
    }
    rl.close();
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
    console.log("Answer the following questions to generate your custom website:");
    const answers = await askQuestions();
    const imageUrls = await fetchImages(parseInt(answers[4]));
    
    const prompt = `
    Create a professional, production-ready HTML webpage using the Bootstrap 5 CSS framework (https://getbootstrap.com/).

    SPECIFICATIONS:
    - Theme: ${answers[0]}
    - Header title: ${answers[1]}
    - Sections: ${answers[2]}
    - Hero section: ${answers[3]}
    - Gallery with ${answers[4]} images ${answers[5] === 'yes' ? 'in a carousel' : 'in a grid layout'}.
    - Footer: ${answers[6]}
    - Primary brand color: ${answers[7]}
    - Contact form: ${answers[8] === 'yes' ? 'Include a contact form with name, email, subject and message fields' : 'No contact form needed'}
    - Gallery images: ${imageUrls.join(', ')}

    REQUIREMENTS:
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
    
    CAROUSEL IMPLEMENTATION:
    1. If using a carousel, properly implement the Bootstrap Carousel with the following options:
       - Use the standard Bootstrap carousel structure with 'carousel' class
       - Include proper controls (arrows) and indicators (dots)
       - Set a 2-second interval for auto-sliding
       - Make it responsive and full-width
       - Ensure proper initialization with data attributes or JavaScript
       - Include proper carousel caption for each slide
    2. If using a grid layout, create a responsive Bootstrap grid system
    
    MOBILE MENU IMPLEMENTATION:
    1. Include proper Bootstrap navbar with toggler for mobile devices
    2. Ensure the menu collapses and expands correctly on mobile devices
    3. Use appropriate Bootstrap classes for responsive behavior

    DO NOT include any AI-generated comments or placeholder text. All content should be production-ready.
    DO NOT add instructional comments about how the code works.
    ONLY return the complete HTML file with no markdown, explanations, or additional text.
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 4000,
        });
       
        let htmlContent: string | null | undefined = completion.choices[0]?.message?.content;
       
        if (htmlContent) {
            // Clean up any remaining markdown code blocks if present
            htmlContent = htmlContent.replace(/```html|```/g, "").trim();
           
            fs.writeFileSync("custom_page.html", htmlContent);
            console.log("✅ Professional website generated successfully: custom_page.html");
           
            await open("custom_page.html");
        } else {
            console.error("❌ Error: Generated content is undefined.");
        }
    } catch (error) {
        console.error("❌ Error generating page:", error);
    }
}

generateCustomPage();