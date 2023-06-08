const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) =>{
    res.send('school server is running')
})

app.listen(port, () =>{
    console.log(`school server port is running on ${port}`);
})