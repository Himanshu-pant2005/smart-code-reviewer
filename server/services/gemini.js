const {GoogleGenerativeAI} = require('@google/generative-ai');
require('dotenv').config()
const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAi.getGenerativeModel({model: 'gemini-2.5-flash'})

const analyzeCode = async (code) => {       //async here means this is gonna take time to run dont wait
    const prompt = `
    You are a senior software engineer reviewing code.
    Analyze the following code and return ONLY a JSON object, nothing else.
    No explanation outside the JSON.

    {
        bugs:["bug1", "bug2"],
        "security": ["issue1", "issue2"],
        "optimization": ["opt1", "opt2"],
        "improved_code":"write the full improved code here"
    }
    Code to analyze:
    ${code}
    `
    const result = await model.generateContent(prompt)
    const responce = result.response.text()
    return responce
}

module.exports = {analyzeCode}    
//module.exports means export this variable we created so that others can use it