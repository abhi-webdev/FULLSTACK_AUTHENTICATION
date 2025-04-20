import cookieParser from "cookie-parser"
import connectDB from "./db/db.js"
import cors from "cors"
import express from "express"
import dotenv from "dotenv"
import { router } from "./routes/auth.route.js"
import { userRouter } from "./routes/user.routes.js"


dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000
// DB connection
connectDB()


// const allowedOrigin = ["https://authentication-frontend-2ygj.onrender.com"]

app.use(express.json())
app.use(express.urlencoded({extended: true}))

// app.use(cors({origin: allowedOrigin, credentials: true}))
const allowedOrigins = ["https://authentication-frontend-2ygj.onrender.com"]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true
}))

app.use(cookieParser())




app.get("/", (req, res) => {
    res.send("hello")
})
app.use("/api/auth/", router )
app.use("/api/user/", userRouter )






app.listen(PORT, () => {
    console.log(`Server is listing on port: ${PORT}`);
    
})
