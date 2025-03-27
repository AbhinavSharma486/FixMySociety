import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

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
    minlenth: 6
  },
  profilePicture: {
    type: String,
    default: "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png",
  },
  isVerified: {
    type: Boolean,
    default: false
  },

  resetPasswordToken: String,

  resetPasswordTokenExpiresAt: Date,

  verificationToken: String,

  verificationTokenExpiresAt: Date,

  buildingName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Building",
    required: true,
  },
  flatNumber: {
    type: String,
    required: true,
  },
  complaints: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
    }
  ]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;