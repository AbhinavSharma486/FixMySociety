import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-100">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl bg-base-300 drop-shadow-2xl rounded-3xl sm:rounded-4xl overflow-hidden">

        <div className="px-6 py-8">
          {/* Logo & Welcome */}
          <div className="text-center mb-4 sm:mb-6">
            <ShieldCheck className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mb-2" />
            <h1 className="text-2xl sm:text-3xl font-bold">
              Admin Login
            </h1>
            <p className="mt-2 text-sm sm:text-base">
              Enter your credentials to access the admin panel.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

            {/* Email */}
            <div className="space-y-1 sm:space-y-2">
              <label htmlFor="email" className="block text-sm sm:text-base font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full py-2 px-9 sm:px-10 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1 sm:space-y-2">
              <label htmlFor="password" className="block text-sm sm:text-base font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="w-full py-2 px-9 sm:px-10 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>

              <div className="flex justify-start mt-2 sm:mt-3">
                <Link
                  to="/forget-password"
                  className="text-xs sm:text-sm link link-hover link-primary"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <ButtonComponent
                buttonText={isLoggingIn ? "Logging In..." : "Admin Login"}
                type="submit"
              />
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;