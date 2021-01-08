const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const verifyModel = require("./verify");
const userService = require("../user/user.model");

module.exports.getUserByUsername = async (username) =>{
    const result = await verifyModel.findOne({username: username});
    return result;
}

module.exports.sendemailverify = async (req, res, next) => {
    let verifycode, link, content;
    const {username, password, name, phone, email} = req.body;
    verifycode = Math.floor((Math.random() * 10000) + 54);
    await this.createNewVerify(username, password, name, phone, email, verifycode);
    // link = "http://" + req.get('host') + "/user/emailverify/verify?id=" + verifycode + "&username=" + username;
    link = "http://localhost:3000" + "/verify-email/" + verifycode + "/" + username;
    content = "Hello this is caro online mail system,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>";
    try {
        await this.verifyMessage(req, res, next, content);
    } catch (error) {

    }
}

module.exports.verifyMessage = (req, res, next, content) => {
    const {email} = req.body;
    var smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASS
        }
    });
    var mailOptions;
    mailOptions = {
        to: email,
        subject: "Please confirm your Email account",
        html: content
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log(error);
            res.end("error");
        } else {
            console.log("Message sent: " + response.message);
            res.end("sent");
        }
    });
}

module.exports.createNewVerify = async (username, password, name, phone, email, verifycode) =>{
    const newVerify = new verifyModel({ username, password, name, phone, email, verifycode});
    return newVerify.save();
}

module.exports.findAccountByUsername = async (username) =>{
    const result = await verifyModel.findOne({username: username});
    return result;
}

module.exports.deleteAccountVerified = async (username) =>{
    const result = await verifyModel.findOneAndDelete({username: username});
    console.log("del: ",result);
}

module.exports.checkVerifyAccount = async (code, username) =>{
    try {
        console.log("Vo check verify")
        const accountVerify = await this.findAccountByUsername(username);
        if(!accountVerify){
            console.log("No account to verify");
            res.status.json("No account to verify");
        }else{
            const checkcode = accountVerify.verifycode;
            if(checkcode==code){
                console.log("email is verified");
                const newUser = await userService.createUser(accountVerify.username, accountVerify.password,
                    accountVerify.name, accountVerify.phone, accountVerify.email);
                await this.deleteAccountVerified(username);
                if(!newUser){
                    console.log("Create account failure")
                    res.status(400).json({message:"Create account failure"});
                }else{
                    console.log("Verify account successfull")
                    res.json({message:"Verify account successfull"});
                }
            }
        }
    } catch (error) {
        res.status(400).json({message:"error"})
    }
}
