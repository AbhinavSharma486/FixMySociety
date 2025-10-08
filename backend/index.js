import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import fileUpload from "express-fileupload";
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
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// Add express-fileupload middleware
app.use(fileUpload({ useTempFiles: true }));

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

// Debugging: Log all registered routes
app._router.stack.forEach(function (middleware) {
  if (middleware.route) { // routes registered directly on the app
    console.log(middleware.route);
  } else if (middleware.name === 'router') { // router middleware
    middleware.handle.stack.forEach(function (handler) {
      let route = handler.route;
      route && console.log(route);
    });
  }
});

// Make `io` accessible to your controllers
app.set("socketio", io);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});