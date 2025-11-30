import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
       user: process.env.SMTP_USER, // Your Gmail address
       pass: process.env.SMTP_PASS // App password 
   }
});

export default transporter;
