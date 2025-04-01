import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ButtonComponent from '../componenets/Button.jsx';
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
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please fill in all fields"); // Basic validation
      return;
    }

    dispatch(login(formData, navigate));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-4xl overflow-hidden">
        <div className="px-6 py-8">

          {/* Logo & Welcome */}
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Log in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full py-2 pl-10 pr-3 border border-gray-300 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300"
                  placeholder="you@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="w-full py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <ButtonComponent
              buttonText={isLoggingIn ? "Logging In..." : "Login"} type="submit"
            />

          </form>

          {/* Signup Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don’t have an account?{" "}
              <Link to="/signup" className="text-blue-500 hover:underline">
                Create Account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
