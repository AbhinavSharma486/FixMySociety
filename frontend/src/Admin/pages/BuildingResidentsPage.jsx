import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBuildingByIdAdmin, updateUserByAdmin, addResidentByAdmin, deleteUserByAdmin } from '../../lib/adminService'; // Updated to adminService
import toast from 'react-hot-toast';
import { LoaderCircle, User, Hash, Mail, Edit, ArrowLeft, PlusCircle, Trash2 } from 'lucide-react'; // Added PlusCircle and Trash2 icons
import EditResidentModal from '../components/EditResidentModal';
import ConfirmationModal from '../components/ConfirmationModal'; // New import for ConfirmationModal
import AddResidentModal from '../components/AddResidentModal'; // New import for AddResidentModal

const BuildingResidentsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [residents, setResidents] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // New state for AddResidentModal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // New state for Delete confirmation modal
  const [selectedResident, setSelectedResident] = useState(null);
  const [residentToDelete, setResidentToDelete] = useState(null); // New state for resident to delete

  useEffect(() => {
    fetchBuildingDetails();
  }, [id]);

  const fetchBuildingDetails = async () => {
    try {
      setLoading(true);
      const response = await getBuildingByIdAdmin(id); // Use admin specific function
      setBuilding(response.building);
      setResidents(response.building.residents || []);
      console.log("Residents data:", response.building.residents); // Add this line
    } catch (error) {
      toast.error(error.message || 'Failed to fetch building details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddResident = async (newResidentData) => {
    try {
      const response = await addResidentByAdmin(id, newResidentData); // Capture the response
      toast.success(response.message); // Display the specific message from the backend
      setIsAddModalOpen(false);
      fetchBuildingDetails(); // Refresh list
    } catch (error) {
      toast.error(error.message || 'Failed to add resident');
    }
  };

  const handleEditResident = (resident) => {
    setSelectedResident(resident);
    setIsEditModalOpen(true);
  };

  const handleUpdateResident = async (residentId, updatedData) => {
    try {
      await updateUserByAdmin(residentId, updatedData); // This function likely handles resident updates
      toast.success('Resident details updated successfully');
      setIsEditModalOpen(false);
      setSelectedResident(null);
      fetchBuildingDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to update resident');
    }
  };

  const handleDeleteClick = (resident) => {
    setResidentToDelete(resident);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteResident = async () => {
    try {
      if (residentToDelete) {
        await deleteUserByAdmin(residentToDelete._id); // Assuming this handles resident deletion via user ID
        toast.success('Resident deleted successfully');
        setIsDeleteModalOpen(false);
        setResidentToDelete(null);
        fetchBuildingDetails();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete resident');
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

  return (
    <div className="p-6 bg-base-200 min-h-screen pt-25">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center bg-base-100 shadow-lg rounded-lg p-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-base-content">{building.buildingName} - Residents</h1>
            <p className="text-base-content/70 mt-2">Manage residents for this building</p>
          </div>
          <div className="flex gap-4">
            <button
              className="btn btn-primary gap-2"
              onClick={() => setIsAddModalOpen(true)}
            >
              <PlusCircle className="w-5 h-5" />
              Add New Resident
            </button>
            <button
              className="btn btn-ghost gap-2"
              onClick={() => navigate(`/admin/building/${id}`)}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Complaints
            </button>
          </div>
        </div>

        <div className="bg-base-100 shadow-lg rounded-lg p-6">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Building</th>
                  <th>Flat No.</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(residents || []).map((resident) => (
                  <tr key={resident._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4" />
                        {resident.fullName}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4" />
                        {resident.email}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Hash className="w-4 h-4" />
                        {building.buildingName}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Hash className="w-4 h-4" />
                        {resident.flatNumber}
                      </div>
                    </td>
                    <td className="flex gap-2">
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleEditResident(resident)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-red-500"
                        onClick={() => handleDeleteClick(resident)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <EditResidentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        resident={selectedResident}
        onSubmit={handleUpdateResident}
      />

      <AddResidentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        buildingId={id}
        onSubmit={handleAddResident}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteResident}
        title="Confirm Deletion"
        message={`Are you sure you want to delete resident ${residentToDelete?.fullName}? This action cannot be undone.`}
      />
    </div>
  );
};

export default BuildingResidentsPage;
