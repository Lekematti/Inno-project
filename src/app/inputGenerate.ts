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
    "Should there be a hero section with an image and message? If so, describe it.",
    "How many images should the gallery have?",
    "Should the gallery have a carousel feature? (yes/no)",
    "What kind of footer information should be displayed?",
    "Should the website be responsive? (yes/no)",
    "Do you need a navigation menu? If so, should it have a mobile-friendly hamburger menu?",
    "Any additional details or special elements you'd like to include?"
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
        imageUrls.push(`https://picsum.photos/800/800?random=${i}&grayscale&blur=1`);
    }
    return imageUrls;
}

async function generateCustomPage(): Promise<void> {
    console.log("Answer the following questions to generate your custom website:");
    const answers = await askQuestions();

    const imageUrls = await fetchImages(parseInt(answers[4]));

    const prompt = `Generate a professional, well-structured HTML5 webpage based on the following user preferences:
    - Theme: ${answers[0]}
    - Header title: ${answers[1]}
    - Sections: ${answers[2]}
    - Hero section: ${answers[3]}
    - Gallery with ${answers[4]} images ${answers[5] === 'yes' ? 'in a carousel' : ''}.
    - Footer: ${answers[6]}
    - Responsive design: ${answers[7]}
    - Navigation menu: ${answers[8]}.
    - Additional details: ${answers[9]}.
    Use the following image URLs for the gallery: ${imageUrls.join(', ')}.
    Ensure the page has modern styling with CSS, a visually appealing layout, and clean semantic HTML structure. Use Bootstrap or CSS Flexbox/Grid for layout if necessary.
    Reserve a section in the page for the sharpened images.
    Only return valid HTML content, with no additional explanations, markdown, or text outside the HTML structure.`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", 
            messages: [{ role: "user", content: prompt }]
        });
        
        let htmlContent: string | null | undefined = completion.choices[0]?.message?.content;
        
        if (htmlContent) {
            htmlContent = htmlContent.replace(/```html|```/g, "").trim();
            
            fs.writeFileSync("custom_page.html", htmlContent);
            console.log("✅ Custom page generated: custom_page.html");
            
            await open("custom_page.html");
        } else {
            console.error("❌ Error: Generated content is undefined.");
        }
    } catch (error) {
        console.error("❌ Error generating page:", error);
    }
}

generateCustomPage();