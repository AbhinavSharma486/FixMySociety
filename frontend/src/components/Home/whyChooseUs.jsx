import React, { useState, useMemo, useCallback } from 'react';
import { Shield, Zap, MessageCircle, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';

const WhyChooseUs = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const features = useMemo(() => [
    {
      icon: Zap,
      title: 'Fast Complaints',
      description: 'Raise issues in seconds with photos/videos. Track status live.',
      color: 'from-blue-500 to-blue-600',
      glowColor: 'rgba(59, 130, 246, 0.5)',
      id: 'fast-complaints'
    },
    {
      icon: MessageCircle,
      title: 'Transparent Communication',
      description: 'Real-time announcements and notifications.',
      color: 'from-green-500 to-green-600',
      glowColor: 'rgba(34, 197, 94, 0.5)',
      id: 'transparent-communication'
    },
    {
      icon: BarChart3,
      title: 'Powerful Admin Tools',
      description: 'Manage buildings, monitor analytics, resolve faster.',
      color: 'from-purple-500 to-purple-600',
      glowColor: 'rgba(168, 85, 247, 0.5)',
      id: 'powerful-admin-tools'
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Role-based access, secure cookies, verified users.',
      color: 'from-red-500 to-red-600',
      glowColor: 'rgba(239, 68, 68, 0.5)',
      id: 'safe-secure'
    }
  ], []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleNext = useCallback(() => {
    if (currentIndex < features.length - 1) {
      setDirection(1);
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
  }, [currentIndex, features.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  }, [currentIndex]);

  const handleMouseEnter = useCallback((index) => {
    setHoveredCard(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredCard(null);
  }, []);

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { y: 60, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: 0.8,
      },
    },
  }), []);

  const slideVariants = useMemo(() => ({
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 45 : -45,
    }),
  }), []);

  const butterySpringTransition = useMemo(() => ({
    type: 'spring',
    stiffness: 120,
    damping: 15,
    mass: 1,
    restDelta: 0.001
  }), []);

  const iconRotateTransition = useMemo(() => ({
    type: 'spring',
    stiffness: 100,
    damping: 20,
  }), []);

  return (
    <section ref={ref} className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none will-change-transform">
        <div className="absolute inset-0 bg-grid-pattern"></div>
      </div>

      {/* Floating Orbs - Using transform for GPU acceleration */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse pointer-events-none will-change-transform"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse pointer-events-none will-change-transform" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-green-500 rounded-full blur-3xl opacity-10 animate-pulse pointer-events-none will-change-transform" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <motion.div
          className="text-center mb-16 md:mb-24"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, type: 'spring', stiffness: 50 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-block mb-4"
          >
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 text-sm font-semibold tracking-wider backdrop-blur-sm">
              NEXT-GEN PLATFORM
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 leading-tight">
            Why Choose{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                Fix My Society
              </span>
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ delay: 0.8, duration: 0.8 }}
              ></motion.div>
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Experience revolutionary society management with cutting-edge technology designed for the future of community living.
          </p>
        </motion.div>

        {/* Mobile/Tablet Card Navigation */}
        <div className="md:hidden flex flex-col items-center">
          <div className="relative w-full max-w-sm mx-auto h-[320px] flex items-center justify-center perspective-1000">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                variants={slideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3 },
                  rotateY: { duration: 0.5 }
                }}
                className="absolute w-full will-change-transform"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="relative group">
                  {/* Glow Effect */}
                  <div
                    className="absolute -inset-1 opacity-75 blur-xl group-hover:opacity-100 transition duration-500 pointer-events-none will-change-transform"
                    style={{
                      background: `linear-gradient(135deg, ${features[currentIndex].glowColor}, transparent)`
                    }}
                  ></div>

                  {/* Card */}
                  <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
                    {/* Holographic Overlay */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none"></div>

                    {/* Icon Container */}
                    <motion.div
                      className={`relative w-20 h-20 bg-gradient-to-br ${features[currentIndex].color} rounded-2xl flex items-center justify-center mb-6 shadow-lg will-change-transform`}
                      animate={{
                        rotateY: [0, 360],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div
                        className="absolute inset-0 rounded-2xl blur-md opacity-60 pointer-events-none"
                        style={{ background: `linear-gradient(135deg, ${features[currentIndex].glowColor}, transparent)` }}
                      ></div>
                      {React.createElement(features[currentIndex].icon, { className: "w-10 h-10 text-white relative z-10" })}
                    </motion.div>

                    <h3 className="text-2xl font-bold text-white mb-3 relative z-10">
                      {features[currentIndex].title}
                    </h3>
                    <p className="text-base text-slate-300 leading-relaxed relative z-10">
                      {features[currentIndex].description}
                    </p>

                    {/* Corner Accents */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-tr-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-bl-3xl pointer-events-none"></div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center items-center mt-12 space-x-6">
            <motion.button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="relative w-12 h-12 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700/50 backdrop-blur-sm overflow-hidden group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <ChevronLeft className="w-6 h-6 relative z-10" />
            </motion.button>

            <div className="flex items-center space-x-2">
              {features.map((_, index) => (
                <motion.div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                    ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-500'
                    : 'w-2 bg-slate-700'
                    }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                ></motion.div>
              ))}
            </div>

            <motion.button
              onClick={handleNext}
              disabled={currentIndex === features.length - 1}
              className="relative w-12 h-12 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700/50 backdrop-blur-sm overflow-hidden group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <ChevronRight className="w-6 h-6 relative z-10" />
            </motion.button>
          </div>
        </div>

        {/* Desktop Grid Layout */}
        <motion.div
          className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              className="relative group cursor-pointer will-change-transform"
              whileHover={{
                y: -10,
                scale: 1.05,
                rotateX: 5,
                rotateY: 5,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
              }}
              transition={butterySpringTransition}
            >
              {/* Card */}
              <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl h-full overflow-hidden"
                style={{ transformStyle: 'preserve-3d' }}>

                {/* Icon Container */}
                <motion.div
                  className={`relative w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg will-change-transform`}
                  animate={{
                    rotateY: hoveredCard === index ? 360 : 0,
                    scale: hoveredCard === index ? 1.1 : 1,
                  }}
                  transition={iconRotateTransition}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-2xl blur-lg opacity-60 pointer-events-none"
                    style={{ background: `linear-gradient(135deg, ${feature.glowColor}, transparent)` }}
                    animate={{
                      scale: hoveredCard === index ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.5, type: 'spring' }}
                  ></motion.div>
                  {React.createElement(feature.icon, { className: "w-10 h-10 text-white relative z-10" })}

                  {/* Orbiting Particles */}
                  <AnimatePresence>
                    {hoveredCard === index && (
                      <>
                        <motion.div
                          key="particle-1"
                          className="absolute w-2 h-2 bg-white/80 rounded-full pointer-events-none will-change-transform"
                          initial={{ x: 0, y: 0, opacity: 0 }}
                          animate={{
                            rotate: 360,
                            x: [0, 30, 0, -30, 0],
                            y: [0, -30, 0, 30, 0],
                            opacity: 1
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        ></motion.div>
                        <motion.div
                          key="particle-2"
                          className="absolute w-1.5 h-1.5 bg-white/60 rounded-full pointer-events-none will-change-transform"
                          initial={{ x: 0, y: 0, opacity: 0 }}
                          animate={{
                            rotate: -360,
                            x: [0, -25, 0, 25, 0],
                            y: [0, 25, 0, -25, 0],
                            opacity: 1
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        ></motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </motion.div>

                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300 relative z-10">
                  {feature.title}
                </h3>
                <p className="text-base text-slate-300 leading-relaxed relative z-10">
                  {feature.description}
                </p>

                {/* Corner Accents */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-tr-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-bl-3xl pointer-events-none"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .bg-grid-pattern {
          background-image: linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridMove 20s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default WhyChooseUs;