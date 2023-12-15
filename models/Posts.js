const mongoose = require('mongoose')

const Post_Schema = mongoose.Schema({
    username:{
        type:String,
        required:true,
    },    
    img_url:{
        type:String,
        required:true
    },
    caption:{
        type:String,
        required:true
    },
    likes:[
    ],
    comments:[
    ],
    date_Of_Posting:{
        type:Date,
        default:Date.now
    }
})

module.exports = new mongoose.model("Posts",Post_Schema)