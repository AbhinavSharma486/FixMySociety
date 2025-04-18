import bcryptjs from "bcryptjs";
import crypto from "crypto";

import Admin from "../models/admin.model.js";
import { generateAdminTokenAndSetCookie } from "../utils/generateAdminTokenAndSetCookie.js";


export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ success: false, message: "You are not an Admin" });
    }

    const isPasswordCorrect = await bcryptjs.compare(password, admin.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    generateAdminTokenAndSetCookie(res, admin._id);

    res.status(200).json({
      success: true,
      message: "Admin Logged in successfully",
      admin: {
        ...admin._doc,
        password: undefined
      }
    });
  } catch (error) {
    console.log("Error in Admin Login controller", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("admin_token", "", { maxAge: 0 });

    res.status(200).json({ message: "Admin Logged out successfully" });

  } catch (error) {
    console.log("Error in Admin Logout controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = async (req, res) => {

  try {
    const admin = await Admin.findById(req.admin).select("-password");

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.status(200).json({ success: true, admin });

  } catch (error) {
    console.log("Error in Admin check auth controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ success: false, message: "Admin not found" });
    }

    // Generate reset token here
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    admin.resetPasswordToken = resetToken;
    admin.resetPasswordTokenExpiresAt = resetTokenExpiresAt;

    await admin.save();

    // Send email with reset token

    res.status(200).json({ success: true, message: "Password reset email sent to your email" });
  } catch (error) {
    console.log("Error in forgetPassword controller", error);
    res.status(400).json({ success: false, message: error.messagae });
  }
};

export const resetPassword = async (req, res) => {

  try {
    const admin_token = req.params.admin_token || req.body.admin_token || req.query.admin_token;

    console.log(admin_token);

    const { password } = req.body;

    const admin = await Admin.findOne({
      resetPasswordToken: admin_token,
      resetPasswordTokenExpiresAt: { $gt: Date.now() }
    });

    console.log(admin);

    if (!admin) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    admin.password = hashedPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordTokenExpiresAt = undefined;

    await admin.save();

    // Send password reset success email

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.log("Error in resetPassword controller", error);
    res.status(400).json({ success: false, message: error.message });
  }
};