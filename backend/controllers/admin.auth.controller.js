import bcryptjs from "bcryptjs";
import Admin from "../models/admin.model.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

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

    generateTokenAndSetCookie(res, admin._id);

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