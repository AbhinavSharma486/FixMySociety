import React, { useState, useMemo, useCallback, memo } from 'react';
import { Building, MessageCircle, BarChart3, Search, Upload, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// Memoized Icon Component to prevent re-renders
const ModuleIcon = memo(({ Icon, className, strokeWidth }) => (
  <Icon className={className} strokeWidth={strokeWidth} />
));

ModuleIcon.displayName = 'ModuleIcon';

// Memoized Module Card for Desktop
const DesktopModuleCard = memo(({ module, index, isHovered, onHoverStart, onHoverEnd, itemVariants }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={itemVariants}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      className="group relative rounded-3xl p-8 cursor-pointer backdrop-blur-xl"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: isHovered
          ? `0 20px 60px ${module.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
          : '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
        willChange: isHovered ? 'transform, box-shadow' : 'auto',
      }}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${module.glow}, transparent 70%)`,
        }}
      />

      {/* Scan line effect */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <motion.div
            className="w-full h-px bg-gradient-to-r from-transparent via-white to-transparent"
            animate={isHovered ? {
              y: [0, 300],
              opacity: [0, 1, 0]
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ willChange: isHovered ? 'transform, opacity' : 'auto' }}
          />
        </motion.div>
      )}

      <div className="relative z-10">
        <motion.div
          className={`w-20 h-20 bg-gradient-to-br ${module.color} rounded-3xl flex items-center justify-center mb-6 relative overflow-hidden`}
          whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{
            boxShadow: isHovered
              ? `0 20px 60px ${module.glow}`
              : `0 10px 30px rgba(0, 0, 0, 0.3)`,
            willChange: 'transform'
          }}
        >
          {/* Shimmer effect */}
          {!prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"
              animate={isHovered ? {
                x: [-100, 200],
              } : {}}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 1
              }}
              style={{ willChange: isHovered ? 'transform' : 'auto' }}
            />
          )}

          <ModuleIcon Icon={module.icon} className="w-10 h-10 text-white relative z-10" strokeWidth={1.5} />
        </motion.div>

        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
          {module.title}
        </h3>

        <p className="text-base text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
          {module.description}
        </p>

        {/* Hover indicator */}
        <motion.div
          className={`mt-6 flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${module.color} bg-clip-text text-transparent`}
          initial={{ opacity: 0, x: -10 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            x: isHovered ? 0 : -10
          }}
          transition={{ duration: 0.3 }}
          style={{ willChange: isHovered ? 'transform, opacity' : 'auto' }}
        >
          Explore Module
          <motion.span
            animate={isHovered && !prefersReducedMotion ? { x: [0, 5, 0] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ willChange: isHovered ? 'transform' : 'auto' }}
          >
            →
          </motion.span>
        </motion.div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none">
        <div className={`absolute top-6 right-6 w-12 h-px bg-gradient-to-r ${module.color}`}></div>
        <div className={`absolute top-6 right-6 w-px h-12 bg-gradient-to-b ${module.color}`}></div>
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return prevProps.isHovered === nextProps.isHovered &&
    prevProps.module.id === nextProps.module.id;
});

DesktopModuleCard.displayName = 'DesktopModuleCard';

// Memoized Mobile Card
const MobileModuleCard = memo(({ module, direction, slideVariants }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      key={module.id}
      variants={slideVariants}
      custom={direction}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
        rotateY: { duration: 0.4 }
      }}
      className="group w-full rounded-3xl p-8 absolute backdrop-blur-xl"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          0 0 60px ${module.glow}
        `,
        transformStyle: 'preserve-3d',
        willChange: 'transform, opacity'
      }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${module.glow}, transparent 70%)`,
        }}></div>

      <div className="relative">
        <motion.div
          className={`w-20 h-20 bg-gradient-to-br ${module.color} rounded-3xl flex items-center justify-center mb-6 relative overflow-hidden`}
          whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
          style={{
            boxShadow: `0 20px 40px ${module.glow}`,
            willChange: 'transform'
          }}
        >
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
          <ModuleIcon Icon={module.icon} className="w-10 h-10 text-white relative z-10" strokeWidth={1.5} />
        </motion.div>

        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
          {module.title}
        </h3>
        <p className="text-base text-gray-300 leading-relaxed">
          {module.description}
        </p>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-30 pointer-events-none">
        <div className={`absolute top-4 right-4 w-12 h-px bg-gradient-to-r ${module.color}`}></div>
        <div className={`absolute top-4 right-4 w-px h-12 bg-gradient-to-b ${module.color}`}></div>
      </div>
    </motion.div>
  );
});

MobileModuleCard.displayName = 'MobileModuleCard';

