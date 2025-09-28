import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Shield } from "lucide-react";
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import ButtonComponent from '../components/Button.jsx';
import { resetPassword } from '../redux/user/userSlice.js';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token } = useParams();
  const cleanToken = token.replace(/}$/, '');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    try {
      dispatch(resetPassword(cleanToken, password, navigate));
    } catch (error) {
      toast.error("Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-2xl animate-ping animation-delay-1000"></div>
      </div>

      <div className="w-full max-w-xl relative z-10">
        {/* Main Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden transform transition-all duration-500 hover:shadow-3xl hover:scale-[1.02] group">

          {/* Glowing Top Border */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse"></div>

          <div className="px-8 py-10 sm:px-10 sm:py-12">

            {/* Header Section */}
            <div className="text-center mb-8 space-y-3">
              {/* Floating Icon */}
              <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-20 blur-lg animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-3 shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                Reset Password
              </h1>
              <p className="text-gray-600 text-sm sm:text-base font-medium px-2">
                Enter your new password below
              </p>
            </div>

            {/* Enhanced Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* New Password Field */}
              <div className="space-y-2 group">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-blue-600">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-500 transition-all duration-300 group-focus-within:text-blue-600 group-focus-within:scale-110" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="w-full py-4 pl-12 pr-14 bg-white/50 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/80 text-gray-900 placeholder-gray-400 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md hover:bg-white/70"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center group/btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle Password Visibility"
                  >
                    <div className="p-1 rounded-lg transition-all duration-200 hover:bg-blue-100 group-focus-within/btn:bg-blue-100">
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-blue-600 transition-transform duration-200 group-hover/btn:scale-110" />
                      ) : (
                        <Eye className="h-5 w-5 text-blue-600 transition-transform duration-200 group-hover/btn:scale-110" />
                      )}
                    </div>
                  </button>
                  {/* Focus glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 pointer-events-none"></div>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2 group">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-purple-600">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-500 transition-all duration-300 group-focus-within:text-purple-600 group-focus-within:scale-110" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className="w-full py-4 pl-12 pr-14 bg-white/50 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-white/80 text-gray-900 placeholder-gray-400 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md hover:bg-white/70"
                    placeholder="••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center group/btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle Confirm Password Visibility"
                  >
                    <div className="p-1 rounded-lg transition-all duration-200 hover:bg-purple-100 group-focus-within/btn:bg-purple-100">
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-purple-600 transition-transform duration-200 group-hover/btn:scale-110" />
                      ) : (
                        <Eye className="h-5 w-5 text-purple-600 transition-transform duration-200 group-hover/btn:scale-110" />
                      )}
                    </div>
                  </button>
                  {/* Focus glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 pointer-events-none"></div>
                </div>
              </div>

              {/* Password Strength Indicator */}
              <div className="bg-white/30 backdrop-blur-sm border border-gray-200/40 rounded-xl p-4 space-y-2">
                <p className="text-xs font-medium text-gray-600 mb-2">Password Requirements:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center space-x-2 ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'} transition-colors duration-300`}></div>
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${password === confirmPassword && password.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${password === confirmPassword && password.length > 0 ? 'bg-green-500' : 'bg-gray-300'} transition-colors duration-300`}></div>
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Submit Button */}
              <div className="pt-2">
                <div className="relative group/button">
                  {/* Button glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover/button:opacity-100 transition duration-500 group-hover/button:duration-200"></div>

                  <ButtonComponent
                    buttonText="Set New Password"
                    type="submit"
                    className="relative w-full"
                  />
                </div>
              </div>

            </form>

            {/* Security Note */}
            <div className="mt-8 pt-6 border-t border-gray-200/50">
              <div className="bg-blue-50/50 border border-blue-200/30 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-blue-800 mb-1">Security Note</p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Your password will be encrypted and stored securely. Make sure to choose a strong, unique password.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Decoration */}
            <div className="mt-6 pt-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse animation-delay-300"></div>
                <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full animate-pulse animation-delay-600"></div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        .animation-delay-600 {
          animation-delay: 600ms;
        }
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
      `}</style>
    </div>
  );
};

export default ResetPasswordPage;