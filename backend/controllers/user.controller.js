import User from "../models/user.models.js";

export const getUserData = async(req, res) => {
    try {
        
        const userId = req.userId
        const user = await User.findById(userId)

        
        if (!user) {
            return res.json({
                success: false,
                message : "User not found"
              })
        }

        return res.json({
            success: true,
            userData: {
                name: user.name,
                isVerified: user.isVerified,
                profilePic: user.profilePic || "",
            }
        })

    } catch (error) {
        console.log(error);
        
        return res.json({
            success: false,
            message : "get user data failed"
          })
    }
}