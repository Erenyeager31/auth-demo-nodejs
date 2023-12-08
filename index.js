const connectToMongo = require('./db')
connectToMongo();

//! Express helps with the development of backend and routing for the API's
const cors = require('cors')
const express = require('express')
const app = express()
const port = 5000

const host = "http://127.0.0.1:5500"

app.use(cors({
    origin:"*"
}))

app.use(express.json())

app.use('/api',require('./routes/auth'))

app.listen(port,() => {
    console.log(`API backend is listening on http://localhost:${port}`)
})