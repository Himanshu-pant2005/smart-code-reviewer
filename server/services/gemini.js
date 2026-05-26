const Groq = require('groq-sdk')
require('dotenv').config()

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const systemInstruction = `
You are an elite Static Code Analyzer. Analyze the provided code for bugs, security vulnerabilities, and optimizations.
Analyze both the code logic AND patterns that indicate poor practices.

IMPORTANT: Always detect the actual programming language of the code regardless of what the user selected.

You MUST respond with ONLY a valid JSON object, no extra text:
{
    "detectedLanguage": "The actual programming language you detected in the code",
    "bugs": ["List every bug found"],
    "security": ["List any security issues"],
    "optimizations": ["List performance improvements"],
    "improvedCode": "The fully rewritten fixed version"
}
`

const analyzeCode = async (code, language, retries = 2) => {
    const prompt = `User selected language: ${language}\n\nCode to analyze:\n\n${code}`

    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' }
        })

        const text = response.choices[0].message.content
        return JSON.parse(text)

    } catch (error) {
        if (retries > 0) {
            console.log(`Retrying... attempts left: ${retries}`)
            await new Promise(r => setTimeout(r, 1000))
            return analyzeCode(code, language, retries - 1)
        }
        throw error
    }
}

module.exports = { analyzeCode }