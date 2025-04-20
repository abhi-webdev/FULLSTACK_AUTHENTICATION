import jwt from "jsonwebtoken"
import dotenv from "dotenv";

dotenv.config()

const userAuth = async(req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.json({
            success: false,
            message: "Not Authorized login again"
        })
    }
    try {
        
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
        
        if (decodedToken.id) {
            req.userId = decodedToken.id
        } else {
            return res.json({
                success: false,
                message: "Not Authorized login again "
            })
        }

        
        next()
        
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Error found in auth middleware", 
        })
    }
}


export default userAuth