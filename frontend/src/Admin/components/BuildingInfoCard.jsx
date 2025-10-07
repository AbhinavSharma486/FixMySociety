import React, { useState, useEffect } from "react";
import {
  Building2,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  Eye,
  DoorOpen,
  Siren,
  ClipboardList,
  Flame
} from "lucide-react";
import { getAllBuildingsAdmin, deleteBuilding } from "../../lib/buildingService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "./ConfirmationModal";

const BuildingInfoCard = ({ onEditBuilding }) => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState(null);

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const response = await getAllBuildingsAdmin();
      setBuildings(response.buildings);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch buildings');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (building) => {
    setBuildingToDelete(building);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setBuildingToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteBuilding = async () => {
    if (!buildingToDelete) return;
    try {
      await deleteBuilding(buildingToDelete._id);
      toast.success(`Building "${buildingToDelete.buildingName}" deleted successfully`);
      fetchBuildings();
    } catch (error) {
      toast.error(error.message || 'Failed to delete building');
    } finally {
      closeDeleteModal();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4 text-lg">Loading buildings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-base-content">Admin Dashboard</h1>
            <p className="text-base-content/70 mt-2">Manage buildings and monitor complaints</p>
          </div>
          <button
            className="btn btn-primary gap-2"
            onClick={() => onEditBuilding && onEditBuilding(null)}
          >
            <Plus className="w-5 h-5" />
            Add Building
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="stat bg-base-100 shadow-lg rounded-lg">
            <div className="stat-figure text-primary">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="stat-title">Total Buildings</div>
            <div className="stat-value text-primary">{buildings.length}</div>
          </div>

          <div className="stat bg-base-100 shadow-lg rounded-lg">
            <div className="stat-figure text-info">
              <Users className="w-8 h-8" />
            </div>
            <div className="stat-title">Total Residents</div>
            <div className="stat-value text-info">
              {buildings.reduce((sum, building) => sum + building.filledFlats, 0)}
            </div>
          </div>

          <div className="stat bg-base-100 shadow-lg rounded-lg">
            <div className="stat-figure text-accent">
              <DoorOpen className="w-8 h-8" />
            </div>
            <div className="stat-title">Total Empty Flats</div>
            <div className="stat-value text-accent">
              {buildings.reduce((sum, building) => sum + building.emptyFlats, 0)}
            </div>
          </div>

          <div className="stat bg-base-100 shadow-lg rounded-lg">
            <div className="stat-figure text-warning">
              <Siren className="w-8 h-8" />
            </div>
            <div className="stat-title">Pending Complaints</div>
            <div className="stat-value text-warning">
              {buildings.reduce((sum, building) =>
                sum + building.complaints.filter(c => c.status === 'Pending').length, 0
              )}
            </div>
          </div>

          <div className="stat bg-base-100 shadow-lg rounded-lg">
            <div className="stat-figure text-info">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div className="stat-title">In Progress Complaints</div>
            <div className="stat-value text-info">
              {buildings.reduce((sum, building) =>
                sum + building.complaints.filter(c => c.status === 'In Progress').length, 0
              )}
            </div>
          </div>

          <div className="stat bg-base-100 shadow-lg rounded-lg">
            <div className="stat-figure text-error">
              <Flame className="w-8 h-8" />
            </div>
            <div className="stat-title">Emergency Complaints</div>
            <div className="stat-value text-error">
              {buildings.reduce((sum, building) =>
                sum + building.complaints.filter(c => c.category === 'Emergency').length, 0
              )}
            </div>
          </div>

          <div className="stat bg-base-100 shadow-lg rounded-lg">
            <div className="stat-figure text-success">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="stat-title">Resolved Complaints</div>
            <div className="stat-value text-success">
              {buildings.reduce((sum, building) =>
                sum + building.complaints.filter(c => c.status === 'Resolved').length, 0
              )}
            </div>
          </div>
        </div>

        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Building Management</h2>

          {buildings.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
              <p className="text-lg text-base-content/70">No buildings found</p>
              <p className="text-base-content/50">Add your first building to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Building Name</th>
                    <th>Total Flats</th>
                    <th>Occupied</th>
                    <th>Vacant</th>
                    <th>Complaints</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {buildings.map((building) => (
                    <tr key={building._id}>
                      <td>
                        <div className="font-medium">{building.buildingName}</div>
                      </td>
                      <td>{building.numberOfFlats}</td>
                      <td>
                        <span className="badge badge-success badge-sm">
                          {building.filledFlats}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-neutral badge-sm">
                          {building.emptyFlats}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {building.complaints.length > 0 && (
                            <>
                              <span className="badge badge-error badge-sm">
                                {building.complaints.filter(c => c.category === 'Emergency').length} Emergency
                              </span>
                              <span className="badge badge-warning badge-sm">
                                {building.complaints.filter(c => c.status === 'Pending').length} Pending
                              </span>
                              <span className="badge badge-info badge-sm">
                                {building.complaints.filter(c => c.status === 'In Progress').length} In Progress
                              </span>
                              <span className="badge badge-success badge-sm">
                                {building.complaints.filter(c => c.status === 'Resolved').length} Resolved
                              </span>
                            </>
                          )}
                          {building.complaints.length === 0 && (
                            <span className="text-base-content/50 text-sm">No complaints</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => navigate(`/admin/building/${building._id}/complaints`)} // Navigate to building-specific complaints page
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => navigate(`/admin/building/${building._id}/residents`)} // Navigate to building-specific residents page
                          >
                            <Users className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => onEditBuilding && onEditBuilding(building)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs text-error"
                            onClick={() => openDeleteModal(building)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteBuilding}
        title="Confirm Deletion"
      >
        <p>Are you sure you want to delete the building "{buildingToDelete?.buildingName}"?</p>
        <p className="text-sm text-error mt-2">This action cannot be undone.</p>
      </ConfirmationModal>
    </div>
  );
};

export default BuildingInfoCard;
