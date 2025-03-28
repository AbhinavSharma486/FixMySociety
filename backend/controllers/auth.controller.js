import bcryptjs from "bcryptjs";
import crypto from "crypto";

import User from "../models/user.model.js";
import Building from "../models/building.model.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

export const signup = async (req, res) => {

  const { fullName, email, password, buildingName, flatNumber } = req.body;

  try {
    if (!fullName || !email || !password || !buildingName || !flatNumber) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    // Validate if the building exists
    const building = await Building.findOne({ buildingName });
    if (!building) {
      return res.status(400).json({ success: false, message: "Invalid building name" });
    }

    // Validate if the flat number is within the valid range
    if (flatNumber < 1 || flatNumber > building.numberOfFlats) {
      return res.status(400).json({ success: false, message: "Flat number is out of range for this building" });
    }

    // Check if the flat number is already registered in the same building
    const flatAlreadyRegistered = await User.findOne({ buildingName, flatNumber });
    if (flatAlreadyRegistered) {
      return res.status(400).json({ success: false, message: "This flat number is already registered to another user" });
    }

    const userAlreadyExists = await User.findOne({ email });

    if (userAlreadyExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      buildingName,
      flatNumber,
    });

    await user.save();

    // TODO : here write email sending logic

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined,
      }
    });
  } catch (error) {
    console.log("Error in Signup controller", error);
    res.status(400).json({ success: false, message: "Internal Server Error" });
  }
};

export const verifyEmail = async (req, res) => {
  // 1 2 3 4 5 6
  const { code } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    // update the building databse details
    if (user.buildingName) {
      const building = await Building.findOne({ buildingName: user.buildingName });

      if (building) {
        building.filledFlats += 1;
        building.emptyFlats = Math.max(0, building.numberOfFlats - building.filledFlats);
        await building.save();
      }
    }

    // generate JWT token and set cookie
    generateTokenAndSetCookie(res, user._id);

    await user.save();

    // TODO : here write email sending logic

    res.status(200).json({
      success: true,
      message: "Email Verified Successfully",
      user: {
        ...user._doc,
        password: undefined
      }
    });
  } catch (error) {
    console.log("Error in VerifyEmail controller : ", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      success: true,
      message: "User Logged in successfully",
      user: {
        ...user._doc,
        password: undefined
      }
    });
  } catch (error) {
    console.log("Error in Login controller", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 0 });

    res.status(200).json({ message: "User Logged out successfully" });
  } catch (error) {
    console.log("Error in Logout controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = async (req, res) => {

  try {
    const user = await User.findById(req.user).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });

  } catch (error) {
    console.log("Error in check auth controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Generate reset token here
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiresAt = resetTokenExpiresAt;

    await user.save();

    // TODO : Send email with reset token 

    res.status(200).json({ success: true, message: "Password reset email sent to your email" });

  } catch (error) {
    console.log("Error in forgetPassword controller", error);
    res.status(400).json({ success: false, message: error.messagae });
  }
};

export const resetPassword = async (req, res) => {

  try {
    const token = req.params.token || req.body.token || req.query.token;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiresAt: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    // update password 
    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiresAt = undefined;

    await user.save();

    // TODO : Send password reset success email

    res.status(200).json({ success: true, message: "Password reset successfully" });

  } catch (error) {
    console.log("Error in resetPassword controller", error);
    res.status(400).json({ success: false, message: error.message });
  }
};