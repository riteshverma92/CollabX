import express from "express"
import { userAuth } from "../middleware/userAuth.js";
import { createRoom,  deleteroom,  joinRoom, removeUser } from "../controllers/roomController.js";

const router = express.Router();

router.post("/create-room", userAuth, createRoom);
router.post("/join-room", userAuth, joinRoom);
router.delete("/delete-room" , userAuth , deleteroom);
router.delete("/remove-room", userAuth , removeUser);
export default router;
