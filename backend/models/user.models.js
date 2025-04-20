// import { verify } from "jsonwebtoken";
import mongoose  from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim : true,
    },
    
    email: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    verifyOTP: {
        type: String,
        default: ""
    },
    verifyOTPexpiryAt: {
        type: Number,
        default: 0,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    resetOTP:{
        type: String,
        default: ""
    },
    resetOTPExpireAt: {
        type: Number,
        default: 0
    }
})


const User = new mongoose.model("User", userSchema)

export default User