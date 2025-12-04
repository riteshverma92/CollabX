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





//


export const getallrooms = async (req, res) => {
  const { userID } = req.body;

  // Validate userID
  if (!userID) {
    return res
      .status(400)
      .json({ success: false, message: "User is Logged Out" });
  }

  try {
    // Fetch user and populate room details
    const userfromdatabase = await User.findById(userID)
      .populate("ownrooms")        // 🔥 Fetch full room documents
      .populate("joinedrooms");    // 🔥 Fetch full room documents

    if (!userfromdatabase) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }

    return res.status(200).json({
      success: true,
      message: "Detail Fetch Successfully",
      ownrooms: userfromdatabase.ownrooms,        // Full room objects
      joinedrooms: userfromdatabase.joinedrooms,  // Full room objects
    });

  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
