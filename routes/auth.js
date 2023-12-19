// require('dotenv').config()
//! environment variables
const host_mail = process.env.host_mail
const smtp_password = process.env.smtp_password

const USER = require('../models/User')

const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const nodemailer = require('nodemailer')
const verifyUser = require('../middleware/Userverification')
const DecryptData = require('../middleware/DecryptData')

//! api endpoint to handle user registration
router.post('/registerUser',DecryptData, [
    //* This area is used for the validation of the credentials
    body('email', 'Please enter a valid Email').isEmail(),
    body('username', 'Please enter a valid username').exists(),
    body('password', 'The password should have minimum length 8').isLength({ min: 8 }).isAlphanumeric()
],
    async (req, res) => {
        const { email, username, password } = req.body
        // console.log(req.body)

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            console.log(req.body)
            console.log(errors)
            return res.status(400).json({
                success: false,
                message: "Credentials are not in the desired format",
                errors
            })
        }

        try {
            //* checking if the email already exists
            let user = await USER.findOne({ email: email })
            if (user) {
                return res.status(400).json({
                    success: false,
                    message: "Email ID already exists"
                })
            }
            try {
                user = await USER.findOne({ username: username })

            } catch (error) {
                console.log(error)
            }
            console.log("hi")
            if (user) {
                return res.status(400).json({
                    success: false,
                    message: "Username already exists"
                })
            }

            //* creating hashed password
            const salt = await bcrypt.genSalt(10)
            const hashed_password = await bcrypt.hash(password, salt)

            user = await USER.create({
                email: email,
                username: username,
                password: hashed_password
            })
            console.log("hi")
            return res.status(200).json({
                success: true,
                message: "Account Created successfully"
            })
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Some unexpected error has occured. Please try again later",
                error
            })
        }
    })

//! api endpoint to handle user login
router.post('/loginUser',DecryptData, [
    //* This area is used for the validation of the credentials
    body('username', 'Please enter a valid username').exists(),
    body('password', 'The password should have minimum length 8').isLength({ min: 8 }).isAlphanumeric()
],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            console.log(req.body)
            return res.status(200).json({
                success: false,
                message: "Credentials are not in the desired format",
                errors,
                // req,body
            })
        }

        const { username, password } = req.body

        try {
            //* checking if the email exists
            let user = await USER.findOne({ username: username })
            if (!user) {
                return res.status(200).json({
                    success: false,
                    message: "Invalid login Credentials"
                })
            }

            const pass_verify = await bcrypt.compare(password, user.password)

            if (!pass_verify) {
                return res.status(200).json({
                    success: false,
                    message: "Incorrect password"
                })
            }

            const payload = {
                id: user._id
            }
            //* creating authtoken
            const authtoken = jwt.sign(payload, process.env.JWTSECRETKEY)

            return res.status(200)
                .cookie("authtoken", authtoken,
                    {
                        path: "/",
                        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                        httpOnly: true,
                        sameSite: "strict",
                    })
                .json({
                    success: true,
                    message: "Login Successful",
                    username
                })
        } catch (error) {
            return res.status(200).json({
                success: false,
                message: "Some unexpected error has occured. Please try again later",
            })
        }
    })

//! Api endpoint for forgot password
router.post('/forgotpwd', [
    //* This area is used for the validation of the credentials
    body('username', 'Please enter a valid Username').exists(),
],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg,
            })
        }

        const { username } = req.body

        try {
            //* checking if the email exists
            let user = await USER.findOne({ username: username })
            if (!user) {  //*username does not exist
                return res.status(400).json({
                    success: false,
                    message: "The Username does not exist"
                })
            }

            console.log(user.email)
            //* handling for valid email and sending email for password reset
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: host_mail,
                    pass: smtp_password, // Use the App Password generated in your Gmail Account settings
                },
            });

            //   $2a$10$O/yiV4FC9ac0sjxM.3dopOpPwTwwZyVOANPxU47pQg.wlOHjmLEhG
            // $2a$10$h4AfysFuKuVDtr8rtzqP3ugG/G.jYL4n0QEqAM4Dr57xGjk1447MO


            const mailOptions = {
                from: host_mail,
                to: user.email,
                subject: `Link to reset the password`,
                html: '<body>' +
                    '<div style="background-color: #1d3557; border:2px solid yellow; color: #fffcf2; font-family:Verdana, Geneva, Tahoma, sans-serif; width: 95%; padding:1% ">' +
                    '<h1 style="text-align: center;">PASSWORD RESET</h1>' +
                    '<h3 style="text-align: center;">Please click on the link to reset the password for your account --> <a href="http:localhost:3000">CLICK HERE</a> </h3>' +
                    '<h5>' + user.email + '</h5>' +
                    '</div>' +
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
                    success: false,
                    message: "Could not send the Email, please try again"
                })
            }


            return res.status(200).json({
                success: true,
                message: "Password reset link has been sent successfully",
            })
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Some unexpected error has occured. Please try again later",
                error
            })
        }
    })

//! api endpoint for password reset
router.post('/pwdreset', [
    //* This area is used for the validation of the credentials
    body('password', 'The password should have minimum length 8').isLength({ min: 8 }).isAlphanumeric()
],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Credentials are not in the desired format",
                errors
            })
        }

        const { email, password } = req.body

        try {

            //* creating hashed password
            const salt = await bcrypt.genSalt(10)
            const hashed_password = await bcrypt.hash(password, salt)

            const user = await USER.findOneAndUpdate({
                email: email,
            }, {
                password: hashed_password
            })
            return res.status(200).json({
                success: true,
                message: "Password reset successfully"
            })
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Some unexpected error has occured. Please try again later"
            })
        }
    })

router.post('/', verifyUser,
    async (req, res) => {
        return res.status(200).json({
            message: "message"
        })
    })

module.exports = router