import { ArrowLeft, Loader, Mail, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ButtonComponent from '../components/Button.jsx';
import { useDispatch } from 'react-redux';

import { forgotPassword } from "../redux/user/userSlice.js";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email");
      return;
    }

    try {
      await dispatch(forgotPassword(email));
      setIsSubmitted(true);
    } catch (error) {
      alert("Failed to send reset link");
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

      <div className="w-full max-w-xl relative z-10 min-h-screen pt-15 sm:pt-18 lg:pt-20 pb-12">
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
                  {isSubmitted ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <Mail className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                {isSubmitted ? "Check Your Email" : "Forgot Password"}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base font-medium px-2">
                {!isSubmitted ? "Enter your email to reset your password" : "We've sent you a reset link"}
              </p>
            </div>

            {/* Content Area */}
            <div className="transition-all duration-500 ease-in-out">
              {isSubmitted ? (
                <div className="text-center space-y-6 animate-fadeIn">
                  {/* Success Icon with Animation */}
                  <div className="relative inline-flex items-center justify-center w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
                    <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-4 shadow-xl transform transition-all duration-500 animate-bounce">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    {/* Success Ring Animation */}
                    <div className="absolute inset-0 border-2 border-green-400 rounded-full animate-ping opacity-75"></div>
                  </div>

                  <div className="bg-white/50 backdrop-blur-sm border border-green-200/50 rounded-2xl p-6 shadow-lg">
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                      If an account exists for{' '}
                      <span className="font-semibold text-blue-600 break-all">{email}</span>,
                      you will receive a password reset link shortly.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      {/* Focus glow effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Enhanced Submit Button */}
                  <div className="pt-2">
                    <div className="relative group/button">
                      {/* Button glow effect */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover/button:opacity-100 transition duration-500 group-hover/button:duration-200"></div>

                      <ButtonComponent
                        buttonText={isSubmitted ? <Loader className='h-5 w-5 animate-spin mx-auto' /> : "Send Reset Link"}
                        type="submit"
                        className="relative w-full"
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Back to Login Link */}
            <div className="text-center mt-8 pt-6 border-t border-gray-200/50">
              <Link
                to="/login"
                className="inline-flex items-center justify-center space-x-2 text-sm font-medium text-indigo-600 hover:text-purple-600 transition-all duration-300 hover:underline hover:underline-offset-4 relative group/link transform hover:scale-105"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover/link:-translate-x-1" />
                <span>Back to Login</span>
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 scale-x-0 transition-transform duration-300 group-hover/link:scale-x-100"></span>
              </Link>
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
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

export default ForgetPassword;