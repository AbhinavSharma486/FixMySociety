import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";

export const userOrAdminProtect = async (req, res, next) => {
  try {
    const userToken = req.cookies?.user_token;

    const adminToken = req.cookies?.admin_token;

    if (!userToken && !adminToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No Token Provided"
      });
    }

    if (userToken) {
      const decoded = jwt.verify(userToken, process.env.JWT_SECRET);

      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - Invalid User Token"
        });
      }

      const user = await User.findById(decoded.id).select("-password");

      if (user) {
        req.user = user;
        return next();
      }
    }

    if (adminToken) {
      const decodedAdmin = jwt.verify(adminToken, process.env.JWT_SECRET);

      if (!decodedAdmin) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - Invalid Admin Token"
        });
      }

      const admin = await Admin.findById(decodedAdmin.id).select("-password");

      if (admin) {
        req.admin = admin;
        return next();
      }
    }

    return res.status(401).json({
      success: false,
      message: "Unauthorized - No valid user or admin found"
    });
  } catch (error) {
    console.error("Error in userOrAdminProtect middleware", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};