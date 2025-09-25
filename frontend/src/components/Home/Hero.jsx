import React, { useState } from 'react';
import { ChevronRight, Shield, Zap, Smartphone, Building, MessageCircle } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2, // Trigger when 20% of the component is in view
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        ease: 'easeOut',
        duration: 0.6,
      },
    },
  };

  return (
    <div
      ref={ref}
      className="relative bg-white text-gray-900"
    >
      {/* Background with subtle gradient and animated shapes */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-60 pointer-events-none"></div>

      {/* Floating animated blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none"></div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-25 pb-8">
        <motion.div
          className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {/* Left Side: Text and CTAs */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6">
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-6xl xl:text-6xl font-extrabold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Report & Resolve
                </span>
                <br />
                <span className="text-gray-800 block">Society Issues</span>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Effortlessly
                </span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                A seamless platform for apartment residents to report and track maintenance issues,
                ensuring a safer and more comfortable living environment.
              </p>
            </motion.div>

            {/* Trust Badges with motion */}
            <motion.div variants={itemVariants} className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 items-center">
              {[
                { icon: Shield, text: 'Secure' },
                { icon: Zap, text: 'Fast' },
                { icon: Smartphone, text: 'Mobile-friendly' }
              ].map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.2 * index + 0.8, duration: 0.5 }}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/70 backdrop-blur-sm rounded-full border border-gray-200 hover:bg-white/90 transform hover:scale-105 transition-all duration-300 shadow-sm sm:shadow-md"
                >
                  <badge.icon className="w-4 h-4 text-blue-500" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">{badge.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div variants={itemVariants} className="flex flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <button
                onClick={() => navigate("/login")}
                className="group px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-xl flex items-center justify-center space-x-2 text-sm sm:text-lg"
              >
                <span>Get Started</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-700 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-lg">
                <span>Admin Login</span>
              </button>
            </motion.div>
          </div>

          {/* Right Side: Visual Mockup */}
          <motion.div variants={itemVariants} className="relative hidden lg:block **p-8**">
            <div className="relative transform hover:scale-105 hover:rotate-2 transition-transform duration-500 ease-in-out cursor-pointer [perspective:1000px] group">
              {/* Main Card */}
              <div className="relative w-full h-[500px] bg-white rounded-3xl shadow-2xl overflow-hidden transform-style-preserve-3d transition-transform duration-700 group-hover:rotate-x-6 group-hover:rotate-y-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 opacity-70"></div>
                <div className="relative z-10 p-8 h-full flex flex-col justify-center items-center text-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  >
                    <Building className="w-24 h-24 text-blue-600 mb-4" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">Smart Dashboard</h3>
                  <p className="text-xl text-gray-600">Real-time society management</p>
                </div>
              </div>

              {/* Floating complaint card */}
              <div className="absolute -bottom-8 -right-8 w-60 p-4 bg-white rounded-2xl shadow-xl border border-gray-100 transform rotate-12 group-hover:rotate-0 transition-transform duration-500 animate-fade-in-up">
                <div className="flex items-center space-x-3 mb-2">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                  <div className="font-semibold text-gray-800">Complaint Filed</div>
                </div>
                <p className="text-sm text-gray-600">Water leakage in B-wing</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    In Progress
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;