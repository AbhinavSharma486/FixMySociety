import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllComplaintsAdmin, getBuildingByIdAdmin, updateComplaintStatusAdmin, deleteComplaintAdmin } from '../../lib/adminService'; // Added getBuildingByIdAdmin
import { format } from 'date-fns';
import { Eye, Clock, AlertTriangle, CheckCircle, RefreshCw, Users, Trash2 } from 'lucide-react'; // Added Users icon and Trash2
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal'; // New import for ConfirmationModal

const AdminBuildingComplaintsPage = () => {
  const { buildingId } = useParams();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buildingName, setBuildingName] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // New state for delete confirmation
  const [complaintToDelete, setComplaintToDelete] = useState(null); // New state to hold complaint to be deleted

  // Removed: const [buildingInfo, setBuildingInfo] = useState(null); // New state for building details

  useEffect(() => {
    if (buildingId) {
      // Removed: fetchBuildingDetails(); // Fetch building details
      fetchBuildingComplaints();
    }
  }, [buildingId]);

  // Removed: const fetchBuildingDetails = async () => {
  // Removed:   try {
  // Removed:     const response = await getBuildingByIdAdmin(buildingId);
  // Removed:     setBuildingInfo(response.building);
  // Removed:     setBuildingName(response.building.buildingName);
  // Removed:   } catch (err) {
  // Removed:     console.error("Failed to fetch building details:", err);
  // Removed:     toast.error(err.message || 'Failed to fetch building details.');
  // Removed:   }
  // Removed: };

  const fetchBuildingComplaints = async () => {
    try {
      setLoading(true);
      // In a real scenario, you'd have an endpoint like /api/admin/buildings/:buildingId/complaints
      // For now, we'll filter all admin complaints by buildingId if available.
      // This is less efficient but works with existing APIs.
      const response = await getAllComplaintsAdmin(); // Fetches ALL complaints
      const allComplaints = response.complaints;
      const filtered = allComplaints.filter(c => c.buildingName?._id === buildingId);

      if (filtered.length > 0) {
        setBuildingName(filtered[0].buildingName?.buildingName);
      } else {
        // If no complaints, try to fetch building name separately if needed
        try {
          const buildingResponse = await getBuildingByIdAdmin(buildingId);
          setBuildingName(buildingResponse.building.buildingName);
        } catch (nameError) {
          console.error("Failed to fetch building name:", nameError);
          setBuildingName('Unknown Building');
        }
      }
      setComplaints(filtered);
    } catch (err) {
      setError(err.message || 'Failed to fetch complaints for building.');
      toast.error(err.message || 'Failed to fetch complaints.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (complaint) => {
    setComplaintToDelete(complaint);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (complaintToDelete) {
        await deleteComplaintAdmin(complaintToDelete._id);
        toast.success('Complaint deleted successfully!');
        setIsDeleteModalOpen(false);
        setComplaintToDelete(null);
        fetchBuildingComplaints(); // Refresh the list
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete complaint.');
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await updateComplaintStatusAdmin(complaintId, newStatus);
      toast.success('Complaint status updated successfully!');
      fetchBuildingComplaints(); // Refresh the list to show updated status
    } catch (error) {
      toast.error(error.message || 'Failed to update complaint status.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'badge-warning';
      case 'In Progress': return 'badge-info';
      case 'Resolved': return 'badge-success';
      default: return 'badge-neutral';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'In Progress': return <AlertTriangle className="w-4 h-4" />;
      case 'Resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-zinc-900">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4 text-lg">Loading complaints...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-4 dark:bg-zinc-900">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 p-8 pt-30">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Complaints for {buildingName || 'Selected Building'}
        </h1>
        <button
          onClick={() => navigate(`/admin/building/${buildingId}/residents`)} // Navigate to residents page
          className="btn btn-primary btn-sm gap-2"
        >
          <Users className="w-4 h-4" />
          Show All Residents
        </button>
      </div>

      {/* Removed: buildingInfo && (
        <div className="bg-base-100 rounded-lg shadow-lg p-4 mb-6">
          <p className="text-lg font-semibold text-gray-800 dark:text-white">Building: {buildingInfo.buildingName}</p>
          <p className="text-gray-600 dark:text-gray-300">Address: {buildingInfo.address}</p>
          <p className="text-gray-600 dark:text-gray-300">Total Flats: {buildingInfo.numberOfFlats}</p>
          <p className="text-gray-600 dark:text-gray-300">Filled Flats: {buildingInfo.filledFlats}</p>
        </div>
      ) */}

      <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="flex justify-end p-4">
          <button onClick={fetchBuildingComplaints} className="btn btn-outline btn-sm gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Complaint</th><th>User</th><th>Category</th><th>Status</th><th>Date</th><th>View</th><th>Actions</th> {/* New Actions Column */}
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-base-content/50">
                    No complaints found for this building.
                  </td>
                </tr>
              ) : (
                complaints.map((complaint) => (
                  <tr key={complaint._id}>
                    <td>
                      <div>
                        <div className="font-medium">{complaint.title}</div>
                        <div className="text-sm text-base-content/70" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {complaint.description}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div className="font-medium">{complaint.user?.fullName || 'Unknown'}</div>
                        <div className="text-base-content/70">Flat {complaint.flatNumber}</div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-outline">{complaint.category}</span>
                    </td>
                    <td>
                      <select
                        className="select select-bordered select-sm w-full max-w-xs"
                        value={complaint.status}
                        onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td>
                      <div className="text-sm">
                        {format(new Date(complaint.createdAt), 'dd/MM/yyyy')}
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => navigate(`/admin/complaints/${complaint._id}`)} // Navigate to individual complaint detail page
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                    <td>
                      {complaint.status === "Resolved" && (
                        <button
                          className="btn btn-ghost btn-xs text-red-500"
                          onClick={() => handleDeleteClick(complaint)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Complaint Deletion"
        message={`Are you sure you want to delete complaint "${complaintToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default AdminBuildingComplaintsPage;
