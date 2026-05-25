const mongoose = require('mongoose')

const analysisSchema = new mongoose.Schema({
    originalCode: String,
    bugs: [String],
    security: [String],
    optimizations: [String],
    improvedCode: String,
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Analysis', analysisSchema)