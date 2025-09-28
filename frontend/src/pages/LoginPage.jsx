import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ButtonComponent from '../components/Button.jsx';
import { useSelector, useDispatch } from "react-redux";
import { login } from '../redux/user/userSlice.js';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggingIn, currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    if (currentUser) {
      navigate("/main");
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please fill in all fields");
      return;
    }

    dispatch(login(formData, navigate));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-2xl animate-ping animation-delay-1000"></div>
      </div>

      <div className="w-full max-w-xl relative z-10 min-h-screen pt-15 sm:pt-18 lg:pt-20 pb-12">
        {/* Main Login Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden transform transition-all duration-500 hover:shadow-3xl hover:scale-[1.02] group">

          {/* Glowing Top Border */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse"></div>

          <div className="px-8 py-10 sm:px-10 sm:py-12">

            {/* Logo & Welcome Section */}
            <div className="text-center mb-8 space-y-3">
              {/* Floating Icon */}
              <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-20 blur-lg animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-3 shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                Welcome Back
              </h1>
              <p className="text-gray-600 text-sm sm:text-base font-medium">
                Log in to your account
              </p>
            </div>

            {/* Enhanced Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Email Field */}
              <div className="space-y-2 group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-blue-600">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-blue-500 transition-all duration-300 group-focus-within:text-blue-600 group-focus-within:scale-110" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full py-4 pl-12 pr-4 bg-white/50 border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/80 text-gray-900 placeholder-gray-400 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md hover:bg-white/70"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  {/* Focus glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 pointer-events-none"></div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2 group">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-purple-600">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-500 transition-all duration-300 group-focus-within:text-purple-600 group-focus-within:scale-110" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className="w-full py-4 pl-12 pr-14 bg-white/50 border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-white/80 text-gray-900 placeholder-gray-400 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md hover:bg-white/70"
                    placeholder="••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center group/btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle Password Visibility"
                  >
                    <div className="p-1 rounded-lg transition-all duration-200 hover:bg-purple-100 group-focus-within/btn:bg-purple-100">
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-purple-600 transition-transform duration-200 group-hover/btn:scale-110" />
                      ) : (
                        <Eye className="h-5 w-5 text-purple-600 transition-transform duration-200 group-hover/btn:scale-110" />
                      )}
                    </div>
                  </button>
                  {/* Focus glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 pointer-events-none"></div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end mt-3">
                  <Link
                    to="/forget-password"
                    className="text-sm font-medium text-indigo-600 hover:text-purple-600 transition-all duration-300 hover:underline hover:underline-offset-4 relative group/link"
                  >
                    Forgot Password?
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 scale-x-0 transition-transform duration-300 group-hover/link:scale-x-100"></span>
                  </Link>
                </div>
              </div>

              {/* Enhanced Login Button */}
              <div className="pt-2">
                <div className="relative group/button">
                  {/* Button glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover/button:opacity-100 transition duration-500 group-hover/button:duration-200"></div>

                  <ButtonComponent
                    buttonText={isLoggingIn ? "Logging In..." : "Login"}
                    type="submit"
                    className="relative w-full"
                  />
                </div>
              </div>

            </form>

            {/* Bottom Decoration */}
            <div className="mt-8 pt-6 border-t border-gray-200/50">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse animation-delay-300"></div>
                <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full animate-pulse animation-delay-600"></div>
              </div>
            </div>

          </div>
        </div>

        {/* Loading Overlay */}
        {isLoggingIn && (
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center z-50 transition-all duration-300">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-gray-700 font-medium">Signing you in...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;