const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("../services/passport");
const userModel = require("../model/user/user.model");



router.get("/",passport.authenticate("jwt", { session: false }),async (req, res, next) => {
    //console.log("chart");
    let num=1;
    const result= await userModel.getUserForChart(5);
    
    for(let row of result)
    {   
        console.log("top");
        row.order=num;
        num=num+1;
        console.log(row);
    }
    console.log(result);
    res.send(result);
}
);
/* GET users listing. */

module.exports = router;