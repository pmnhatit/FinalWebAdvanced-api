const mongoose = require('mongoose');
var db = mongoose.connection;

//create schame
var moveHistoryschema = new mongoose.Schema({
    match_id:String,
    move:[],
},
    {
        collection: 'movehistory'
    });

const moveHistory = db.useDb("final-web-advanced").model("movehistory", moveHistoryschema);

module.exports = moveHistory;