import Building from "../models/building.model.js";
import User from "../models/user.model.js";
import Complaint from "../models/complaint.model.js";
import { io } from "../sockets/socket.js";
import { emitStatsUpdated } from "../sockets/eventEmitter.js";

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

// Get all buildings 
export const getAllBuildings = async (req, res) => {
  try {
    const buildings = await Building.find()
      .populate('complaints')
      .sort({ createdAd: -1 });

    res.status(200).json({
      success: true,
      buildings
    });
  } catch (error) {
    console.log("Error in getAllBuildings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get building by ID
export const getBuildingById = async (req, res) => {
  try {
    const { id } = req.params;

    const building = await Building.findById(id)
      .populate({
        path: 'complaints',
        populate: {
          path: 'user',
          select: 'fullName email flatNumber'
        }
      })
      .populate({
        path: 'residents',
        select: 'fullName email flatNumber'
      });

    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Building not found"
      });
    }

    res.status(200).json({
      success: true,
      building: building
    });
  } catch (error) {
    console.log("Error in getBuildingById:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update building
export const updateBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const { buildingName, numberOfFlats } = req.body;

    const building = await Building.findById(id);

    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Building not found"
      });
    }

    // Check if new building name already exists (if changing)
    if (buildingName && buildingName !== building.buildingName) {

      const existingBuilding = await Building.findOne({ buildingName });

      if (existingBuilding) {
        return res.status(400).json({
          success: false,
          message: "Building with this name already exists"
        });
      }
    }

    // Validate number of flats
    if (numberOfFlats && numberOfFlats < building.filledFlats) {
      return res.status(400).json({
        success: false,
        message: "Cannot reduce flats below currently filled count"
      });
    }

    // Update building
    const updatedBuilding = await Building.findByIdAndUpdate(id, {
      buildingName: buildingName || building.buildingName,
      numberOfFlats: numberOfFlats || building.numberOfFlats,
      emptyFlats: (numberOfFlats || building.numberOfFlats) - building.filledFlats
    }, { new: true });

    io.to("adminRoom").emit("building:updated", { building: updatedBuilding });
    emitStatsUpdated().catch(err => console.error("Error emitting stats update: ", err));

    res.status(200).json({
      success: true,
      message: "Building updated successfully",
      building: updatedBuilding
    });

  } catch (error) {
    console.log("Error in updateBuilding:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Delete Building 
export const deleteBuilding = async (req, res) => {
  try {
    const { id } = req.params;

    const building = await Building.findById(id);

    if (!building) {
      return res.status(400).json({
        success: false,
        message: "Building not found"
      });
    }

    // Check if building has users 
    if (building.filledFlats > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete building with registered users"
      });
    }

    //  Check if building has complaints
    if (building.complaints.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete building with existing complaints"
      });
    }

    await Building.findByIdAndDelete(id);

    io.to("adminRoom").emit("building:deleted", { buildingId: id });

    res.status(200).json({
      success: true,
      message: "Building deleted successfully"
    });
  } catch (error) {
    console.log("Error in deleteBuilding:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get building statistics 
export const getBuildingStats = async (req, res) => {
  try {
    const { id } = req.params;

    const building = await Building.findById(id);

    if (!building) {
      return res.status(400).json({
        success: false,
        message: "Building not found"
      });
    }

    // Get complaint statistics
    const totalComplaints = building.complaints.length;

    const pendingComplaints = await Complaint.countDocuments({
      buildingName: id, status: "Pending"
    });

    const inProgressComplaints = await Complaint.countDocuments({
      buildingName: id, status: "In Progress"
    });

    const resolvedComplaints = await Complaint.countDocuments({
      buildingName: id, status: "Resolved"
    });

    // Get user statistics
    const totalUsers = await User.countDocuments({ buildingName: id });

    const occupancyRate = ((building.filledFlats / building.numberOfFlats) * 100).toFixed(2);

    const stats = {
      building: {
        name: building.buildingName,
        totalFlats: building.numberOfFlats,
        filledFlats: building.filledFlats,
        emptyFlats: building.emptyFlats,
        occupancyRate: `${occupancyRate}%`
      },
      users: {
        total: totalUsers
      },
      complaints: {
        total: totalComplaints,
        pending: pendingComplaints,
        inProgress: inProgressComplaints,
        resolved: resolvedComplaints
      }
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.log("Error in getBuildingStats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};