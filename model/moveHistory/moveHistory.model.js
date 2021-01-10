const moveHistoryModel = require('./moveHistory');

module.exports.getMoveHistoryByID = async (match_id)=>{
    const result = await moveHistoryModel.findOne({ match_id});
    return result;
}

module.exports.createMoveHistory = async (match_id, move) =>{
 
    const newHistory = new moveHistoryModel({match_id, move});
    return newHistory.save();
}