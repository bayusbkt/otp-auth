import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import randomstring from "randomstring";
import User from "../Models/User.js";
import validateEmail from "../Utils/EmailValidator.js";
import sendEmail from "../Utils/SendEmail.js";
import OtpCode from "../Models/OtpCode.js";

const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

const generateOtp = () => {
  return randomstring.generate({
    length: 6,
    charset: "numeric",
  });
};

const createOtpCode = async (userId) => {
  const otp = generateOtp();
  const validUntil = new Date(Date.now() + 5 * 60 * 1000);
  await OtpCode.create({ user: userId, otp, validUntil });
  return otp;
};

const sendVerificationEmail = async (user, otp) => {
  const emailContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 5px;">
      <h1 style="color: #333;">Email Verification</h1>
      <p style="color: #555;">Dear ${user.username},</p>
      <p style="color: #555;">Thank you for registering with us! Please verify your email address to complete your registration.</p>
      <h2 style="color: #333;">Your Verification Code:</h2>
      <div style="background-color: #e7f3fe; border-left: 6px solid #2196F3; padding: 10px; margin: 20px 0;">
        <strong style="font-size: 24px; color: #2196F3;">${otp}</strong>
      </div>
      <p style="color: #555;">This code is valid for <strong>5 minutes</strong>. If you did not create an account, please ignore this email.</p>
      <p style="color: #555;">Best regards,<br>Testing</p>
      <footer style="margin-top: 20px; font-size: 12px; color: #aaa;">
        <p>&copy; ${new Date().getFullYear()} Testing. All rights reserved.</p>
      </footer>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: "Verify Your Email",
    html: emailContent,
  });
};

export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      throw new Error("Username, email, and password are required");
    }

    if (!validateEmail(email)) {
      throw new Error("Email is not valid");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email is already in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashPassword,
      role,
    });

    const otp = await createOtpCode(newUser._id);
    await sendVerificationEmail(newUser, otp);

    return res.status(201).json({
      status: true,
      message: "Register Successful, Please Verify Your Email",
      data: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(422).json({
      status: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid email or password");
    }

    const userInfo = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(userInfo, jwtSecret, { expiresIn: "1h" });
    const refreshToken = jwt.sign(userInfo, jwtRefreshSecret, {
      expiresIn: "2h",
    });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 3600000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7200000,
    });

    return res.status(200).json({
      status: true,
      message: "Login Successful",
      accessToken: token,
    });
  } catch (error) {
    res.status(422).json({
      status: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("accessToken", { httpOnly: true, sameSite: "strict" });
    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict" });
    return res.status(200).json({
      status: true,
      message: "Logout Successful",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      throw new Error("User not found");
    }

    return res.status(200).json({
      status: true,
      message: "Success Get Current User",
      data: user,
    });
  } catch (error) {
    res.status(422).json({
      status: false,
      message: error.message,
    });
  }
};

export const regenerateOtpCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new Error("Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    if (user.isVerified) {
      throw new Error("User is already verified");
    }

    const otp = await createOtpCode(user._id);
    await sendVerificationEmail(user, otp);

    return res.status(200).json({
      status: true,
      message: "New OTP code generated and sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to regenerate OTP code: " + error.message,
    });
  }
};

export const verifyOtpCode = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      throw new Error("OTP is required");
    }

    const otpCode = await OtpCode.findOne({ otp }).populate("user");
    if (!otpCode) {
      throw new Error("OTP Code not found or invalid");
    }

    if (otpCode.validUntil < Date.now()) {
      throw new Error("OTP Code has expired");
    }

    const user = await User.findById(otpCode.user._id);
    if (!user) {
      throw new Error("User not found");
    }

    user.isVerified = true;
    user.EmailVerifiedAt = new Date();
    await user.save();

    await OtpCode.deleteOne({ _id: otpCode._id });

    return res.status(200).json({
      status: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    res.status(422).json({
      status: false,
      message: error.message,
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    const userData = jwt.verify(refreshToken, jwtRefreshSecret);
    const user = await User.findById(userData.id);

    if (!user || user.refreshToken !== refreshToken) {
      throw new Error("Invalid refresh token");
    }

    const newAccessToken = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      status: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(422).json({
      status: false,
      message: error.message,
    });
  }
};
