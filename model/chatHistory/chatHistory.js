const mongoose = require('mongoose');
var db = mongoose.connection;

//create schame
var chatHistoryschema = new mongoose.Schema({
    match_id:String,
    chat:[{user:String,text:String}],
},
    {
        collection: 'chathistory'
    });

const chatHistory = db.useDb("final-web-advanced").model("chathistory", chatHistoryschema);

module.exports = chatHistory;