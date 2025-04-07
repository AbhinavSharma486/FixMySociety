import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail } from '../redux/user/userSlice.js';

const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.user);

  const handleChange = (index, value) => {
    const newCode = [...code];

    // Handle Pasted content
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");

      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);

      // Focus on the Last non-empty input or the first empty one
      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex]?.focus();
    } else {
      newCode[index] = value;
      setCode(newCode);

      // Move focus to the next input field if value is entered
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const verificationCode = code.join("");

    if (verificationCode.length === 6) {
      try {
        dispatch(verifyEmail(verificationCode, navigate));
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Auto submit the form when all inputs are filled
  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit(new Event("submit"));
    }
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-100">
      <div className="w-full max-w-md shadow-2xl rounded-4xl md:rounded-2xl overflow-hidden bg-base-300">
        <div className="px-4 py-8 sm:px-8 sm:py-10">

          {/* Logo */}
          <div className="text-center mb-6">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Verify Your Email
              </h1>
              <p className="text-sm sm:text-base mt-2">
                Enter the 6-digit code sent to email address
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>

            {/* Code Input Fields */}
            <div className="flex justify-center gap-2 sm:gap-3 mt-5">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold border border-gray-300 dark:border-gray-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 focus:outline-none transition"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Submit Button */}
            <div className='pt-2'>
              <button
                type="submit"
                className="w-full py-3 px-4 text-white font-bold rounded-4xl focus:outline-none transition-all bg-gradient-to-r from-[#1A2980] via-[#26D0CE] to-[#1A2980] bg-[length:200%_auto] hover:bg-right shadow-lg cursor-pointer"
              >
                {loading ? "Verifying..." : "Verify Email"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;