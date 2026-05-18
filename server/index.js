const express = require('express');  // import the express library
const app = express();  // create your server

app.get('/analyze', (req, res) => {        // when someone visits /analyze, run this function
    res.send('Ai analysis will go here soon!')
})

app.listen(5000, () =>{       // start the server, listen on port 5000
    console.log('Server is running on port 5000');
})