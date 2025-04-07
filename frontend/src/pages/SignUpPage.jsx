import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Home, Building, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ButtonComponent from '../componenets/Button';
import { signup } from "../redux/user/userSlice.js";
import { useSelector, useDispatch } from 'react-redux';

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    buildingName: '',
    flatNumber: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isSignInUp = useSelector((state) => state.user.isSignInUp);

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Invalid email format');
      return false;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (!formData.buildingName) {
      toast.error('Building name is required');
      return false;
    }
    if (!formData.flatNumber) {
      toast.error('Flat number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success === true) {
      dispatch(signup(formData, navigate));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 mt-15 bg-base-100">
      <div className="w-full max-w-md bg-base-300 drop-shadow-2xl rounded-4xl overflow-hidden md:max-w-md lg:max-w-lg">
        <div className="px-6 py-8">

          {/* Logo */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-2 group">
              <h1 className="text-3xl font-bold text-base-content">
                Create Account
              </h1>
              <p className="text-base-content/70 mt-2">
                Get started with your free account
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div className="space-y-2">
              <label
                htmlFor="fullName"
                className="block text-sm font-medium"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className="w-full py-2 px-10 border border-gray-300 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full py-2 px-10 border border-gray-300 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="w-full py-2 px-10 border border-gray-300 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Building Name */}
            <div className="space-y-2">
              <label
                htmlFor="buildingName"
                className="block text-sm font-medium"
              >
                Building Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Home className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  id="buildingName"
                  name="buildingName"
                  className="w-full py-2 px-10 border border-gray-300 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 "
                  placeholder="Select Building Name"
                  list="buildings"
                  value={formData.buildingName}
                  onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
                />
                <datalist id="buildings">
                  <option value="Raheja Exotica" />
                  <option value="Amrapali Sapphire" />
                  <option value="Ashirwad" />
                  <option value="Govind Dham" />
                  <option value="Radha Nivas" />
                  <option value="Swarn Bhavan" />
                  <option value="Dwarka" />
                </datalist>
              </div>
            </div>

            {/* Flat Number */}
            <div className="space-y-2">
              <label
                htmlFor="flatNumber"
                className="block text-sm font-medium"
              >
                Flat Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  id="flatNumber"
                  name="flatNumber"
                  className="w-full py-2 px-10 border border-gray-300 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Flat Number"
                  min="1"
                  max="50"
                  value={formData.flatNumber}
                  onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value })}
                />
              </div>
            </div>

            {/* Create Button */}
            <ButtonComponent
              buttonText={
                isSignInUp ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin size-5" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  "Create Account"
                )
              }
            />
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;