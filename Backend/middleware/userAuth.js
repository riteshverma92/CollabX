import jwt from "jsonwebtoken";

export  const userAuth = async(req, res, next) =>{

    const{token} = req.cookies;
    if(!token){
        return res
            .status(400)
            .json({success : false , message :"you are logout : unauthorized"});
    }

    try {

        const decodetoken = jwt.verify(token, process.env.JWT_SECRET);
        if(decodetoken.id){
            req.body = {...req.body};
            req.body.userID = decodetoken.id;
        }

        else{
            return res
                .status(401)
                .json({success: false, message :" Unotharized user"});
        }
        next();



        
    } catch (err) {

        return res
            .status(500)
            .json({success: false , message : err.message});
        
    }

} 