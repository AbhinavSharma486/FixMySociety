import Building from "../models/building.model.js";
import User from "../models/user.model.js";
import Complaint from "../models/complaint.model.js";
import { io } from "../sockets/socket.js";

// Create new Building
export const createBuilding = async (req, res) => {
  try {
    const { buildingName, numberOfFlats } = req.body;

    if (!buildingName || !numberOfFlats) {
      return res.status(400).json({
        success: false,
        message: "Building name and number of flats are required"
      });
    }

    // Check if building already exists
    const existingBuilding = await Building.findOne({ buildingName });

    if (existingBuilding) {
      return res.status(400).json({
        success: false,
        message: "Building with this name already exists"
      });
    }

    if (numberOfFlats <= 0) {
      return res.status(400).json({
        success: false.valueOf,
        message: "Number of flats must be greated than 0"
      });
    }

    const building = new Building({
      buildingName,
      numberOfFlats,
      filledFlats: 0,
      emptyFlats: numberOfFlats
    });

    await building.save();

    // Emit the full building object for easier client side handling
    const populatedBuilding = await Building.findById(building._id);
    io.to("adminRoom").emit("building:created", populatedBuilding);

    res.status(201).json({
      success: true,
      message: "Building created successfully",
      building
    });

  } catch (error) {
    console.log("Error in createBuilding:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};