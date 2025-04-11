import { ArrowLeft, Loader, Mail } from 'lucide-react';
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
      toast.error("Please enter your email");
      return;
    }

    try {
      await dispatch(forgotPassword(email));
      setIsSubmitted(true);
    } catch (error) {
      toast.error("Failed to send reset link");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-100">
      <div className="w-full max-w-md bg-base-300 drop-shadow-2xl rounded-4xl overflow-hidden">
        <div className="px-6 py-8">

          {/* Logo & Welcome */}
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold">
              Forgot Password
            </h1>
            <p className="mt-2">
              {!isSubmitted ? "Enter your email to reset your password" : "Check your email"}
            </p>
          </div>

          {
            isSubmitted ? (
              <div className="text-center space-y-5">
                <div className='w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Mail className='h-8 w-8 text-white' />
                </div>
                <p className='mb-6'>
                  If an account exists for {email}, you will receive a password reset link shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full py-2 px-10 border border-gray-300 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="you@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <ButtonComponent
                  buttonText={isSubmitted ? <Loader className='h-5 w-5 animate-spin mx-auto' /> : "Send Reset Link"}
                  type="submit"
                />
              </form>
            )
          }

          {/* Back to Login Link */}
          <div className="text-center mt-6">
            <Link
              to="/login"
              className="text-sm text-blue-500 hover:underline flex items-center justify-center"
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;