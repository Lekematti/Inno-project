import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import open from 'open';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string });

async function generateDogPage(): Promise<void> {
    const prompt: string = `Generate a simple HTML page with a dog theme. 
    The page should include:
    - A header with a title basic information, gallery, contact us buttons and on small screens a hamburger menu instead of those. Also a logo and a title which says "We like dogs!"
    - A hero section with a background image of a dog and a message "Dogs Make Life Better!"
    - A dog image gallery with 15 different images with a carousel view logic (use placedog.net)
    - A footer with copyright information.
    Only return valid HTML content, with no additional explanations, markdown, or text outside the HTML structure.`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", 
            messages: [{ role: "user", content: prompt }]
        });
        
        let htmlContent: string | null | undefined = completion.choices[0]?.message?.content;
        
        if (htmlContent) {
            // Remove unwanted markdown formatting if present
            htmlContent = htmlContent.replace(/```html|```/g, "").trim();
            
            fs.writeFileSync("dog_page.html", htmlContent);
            console.log("✅ Dog page generated: dog_page.html");
            
            // Open the generated file in the browser
            await open("dog_page.html");
        } else {
            console.error("❌ Error: Generated content is undefined.");
        }
    } catch (error) {
        console.error("❌ Error generating page:", error);
    }
}

generateDogPage();