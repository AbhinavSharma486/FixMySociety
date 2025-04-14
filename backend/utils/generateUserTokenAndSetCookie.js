import jwt from "jsonwebtoken";

// Function to generate and set user token cookie
export const generateUserTokenAndSetCookie = (res, userId) => {
  const userToken = jwt.sign(
    { id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" }
  );

  res.cookie("user_token", userToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return userToken;
};