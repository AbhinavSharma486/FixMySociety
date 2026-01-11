import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path";


import adminAuthRoutes from "./routes/admin.auth.route.js";
import adminRoutes from './routes/admin.route.js';
import authRoutes from "./routes/auth.route.js";
import buildingRoutes from './routes/building.route.js';
import complaintRoutes from "./routes/complaint.route.js";
import notificationRoutes from "./routes/notification.route.js";
import searchRoutes from "./routes/search.route.js";
import connectDB from "./lib/db.js";
import { app, server, io } from "./sockets/socket.js";

const __dirname = path.resolve();
const PORT = process.env.PORT;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Middleware for express
app.use(express.json({ limit: "50mb" })); // to parse JSON from req.body
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // restored
app.use(cookieParser()); // to parse cookies from erq.headers
app.use(cors({
  origin: [process.env.FRONTEND_URL],
  credentials: true,
}));

// Configure multer for memory storage (serverless compatible)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 10 // Maximum 10 files per request
  },
  fileFilter: (req, file, cb) => {
    // Allow only images and videos
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/svg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/avif',
      'image/heic',
      'image/heif',
      'video/mp4',
      'video/mkv',
      'video/avi',
      'video/mov',
      'video/webm',
      'video/quicktime'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only images and videos are allowed.`), false);
    }
  }
});

// Make multer available as middleware
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// Connect to Database
connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/buildings", buildingRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}


// Make `io` accessible to your controllers
app.set("socketio", io);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});