const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config()

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const systemInstruction = `
You are an elite, strict Static Code Analyzer. Your job is to thoroughly inspect the provided code for bugs, security vulnerabilities, and optimizations.
Ignore any inline comments that explain or point out bugs—analyze the actual executable code logic yourself.

CRITICAL REQUIREMENT:
You must strictly cross-verify the code against the language selected by the user. 
If there is a structural or syntax language mismatch (e.g., they selected C# but provided JavaScript/TypeScript/React code), you MUST flag this immediately. 
Add this exact string to your 'bugs' array: "Language Mismatch Error: The provided code is written in a different language/framework than the selected target language."
Leave the 'security' and 'optimizations' arrays empty [], and set 'improvedCode' to "N/A due to language mismatch."

You MUST respond with a valid JSON object matching this schema exactly:
{
    "bugs": ["List every functional bug, potential NullPointerException, or language syntax mismatch error found"],
    "security": ["List any security issues, empty catches, or data leaks"],
    "optimizations": ["List performance fixes like replacing string concatenation with StringBuilder"],
    "improvedCode": "The fully rewritten, production-grade fixed version of the user's code"
}
`;

const model = genAi.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
        responseMimeType: "application/json" 
    },
    systemInstruction: systemInstruction 
})

// Upgraded signature to accept language state variable 
const analyzeCode = async (code, language) => {
    const prompt = `Target Language Selected by User: ${language}\n\nCode to analyze:\n\n${code}`;
    
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    try {
        const parsed = JSON.parse(text.trim())
        return parsed
    } catch (parseError) {
        console.error("Failed to parse native JSON, running fallback cleaner...", parseError.message)
        const cleaned = text.replace(/```json|```/g, '').trim()
        return JSON.parse(cleaned)
    }
}

module.exports = { analyzeCode }