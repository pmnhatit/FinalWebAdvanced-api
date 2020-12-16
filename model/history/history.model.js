const historyModel = require('./history');

module.exports.getHistoryByID = async (player_id)=>{
    const result = await historyModel.find({ $or: [ { player1: player_id }, { player2: player_id} ] });
    return result;
}

module.exports.createHistory = async (player1, player2,date,order) =>{
 
    const newHistory = new historyModel({ player1, player2, date, order});
    return newHistory.save();
}