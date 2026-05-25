const {GoogleGenerativeAI} = require('@google/generative-ai');
require('dotenv').config()
const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAi.getGenerativeModel({model: 'gemini-2.5-flash'})

const analyzeCode = async (code) => {
    const prompt = `
    You are a senior software engineer reviewing code.
    Analyze the following code and return ONLY a valid JSON object, nothing else.
    No markdown, no backticks, no explanation outside the JSON.

    {
        "bugs": ["bug1", "bug2"],
        "security": ["issue1", "issue2"],
        "optimizations": ["opt1", "opt2"],
        "improvedCode": "write the full improved code here"
    }

    Code to analyze:
    ${code}
    `
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Clean and parse here so the rest of the app always gets an object
    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    return parsed
}

module.exports = {analyzeCode}