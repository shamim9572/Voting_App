const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) =>{

    //First check request herders has authorized or not
    const authorization = req.headers.authorization;
    if(!authorization) return res.status(401).json({error:'token not found'});

    // Extract the jwt token from the request header
    const token = req.headers.authorization.split(' ')[1];

    if(!token) return res.status(401).json({error: 'unauthorized'});
    try{
        // verify the jwt token
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user information to the request object
        req.user = decode
        next();
        
    }catch(err){
        console.error(err);
        res.status(401).json({error: 'Invalid Token'});

    }
}
//Function to Generate JWT Token
const generateToken = (userData) =>{

    //Generate new JWT Token using user data
    return jwt.sign(userData, process.env.JWT_SECRET,{expiresIn:30000});

}

module.exports = {jwtAuthMiddleware , generateToken};
