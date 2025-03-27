import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import Building from "../models/building.model.js";

export const signup = async (req, res) => {

  const { fullName, email, password, buildingName, flatNumber } = req.body;

  try {
    if (!fullName || !email || !password || !buildingName || !flatNumber) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    // Validate if the building exists
    const building = await Building.findOne({ buildingName });
    if (!building) {
      return res.status(400).json({ success: false, message: "Invalid building name" });
    }

    // Validate if the flat number is within the valid range
    if (flatNumber < 1 || flatNumber > building.numberOfFlats) {
      return res.status(400).json({ success: false, message: "Flat number is out of range for this building" });
    }

    const userAlreadyExists = await User.findOne({ email });

    if (userAlreadyExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      buildingName,
      flatNumber,
    });

    await user.save();

    // TODO : here write email sending logic

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined,
      }
    });
  } catch (error) {
    console.log("Error in Signup controller", error);
    res.status(400).json({ success: false, message: "Internal Server Error" });
  }
};

export const login = async (req, res) => { };

export const logout = async (req, res) => { };