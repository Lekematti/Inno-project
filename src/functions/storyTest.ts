import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();


//const ORGANIZATION_ID = process.env.ORGANIZATION_ID;
//const PROJECT_ID = process.env.PROJECT_ID;
//const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  organization: process.env.ORGANIZATION_ID,
  project: process.env.PROJECT_ID,
  apiKey: process.env.OPENAI_API_KEY,
  // dangerouslyAllowBrowser: true
});

export async function generateStory(prompt: string) {
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: 'You are a creative storyteller' },
            {
                role: 'user',
                content: `Write a short story based on the following prompt: ${prompt}`,
            },
        ],
    });
    return completion.choices[0].message.content;
}