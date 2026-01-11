import bcryptjs from "bcryptjs";

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

    const token = generateAdminTokenAndSetCookie(res, admin._id);

    res.status(200).json({
      success: true,
      message: "Admin Logged in successfully",
      admin: {
        ...admin._doc,
        password: undefined
      },
      token: token
    });
  } catch (error) {
    console.error("Error in Admin Login controller", error.stack || error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("admin_token", "", { maxAge: 0 });

    res.status(200).json({ message: "Admin Logged out successfully" });

  } catch (error) {
    console.error("Error in Admin Logout controller", error.stack || error);
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
    console.error("Error in Admin check auth controller", error.stack || error);
    res.status(500).json({ message: "Internal server error" });
  }
};
