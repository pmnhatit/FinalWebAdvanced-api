const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("../services/passport");
const historyModel = require("../model/history/history.model");
const userModel = require("../model/user/user.model");
const bcrypt = require('bcryptjs');
const { log } = require("debug");
const {cloudinary}=require("../services/cloudinary/cloudinary");


/* GET users listing. */
router.post("/history",passport.authenticate("jwt", { session: false }),async (req, res, next) => {
 
 
}
);

router.get("/history/:id",passport.authenticate("jwt", { session: false }),async (req, res, next) => {
    const player_id= req.params.id;
    let history=[];
   
    console.log("history: " +player_id);
    try {
      const result = await historyModel.getHistoryByID(player_id);  
      //console.log(result);
      for(let i=0 ;i<result.length;i++)
      {   
          let winner='lose';
          let enemy='';
          console.log(result[i]);
          let user1= await userModel.getUserByID(result[i].player1);
          let user2= await userModel.getUserByID(result[i].player2);
          // console.log(user1);
          // console.log(user2);
          console.log(1);
          if(player_id==user1._id)
          {
            
            winner='win'; 
            enemy=user2.name;console.log("true");
          }
          else
          {
            enemy=user1.name;
          }
          if(result[i].draw==true)
          {
            winner="draw";
          }
          console.log(2);
          let entity={
          _id:result[i]._id,
          // player1:user1.name,
          // player2:user2.name,
          enemy:enemy,
          status:winner,
          date:result[i].date,
          order:i+1
      }
      console.log(entity);
      history.push(entity);
      }
      console.log("his");
      console.log(history);
       res.send(history);  
    } catch (error) {
      res.status(401).json({ message: "errors", error: error });
    }
   
  }
);
router.get("/:id",passport.authenticate("jwt", { session: false }),async (req, res,next) => {
    const result= await userModel.getUserByID(req.params.id);
    res.send(result)
  }
);

router.post("/edit/:id",passport.authenticate("jwt", { session: false }),async (req, res,next) => {
    const entity = req.body;
    const result= await userModel.updateUserInfo(req.params.id,entity.name,entity.phone,"","","","","");
  }
);
router.post("/changepassword/:id",passport.authenticate("jwt", { session: false }),async (req, res,next) => {
  const entity = req.body;
  const user = await userModel.getUserByID(req.params.id);
  //console.log(entity.oldPassword);
  //console.log(user.password);
  const mess= bcrypt.compareSync(entity.oldPassword,user.password);
  //console.log(mess);
  if (mess) {
    const hash= bcrypt.hashSync(entity.newPassword, bcrypt.genSaltSync(10));
    await userModel.updateUserInfo(req.params.id,"","","",hash,"","","");
    res.json({ message: "success"});
    
  } else {
   //console.log("sai mk");
   res.json({ message: "fail" });
  }
}
);
router.post("/changeimage/:id",passport.authenticate("jwt", { session: false }),async (req, res,next) => {
  const entity = req.body;
  console.log(req.body.data);
  try {
    const fileString=req.body.data;
    const result = await cloudinary.uploader.upload(fileString);
    console.log(result);
    await userModel.updateUserInfo(req.params.id,"","",result.url,"","","","");
    res.json({ message: "success"});
  } catch (error) {
    res.json({ message: "fail" });
  }
  //const result= await userModel.updateUserInfo(req.params.id,entity.name,entity.phone,"","","");
}
);


module.exports = router;
