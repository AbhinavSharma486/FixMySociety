// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import Building from "../models/building.model.js";

// dotenv.config();

// const buildings = [
//   {
//     "buildingName": "Raheja Exotica",
//     "numberOfFlats": 50,
//     "filledFlats": 0,
//     "emptyFlats": 50,
//     "complaints": []
//   },
//   {
//     "buildingName": "Amrapali Sapphire",
//     "numberOfFlats": 50,
//     "filledFlats": 0,
//     "emptyFlats": 50,
//     "complaints": []
//   },
//   {
//     "buildingName": "Ashirwad",
//     "numberOfFlats": 50,
//     "filledFlats": 0,
//     "emptyFlats": 50,
//     "complaints": []
//   },
//   {
//     "buildingName": "Govind Dham",
//     "numberOfFlats": 50,
//     "filledFlats": 0,
//     "emptyFlats": 50,
//     "complaints": []
//   },
//   {
//     "buildingName": "Radha Nivas",
//     "numberOfFlats": 50,
//     "filledFlats": 0,
//     "emptyFlats": 50,
//     "complaints": []
//   },
//   {
//     "buildingName": "Swarn Bhavan",
//     "numberOfFlats": 50,
//     "filledFlats": 0,
//     "emptyFlats": 50,
//     "complaints": []
//   },
//   {
//     "buildingName": "Dwarka",
//     "numberOfFlats": 50,
//     "filledFlats": 0,
//     "emptyFlats": 50,
//     "complaints": []
//   }
// ];

// // Connect to MongoDB

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);

//     // Clear existing buildings before seeding (Optional)
//     await Building.deleteMany();

//     // Insert buildings
//     await Building.insertMany(buildings);

//     console.log("Building data seeded successfully!");
//     process.exit(); // Exit the script after insertion
//   } catch (error) {
//     console.error("Error seeding data:", error);
//     process.exit(1);
//   }
// };

// connectDB();