import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ButtonComponent from '../../components/Button.jsx';
import { useSelector, useDispatch } from "react-redux";
import { login } from "../../redux/admin/adminSlice.js";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggingIn, admin } = useSelector((state) => state.admin);

  useEffect(() => {
    if (admin) {
      navigate("/admin-dashboard");
    }
  }, [admin, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please fill in all fields"); // Basic validation
      return;
    }

    dispatch(login(formData, navigate));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20 md:pt-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl border border-indigo-100 shadow-2xl rounded-4xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Illustration Panel (Left on desktop) */}
          <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
            <div className="text-center">
              <img src="/building-icon.svg" alt="Login Illustration" className="mx-auto w-44 h-44 md:w-56 md:h-56" />
              <p className="mt-4 text-sm text-gray-600 px-4">Welcome back to FixMySociety. Securely access your account.</p>
            </div>
          </div>

          {/* Form Panel (Right on desktop) */}
          <div className="px-6 py-8">
            {/* Logo & Welcome */}
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Login
              </h1>
              <p className="mt-2 text-gray-600">
                Enter your credentials to access the admin panel.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full py-2 px-10 border border-gray-300 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                    placeholder="you@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className="w-full py-2 px-10 border border-gray-300 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 text-sm sm:text-base"
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
                    {showPassword ? <EyeOff className="h-5 w-5 text-purple-600" /> : <Eye className="h-5 w-5 text-purple-600" />}
                  </button>
                </div>

                <div className="flex justify-start mt-3">
                  <Link
                    to="/forget-password"
                    className="text-sm text-indigo-600 hover:text-purple-600 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Login Button */}
              <ButtonComponent
                buttonText={isLoggingIn ? "Logging In..." : "Admin Login"}
                type="submit"
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;