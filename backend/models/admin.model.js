import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: "https://i.pinimg.com/474x/0a/a8/58/0aa8581c2cb0aa948d63ce3ddad90c81.jpg"
  },
  managesAllBuildings: {
    type: Boolean,
    default: true
  }, // Admin manages all buildings
  notifications: [
    {
      message: String,
      seen: { type: Boolean, default: false },
      date: { type: Date, default: Date.now }
    }
  ],
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;