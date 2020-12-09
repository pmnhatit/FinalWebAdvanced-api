const LocalStrategy = require("passport-local").Strategy;
const userModel = require("../../model/user/user.model");
const bcrypt = require('bcryptjs');
module.exports = new LocalStrategy({ session: false },async (username, password, callback) => {
    // We use default {username: "catlover", password: "cat", id: 1} to authenticate.
    // You should use database to check for user credentials.
    const user = await userModel.getUserByUsername(username);
    console.log("local");
    if (!user) {
      console.log("user not exit");
      callback(null, { message: "false" });
    } else {
      const infoUser = {_id:user._id ,username: user.username,name: user.name,
        phone: user.phone, email: user.email}
        bcrypt.compare(password,user.password, (err,isMatch ) =>{
          if (err) throw err;
                  if (isMatch) {
                    console.log("user:"+user);
                      callback(null, infoUser)
                  } else {
                    // callback(null, false);
                    console.log("sai mk");
                    callback(null,{message: "false"});
                  }
      });
    }
  }
);
