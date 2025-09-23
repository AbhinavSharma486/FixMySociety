import bcryptjs from "bcryptjs";

import Complaint from "../models/complaint.model.js";
import Admin from "../models/admin.model.js";
import Building from "../models/building.model.js";
import User from "../models/user.model.js";
import Broadcast from "../models/broadcast.model.js";
import Notification from '../models/notification.model.js';
import { sendNewResidentWelcomeEmail } from "../nodemailer/email.js";
import { emitStatsUpdated } from "../sockets/eventEmitter.js";


// Get all complaints across all buildings (Admin only)
export const getAllComplaintsAdmin = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('user', 'fullName email flatNumber')
      .populate('buildingName', 'buildingName')
      .select('title description user buildingName flatNumber category likes status images video createdAt') // Explicitly select video field
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      complaints
    });
  } catch (error) {
    console.log("Error in getAllComplaintsAdmin:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get Complaint by ID (Admin only)
// Complaint ko ID ke basis pe nikalne ke liye controller function
export const getComplaintByIdAdmin = async (req, res) => {
  try {
    // 1. URL params se complaint ka id nikal liya
    const { id } = req.params;

    // 2. Complaint ko DB se find karo aur related data ko populate karo
    const complaint = await Complaint.findById(id)
      // Complaint banane wale user ka detail lao (sirf ye fields)
      .populate('user', 'fullName email flatNumber')
      // Complaint jis building se belong karti hai uska naam lao
      .populate('buildingName', 'buildingName')
      // Har comment ka user ka detail lao
      .populate("comments.user", "fullName profilePic flatNumber")
      // Har reply ka user ka detail lao
      .populate("comments.replies.user", "fullName profilePic flatNumber")
      // Sirf selected fields complaint ke laane hain
      .select('title description user buildingName flatNumber category likes status images video createdAt');

    // 3. Agar complaint exist hi nahi karti toh 404 return karo
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    // 4. Admin ke comments/replies ke user info ko manually attach karna padega
    // (kyunki populate normally User model se karta hai, Admin se nahi)
    const adminIdsToFetch = new Set(); // duplicate IDs avoid karne ke liye Set use kiya

    // 5. Complaint ke comments loop karo
    complaint.comments.forEach(c => {
      // Agar comment admin ka hai aur user ka detail populate nahi hua
      if (c.authorRole === 'admin' && c.user && !c.user.fullName) {
        // To admin ka ID save kar lo future fetch ke liye
        adminIdsToFetch.add(String(c.user));
      }

      // Agar replies bhi hai comment ke andar
      if (c.replies && c.replies.length) {
        // Har reply loop karo aur admin check karo
        c.replies.forEach(r => {
          if (r.authorRole === 'admin' && r.user && !r.user.fullName) {
            // Agar reply bhi admin ka hai aur detail nahi mila
            adminIdsToFetch.add(String(r.user));
          }
        });
      }
    });

    // 6. Agar kuch admin IDs collect hue hai
    if (adminIdsToFetch.size > 0) {
      // Un IDs ke admins ka detail Admin collection se nikal lo
      const admins = await Admin.find({ _id: { $in: Array.from(adminIdsToFetch) } })
        .select('fullName profilePic'); // Sirf fullName aur profilePic chahiye

      // Admins ka ek map bana lo (quick lookup ke liye)
      const adminMap = new Map(admins.map(a => [String(a._id), a]));

      // 7. Ab dobara comments loop karo aur admin ka detail set karo
      complaint.comments.forEach(c => {
        // Agar comment admin ka hai aur abhi tak user ka detail nahi hai
        if (c.authorRole === 'admin' && c.user && !c.user.fullName) {
          const adm = adminMap.get(String(c.user));

          if (adm) {
            // Comment ke user field ko manually admin ka detail assign kar do
            c.user = { _id: adm._id, fullName: adm.fullName, profilePic: adm.profilePic };
          }
        }

        // Replies me bhi same process karo
        if (c.replies && c.replies.length) {
          c.replies.forEach(r => {
            if (r.authorRole === 'admin' && r.user && !r.user.fullName) {
              const adm = adminMap.get(String(r.user));

              if (adm) {
                // Reply ke user field ko manually admin ka detail assign kar do
                r.user = { _id: adm._id, fullName: adm.fullName, profilePic: adm.profilePic };
              }
            }
          });
        }
      });
    }

    // 8. Final response bhej do (complaint ke saath user/admin detail attach karke)
    res.status(200).json({
      success: true,
      complaint
    });

  } catch (error) {
    // 9. Agar upar kahi error aaya toh catch block chalega
    console.log("Error in getComplaintByIdAdmin:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Delete a complaint (Admin only)
export const deleteComplaintAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    // Remove complaint from associated building (if applicable)
    if (complaint.buildingName) {
      const building = await Building.findOne({ buildingName: complaint.buildingName });

      if (building) {
        building.complaints.pull(complaint._id);

        await building.save();
      }
    }

    await Complaint.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Complaint deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteComplaintAdmin:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Add a new resident to a building (Admin only)
export const addResidentToBuilding = async (req, res) => {
  try {
    const { id: buildingId } = req.params;

    const { fullName, email, flatNumber, password } = req.body;

    // validate input 
    if (!fullName || !email || !flatNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long."
      });
    }

    // Check if building exists
    const building = await Building.findById(buildingId);

    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Building not found."
      });
    }

    // Check if email already exists 

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists."
      });
    }

    // Check if flat number is within building range and not already occupied
    const flatNum = parseInt(flatNumber);

    if (isNaN(flatNum) || flatNum < 1 || flatNum > building.numberOfFlats) {
      return res.status(400).json({
        success: false,
        message: "Flat number is out of range for this building."
      });
    }

    const flatAlreadyOccupied = await User.findOne({ buildingId: buildingId, flatNumber: String(flatNum) });

    if (flatAlreadyOccupied) {
      return res.status(400).json({
        success: false,
        message: "This flat number is already occupied in this building."
      });
    }

    // Create new user (resident)
    const newResident = new User({
      fullName,
      email,
      flatNumber,
      password, // Password will be hashed by pre-save hook in user model
      buildingName: building.buildingName, // Associate with building by name
      buildingId: building._id, // Associate with building by ID
      role: "user", // Default role for a new resident
    });

    await newResident.save();

    // Update building's residents array and counts
    building.residents.push(newResident._id);
    building.filledFlats += 1;
    building.emptyFlats = Math.max(0, building.numberOfFlats - building.filledFlats); // Ensure empty Flats doesn't go below 0

    await building.save();

    // Return resident without password
    const residentRespone = newResident.toObject();

    delete residentRespone.password;

    let emailSentSuccessfully = false;

    try {
      await sendNewResidentWelcomeEmail(
        email,
        fullName,
        password, // The plain text password before hashing
        flatNumber,
        building.buildingName
      );
      emailSentSuccessfully = true;
    } catch (error) {
      console.error(`Failed to send welcome email to ${email}:`, emailError);
    }

    if (emailSentSuccessfully) {
      res.status(201).json({
        success: true,
        message: "Resident created and email sent successfully.",
        resident: residentRespone
      });
    }
    else {
      res.status(201).json({
        success: true,
        message: "Resident created but email not send. Please retry.",
        resident: residentRespone
      });
    }

    // Trigger a real time update for all admin dashboards
    emitStatsUpdated().catch(err => console.error('Error triggering stats update after adding resident:', err));
  } catch (error) {
    console.error("Error in addResidentToBuilding:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get all buildings with detailed information (Admin only)
export const getAllBuildingsAdmin = async (req, res) => {
  try {
    const buildings = await Building.find()
      .populate('complaints')
      .populate({
        path: 'complaints',
        populate: {
          path: 'user',
          select: 'fullName email flatNumber'
        }
      })
      .sort({ createdAt: -1 });

    res.staus(200).json({
      success: true,
      buildings
    });
  } catch (error) {
    console.log("Error in getAllBuildingsAdmin:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get buildings by ID (Admin only)
export const getBuildingByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const building = await Building.findById(id)
      .populate('residents', 'fullName email flatNumber')
      .populate({
        path: 'complaints',
        populate: {
          path: 'user',
          select: 'fullName email flatNumber'
        }
      });

    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Building not found"
      });
    }

    // Failsafe : If residents array is empty after population, fetch residents by buildingName
    if (building.residents.length === 0) {
      const fallbackResidents = await User.find({ buildingName: building.buildingName })
        .select('fullName email flatNumber');

      building.residents = fallbackResidents;
    }


    res.status(200).json({
      success: true,
      message: "Building fetched successfully",
      building,
    });
  } catch (error) {
    console.log("Error in getBuildingByIdAdmin:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get All Users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("buildingName", "buildingName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delet User (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params; // User ID

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    // Prevent admin from deleting other admins or themselves via this route for simplicity
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete admin users."
      });
    }

    // Remove user from their buildings's residents list
    if (user.building) {
      const building = await Building.findOne({ buildingName: user.buildingName });

      if (building) {
        building.residents.pull(user._id);
        building.filledFlats -= 1;
        building.emptyFlats += 1;

        await building.save();
      }
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully."
    });

    // Trigger a real time update for all admin dashboards
    emitStatsUpdated().catch(err => console.error('Error triggering stats update after deleting user:', err));
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get All Broadcasts (Admin only)
export const getAllBroadcasts = async (req, res) => {
  try {
    const broadcasts = await Broadcast.find()
      .populate("sender", "fullName")
      .populate("relatedBuilding", "buildingName")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, broadcasts });
  } catch (error) {
    console.error("Error fetching broadcasts:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Delete Broadcast (Admin Only)
export const deleteBroadcast = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.admin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action."
      });
    }

    const broadcast = await Broadcast.findById(id);

    if (!broadcast) {
      return res.status(404).json({
        success: false,
        message: "Broadcast not found."
      });
    }

    await Notification.deleteMany({ broadcast: id });

    await Broadcast.findByIdAndDelete(id);

    // broadcast deletion : notify all clients so UI can remove records

    // Empty only once (global) to avoid duplicate events for admins who are in adminRoom

    io.emit("broadcast:deleted", { broadcastId: id });

    res.status(200).json({
      success: true,
      message: "Broadcast and associated notifications deleted."
    });
  } catch (error) {
    console.error("Error deleting broadcast:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// New Controller to fetch building options for dropdown
export const getBuildingOptions = async (req, res) => {
  try {
    const buildings = await Building.find({}, 'buildingName').sort({ buildingName: 1 });

    const formattedBuildings = buildings.map(building => ({
      _id: building._id,
      name: building.buildingName
    }));

    res.status(200).json({
      success: true,
      buildings: formattedBuildings
    });
  } catch (error) {
    console.error("Error in getBuildingOptions:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get Admin Profile 
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    res.status(200).json({
      success: true,
      admin
    });
  } catch (error) {
    console.error("Error in getAdminProfile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update Admin Profile 
export const updateAdminProfile = async (req, res) => {
  try {
    const { fullName, email, profileImage } = req.body;

    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    if (email && email !== admin.email) {

      const existingAdmin = await Admin.findOne({ email });

      if (existingAdmin && existingAdmin._id.toString() !== req.admin._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Email already in use"
        });
      }
    }

    admin.fullName = fullName || admin.fullName;
    admin.email = email || admin.email;

    // Handle profile image upload 
    if (profileImage) {

      // check if the new image is a base64 string or a direct URL
      if (profileImage.startsWith("data:image")) {

        // upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(
          profileImage,
          {
            folder: "admin_profile_pics"
          }
        );

        admin.profileImage = uploadResponse.secure_url;
      }
      else if (profileImage.startsWith("http")) {

        // if it's already a URL (e.g., unchanged default or existing cloudinary URL)
        admin.profileImage = profileImage;
      }
      else {
        return res.status(400).json({
          success: false,
          message: "Invalid profile image format."
        });
      }
    }

    await admin.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      admin: admin.toObject({
        getters: true,
        virtuals: false,
        transform: (doc, ret) => {
          delete ret.password;
          return ret;
        }
      })
    });
  } catch (error) {
    console.error("Error in updateAdminProfile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Change Admin Password 
export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required"
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New Password and confirm new password do not match"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New Password must be at least 6 characters long"
      });
    }

    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // compare current password 
    const isMatch = await bcryptjs.compare(currentPassword, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect current password"
      });
    }

    // Hash new password and save
    const salt = await bcryptjs.genSalt(10);

    admin.password = await bcryptjs.hash(newPassword, salt);

    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Error in changeAdminPassword:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get System wide statistics (Admin only)
