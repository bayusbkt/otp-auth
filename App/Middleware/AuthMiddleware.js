import jwt from "jsonwebtoken";
import User from "../Models/User.js";

const jwtSecret = process.env.JWT_SECRET;

export const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, jwtSecret);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role == "Admin") {
    next();
  } else {
    return res.status(401).json({ message: "Access Denied" });
  }
};

export const verifiedUserOnly = async(req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized, please login",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        status: false,
        message: "Email not verified. Please verify your email to access this resource.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
}
