import bcrypt from "bcrypt";
import transporter from "../config/nodemailer.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const tempUser = new Map();

export const register = async (req, res) => {
  const { userName, email, password } = req.body;

  if (!userName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // Check if already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "You are already registered. Please login.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store user temporarily (NOT in DB yet)
    tempUser.set(email, {
      userName,
      email,
      password: hashedPassword,
      otp,
      otpExpire: Date.now() + 5 * 60 * 1000, // 5 min
    });

    // Send OTP to email
    const mailOptions = {
      from: process.env.SMTP_USER, // Sender address
      to: email, // Receiver address
      subject: "Verification OIP",
      html: `<h1>Your OTP: <b>${otp}</b></h1>`, // HTML body (optional)
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const storedUser = tempUser.get(email);
    if (!storedUser) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or user not found",
      });
    }

    // match otp
    if (storedUser.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // check expiration
    if (storedUser.otpExpire < Date.now()) {
      tempUser.delete(email);
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please register again.",
      });
    }

    // save to database
    const newUser = await User.create({
      userName: storedUser.userName,
      email: storedUser.email,
      password: storedUser.password,
    });

    // delete from temp storage
    tempUser.delete(email);

    return res.status(200).json({
      success: true,
      message: "User registered successfully!",
      user: newUser,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// login User

export const login = async (req, res) => {


  const { email, password } = req.body;

  // Validate request
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // Check if user exists
    const userfromdatabase = await User.findOne({ email });

    if (!userfromdatabase) {
      return res.status(400).json({
        success: false,
        message: "You are not registered. Please register first.",
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(
      password,
      userfromdatabase.password
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password. Please try again.",
      });
    }

    // Create JWT
    const token = jwt.sign(
      { id: userfromdatabase._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Set cookie (SaaS recommended settings)
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,        // true in production (https)
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Response


    return res.status(200).json({
      success: true,
      message: "Login successful",
      userData: {
        email: userfromdatabase.email,
        userName: userfromdatabase.userName,
      },
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// reset password Otp

export const forgetpasswordotp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Enter Your Email" });
  }

  try {
    const userfromdatabase = await User.findOne({ email });
    if (!userfromdatabase) {
      return res
        .status(400)
        .json({ success: false, message: "You are not Register" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    tempUser.set(email, {
      email: email,
      otp: otp,
      otpExpire: Date.now() + 5 * 60 * 1000
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Reset Password OTP",
      html: `<h1>Your OTP: <b>${otp}</b></h1>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Otp Send On Email for Password Reset",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// verify reset password otp

export const verify_otp_for_resetpassword = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email & OTP required",
    });
  }

  const userData = tempUser.get(email);

  if (!userData) {
    return res.status(400).json({
      success: false,
      message: "OTP expired or request not found",
    });
  }

  // check otp expire
  if (Date.now() > userData.otpExpire) {
    tempUser.delete(email);
    return res.status(400).json({
      success: false,
      message: "OTP expired",
    });
  }

  // check otp match
  if (otp !== userData.otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  }

  // hash password
  const hashedPassword = await bcrypt.hash(userData.newPassword, 10);

  // update password in DB
  await User.updateOne({ email }, { password: hashedPassword });

  // remove from map
  tempUser.delete(email);

  return res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
};


// reset password

export const resetPassword = async (req, res) => {
  const { email, password, againpassword } = req.body;

  if (!email || !password || !againpassword) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (password !== againpassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not registered",
      });
    }

    // generate otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // store temporary data
    tempUser.set(email, {
      email,
      newPassword: password,
      otp,
      otpExpire: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    // send mail
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `<h1>Your OTP: <b>${otp}</b></h1>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    return res
      .status(200)
      .json({ success: true, message: "Logout Successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


// Check if user is logged in
export const isUserLoggedIn = async (req, res) => {
  try {
    return res
      .status(200)
      .json({ success: true, message: "User is logged in" }); // If user is logged in, return success message
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message }); // If an error occurs, return error message
  }
};