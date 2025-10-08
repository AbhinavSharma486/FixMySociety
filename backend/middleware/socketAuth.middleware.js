import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";

const socketAuth = async (socket, next) => {

  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error : Token not provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return next(new Error("Authentication error: Invalid token"));
    }

    let userOrAdmin = null;

    // Try to find user
    userOrAdmin = await User.findById(decoded.id).select("-password");

    if (userOrAdmin) {
      socket.user = userOrAdmin;
    } else {
      // If not a user, try to find admin
      userOrAdmin = await Admin.findById(decoded.id).select("-password");

      if (userOrAdmin) {
        socket.admin = userOrAdmin;
      }
    }

    if (!userOrAdmin) {
      return next(new Error("Authentication error: User or Admin not found for provided token ID."));
    }

    next();

  } catch (error) {
    return next(new Error("Authentication error: Invalid or expired token."));
  }
};

export default socketAuth;