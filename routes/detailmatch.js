const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("../services/passport");
const moveHistoryModel = require("../model/moveHistory/moveHistory.model");
const chatHistoryModel=require("../model/chatHistory/chatHistory.model");
const historyModel=require("../model/history/history.model");
const userModel=require("../model/user/user.model");

router.get("/:id",passport.authenticate("jwt", { session: false }),async (req, res, next) => {
    const match_id=req.params.id;
    console.log("detailmatch");
    console.log(match_id);
    const move= await moveHistoryModel.getMoveHistoryByID(match_id);
    const chat= await chatHistoryModel.getChatHistoryByID(match_id);
    
    const history= await historyModel.getHistoryByMatchID(match_id);
    console.log(history[0].player1);
    const user1= await userModel.getUserByID(history[0].player1);
    const user2= await userModel.getUserByID(history[0].player2);
    // console.log(user1);
    // console.log(user2);
    const  player1=user1.name;
    const player2=user2.name;
    const result={move,chat,player1,player2}

    res.json(result);
    // res.send(move,chat); 
}
);
/* GET users listing. */


// khong xai
router.post("/movehistory",passport.authenticate("jwt", { session: false }),async (req, res, next) => {
    const entity=
    {
        match_id:"5ff5b3a7d5b84bc65dddb92e",
        move : [1,2,3,4,5,6,7]
    }
   await moveHistoryModel.createMoveHistory(entity.match_id,entity.move);
   console.log("create");
   const result= await moveHistoryModel.getMoveHistoryByID(entity.match_id);
   console.log(result);
}
);



router.post("/chathistory",passport.authenticate("jwt", { session: false }),async (req, res, next) => {
    const entity=
    {
        match_id:"5ff5b3a7d5b84bc65dddb92e",
        chat : [{name:"khang", content:"hello"},{name:"minh", content:"hi"}]
    }
   await chatHistoryModel.createChatHistory(entity.match_id,entity.chat);
   console.log("create");
   const result= await chatHistoryModel.getChatHistoryByID(entity.match_id);
   console.log(result);
}
);
module.exports = router;