const mongoose = require('mongoose');
var db = mongoose.connection;

//create schame
var verifychema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    phone: String,
    email: String,
    verifycode: String
},
    {
        collection: 'verify'
    });

const verify = db.useDb("final-web-advanced").model("verify", verifychema);

module.exports = verify;