import jwt from "jsonwebtoken";

import Admin from "../models/admin.model.js";

export const protectAdminRoute = async (req, res, next) => {
  try {
    const adminToken = req.cookies.admin_token;

    if (!adminToken) {
      return res.status(401).json({ message: "Unauthorized - No Admin Token Provided" });
    }

    const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Admin Token" });
    }

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    req.admin = admin;

    next();

  } catch (error) {
    console.log("Error in protectAdminRoute middleware", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};