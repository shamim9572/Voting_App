const express = require('express');
const router = express.Router();

const User = require('./../models/user');
const{jwtAuthMiddleware , generateToken} = require('./../jwt');

// Post route to add Person
router.post('/signup', async (req, res) => {
  try {
    const data = req.body  // assuming the request body contains the person data

    //create the new user document using the mongoes Model
    const newUser = new User(data);

    // save the new user to the  database
    const response = await newUser.save();
    console.log("Save the Data");

    const payload = {
      id:response.id,
    }

    console.log(JSON.stringify(payload));
    const token = generateToken(payload);
    console.log("Token is :", token);

    res.status(200).json({response: response, token:token});
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server Error" });

  }
})

// Login Route
router.post('./login',async(req, res) =>{
  try{
    //Extract username and Password from request body
    const{aadharCardNumber, password} = req.body;

    //find the user by username
    const user = await Person.findOne({aadharCardNumber: aadharCardNumber});

    // if password does not exits or password does not match then return Error
    if(!user|| !(await user.comparePassword(password))){
      return res.status(401).json({error:'Invalid username and Password'});
    }

    // generate Token
    const payload = {
      id : user.id,
      
    }
    const token = generateToken(payload);

    //return token as response
    res.json({token});
  }catch(err){
    console.log(err);
    res.status(500).json({ error: "internal server Error" });
  }
})
// profile route
router.get('/profile',jwtAuthMiddleware, async(req,res)=>{
  try{
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);

    res.status(200).json({user});
  }catch(err){
    console.log(err);
    res.status(500).json({ error: "internal server Error" });
  }

})

router.put('/profile/password',jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user;    //Extract the id from the token
    const {currentPassword, newPassword} = req.body
    //find the user by userId
    const user = await User.findById({userId});

    // if password does not Match return Error
    if(!(await user.comparePassword(currentPassword))){
      return res.status(401).json({error:'Invalid username and Password'});
    }

    // Update the user Password
    user.password = newPassword;
    await user.save();
    console.log('Password update');
    res.status(200).json({message:'Password Updated'});

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server data' });
  }
})

  module.exports = router;
