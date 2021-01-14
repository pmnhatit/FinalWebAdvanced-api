const mongoose = require('mongoose');
const { default: timestamp } = require('time-stamp');
var db = mongoose.connection;

//create schame
var historychema = new mongoose.Schema({
    // id: String,
    player1: String,
    player2: String, 
    date: String,
    order: Number,
    draw:Boolean,
},
    {
        collection: 'history'
    });

const history = db.useDb("final-web-advanced").model("history", historychema);

module.exports = history;