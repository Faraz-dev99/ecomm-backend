const User = require('../models/user-model');
const bcrypt = require('bcrypt');
const Jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator')
const sendMail = require('../middleware/sendMail');



const home = async (req, resp) => {
    try {
        resp.status(200).send("this is home page");
    }
    catch (err) {
        resp.status(201).send({ err: "error" })
    }

}

const register = async (req, resp) => {
    try {
        const { username, email, password, role } = req.body;
        const userEmailExist = await User.findOne({ email });
        const userNameExist = await User.findOne({ username });

        if (userEmailExist || userNameExist) {
            return resp.json({ 
                success:false,
                message: "user already exist" 
            })
        }
        if (!username || !email || !password) {
            return resp.json({ 
                success:false,
                message: "incomplete details" 
            })
        }

        /* 

        //signing user without otp
        
        let hash_pass = await bcrypt.hash(password, 10)

        let result = new User({
            username,
            email,
            password: hash_pass,
            isAdmin
        });
        result = await result.save();
        result = result.toObject();

        delete result.password;
        Jwt.sign({ result },process.env.JWTKEY, { expiresIn: '24h' }, (err, token) => {
            if (err) {
                resp.send({ err: "something went wrong" });
            }
            else {
                resp.status(200).send({ result, auth: token });
            }
        }) */

        //signing user with otp
        let hash_pass = await bcrypt.hash(password, 10)
        let user = {
            username,
            email,
            password: hash_pass,
            role
        }
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })

        Jwt.sign({ user, otp }, process.env.JWTKEY, { expiresIn: '5m' }, async (err, token) => {
            if (err) {
                resp.status(500).json({ 
                    success:false,
                    message:"something went wrong",
                    err: err.message 
                });
            }
            else {
                try {
                    await sendMail(email, "let's negotiate", `${otp}`);

                    resp.status(200).json({ 
                        success:true,
                        message: "otp send successfully", 
                        token 
                    });
                }
                catch (err) {
                    console.log("error occure: ", err)
                    resp.json({
                        success: false,
                        message: 'something went wrong',
                        error: 'something went wrong'
                    })
                }


            }
        })

    }
    catch (err) {
        resp.status(201).send({
            success: false,
            message: 'something went wrong',
            error: err.message
        });
    }
}

const verifyUser = async (req, resp) => {
    try {
        const { otp, token } = req.body;
        const verify = Jwt.verify(token, process.env.JWTKEY);
        if (!verify) {
            return resp.status(400).json({
                msg: "otp expired"
            })
        }
        if (verify.otp != otp) {
            return resp.status(400).json({
                msg: "wrong otp"
            })

        }

        let user = new User({
            username: verify.user.username,
            email: verify.user.email,
            password: verify.user.password,
            role: verify.user.role
        });
        user = await user.save();
        user = user.toObject();

        delete user.password;
        Jwt.sign({ user }, process.env.JWTKEY, { expiresIn: '24h' }, (err, token) => {
            if (err) {
                resp.send({
                    success: false,
                    message: 'something went wrong',
                    error: err.message
                });
            }
            else {
                resp.status(200).send({ user,token });
            }
        })

    }
    catch (err) {
        console.log("error occure: ", err)
        resp.send({
            success: false,
            message: 'something went wrong',
            error: err.message
        })
    }
}

const login = async (req, resp) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return resp.send("incomplete details");
    }

    let user = await User.findOne({ email });
    if (user) {
        if (await bcrypt.compare(password, user.password)) {


            Jwt.sign({ user }, process.env.JWTKEY, { expiresIn: '24h' }, (err, token) => {
                if (err) {
                    resp.send({
                        success: false,
                        message: "something went wrong",
                        error: err.message
                    })
                }
                else {
                    resp.send({ user,token })
                }
            })
        }
        else {
            resp.send({
                success: false,
                message: "wrong password"
            })
        }
    }
    else {
        resp.send({
            success: false,
            message: "user not exist"
        });
    }
}

module.exports = { home, register, login, verifyUser };