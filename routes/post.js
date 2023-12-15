const express = require('express')
const verifyUser = require('../middleware/Userverification')
const router = express.Router()
const USER = require('../models/User')
const POST = require('../models/Posts')

router.post('/savePost',verifyUser,
async(req,res)=>{
    try {
        // const UserID = req.id.
        const {img_url,caption} = req.body

        console.log(req.body)

        const {id,iat} = req.id
        console.log(id)
        //! fetching user data
        const user = await USER.findById(id)
        // console.log(user)
        const username = user.username

        //! creating the post
        try {
            const post = await POST.create({
                "username":username,
                "img_url":img_url,
                "caption":caption
            })    
            // const post_id = post._id
            user.posts.push(
                post._id)
            user.save()
        } catch (error) {
            console.log(error)
            throw error
        }

        return res.status(200).json({
            success:true,
            message:"Post uploaded successfully"
        })    
    } catch (error) {
        return res.status(200).json({
            success:false,
            message:"Some error occured! please try again later ",
            "error":error.message
        })    
    }
})

router.get('/fetchAllPosts',verifyUser,
async(req,res)=>{
    try {
        console.log("hi")
        const post = await POST.find()
        console.log("hey")
        return res.status(200).json({
            success:true,
            post
        })
    } catch (error) {
        return res.status(200).json({
            "error":error.message
        })
    }
}
)

router.post('/addComment',verifyUser,
async(req,res)=>{
    try {
        // const UserID = req.id.
        const {pid,comment,username} = req.body

        console.log(req.body)
        const {id,iat} = req.id //!owner comment
        console.log(id)
        //! fetching user data
        const user = await USER.findById(id)
        // console.log(user)
        const p_username = user.username

        //! fetching all posts by the pid id of the post
        const post = await POST.findById(pid)
        console.log(post)

        post.comments.push({
            username:user.username,
            comment
        })
        post.save()

        user.comments.push({
            pid:pid,
            comment:comment
        })
        user.save()

        return res.status(200).json({
            success:true,
            message:"Comment added successfully"
        })    
    } catch (error) {
        return res.status(200).json({
            success:false,
            message:"Some error occured! please try again later ",
            "error":error.message
        })    
    }
})

router.get('/fetchAllPosts',verifyUser,
async(req,res)=>{
    try {
        console.log("hi")
        const post = await POST.find()
        console.log("hey")
        return res.status(200).json({
            success:true,
            post
        })
    } catch (error) {
        return res.status(200).json({
            "error":error.message
        })
    }
}
)

router.post('/addLike',verifyUser,
async(req,res)=>{
    try {
        // const UserID = req.id.
        const {pid} = req.body

        console.log(req.body)
        const {id,iat} = req.id //!owner comment
        console.log(id)
        //! fetching user data
        const user = await USER.findById(id)
        // console.log(user)
        const p_username = user.username

        //! fetching all posts by the pid id of the post
        const post = await POST.findById(pid)
        console.log(post)

        post.likes.push({
            username:user.username,
        })
        post.save()

        user.comments.push({
            pid:pid,
        })
        user.save()

        return res.status(200).json({
            success:true,
            message:`You have liked the post by ${user.username}`
        })    
    } catch (error) {
        return res.status(200).json({
            success:false,
            message:"Some error occured! please try again later ",
            "error":error.message
        })    
    }
})

module.exports = router