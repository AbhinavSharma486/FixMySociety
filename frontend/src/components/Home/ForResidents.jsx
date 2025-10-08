import React, { useState, useEffect } from 'react';
import { CheckCircle, ArrowRight, Bell, Zap } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";

const ForResidents = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const features = [
    'One-tap complaint creation with attachments',
    'Status tracking: Open → In Progress → Resolved',
    'Notification center for updates & notices',
    'Profile & password management',
    'Search across notices and complaints'
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        ease: 'easeOut',
        duration: 0.5,
      },
    },
  };

  return (
    <section
      ref={ref}
      className="relative py-16 md:py-24 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }}></div>
      </div>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-blue-400 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Gradient Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side: Text and Features */}
          <motion.div
            className="space-y-6 text-center lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            {/* Glowing Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-400/30 backdrop-blur-sm"
            >
              <Zap className="w-4 h-4 text-blue-400 animate-pulse" />
              <span className="text-sm font-medium text-blue-200">Next-Gen Living</span>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight"
              style={{
                textShadow: '0 0 40px rgba(59, 130, 246, 0.5), 0 0 80px rgba(147, 51, 234, 0.3)'
              }}
            >
              Everything{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
                  Residents
                </span>
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={inView ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </span>
              <br />Need
            </motion.h2>

            <motion.div
              variants={itemVariants}
              className="text-lg sm:text-xl text-blue-100/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Our intuitive app puts the power of community management in your hands, making it easy to report issues and stay informed.
            </motion.div>

            <motion.div
              className="space-y-3 mb-8 pt-6"
              variants={containerVariants}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  variants={itemVariants}
                  className="group flex items-start space-x-4 p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-blue-400/50 hover:bg-white/10 transition-all duration-300"
                  whileHover={{ x: 10, scale: 1.02 }}
                >
                  <motion.div
                    className="relative w-7 h-7 flex-shrink-0 mt-0.5"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-md opacity-70"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>
                  <span className="text-base sm:text-lg text-white/90 group-hover:text-white transition-colors">
                    {feature}
                  </span>
                  <motion.div
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: -10 }}
                    whileHover={{ x: 0 }}
                  >
                    <ArrowRight className="w-5 h-5 text-blue-400" />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                className="group relative px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/50 flex items-center justify-center space-x-3 mx-auto lg:mx-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative text-lg sm:text-xl font-bold z-10">Join Your Society</span>
                <ArrowRight className="relative w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform duration-300 z-10" />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right Side: 3D Holographic Card (Hidden on Mobile/Tablet) */}
          <div className="hidden lg:block relative perspective-1000">
            <motion.div
              initial={{ rotateY: -90, opacity: 0, z: -100 }}
              animate={inView ? { rotateY: 0, opacity: 1, z: 0 } : {}}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
              className="relative transform-gpu"
              style={{
                transform: `rotateX(${(mousePosition.y - 50) * 0.1}deg) rotateY(${(mousePosition.x - 50) * 0.1}deg)`,
                transition: 'transform 0.3s ease-out'
              }}
            >
              {/* Holographic Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-30 blur-2xl animate-pulse"></div>

              {/* Main Card */}
              <div className="relative w-full h-[500px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl p-1 overflow-hidden border border-white/20">
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50 animate-spin-slow"></div>
                  <div className="absolute inset-[1px] bg-slate-900 rounded-3xl"></div>
                </div>

                {/* Card Content */}
                <div className="relative z-10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-[22px] h-full p-8 border border-white/10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-2 h-2 bg-green-400 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [1, 0.5, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                        My Complaints
                      </h3>
                    </div>
                    <motion.div
                      className="px-3 py-1 rounded-full bg-green-500/20 border border-green-400/50"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-xs font-semibold text-green-400">Live</span>
                    </motion.div>
                  </div>

                  <div className="space-y-4">
                    {['Water leak in bathroom', 'Elevator not working', 'Parking issue'].map((complaint, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20, rotateX: -90 }}
                        animate={inView ? { opacity: 1, x: 0, rotateX: 0 } : {}}
                        transition={{ delay: 1 + index * 0.2, duration: 0.6 }}
                        className="group relative"
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-purple-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>

                        <div className="relative flex items-center justify-between p-4 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-xl border border-white/10 group-hover:border-blue-400/50 transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                            <span className="text-white/90 font-medium">{complaint}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.div
                              className="w-2 h-2 bg-green-400 rounded-full"
                              animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.5, 1, 0.5],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: index * 0.3,
                              }}
                            />
                            <span className="text-xs text-green-400 font-semibold px-2 py-1 rounded-full bg-green-400/10">
                              In Progress
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Stats Bar */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 1.8, duration: 0.6 }}
                    className="mt-8 pt-6 border-t border-white/10"
                  >
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Active', value: '3', color: 'blue' },
                        { label: 'Resolved', value: '12', color: 'green' },
                        { label: 'Total', value: '15', color: 'purple' }
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          className={`text-center p-3 rounded-lg bg-${stat.color}-500/10 border border-${stat.color}-400/30`}
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</div>
                          <div className="text-xs text-white/60 mt-1">{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Floating Notification Bell */}
              <motion.div
                initial={{ scale: 0, opacity: 0, y: 50, rotateZ: -180 }}
                animate={inView ? { scale: 1, opacity: 1, y: 0, rotateZ: 0 } : {}}
                transition={{ duration: 0.8, delay: 1.8, ease: 'easeOut' }}
                className="absolute -bottom-10 -right-10 w-36 h-36"
                whileHover={{ scale: 1.1, rotateZ: 15 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-2xl opacity-60 animate-pulse"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
                  <motion.div
                    animate={{
                      rotate: [0, -15, 15, -15, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <Bell className="w-14 h-14 text-white" />
                  </motion.div>
                  {/* Notification Badge */}
                  <motion.div
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-slate-900"
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                  >
                    3
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </section>
  );
};

export default ForResidents;