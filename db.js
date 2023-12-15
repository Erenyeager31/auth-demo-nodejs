const mongoose = require('mongoose')
const mongoURI = "mongodb+srv://dishant:dishant@cluster0.unwhqu4.mongodb.net/social_media?retryWrites=true&w=majority"

const connectToMongo = () =>{
    mongoose.connect(mongoURI)
}

module.exports = connectToMongo;