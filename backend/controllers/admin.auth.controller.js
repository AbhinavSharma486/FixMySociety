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