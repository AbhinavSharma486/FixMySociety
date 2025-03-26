import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png",
  },
  buildingName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Building",
    required: true,
  },
  flatNumber: {
    type: String,
    required: true,
  },
  complaints: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Complaint",
  }],
  externalAccounts: [
    {
      provider: { type: String, enum: ["google", "facebook", "twitter"], required: true }, // Social login provider
      externalId: { type: String, required: true } // External ID from provider
    }
  ]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;