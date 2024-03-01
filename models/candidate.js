const mongoose = require('mongoose');
//const bcrypt = require('bcrypt');

// Define the person schema

const candidateSchema = new mongoose.Schema({
    name:{
        type:String,
        require: true
    },
    party:{
        type:String,
        require:true
    },
    age:{
        type:Number,
        require:true
    },

    votes:[
        {
            user:{
                type: mongoose.Schema.ObjectId,
                ref:'User',
                require:true
            },
            votedAt:{
                type:Date,
                default: Date.now()
            }
        }
    ],
    voteCount:{
        type:Number,
        default:0
    }
    
    
    
});

// Create user Model

const Candidate = mongoose.model('Candidate', candidateSchema);
module.exports = Candidate;
