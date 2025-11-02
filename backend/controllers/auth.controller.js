import bcryptjs from "bcryptjs";

import User from "../models/user.model.js";
import { generateUserTokenAndSetCookie } from "../utils/generateUserTokenAndSetCookie.js";
import cloudinary from "../lib/cloudinary.js";

const FRONTEND_URL = process.env.FRONTEND_URL;

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

    // Ensure the user is associated with a building (i.e., is a resident) if their role is 'user'
    if (user.role === "user" && !user.buildingId) {
      return res.status(403).json({ success: false, message: "Access denied. User not associated with a building." });
    }

    const token = generateUserTokenAndSetCookie(res, user._id);

    res.status(200).json({
      success: true,
      message: "User Logged in successfully",
      user: {
        ...user._doc,
        password: undefined
      },
      token: token // Include the token in the response body
    });
  } catch (error) {
    console.log("Error in Login controller", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("user_token", "", { maxAge: 0 });

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

export const updateProfile = async (req, res) => {

  try {
    const { profilePic, newPassword } = req.body;
    const userId = req.user.id;

    if (!profilePic && !newPassword) {
      return res.status(400).json({ message: "At least one field is required to update" });
    }

    let updateData = {};

    if (profilePic) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        updateData.profilePic = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(400).json({ success: false, message: "Failed to upload profile picture. Please try again." });
      }
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
      }

      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(newPassword, salt);

      updateData.password = hashedPassword;
    }

    const updateUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");;

    res.status(200).json({ success: true, message: "Profile updated successfully", user: updateUser });
  } catch (error) {
    console.error("Error in updateProfile controller:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error during profile update." });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);

    res.status(200).json({ message: "User deleted successfully" });

  } catch (error) {
    console.log("Error in delete user controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};