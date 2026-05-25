const express = require('express');  // import the express library
const {analyzeCode} = require('./services/gemini')
const cors = require('cors');  // import CORS middleware
const app = express();  // create your server
app.use(cors());  // enable CORS for all routes
app.use(express.json());  
//this line allows server to read JSON that gets sent to it by react app, without it,server wont see the code

// POST because we're sending data (the code) to the server
app.post('/analyze', async (req, res) => {
    const { code } = req.body  // extract code from what React sends
    if (!code){
        return res.status(400).json({error: 'No code provided'})
    }
    try {
        const result = await analyzeCode(code)  // send to Gemini
        res.send(result)  // send response back to React
    } catch(error){
        console.error('Ai Error:',error.message)
        res.status(500).json({error: 'Ai analysis failed,try again'})
    }    
})

app.listen(5000, () =>{       // start the server, listen on port 5000
    console.log('Server is running on port 5000');
})