export const getSystemStats = async (req, res) => {
  try {
    const totalBuildings = await Building.countDocuments();

    // calculate total residents by summing filledFlats across all buildings 
    const totalResidents = await Building.aggregate([
      {
        $group: {
          _id: null,
          totalFilledFlats: { $sum: "$filledFlats" }
        }
      }
    ]);

    const totalUsers = totalResidents.length > 0 ? totalResidents[0].totalFilledFlats : 0;

    const totalComplaints = await Complaint.countDocuments();

    const pendingComplaints = await Complaint.countDocuments(
      { status: "Pending" }
    );

    const inProgressComplaints = await Complaint.countDocuments(
      { status: "In Progress" }
    );

    const resolvedComplaints = await Complaint.countDocuments(
      { status: "Resolved" }
    );

    const allBuildings = await Building.find(); // fetch all buildings for manual aggregation

    const totalFlats = allBuildings.reduce((sum, b) => sum + b.numberOfFlats, 0);

    const filledFlats = allBuildings.reduce((sum, b) => sum + b.filledFlats, 0);

    const emptyFlats = totalFlats - filledFlats;

    const today = new Date();

    today.setHours(0, 0, 0, 0); // Start of today

    const newComplaintsToday = await Complaint.countDocuments(
      { createdAt: { $gte: today } }
    );

    // Get category distribution 
    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get building occupancy stats using a robust lookup for accurate complaint counts

    const buildingPerformance = await Building.aggregate([
      {
        $lookup: {
          from: 'complaints',
          localField: 'complaints',
          foreignField: '_id',
          as: 'complaintsDocs'
        }
      },
      {
        $project: {
          buildingName: 1,
          totalFlats: "$numberOfFlats",
          filledFlats: 1,
          occupancyRate: {
            $round: [
              {
                $multiply: [
                  { $cond: [{ $eq: ['$numberOfFlats', 0] }, 0, { $divide: ["$filledFlats", "$numberOfFlats"] }] },
                  100
                ]
              }
            ]
          },
          complaintsCount: { $size: "$complaintsDocs" }
        }
      },
      {
        $sort: { occupancyRate: -1 }
      }
    ]);

    const stats = {
      overview: {
        totalBuildings,
        totalUsers,
        totalComplaints,
        pendingComplaints,
        inProgressComplaints,
        resolvedComplaints,
        totalFlats,
        emptyFlats,
        newComplaintsToday
      },
      categoryDistribution: categoryStats,
      buildingPerformance: buildingPerformance,
      generatedAt: new Date()
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.log("Error in getSystemStats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update User By Admin
export const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { fullName, email, flatNumber, buildingName } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const oldBuildingName = user.buildingName;

    // If building is being changed, we need to update both old and new building documents 
    if (buildingName && buildingName !== oldBuildingName) {

      const newBuilding = await Building.findOne(
        { buildingName: buildingName }
      );

      if (!newBuilding) {
        return res.status(404).json({
          success: false,
          message: "New building not found"
        });
      }

      const oldBuilding = await Building.findOne(
        { buildingName: oldBuildingName }
      );

      // Atomically update user and buildings 
      // 1. Update user document 
      user.fullName = fullName;
      user.email = email;
      user.flatNumber = flatNumber;
      user.buildingName = buildingName;

      // 2. Remove user from old buildings residents list and update counts 
      if (oldBuilding) {
        oldBuilding.residents.pull(user._id);
        oldBuilding.filledFlats -= 1;
        oldBuilding.emptyFlats += 1;

        await oldBuilding.save();
      }

      // 3. Add user to new building's residents list and update counts 
      newBuilding.residents.push(user._id);
      newBuilding.filledFlats += 1;
      newBuilding.emptyFlats -= 1;

      await newBuilding.save();

      await user.save();
    }
    else {
      // just update user details without changing building 
      user.fullName = fullName;
      user.email = email;
      user.flatNumber = flatNumber;

      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user
    });
  } catch (error) {
    console.log("Error in updateUserByAdmin:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update User Building and Flat
export const updateUserBuildingAndFlat = async (req, res) => {
  try {
    const { id } = req.params;

    const { buildingName, flatNumber } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const oldBuildingName = user.buildingName;

    // update only if buildingName or flatNumber are provided and changed 
    if (
      (buildingName && buildingName !== oldBuildingName) ||
      (flatNumber && flatNumber !== user.flatNumber)
    ) {
      if (buildingName && buildingName !== oldBuildingName) {

        const newBuilding = await Building.findOne(
          { buildingName: buildingName }
        );

        if (!newBuilding) {
          return res.status(404).json({
            success: false,
            message: "New Building not found"
          });
        }

        const oldBuilding = await Building.findOne(
          { buildingName: oldBuildingName }
        );

        // Remove user from old building's residents list and update counts
        if (oldBuilding) {
          oldBuilding.residents.pull(user._id);
          oldBuilding.filledFlats -= 1;
          oldBuilding.emptyFlats += 1;

          await oldBuilding.save();
        }

        // Add user to new building's residents list and update counts 
        newBuilding.residents.push(user._id);
        newBuilding.filledFlats += 1;
        newBuilding.emptyFlats -= 1;

        await newBuilding.save();

        user.buildingName = buildingName;
      }

      if (flatNumber) {
        user.flatNumber = flatNumber;
      }

      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "User building and flat updated successfully",
      user
    });
  } catch (error) {
    console.error("Error in updateUserBuildingAndFlat:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};