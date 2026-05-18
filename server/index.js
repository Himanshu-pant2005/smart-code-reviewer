const express = require('express');  // import the express library
const {analyzeCode} = require('./services/gemini')  // importing
const app = express();  // create your server
app.use(express.json())  
//this line allows server to read JSON that gets sent to it by react app, without it,server wont see the code

// POST because we're sending data (the code) to the server
app.post('/analyze', async (req, res) => {
    const { code } = req.body  // extract code from what React sends
    const result = await analyzeCode(code)  // send to Gemini
    res.send(result)  // send response back
})

app.listen(5000, () =>{       // start the server, listen on port 5000
    console.log('Server is running on port 5000');
})