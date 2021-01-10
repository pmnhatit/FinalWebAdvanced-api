const userModel = require('./user');
const bcrypt = require('bcryptjs');
const verifyService = require("../verify/verify.model");
const historyModel=require('../history/history.model');

module.exports.getUserByUsername = async (username)=>{
    const result = await userModel.findOne({username: username});
    return result;
}

module.exports.getUserByID= async (id) =>{
    const result = await userModel.findOne({_id: id});
    return result;
}

module.exports.updateUserInfo = async (id, name, phone,image,password,matches,trophies,win_rate) => {
    if(name!=="")
    {   //console.log("name not null");
        const result = await userModel.updateOne({ '_id': id }, { $set: { 'name': name, 'phone': phone }}, (err, doc) => {
                if (err) {
                    console.log("update user error");
                } else {
                    console.log("update user success");
                    //console.log(doc);
                }
            });
    }
    if(image!=="")
    {
        const result = await userModel.updateOne({ '_id': id }, { $set: { 'image': image }}, (err, doc) => {
            if (err) {
                console.log("update user error");
            } else {
                console.log("update user success");
                //console.log(doc);
            }
        });
    }
    if(password!=="")
    {
        console.log("pass not null");
       const result = await userModel.updateOne({ '_id': id }, { $set: { 'password': password }}, (err, doc) => {
        if (err) {
            console.log("update pass error");
        } else {
            console.log("update pass success");
            //console.log(doc);
        }
    });
    }
    if(matches!=="")
    {
        console.log("matches not null");
        const result = await userModel.updateOne({ '_id': id }, { $set: { 'matches':matches,'trophies': trophies, 'win_rate': win_rate }}, (err, doc) => {
                if (err) {
                    console.log("update match error");
                } else {
                    console.log("update match success");
                    //console.log(doc);
                }
            });
    }
     
     console.log("hết service");
     
},



module.exports.createUser = async (username, password, name, phone, email) =>{
   
    let hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    const trophies=1000;
    const matches=0;
    const win_rate=100;
    const blocked=false;
    const code="";
    const image="https://res.cloudinary.com/dvtm1pjkp/image/upload/v1610201908/default-avatar-profile-image-vector-social-media-user-icon-potrait-182347582_pp6vqh.jpg";
    const newUser = new userModel({ username, password: hash, name, phone,image, email,matches,trophies,win_rate, blocked, code});
    return newUser.save();
}

module.exports.addCodeResetPass = async (username, code)=>{
    console.log("Vo add code");
    const result = await userModel.updateOne({ 'username': username }, { $set: { 'code':code }}, (err, doc) => {
        if (err) {
            console.log("update match error");
        } else {
            console.log("update match success");
            //console.log(doc);
        }
    });
    console.log("Het add code");
}

module.exports.changePass = async (username, newPass)=>{
    console.log("Vo change pass");
    let hash = bcrypt.hashSync(newPass, bcrypt.genSaltSync(10));
    const result = await userModel.updateOne({ 'username': username }, { $set: { 'password': hash, 'code': ""}}, (err, doc) => {
        if (err) {
            console.log("update match error");
        } else {
            console.log("update match success");
            //console.log(doc);
        }
    });
    console.log("Het add code");
}

module.exports.forgotPassword = async (req, res, next)=>{
    let code, link, content;
    const {username} = req.body;
    code = Math.floor((Math.random() * 10000) + 54);
    const user = await this.getUserByUsername(username);
    if(!user){
        res.status(400).json({message:"username is wrong"});
    }else{
        this.addCodeResetPass(username, code);
    // link = "http://" + req.get('host') + "/user/emailverify/verify?id=" + verifycode + "&username=" + username;
    link = "https://user-caro.herokuapp.com" + "/reset-password/" + username;
    content = "Hello this is caro online mail system, this is code to reset password: <h3>"+code+"</h3><br> Please Click on the link to reset your password.<br><a href=" + link + ">Click here to verify</a>";
    try {
        console.log("send mail")
        await verifyService.verifyMessage(req, res, next, content);
        console.log("send mail completed")
    } catch (error) {
        res.status(400).json({message:"error"});
    }
    }
    
}

module.exports.resetPass = async (req, res, next) =>{
    try {
        const {username, code, newPass} = req.body;
        const user = await this.getUserByUsername(username);
        if(!user){
            console.log("no user");
            res.status(400).json({message:"Username is wrong!"});
        }else{
            if(user.code!=code){
                console.log("wrong code");
                res.status(400).json({message:"Code is wrong!"});
            }else{
                console.log("chang pass");
                await this.changePass(username, newPass);
                res.json({message:"Reset pass completed!"});
            }
        }
    } catch (error) {
        res.status(400).json({message:"error"});
    }
}

module.exports.editTrophies = async (id_player1,id_player2) =>{
    try {
        const changeTrophies=20;
        const player1= await this.getUserByID(id_player1);  //
        const player2= await this.getUserByID(id_player2);  //

        const history1 = await historyModel.getHistoryByID(id_player1); 
        const history2 = await historyModel.getHistoryByID(id_player2); 
        
        const newProfile1= await this.CaculateTrophies(id_player1,history1);
        const newProfile2= await this.CaculateTrophies(id_player2,history1);

        await this.updateUserInfo(id_player1,"","","","",newProfile1.matches,player1.trophies+20,newProfile1.win_rate);
        await this.updateUserInfo(id_player1,"","","","",newProfile2.matches,player2.trophies-20,newProfile2.win_rate);

    } catch (error) {
        console.log("edit trophies fail");
    }
    
    
      

}
module.exports.CaculateTrophies = async (id_player,history) =>{
    
    const win=0;
    const total=history.length();
    for(let i=0 ;i<history.length;i++) // dem so tran thang
    { 
        if(id_player==history[i]._id)
        {
            win++;
        }
    }
    const entity={              //save new profileInfo
        matches:total,
        win_rate: win/total*100,

    }
    return entity;
}