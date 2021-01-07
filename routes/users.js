const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("../services/passport");
const { OAuth2Client } = require("google-auth-library");
const fetch = require("node-fetch");

const userModel = require("../model/user/user.model");
const verifyService = require("../model/verify/verify.model");

/* GET users listing. */
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    //const result = await userModel.load(req.params.id);
    res.send(result);
  }
);
router.post("/signin",passport.authenticate("local", { session: false }),
  async (req, res, next) => {
    const user = req.user;
    if (user.message === "false") {
      res.status(401).json({ message: "username or password invalid" });
    } else {
      const sign = { username: user.username, id: user.id };
      const token = jwt.sign(sign, process.env.JWT_SECRET);
      // console.log("token controller:" + token);
      res.json({ message: "200OK", token: token, user: user });
    }
  }
);

router.post("/signin/google", async (req, res, next) => {
    const idToken = req.body.token;
    const {OAuth2Client} = require('google-auth-library');
    const client = new OAuth2Client('718820147204-d08vqnq79hnapbjv3099umi363a7bf5k.apps.googleusercontent.com');
    async function verify() {
      const ticket = await client.verifyIdToken({
          idToken: idToken,
          audience: '718820147204-d08vqnq79hnapbjv3099umi363a7bf5k.apps.googleusercontent.com',  // Specify the CLIENT_ID of the app that accesses the backend
          // Or, if multiple clients access the backend:
          //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
      });
      const payload = ticket.getPayload();
      const userid = payload['sub'];
        // console.log(payload);

    if (payload === null) {      
       res.status(401).json({ message: "google auth fall" });
    } else{
        let user = await userModel.getUserByUsername(userid);  
        if(!user)
        {
            // console.log("new");
            const newUser = await userModel.createUser(
            payload["sub"],
            "",
            payload["family_name"]+" "+payload["given_name"],
            "",
            payload["email"]
          );
         user = await userModel.getUserByUsername(userid);  
        } 
        const sign = { username: user.username,password: user.password };
        const token = jwt.sign(sign, process.env.JWT_SECRET);
        // console.log("token controller:" + token);
        res.json({ message: "200OK", token: token, user: user });}
    }

     
    
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
  
  verify().catch(console.error);
});


const verifyFB=async(accessToken,userID,res)=>
{
  let data='';
  const linkUrl=`https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;
      const a = await fetch(linkUrl, {
        method: "GET",
    
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((result) => {
          data=result;
          //return result;
       
        })
        .catch((err) => {
          
          console.log("error aa");
        });
        
          const userid = data.id;
          if (data === '') {      
            res.status(401).json({ message: "facebook auth fall" });
         } else{
             let user = await userModel.getUserByUsername(userid);  
             if(!user)
             {
                //  console.log("new");
                 const newUser = await userModel.createUser(
                 data.id,
                 "",
                  data.name,
                 "",
                 data.email
               );
              user = await userModel.getUserByUsername(userid);  
             } 
             const sign = { username: user.username,password: user.password };
             const token = jwt.sign(sign, process.env.JWT_SECRET);
            //  console.log("token controller:" + token);
             res.json({ message: "200OK", token: token, user: user });}   
      
}

router.post("/signin/facebook",async (req, res, next) => {
      const accessToken = req.body.accessToken;
      const userID= req.body.userID
      const result = verifyFB(accessToken,userID,res);
      
      
    }
  );

router.post("/signup", async (req, res, next) => {
  const entity = req.body;
  // console.log(entity);

  try {
    const user = await userModel.getUserByUsername(req.body.username);
    if (user) {
      res.status(401).json({ message: "user_exists" });
    } else {
      verifyService.sendemailverify(req, res, next);
      // const newUser = await userModel.createUser(
      //   req.body.username,
      //   req.body.password,
      //   req.body.name,
      //   req.body.phone,
      //   req.body.email
      // );
      res.json({ message: "Check your email" });
    }
  } catch (error) {
    res.status(401).json({ message: "errors", error: error });
  }
});



module.exports = router;
