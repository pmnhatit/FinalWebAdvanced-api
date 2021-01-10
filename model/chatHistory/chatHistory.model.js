const chatHistoryModel = require('./chatHistory');


module.exports.getChatHistoryByID = async (match_id)=>{
    const result = await chatHistoryModel.findOne({match_id});
    return result;
}

module.exports.createChatHistory = async (match_id, chat) =>{
 
    const newHistory = new chatHistoryModel({match_id, chat});
    return newHistory.save();
}