import express from "express"
import { userAuth } from "../middleware/userAuth.js";
import { createRoom,  deleteroom,  joinRoom } from "../controllers/roomController.js";

const router = express.Router();

router.post("/create-room", userAuth, createRoom);
router.post("/join-room", userAuth, joinRoom);
router.delete("/delete-room" , userAuth , deleteroom);
export default router;