const FeaturedModules = ({ id }) => {
  const prefersReducedMotion = useReducedMotion();
  const [inView] = useState(true);

  // Static modules data - defined once
  const modules = useMemo(() => [
    { icon: MessageCircle, title: 'Complaints & Workflows', description: 'Priorities, categories, attachments, timelines', id: 'complaints-workflow', color: 'from-blue-500 to-blue-600', glow: 'rgba(59, 130, 246, 0.5)' },
    { icon: Building, title: 'Buildings', description: 'Pre-seeded buildings, occupancy stats', id: 'buildings-module', color: 'from-green-500 to-green-600', glow: 'rgba(34, 197, 94, 0.5)' },
    { icon: Bell, title: 'Notifications', description: 'Role-based announcements and updates', id: 'notifications-module', color: 'from-purple-500 to-purple-600', glow: 'rgba(168, 85, 247, 0.5)' },
    { icon: Search, title: 'Search', description: 'Advanced search for residents and admins', id: 'search-module', color: 'from-red-500 to-red-600', glow: 'rgba(239, 68, 68, 0.5)' },
    { icon: Upload, title: 'File Uploads', description: 'Cloud-ready media storage', id: 'file-uploads', color: 'from-yellow-500 to-yellow-600', glow: 'rgba(234, 179, 8, 0.5)' },
    { icon: BarChart3, title: 'Analytics', description: 'Insights and performance metrics', id: 'analytics-module', color: 'from-cyan-500 to-cyan-600', glow: 'rgba(6, 182, 212, 0.5)' }
  ], []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [hoveredModule, setHoveredModule] = useState(null);

  // Optimized navigation handlers with useCallback
  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex(prev => Math.min(prev + 1, modules.length - 1));
  }, [modules.length]);

  const handlePrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const handleHoverStart = useCallback((index) => {
    setHoveredModule(index);
  }, []);

  const handleHoverEnd = useCallback(() => {
    setHoveredModule(null);
  }, []);

  // Animation variants - memoized and conditional on reduced motion
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.15,
        delayChildren: prefersReducedMotion ? 0 : 0.2,
      },
    },
  }), [prefersReducedMotion]);

  const itemVariants = useMemo(() => ({
    hidden: {
      y: prefersReducedMotion ? 0 : 60,
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.8,
      rotateX: prefersReducedMotion ? 0 : -15,
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: prefersReducedMotion ? 0.1 : 0.8,
      },
    },
  }), [prefersReducedMotion]);

  const slideVariants = useMemo(() => ({
    enter: (direction) => ({
      x: prefersReducedMotion ? 0 : (direction > 0 ? 300 : -300),
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.8,
      rotateY: prefersReducedMotion ? 0 : (direction > 0 ? 25 : -25),
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction) => ({
      x: prefersReducedMotion ? 0 : (direction < 0 ? 300 : -300),
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.8,
      rotateY: prefersReducedMotion ? 0 : (direction < 0 ? 25 : -25),
    }),
  }), [prefersReducedMotion]);

  const floatingAnimation = useMemo(() => prefersReducedMotion ? {} : {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }, [prefersReducedMotion]);

  const currentModule = modules[currentIndex];

  return (
    <section id={id} className="relative py-16 md:py-24 overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)'
    }}>
      {/* Animated Background Grid - Simplified for performance */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: prefersReducedMotion ? 'none' : 'grid-flow 20s linear infinite',
          willChange: prefersReducedMotion ? 'auto' : 'transform'
        }}></div>
      </div>

      {/* Glowing Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse pointer-events-none" style={{ willChange: 'opacity' }}></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse pointer-events-none" style={{ animationDelay: '1s', willChange: 'opacity' }}></div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          className="text-center mb-12 md:mb-20"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: prefersReducedMotion ? 0.1 : 1, ease: 'easeOut' }}
        >
          <motion.div
            className="inline-block mb-4"
            animate={floatingAnimation}
            style={{ willChange: prefersReducedMotion ? 'auto' : 'transform' }}
          >
            <span className="px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase"
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
              }}>
              Next-Gen Features
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 leading-tight">
            <span className="inline-block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              style={{
                textShadow: '0 0 80px rgba(59, 130, 246, 0.5)',
                WebkitTextStroke: '1px rgba(255, 255, 255, 0.1)'
              }}>
              Featured Modules
            </span>
          </h2>

          <p className="text-base sm:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
            Comprehensive tools designed to handle every aspect of{' '}
            <span className="text-blue-400 font-medium">society management</span>
          </p>
        </motion.div>

        {/* Mobile/Tablet Card Navigation */}
        <div className="md:hidden flex flex-col items-center perspective-1000">
          <div className="relative w-full max-w-sm mx-auto h-[320px] flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <MobileModuleCard
                module={currentModule}
                direction={direction}
                slideVariants={slideVariants}
              />
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center items-center mt-12 space-x-6">
            <motion.button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-xl transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                willChange: 'transform'
              }}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </motion.button>

            <div className="flex space-x-2">
              {modules.map((_, idx) => (
                <motion.div
                  key={idx}
                  className="rounded-full transition-all"
                  animate={{
                    width: idx === currentIndex ? 24 : 8,
                    height: 8,
                    backgroundColor: idx === currentIndex ? '#60a5fa' : 'rgba(255, 255, 255, 0.2)',
                  }}
                  style={{
                    boxShadow: idx === currentIndex ? '0 0 20px rgba(96, 165, 250, 0.6)' : 'none',
                    willChange: 'width, background-color'
                  }}
                />
              ))}
            </div>

            <motion.button
              onClick={handleNext}
              disabled={currentIndex === modules.length - 1}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-xl transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                willChange: 'transform'
              }}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </motion.button>
          </div>
        </div>

        {/* Desktop Grid Layout */}
        <motion.div
          className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {modules.map((module, index) => (
            <DesktopModuleCard
              key={module.id}
              module={module}
              index={index}
              isHovered={hoveredModule === index}
              onHoverStart={() => handleHoverStart(index)}
              onHoverEnd={handleHoverEnd}
              itemVariants={itemVariants}
            />
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes grid-flow {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(50px);
          }
        }

        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </section>
  );
};

export default FeaturedModules;