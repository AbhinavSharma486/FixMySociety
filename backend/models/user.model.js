import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

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
  profilePic: {
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
    type: String,
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

// Pre-save hook to hash the password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcryptjs.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);

export default User;