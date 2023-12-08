const mongoose = require('mongoose')
const mongoURI = "mongodb://localhost:27017/test_apis"

const connectToMongo = () =>{
    mongoose.connect(mongoURI)
}

module.exports = connectToMongo;