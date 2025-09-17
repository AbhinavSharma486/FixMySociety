import { io } from "./socket.js";
import Building from "../models/building.model.js";
import Complaint from "../models/complaint.model.js";


export const emitStatsUpdated = async () => {
  try {
    // Recompute summary stats similar to admin getSystemStats
    const totalBuildings = await Building.countDocuments();

    const totalResidentsAgg = await Building.aggregate([
      { $group: { _id: null, totalFilledFlats: { $sum: '$filledFlats' } } }
    ]);

    const totalUsers = totalResidentsAgg.length > 0 ? totalResidentsAgg[0].totalFilledFlats : 0;

    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'Pending' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'In Progress' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });

    const allBuildings = await Building.find();
    const totalFlats = allBuildings.reduce((sum, b) => sum + (b.numberOfFlats || 0), 0);
    const filledFlats = allBuildings.reduce((sum, b) => sum + (b.filledFlats || 0), 0);
    const emptyFlats = Math.max(0, totalFlats - filledFlats);

    // Building performance: include per-status complaint counts by joining complaints 
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
          _id: 1,
          buildingName: 1,
          totalFlats: '$numberOfFlats',
          filledFlats: 1,
          occupancyRate: {
            $round: [ // Round the final percentage to the nearest whole number
              {
                $multiply: [
                  { $cond: [{ $eq: ['$numberOfFlats', 0] }, 0, { $divide: ['$filledFlats', '$numberOfFlats'] }] },
                  100
                ]
              }
            ]
          },
          complaintsCount: { $size: '$complaintsDocs' },
          pendingCount: { $size: { $filter: { input: '$complaintsDocs', as: 'c', cond: { $eq: ['$$c.status', 'Pending'] } } } },
          inProgressCount: { $size: { $filter: { input: '$complaintsDocs', as: 'c', cond: { $eq: ['$$c.status', 'In Progress'] } } } },
          resolvedCount: { $size: { $filter: { input: '$complaintsDocs', as: 'c', cond: { $eq: ['$$c.status', 'Resolved'] } } } },
          emergencyCount: { $size: { $filter: { input: '$complaintsDocs', as: 'c', cond: { $eq: ['$$c.category', 'Emergency'] } } } }
        }
      },
      { $sort: { occupancyRate: -1 } }
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
      },
      buildingPerformance,
      generatedAt: new Date()
    };

    io.to('adminRoom').emit('stats:updated', stats);
    return stats;
  } catch (error) {
    console.error('Error computing stats for emitStatsUpdated:', error);
    throw error;
  }
};

export const emitComplaintCreated = (complaint) => {
  const buildingNameStr = complaint.buildingName?.buildingName || complaint.buildingName;

  // convert Mongoose doc to a plain object to avoid issues with socket.io
  const payload = complaint.toObject ? complaint.toObject() : { ...complaint };

  // Add a unique event ID for client side duplicate handling
  payload.eventId = `complaint_created_${complaint._id}_${Date.now()}`;

  if (buildingNameStr) io.to(buildingNameStr).emit('complaint:created', payload);

  io.to('adminRoom').emit('complaint:created', payload);

  // update dashboard stats for admins
  emitStatsUpdated().catch(err => console.error('emitStatsUpdated error:', err));
};

export const emitComplaintUpdated = (complaint) => {
  const buildingName = complaint.buildingName?.buildingName || complaint.buildingName;

  if (buildingName) {
    io.to(buildingName).emit('complaint:updated', { complaint });
  }

  io.to('adminRoom').emit('complaint:updated', { complaint });

  // refresh admin stats when complaints change
  emitStatsUpdated().catch(err => console.error('emitStatsUpdated error:', err));
};