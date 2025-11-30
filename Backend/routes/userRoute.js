import { showUserProfile } from "../controllers/userProfile.js";
import { userAuth } from "../middleware/userAuth.js";
import express from "express"


const userRouter = express.Router();
userRouter.get('/profile', userAuth, showUserProfile); 


export default userRouter;