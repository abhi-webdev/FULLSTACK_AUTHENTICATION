import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}\auth Db connect`)
        console.log("Connected to Mongo DB");
        
    } catch (error) {
        console.log("Error Connection to DB");
        
    }
    

}

export default connectDB