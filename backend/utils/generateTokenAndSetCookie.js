import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {

  const token = jwt.sign(
    { id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000
  });

  return token;
};