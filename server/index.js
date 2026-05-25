const connectDB = require('./config/db')
const Analysis = require('./models/Analysis')
const express = require('express');
const {analyzeCode} = require('./services/gemini')
const cors = require('cors');
const app = express();

connectDB()
app.use(cors());
app.use(express.json());  

app.post('/analyze', async (req, res) => {
    const { code } = req.body
    if (!code){
        return res.status(400).json({error: 'No code provided'})
    }
    try {
        const result = await analyzeCode(code)  // now returns a JS object

        const analysis = new Analysis({
            originalCode: code,
            bugs: result.bugs || [],
            security: result.security || [],
            optimizations: result.optimizations || [],
            improvedCode: result.improvedCode || ''
        })
        await analysis.save()
        console.log('Analysis saved to MongoDB ✓')

        res.json(result)  // send as JSON, not text
    } catch(error){
        console.error('Ai Error:',error.message)
        res.status(500).json({error: 'Ai analysis failed,try again'})
    }    
})

// GET all past analyses
app.get('/history', async (req, res) => {
    try {
        const history = await Analysis.find().sort({ createdAt: -1 })  // newest first
        res.json(history)
    } catch(error){
        console.error('History fetch error:', error.message)
        res.status(500).json({error: 'Could not fetch history'})
    }
})

app.listen(5000, () =>{
    console.log('Server is running on port 5000');
})