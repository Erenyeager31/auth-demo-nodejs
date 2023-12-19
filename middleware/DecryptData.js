const CryptoJs = require('crypto-js')
const secret_key = process.env.secret_key

const decrypt = (text) => {
    const bytes = CryptoJs.AES.decrypt(text, secret_key);
    const data = JSON.parse(bytes.toString(CryptoJs.enc.Utf8));
    return data
};

const DecryptData = (req,res,next) =>{
    try {
        // console.log("Decryption in process...")
        console.log("before Decryption:",req.body)
        Object.keys(req.body).forEach((key,value)=>{
            console.log(req.body[key],",",value)
            req.body[key] = decrypt(req.body[key])
        })
        console.log("after Decryption:",req.body)
        next()
    } catch (error) {
        console.log(error.message)
        return res.status(200).json({
            success:false,
            message:"Some error occured, please try again later"
        })
    }
}

module.exports = DecryptData