import User from "../models/User.js";

export const showUserProfile = async (req, res) => {
  const { userID } = req.body;

  try {
    const userfromdatabase = await User.findById(userID);

    if (!userfromdatabase) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    return res.status(200).json({
      success: true,
      userData: {
        userName: userfromdatabase.userName,
        email: userfromdatabase.email
      }
    });

  } catch (err) {
    console.error("Profile Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};
