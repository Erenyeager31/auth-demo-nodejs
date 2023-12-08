require('dotenv').config()
//! environment variables
const JWTSECRETKEY = process.env.JWTSECRETKEY
const host_mail = process.env.host_mail
const smtp_password = process.env.smtp_password

const express = require('express')
const router = express.Router()

//! importing model for the mongodb
const USER = require('../models/User')

//! importing bcryptjs the purpose of hashing the password
const bcrypt = require('bcryptjs')

//! importing jwt for creation of unique tokens for different users
const jwt = require('jsonwebtoken')

//! importing validation library of express
const {body,validationResult} = require('express-validator')

//! importing nodemailer for the smtp service
const nodemailer = require('nodemailer')

//! api endpoint to handle user registration
router.post('/registerUser',[
    //* This area is used for the validation of the credentials
    body('email','Please enter a valid Email').isEmail(),
    body('password','The password should have minimum length 8').isLength({min:8}).isAlphanumeric()
],
async (req,res) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({
            success:false,
            message:"Credentials are not in the desired format",
            errors
        })
    }

    const {email,password} = req.body
    // console.log(req,body)
    try {
        //* checking if the email already exists
        let user = await USER.findOne({email:email})
        if(user){
            return  res.status(400).json({
                success:false,
                message:"Email ID already exists"
            })
        }
        
        //* creating hashed password
        const salt = await bcrypt.genSalt(10)
        const hashed_password = await bcrypt.hash(password,salt)   

        user = await USER.create({
            email:email,
            password:hashed_password
        })
        console.log("hi")
        return res.status(200).json({
            success:true,
            message:"Account Created successfully"
        })
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:"Some unexpected error has occured. Please try again later"
        })
    }
})

//! api endpoint to handle user login
router.post('/loginUser',[
    //* This area is used for the validation of the credentials
    body('email','Please enter a valid Email').isEmail(),
    body('password','The password should have minimum length 8').isLength({min:8}).isAlphanumeric()
],
async (req,res) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({
            success:false,
            message:"Credentials are not in the desired format",
            errors
        })
    }

    const {email,password} = req.body

    try {
        //* checking if the email exists
        let user = await USER.findOne({email:email})
        if(!user){
            return  res.status(400).json({
                success:false,
                message:"Invalid login Credentials"
            })
        }

        const pass_verify = await bcrypt.compare(password,user.password)

        if(!pass_verify){
            return res.status(400).json({
                success:false,
                message:"Incorrect password"
            })
        }

        const payload = {
            id:user._id
        }
        //* creating authtoken
        const authtoken = jwt.sign(payload,JWTSECRETKEY)

        return res.status(200).json({
            success:true,
            message:"Login Successful",
            authtoken:authtoken
        })
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:"Some unexpected error has occured. Please try again later",
        })
    }
})

//! Api endpoint for forgot password
router.post('/forgotpwd',[
    //* This area is used for the validation of the credentials
    body('email','Please enter a valid Email').isEmail(),
],
async (req,res) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({
            success:false,
            message:errors.array()[0].msg,
        })
    }

    const {email} = req.body

    try {
        //* checking if the email exists
        let user = await USER.findOne({email:email})
        if(!user){  //*email does not exist
            return  res.status(400).json({
                success:false,
                message:"The Email ID does not exist"
            })
        }

        //* handling for valid email and sending email for password reset
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: host_mail,
              pass: smtp_password, // Use the App Password generated in your Gmail Account settings
            },
          });

        const mailOptions = {
            from: host_mail,
            to: email,
            subject: `Link to reset the password`,
            html: '<body>'+
            '<div style="background-color: #1d3557; border:2px solid yellow; color: #fffcf2; font-family:Verdana, Geneva, Tahoma, sans-serif; width: 95%; padding:1% ">'+
              '<h1 style="text-align: center;">PASSWORD RESET</h1>'+
              '<h3 style="text-align: center;">Please click on the link to reset the password for your account --> <a href="http:localhost:3000">CLICK HERE</a> </h3>'+
              '<h5>'+email+'</h5>'+
            '</div>'+
          '</body>'
          };

          try {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.error('Error sending email:', error);
                } else {
                  console.log('Email sent successfully:', info.messageId);
                }
              });
          } catch (error) {
            return res.status(200).json({
                success:false,
                message:"Could not send the Email, please try again"
            })
          }
          

        return res.status(200).json({
            success:true,
            message:"Password reset link has been sent successfully",
        })
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:"Some unexpected error has occured. Please try again later",
            error
        })
    }
})

//! api endpoint for password reset
router.post('/pwdreset',[
    //* This area is used for the validation of the credentials
    body('password','The password should have minimum length 8').isLength({min:8}).isAlphanumeric()
],
async (req,res) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({
            success:false,
            message:"Credentials are not in the desired format",
            errors
        })
    }

    const {email,password} = req.body

    try {
        
        //* creating hashed password
        const salt = await bcrypt.genSalt(10)
        const hashed_password = await bcrypt.hash(password,salt)   

        const user = await USER.findOneAndUpdate({
            email:email,
        },{
            password:hashed_password
        })
        return res.status(200).json({
            success:true,
            message:"Password reset successfully"
        })
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:"Some unexpected error has occured. Please try again later"
        })
    }
})

module.exports = router