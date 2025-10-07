import React, { useState, useEffect } from 'react';
import { X, Building2, Save, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const BuildingModal = ({
  isOpen,
  onClose,
  building = null,
  onSubmit,
  mode = 'create'
}) => {
  const [formData, setFormData] = useState({
    buildingName: '',
    numberOfFlats: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (building && mode === 'edit') {
      setFormData({
        buildingName: building.buildingName,
        numberOfFlats: building.numberOfFlats.toString()
      });
    } else {
      setFormData({
        buildingName: '',
        numberOfFlats: ''
      });
    }
  }, [building, mode, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.buildingName.trim() || !formData.numberOfFlats) {
      toast.error('Please fill all required fields');
      return;
    }

    if (parseInt(formData.numberOfFlats) <= 0) {
      toast.error('Number of flats must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        buildingName: formData.buildingName.trim(),
        numberOfFlats: parseInt(formData.numberOfFlats)
      });
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save building');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open" style={{ zIndex: 1000 }}>
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {mode === 'create' ? (
                <Building2 className="w-6 h-6 text-primary" />
              ) : (
                <Edit className="w-6 h-6 text-primary" />
              )}
            </div>
            <h3 className="text-xl font-bold">
              {mode === 'create' ? 'Create New Building' : 'Edit Building'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">
              <span className="label-text font-medium">Building Name</span>
              <span className="label-text-alt text-error">*</span>
            </label>
            <input
              type="text"
              name="buildingName"
              value={formData.buildingName}
              onChange={handleInputChange}
              className="input input-bordered w-full"
              placeholder="Enter building name"
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">Number of Flats</span>
              <span className="label-text-alt text-error">*</span>
            </label>
            <input
              type="number"
              name="numberOfFlats"
              value={formData.numberOfFlats}
              onChange={handleInputChange}
              className="input input-bordered w-full"
              placeholder="Enter total number of flats"
              min="1"
              required
            />
            <div className="label">
              <span className="label-text-alt text-base-content/60">
                This will set the initial capacity of the building
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary gap-2"
              disabled={loading}
            >
              {loading ? (
                <div className="loading loading-spinner loading-sm"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {mode === 'create' ? 'Create Building' : 'Update Building'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuildingModal;
