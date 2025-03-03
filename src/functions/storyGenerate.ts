import { generateStory } from './storyTest'; 

async function testGenerateStory() {
    const prompt = "Once upon a time in a land far, far away...";
    console.log("Testing story generation with prompt:", prompt);
    try {
        const story = await generateStory(prompt);
        console.log("Generated Story:", story);
    } catch (error) {
        console.error("Error generating story:", error);
    }
}

testGenerateStory();