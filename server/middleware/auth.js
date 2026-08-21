import jwt from "jsonwebtoken"



const authMiddleware = async (req,res,next) => {
    const {token} = req.headers;
    if (!token) {
        return res.json({success:false,message:"Not authorized Login Again !"})
    }
    try {
        const token_Decode  = jwt.verify(token,process.env.JWT_SECRET);
        req.body = req.body || {};
        req.body.userId = token_Decode.id;
     
        next();
    } catch (error) {
        console.log("Auth Middleware Error:", error.message);
        res.json({success:false,message:"Invalid or expired token. Please login again."});
    }
}

export default authMiddleware;


