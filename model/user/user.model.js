const userModel = require('./user');
const bcrypt = require('bcryptjs');

module.exports.getUserByUsername = async (username)=>{
    const result = await userModel.findOne({username: username});
    return result;
}

module.exports.getUserByID= async (id) =>{
    const result = await userModel.findOne({_id: id});
    return result;
}

module.exports.updateUserInfo = async (id, name, phone,password,matches,trophies,win_rate) => {
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
    const newUser = new userModel({ username, password: hash, name, phone, email,matches,trophies,win_rate, blocked, code});
    return newUser.save();
}