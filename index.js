const express = require('express');

const app = express()

const port = process.env.PORT || 5000;

app.get('/', (req, res) =>{
    res.send('school server is running')
})

app.listen(port, () =>{
    console.log(`school server port is running on ${port}`);
})