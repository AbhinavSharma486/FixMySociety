import jwt from "jsonwebtoken";

// Function to generate and set admin token cookie
export const generateAdminTokenAndSetCookie = (res, adminId) => {
  const adminToken = jwt.sign(
    { id: adminId }, process.env.JWT_SECRET, { expiresIn: "1d" }
  );

  res.cookie("admin_token", adminToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return adminToken;
};