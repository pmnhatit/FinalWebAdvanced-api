const historyModel = require('./history');
const moveHistoryModel = require("../moveHistory/moveHistory.model");
const chatHistoryModel=require("../chatHistory/chatHistory.model");
const { relativeTimeThreshold } = require('moment');

module.exports.getHistoryByID = async (player_id)=>{
    const result = await historyModel.find({ $or: [ { player1: player_id }, { player2: player_id} ] });
    return result;
}
// module.exports.getHistoryNew= async(player1,player2,date)=>
// {
//     const result = await historyModel.find({ $and: [ { player1: player1 }, { player2: player2},{date:date} ] });
// }
module.exports.createHistory = async (player1, player2,date,order,draw,move,chat) =>{
    console.log("create");
    const newHistory =await new historyModel({ player1, player2, date, order,draw});
    const history= await newHistory.save();
    console.log(history);
    await moveHistoryModel.createMoveHistory(history._id,move);
    await chatHistoryModel.createChatHistory(history._id,chat);
    console.log("save history success");
}