import jwt from "jsonwebtoken";
import cookie from "cookie";
import "dotenv/config";

export function authenticate(req) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token;
  if (!token) return false;

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}
