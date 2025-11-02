import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Eye, EyeOff, Lock, Mail, Sparkles, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";

import { login } from '../redux/user/userSlice.js';
import ButtonComponent from '../components/Button.jsx';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
    })),
    []
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggingIn, currentUser } = useSelector((state) => state.user);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      navigate("/main");
    }
  }, [currentUser, navigate]);

  // Optimized mouse tracking with requestAnimationFrame
  const handleMouseMove = useCallback((e) => {
    mousePositionRef.current = {
      x: (e.clientX / window.innerWidth - 0.5) * 20,
      y: (e.clientY / window.innerHeight - 0.5) * 20,
    };

    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      setMousePosition(mousePositionRef.current);
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleMouseMove]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please fill in all fields");
      return;
    }

    dispatch(login(formData, navigate));
  }, [formData, dispatch, navigate]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden pt-16 xs:pt-17 sm:pt-18 lg:pt-20 xl:pt-24">

      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite',
          willChange: 'transform'
        }}></div>
      </div>

      {/* Holographic Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4), rgba(168, 85, 247, 0.2), transparent)',
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            transition: 'transform 0.2s ease-out',
            willChange: 'transform'
          }}
        ></div>
        <div
          className="absolute bottom-20 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4), rgba(99, 102, 241, 0.2), transparent)',
            animationDelay: '1s',
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
            transition: 'transform 0.2s ease-out',
            willChange: 'transform'
          }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-72 h-72 rounded-full blur-3xl opacity-25 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.5), rgba(236, 72, 153, 0.2), transparent)',
            animationDelay: '2s',
            transform: `translate(-50%, -50%) translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
            transition: 'transform 0.3s ease-out',
            willChange: 'transform'
          }}
        ></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-60"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animation: `float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
              willChange: 'transform',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          ></div>
        ))}
      </div>

      {/* Scan Lines Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(99, 102, 241, 0.1) 2px, rgba(99, 102, 241, 0.1) 4px)',
          animation: 'scanlines 8s linear infinite',
          willChange: 'transform'
        }}></div>
      </div>

      <div className="w-full max-w-xl relative z-10 py-8">

        {/* Main Login Card */}
        <div className="w-full relative group/card">

          {/* Holographic Border Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl blur-lg opacity-50 group-hover/card:opacity-75 transition-all duration-500 animate-pulse" style={{ willChange: 'opacity' }}></div>

          {/* Card Container */}
          <div className="relative bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden"
            style={{
              boxShadow: '0 0 60px rgba(99, 102, 241, 0.3), inset 0 0 60px rgba(99, 102, 241, 0.05)',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}>

            {/* Animated Top Border */}
            <div className="h-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-shimmer" style={{ willChange: 'transform' }}></div>
            </div>

            {/* Holographic Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-pink-500/5 pointer-events-none"></div>

            <div className="px-8 py-10 sm:px-10 sm:py-12 relative">

              {/* Logo & Welcome Section */}
              <div className="text-center mb-8 space-y-4">

                {/* 3D Floating Icon */}
                <div className="relative inline-flex items-center justify-center mb-4">
                  {/* Outer Glow Rings */}
                  <div className="absolute inset-0 animate-ping opacity-20" style={{ willChange: 'opacity' }}>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 blur-xl"></div>
                  </div>
                  <div className="absolute inset-0 animate-pulse" style={{ willChange: 'opacity' }}>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 blur-lg opacity-50"></div>
                  </div>

                  {/* Main Icon Container */}
                  <div className="relative w-20 h-20 group/icon">
                    {/* 3D Shadow Layer */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/50 to-purple-600/50 rounded-2xl transform rotate-6 blur-md" style={{ willChange: 'transform' }}></div>

                    {/* Icon Background */}
                    <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-4 shadow-2xl transform transition-all duration-500 group-hover/icon:scale-110 group-hover/icon:rotate-12"
                      style={{
                        boxShadow: '0 10px 40px rgba(99, 102, 241, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.2)',
                        willChange: 'transform',
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden'
                      }}>
                      <ShieldCheck className="w-12 h-12 text-white drop-shadow-lg" />

                      {/* Sparkle Effect */}
                      <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" style={{ willChange: 'opacity' }} />
                    </div>
                  </div>
                </div>

                {/* Title with Holographic Effect */}
                <div className="relative">
                  <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight tracking-tight"
                    style={{
                      textShadow: '0 0 30px rgba(99, 102, 241, 0.5)'
                    }}>
                    Welcome Back
                  </h1>
                  {/* Glitch Underline */}
                  <div className="h-1 w-32 mx-auto mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full opacity-50 animate-pulse" style={{ willChange: 'opacity' }}></div>
                </div>

                <p className="text-gray-300 text-sm sm:text-base font-medium tracking-wide">
                  Secure access to your account
                </p>
              </div>

              {/* Enhanced Form */}
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Email Field */}
                <div className="space-y-2 group/field">
                  <label htmlFor="email" className="block text-sm font-bold text-gray-300 uppercase tracking-wider transition-all duration-300 group-focus-within/field:text-indigo-400">
                    <span className="flex items-center gap-2">
                      Email Address
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{ willChange: 'opacity' }}></span>
                    </span>
                  </label>
                  <div className="relative group/input">
                    {/* Input Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl opacity-0 group-focus-within/input:opacity-50 blur transition-all duration-300" style={{ willChange: 'opacity' }}></div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <Mail className="h-5 w-5 text-indigo-400 transition-all duration-300 group-focus-within/input:text-indigo-300 group-focus-within/input:scale-110 drop-shadow-lg" style={{ willChange: 'transform' }} />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="relative w-full py-4 pl-12 pr-4 bg-gray-800/50 border border-white/10 rounded-2xl focus:outline-none focus:border-indigo-500/50 text-white placeholder-gray-500 text-sm sm:text-base transition-all duration-300 backdrop-blur-xl"
                        style={{
                          boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.3)',
                          backfaceVisibility: 'hidden'
                        }}
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                      {/* Animated Border on Focus */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{
                          background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.3))',
                          backgroundSize: '200% 100%',
                          animation: 'borderMove 2s ease infinite',
                          WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          WebkitMaskComposite: 'xor',
                          maskComposite: 'exclude',
                          padding: '1px',
                          willChange: 'opacity'
                        }}></div>
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2 group/field">
                  <label htmlFor="password" className="block text-sm font-bold text-gray-300 uppercase tracking-wider transition-all duration-300 group-focus-within/field:text-purple-400">
                    <span className="flex items-center gap-2">
                      Password
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ willChange: 'opacity' }}></span>
                    </span>
                  </label>
                  <div className="relative group/input">
                    {/* Input Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-focus-within/input:opacity-50 blur transition-all duration-300" style={{ willChange: 'opacity' }}></div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <Lock className="h-5 w-5 text-purple-400 transition-all duration-300 group-focus-within/input:text-purple-300 group-focus-within/input:scale-110 drop-shadow-lg" style={{ willChange: 'transform' }} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        className="relative w-full py-4 pl-12 pr-14 bg-gray-800/50 border border-white/10 rounded-2xl focus:outline-none focus:border-purple-500/50 text-white placeholder-gray-500 text-sm sm:text-base transition-all duration-300 backdrop-blur-xl"
                        style={{
                          boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.3)',
                          backfaceVisibility: 'hidden'
                        }}
                        placeholder="••••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 group/btn"
                        onClick={togglePasswordVisibility}
                        aria-label="Toggle Password Visibility"
                      >
                        <div className="p-2 rounded-lg transition-all duration-300 hover:bg-purple-500/20 backdrop-blur-xl border border-transparent hover:border-purple-500/30">
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-purple-400 transition-all duration-300 group-hover/btn:scale-110 group-hover/btn:text-purple-300" style={{ willChange: 'transform' }} />
                          ) : (
                            <Eye className="h-5 w-5 text-purple-400 transition-all duration-300 group-hover/btn:scale-110 group-hover/btn:text-purple-300" style={{ willChange: 'transform' }} />
                          )}
                        </div>
                      </button>
                      {/* Animated Border on Focus */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{
                          background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.3), rgba(168, 85, 247, 0.3))',
                          backgroundSize: '200% 100%',
                          animation: 'borderMove 2s ease infinite',
                          WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          WebkitMaskComposite: 'xor',
                          maskComposite: 'exclude',
                          padding: '1px',
                          willChange: 'opacity'
                        }}></div>
                    </div>
                  </div>

                </div>

                {/* Enhanced Login Button */}
                <div className="pt-4">
                  <div className="relative group/button">
                    {/* Button glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl blur-lg opacity-50 group-hover/button:opacity-100 transition-all duration-500 animate-pulse" style={{ willChange: 'opacity' }}></div>

                    <ButtonComponent
                      buttonText={isLoggingIn ? "Logging In..." : "Login"}
                      type="submit"
                      className="relative w-full"
                    />
                  </div>
                </div>

              </form>

              {/* Bottom Decoration */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center justify-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{
                          animation: `pulse 2s ease-in-out infinite`,
                          animationDelay: `${i * 0.2}s`,
                          opacity: 0.6,
                          willChange: 'opacity'
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoggingIn && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md rounded-3xl flex items-center justify-center z-50 transition-all duration-300" style={{ willChange: 'opacity' }}>
            <div className="relative">
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-2xl opacity-50 animate-pulse" style={{ willChange: 'opacity' }}></div>

              {/* Loading Card */}
              <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-2xl rounded-2xl p-8 shadow-2xl border border-white/10" style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}>
                <div className="flex flex-col items-center space-y-4">
                  {/* Spinner */}
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500 animate-spin" style={{ willChange: 'transform' }}></div>
                    <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 border-r-pink-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s', willChange: 'transform' }}></div>
                  </div>
                  <span className="text-gray-200 font-bold text-lg tracking-wide">Authenticating...</span>
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s`, willChange: 'transform' }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-15px) translateX(5px); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(10px); }
        }
        
        @keyframes borderMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-600 { animation-delay: 0.6s; }
      `}</style>
    </div>
  );
};

export default LoginPage;