import express from "express"
import { getUserData } from "../controllers/user.controller.js"
import userAuth from "../middlewares/auth.middleware.js"

const userRouter = express.Router()

userRouter.get("/get-user-data",userAuth, getUserData)

export { userRouter}

