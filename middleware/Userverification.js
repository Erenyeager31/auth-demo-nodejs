const jwt = require('jsonwebtoken')

const verifyUser = (req, res, next) => {
    try {
        // console.log(req.headers.cookie)
        if (!req.headers?.cookie) {
            return res.status(200).json({
                success: false,
                message: "Please login!",
            });
        }
        //! Accessing the cookie
        const token = req.headers?.cookie.split("=")[1];
        const verification = jwt.verify(token,process.env.JWTSECRETKEY)
        if(verification){
            // console.log(verification)
            req.id = verification
            // console.log(req.id + "here")
            next();
        }else{
            return res.status(200).json({
                success:false,
                message:"Please Login !"
            })
        }
    } catch (error) {
        return res.status(200).json({
            success: false,
            message: "Please try again later"
        })
    }
}

module.exports = verifyUser