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
  // Destructured the incoming language payload parameter
  const { code, isReanalyze, analysisId, language } = req.body
  if (!code) return res.status(400).json({ error: 'No code provided' })

  try {
    // Pass both parameters down into our service layer framework execution hook
    const result = await analyzeCode(code, language || 'Python')

    let analysis
    if (isReanalyze && analysisId) {
      analysis = await Analysis.findByIdAndUpdate(
        analysisId,
        {
          originalCode: code,
          bugs: result.bugs || [],
          security: result.security || [],
          optimizations: result.optimizations || [],
          improvedCode: result.improvedCode || ''
        },
        { new: true }
      )
    } else {
      analysis = new Analysis({
        originalCode: code,
        bugs: result.bugs || [],
        security: result.security || [],
        optimizations: result.optimizations || [],
        improvedCode: result.improvedCode || ''
      })
      await analysis.save()
    }

    console.log('Analysis saved to MongoDB ✓')
    res.json({ ...result, _id: analysis._id })
  } catch (error) {
    console.error('AI Error:', error.message)
    res.status(500).json({ error: 'AI analysis failed, try again' })
  }
})

app.get('/history', async (req, res) => {
    try {
        const history = await Analysis.find().sort({ createdAt: -1 })
        res.json(history)
    } catch(error){
        console.error('History fetch error:', error.message)
        res.status(500).json({error: 'Could not fetch history'})
    }
})

app.listen(5000, () =>{
    console.log('Server is running on port 5000');
})