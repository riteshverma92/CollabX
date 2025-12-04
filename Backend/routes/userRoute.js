import { getallrooms, showUserProfile } from "../controllers/userProfile.js";
import { userAuth } from "../middleware/userAuth.js";
import express from "express"


const userRouter = express.Router();
userRouter.get('/profile', userAuth, showUserProfile); 
userRouter.get("/get-user-rooms" , userAuth , getallrooms);


export default userRouter;