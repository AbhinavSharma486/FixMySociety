import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBuildingById } from '../../lib/buildingService';
import { updateComplaintStatus, deleteComplaint } from '../../lib/complaintService';
import toast from 'react-hot-toast';
import { LoaderCircle, User, Hash, Clock, ShieldAlert, Users, Trash2 } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

const BuildingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState(null);

  useEffect(() => {
    fetchBuildingDetails();
  }, [id]);

  const fetchBuildingDetails = async () => {
    try {
      setLoading(true);
      const response = await getBuildingById(id);
      setBuilding(response.building);
      setComplaints(response.building.complaints || []);
    } catch (error) {
      toast.error('Failed to fetch building details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await updateComplaintStatus(complaintId, newStatus);
      toast.success('Complaint status updated');
      fetchBuildingDetails();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const openDeleteModal = (complaint) => {
    setComplaintToDelete(complaint);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setComplaintToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteComplaint = async () => {
    if (!complaintToDelete) return;
    try {
      await deleteComplaint(complaintToDelete._id);
      toast.success('Complaint deleted successfully');
      fetchBuildingDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to delete complaint');
    } finally {
      closeDeleteModal();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className="size-10 animate-spin" />
      </div>
    );
  }

  if (!building) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Building not found.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'select-warning';
      case 'In Progress': return 'select-info';
      case 'Resolved': return 'select-success';
      default: return 'select-bordered';
    }
  };

  return (
    <div className="p-6 bg-base-200 min-h-screen pt-25">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center bg-base-100 shadow-lg rounded-lg p-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-base-content">{building.buildingName}</h1>
            <p className="text-base-content/70 mt-2">Detailed view of the building and its complaints</p>
          </div>
          <button
            className="btn btn-primary gap-2"
            onClick={() => navigate(`/admin/building/${id}/residents`)}
          >
            <Users className="w-5 h-5" />
            Show All Residents
          </button>
        </div>

        <div className="bg-base-100 shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <ShieldAlert className="w-6 h-6" />
            Complaint Management
          </h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>User</th>
                  <th>Flat No.</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(complaints || []).map((complaint) => (
                  <tr key={complaint._id} className={complaint.category === 'Emergency' ? 'bg-red-500 text-white' : ''}>
                    <td>
                      <div className="font-medium">{complaint.title}</div>
                      <div className="text-sm opacity-70 truncate max-w-xs">{complaint.description}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4" />
                        {complaint.user?.fullName || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Hash className="w-4 h-4" />
                        {complaint.user?.flatNumber || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4" />
                        {new Date(complaint.createdAt).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                    <td>
                      <select
                        className={`select select-bordered select-sm w-full max-w-xs ${getStatusColor(complaint.status)}`}
                        value={complaint.status}
                        onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td>
                      {complaint.status === 'Resolved' && (
                        <button
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => openDeleteModal(complaint)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteComplaint}
        title="Confirm Complaint Deletion"
      >
        <p>Are you sure you want to permanently delete this complaint?</p>
        <p className="font-semibold mt-2">"{complaintToDelete?.title}"</p>
        <p className="text-sm text-error mt-2">This action cannot be undone.</p>
      </ConfirmationModal>
    </div>
  );
};

export default BuildingDetailsPage;
