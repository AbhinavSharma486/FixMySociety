import React, { useState, useEffect } from 'react';
import { X, User, Mail, Home, Hash, PlusCircle, Eye, EyeOff } from 'lucide-react';
import ButtonComponent from '../../components/Button';
import { useSelector } from 'react-redux';

const AddResidentModal = ({ isOpen, onClose, buildingId, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    flatNumber: '',
    password: '', // Initial password for new resident
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const { isAddingResident } = useSelector((state) => state.admin); // Assuming a state for loading

  useEffect(() => {
    if (!isOpen) {
      setFormData({ // Reset form when modal closes
        fullName: '',
        email: '',
        flatNumber: '',
        password: '',
      });
      setErrors({});
      setShowPassword(false); // Reset password visibility
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.flatNumber) newErrors.flatNumber = 'Flat Number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ ...formData, buildingId }); // Pass buildingId with new resident data
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
      <div className="bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl w-full max-w-md p-6 relative">
        <button
          className="btn btn-sm btn-circle absolute right-3 top-3"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-2xl font-bold text-white mb-4">Add New Resident</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="label"><span className="label-text text-gray-300">Full Name</span></label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full py-2 px-10 border border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 text-sm sm:text-base bg-gray-800 ${errors.fullName ? 'input-error' : ''}`}
                placeholder="John Doe"
                style={{ WebkitBoxShadow: "0 0 0 1000px #1a202c inset !important", WebkitTextFillColor: 'white !important' }}
              />
            </div>
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="email" className="label"><span className="label-text text-gray-300">Email</span></label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full py-2 px-10 border border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 text-sm sm:text-base bg-gray-800 ${errors.email ? 'input-error' : ''}`}
                placeholder="john.doe@example.com"
                style={{ WebkitBoxShadow: "0 0 0 1000px #1a202c inset !important", WebkitTextFillColor: 'white !important' }}
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="flatNumber" className="label"><span className="label-text text-gray-300">Flat Number</span></label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                id="flatNumber"
                name="flatNumber"
                value={formData.flatNumber}
                onChange={handleChange}
                className={`w-full py-2 px-10 border border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 text-sm sm:text-base bg-gray-800 ${errors.flatNumber ? 'input-error' : ''}`}
                placeholder="A-101"
                style={{ WebkitBoxShadow: "0 0 0 1000px #1a202c inset !important", WebkitTextFillColor: 'white !important' }}
              />
            </div>
            {errors.flatNumber && <p className="text-red-500 text-sm mt-1">{errors.flatNumber}</p>}
          </div>

          <div>
            <label htmlFor="password" className="label"><span className="label-text text-gray-300">Password (initial)</span></label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full py-2 px-10 border border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 text-sm sm:text-base bg-gray-800 ${errors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
                style={{ WebkitBoxShadow: "0 0 0 1000px #1a202c inset !important", WebkitTextFillColor: 'white !important' }}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle Password Visibility"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <ButtonComponent
            buttonText={isAddingResident ? "Adding Resident..." : "Add Resident"}
            type="submit"
            icon={<PlusCircle className="w-5 h-5" />}
            loading={isAddingResident}
          />
        </form>
      </div>
    </div>
  );
};

export default AddResidentModal;
