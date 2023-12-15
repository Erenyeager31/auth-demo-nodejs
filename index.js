const connectToMongo = require('./db')
require('dotenv').config()
connectToMongo();

//! Express helps with the development of backend and routing for the API's
const cors = require('cors')
const express = require('express')
const app = express()
const port = 5000
var cookieParser = require('cookie-parser');
const verifyUser = require('./middleware/Userverification');
app.use(cookieParser());

const host = "http://127.0.0.1:5000"

app.use(cors({
    origin:"http://localhost:3000",
    credentials:true
}))

app.use(express.json())

//! Routes for user authentication
app.use('/api/auth',require('./routes/auth'))

//! Routes related to Posting
app.use('/api/post',require('./routes/post'))

//! route for testing
app.use('/api/test',require('./routes/auth'))
// app.use('/api/test',verifyUser)

app.listen(port,() => {
    console.log(`API backend is listening on http://localhost:${port}`)
})