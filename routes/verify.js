const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("../services/passport");
const verifyService = require("../model/verify/verify.model");


router.post("/verify-account",
  async(req, res, next) =>{
    try {
      console.log("code: ",req.body.code);
      console.log("username: ",req.body.username);
      await verifyService.checkVerifyAccount(req.body.code, req.body.username);
    } catch (error) {
      res.status(400).json({message:"error"});
    }
    
  }
)

module.exports = router;