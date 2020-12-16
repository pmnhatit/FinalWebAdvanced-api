const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("../services/passport");
const historyModel = require("../model/history/history.model");
const userModel = require("../model/user/user.model");


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
      for(let i=0 ;i<result.length;i++)
      {   
          let winner='lose';
          let enemy='';
          //console.log(result[i]);
          let user1= await userModel.getUserByID(result[i].player1);
          let user2= await userModel.getUserByID(result[i].player2);
          console.log(player_id);
          console.log(user1._id);
          if(player_id==user1._id)
          {
            winner='win'; 
            enemy=user2.name;
          }
          else
          {
            enemy=user1.name;
          }
        
          const entity={
          _id:result[i]._id,
          // player1:user1.name,
          // player2:user2.name,
          enemy:enemy,
          status:winner,
          date:result[i].date,
          order:i+1
      }
      history.push(entity);
      }
      
       res.send(history);  
    } catch (error) {
      res.status(401).json({ message: "errors", error: error });
    }
   
  }
);


module.exports = router;
