const express = require('express');
const router = express.Router();

const User = require('../models/candidate');
const{jwtAuthMiddleware , generateToken} = require('../jwt');
const Candidate = require('../models/candidate');



const checkAdminRole =async (userID)=>{
  try{
      const user = await User.findById(userID);
      if(user.role === 'admin'){      
        return true;
      }
  }catch(err){
    return false;
  }
} 

// Post route to add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
      if(!( checkAdminRole(req.user.id)))
          return res.status(403).json({message:'UUser does not have admin role'});
    
    const data = req.body  // assuming the request body contains the candidate data

    //create the new user document using the mongoes Model
    const newCandidate = new Candidate(data);

    // save the new user to the  database
    const response = await newCandidate.save();
    console.log("Save the Data");
    res.status(200).json({response: response});
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server Error" });

  }
})


router.put('/candidateID',jwtAuthMiddleware, async (req, res) => {
  try {

    if(!checkAdminRole(req.user.id))
        return res.status(403).json({message:'User does not have admin role'});
    
    const candidateID = req.params.id;    //Extract the id from the URL parameter
    const updateCandidateData = req.body;  // Update data from the person

    const response = await Person.findByIdAndUpdate(candidateID, updateCandidateData, {
      new: true,
      runValidators: true,
    })

    if (!response) {
      return res.status(403).json({ error: 'Candidate not found' })
    }
    console.log('Candidate data Updated');
    res.status(200).json(response);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server data' });
  }
})

router.delete('/candidateID',jwtAuthMiddleware, async (req, res) => {
  try {

    if(!checkAdminRole(req.user.id)){
       return res.status(403).json({message:'User does not have admin role'});
    }
    const candidateId = req.params.id;    //Extract the id from the URL parameter
    const response = await Person.findByIdAndDelete(candidateId);

    if (!response) {
      return res.status(403).json({ error:'Candidate not found' })
    }
    console.log('Candidate data Deleted');
    res.status(200).json(response);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server data' });
  }
})

// lets start Voting
router.post('/vote/:candidateID', jwtAuthMiddleware,async(req,res)=>{
  // no admin can vote
  // only vote for user

  candidateID = req.params.candidateID;
  userId = req.user.id;
  try{

    //Find the candidate document with the specific candidate
    const candidate = await Candidate.findById(candidateID);
    if(!candidate){
      return res.status(404).json({message: 'Candidate not found'})
    }

    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({message: 'user not found'})
    }

    if(user.isVoted){
            return res.status(400).json({message: 'You have already voted'})
    }

    if(user.role =='admin'){
      return res.status(403).json({message: 'admin is not allowed'})
    }

    // Update the Candidate the record the  vote
    candidate.votes.push({user: userId});
    candidate.voteCount++;
    await candidate.save();

    // update user document
    user.isVoted = true;
      await user.save();
      res.status(200).json({message: 'Vote record successfully'})


  }catch(err){
    console.log(err);
    res.status(500).json({ error: 'Internal Server data' });
  }
});

//vote count

router.get('/vote/count', async(req,res)=>{
  try{
    //Find the all candidate and sort them voteCount descending order
    const candidate = await Candidate.find().sort({votesCount:'desc'});

    // Map the candidate to only return their name and VoteCount
    const voteRecord = candidate.map((data)=>{
      return {
        party: data.party,
        count: data.voteCount
      }

    });
    return  res.status(200).json(voteRecord);

  }catch(err){
    console.log(err);
    res.status(500).json({ error: 'Internal Server data' });
  }
})

  module.exports = router;
