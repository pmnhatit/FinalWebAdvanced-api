const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('../services/passport');
const userModel= require ("../model/user/user.model");

/* GET users listing. */
router.get('/:id',passport.authenticate('jwt', { session: false }), async(req, res, next)=> {
  //const result = await userModel.load(req.params.id);
  res.send(result);
});
router.post('/signin', passport.authenticate('local', { session: false }),async (req, res,next) => {
    const user = req.user;
    if(user.message==="false"){
        res.status(401).json({message:"username or password invalid"});
    }else{
        const sign = {username: user.username, id: user.id}
        const token = jwt.sign(sign, process.env.JWT_SECRET);
        console.log("token controller:"+token);
        res.json({message: "200OK", token: token, user: user});
    }
  
 });
 router.post("/signup", async (req, res) => {
  const entity  = req.body;
  console.log(entity);

  try {
    const user = await userModel.getUserByUsername(req.body.username);
    if(user){
        res.status(401).json({message:"user_exists"});
    }else{
        const newUser = await userModel.createUser(req.body.username,req.body.password , req.body.name, req.body.phone, req.body.email);  
        res.json({message: "200OK"});
    }
    
} catch (error) {
    res.status(401).json({message:"errors",error:error});
}
 });
 router.post("/edit",passport.authenticate('jwt', { session: false }),async (req, res) => {
  const entity  = req.body;   
  console.log(entity);  
  //const result= await userModel.patch(entity);
 });
module.exports = router;
