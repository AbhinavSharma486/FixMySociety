import React, { useState, useEffect } from 'react';
import { User, Mail, Hash, Building2 } from 'lucide-react';
import { getAllBuildingsAdmin } from '../../lib/buildingService';

const EditResidentModal = ({ isOpen, onClose, resident, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    flatNumber: '',
    buildingName: ''
  });
  const [buildings, setBuildings] = useState([]);

  useEffect(() => {
    if (resident) {
      setFormData({
        fullName: resident.fullName || '',
        email: resident.email || '',
        flatNumber: resident.flatNumber || '',
        buildingName: resident.buildingName || ''
      });
    }
  }, [resident]);

  useEffect(() => {
    if (isOpen) {
      fetchBuildings();
    }
  }, [isOpen]);

  const fetchBuildings = async () => {
    try {
      const response = await getAllBuildingsAdmin();
      setBuildings(response.buildings);
    } catch (error) {
      console.error("Failed to fetch buildings", error);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(resident._id, formData);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <h3 className="font-bold text-lg">Edit Resident Details</h3>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <label className="input input-bordered flex items-center gap-2">
            <User className="w-4 h-4" />
            <input
              type="text"
              name="fullName"
              className="grow"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
            />
          </label>
          <label className="input input-bordered flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <input
              type="email"
              name="email"
              className="grow"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
          </label>
          <label className="input input-bordered flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <select
              name="buildingName"
              className="grow"
              value={formData.buildingName}
              onChange={handleChange}
            >
              <option value="" disabled>Select a building</option>
              {buildings.map(b => (
                <option key={b._id} value={b.buildingName}>{b.buildingName}</option>
              ))}
            </select>
          </label>
          <label className="input input-bordered flex items-center gap-2">
            <Hash className="w-4 h-4" />
            <input
              type="text"
              name="flatNumber"
              className="grow"
              placeholder="Flat Number"
              value={formData.flatNumber}
              onChange={handleChange}
            />
          </label>
          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditResidentModal;
