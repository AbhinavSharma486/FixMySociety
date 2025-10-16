import React, { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react';
import { CheckCircle, ArrowRight, BarChart3, Lock, MessageSquare, Briefcase, Zap, TrendingUp, Shield } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from "react-router-dom";

// Memoized particle component with optimized animations
const Particle = memo(({ index }) => {
  const style = useMemo(() => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    willChange: 'transform, opacity',
  }), []);

  const transition = useMemo(() => ({
    duration: 3 + Math.random() * 2,
    repeat: Infinity,
    delay: Math.random() * 2,
    ease: 'linear',
  }), []);

  return (
    <motion.div
      className="absolute w-1 h-1 bg-purple-400 rounded-full pointer-events-none"
      style={style}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
      }}
      transition={transition}
    />
  );
});

Particle.displayName = 'Particle';

// Memoized metric card with optimized hover handling
const MetricCard = memo(({ metric, index, inView, hoveredMetric, setHoveredMetric }) => {
  const Icon = metric.icon;
  const isHovered = hoveredMetric === index;

  const handleMouseEnter = useCallback(() => setHoveredMetric(index), [index, setHoveredMetric]);
  const handleMouseLeave = useCallback(() => setHoveredMetric(null), [setHoveredMetric]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        delay: 1.2 + index * 0.1,
        duration: 0.6,
        type: 'spring',
        stiffness: 150
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative group cursor-pointer"
      style={{ willChange: 'transform' }}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${metric.color} rounded-xl blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none`} />

      <div className="relative h-full rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-purple-500/20 p-4 overflow-hidden transition-all duration-300 group-hover:border-purple-400/40 group-hover:scale-105 group-hover:shadow-xl">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-transparent rounded-bl-full pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-2">
            <motion.div
              className={`text-4xl font-black bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}
              animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
              style={{ willChange: 'transform' }}
            >
              {metric.value}
            </motion.div>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center opacity-80`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-xs text-purple-200/70 font-medium tracking-wide">
            {metric.label}
          </div>
        </div>

        <motion.div
          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${metric.color} pointer-events-none`}
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: isHovered ? 1 : 0.6 } : {}}
          transition={{ delay: 1.5 + index * 0.1, duration: 0.8 }}
          style={{ transformOrigin: 'left', willChange: 'transform' }}
        />
      </div>
    </motion.div>
  );
});

MetricCard.displayName = 'MetricCard';

// Memoized feature item with optimized hover handling
const FeatureItem = memo(({ feature, index, itemVariants }) => {
  const Icon = feature.icon;

  return (
    <motion.div
      variants={itemVariants}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-purple-600/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative flex items-start space-x-4 p-4 rounded-xl backdrop-blur-sm border border-purple-500/0 group-hover:border-purple-500/30 transition-all duration-300">
        <div className="relative flex-shrink-0 mt-1">
          <motion.div
            className="absolute inset-0 bg-purple-600 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none"
            whileHover={{ scale: 1.2 }}
            style={{ willChange: 'transform' }}
          />
          <div className="relative w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center border border-purple-400/30 group-hover:scale-110 transition-transform duration-300" style={{ willChange: 'transform' }}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>

        <span className="text-base sm:text-lg text-purple-100 group-hover:text-white transition-colors duration-300 pt-1.5">
          {feature.text}
        </span>

        <motion.div
          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ x: -10 }}
          whileHover={{ x: 0 }}
          style={{ willChange: 'transform' }}
        >
          <ArrowRight className="w-5 h-5 text-purple-400" />
        </motion.div>
      </div>
    </motion.div>
  );
});

FeatureItem.displayName = 'FeatureItem';

const ForAdmins = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [hoveredMetric, setHoveredMetric] = useState(null);
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();

  // Memoize static data to prevent recreation on every render
  const features = useMemo(() => [
    { text: 'Admin login with a dedicated dashboard', icon: Shield },
    { text: 'Complaint triage and status management', icon: MessageSquare },
    { text: 'Building and resident data management', icon: Briefcase },
    { text: 'Analytics: track resolution trends and performance', icon: TrendingUp },
    { text: 'Admin profile updates and secure sessions', icon: Lock }
  ], []);

  const metrics = useMemo(() => [
    { value: 42, label: 'Total Complaints', color: 'from-purple-500 to-pink-500', icon: MessageSquare },
    { value: 8, label: 'Resolved Today', color: 'from-green-500 to-emerald-500', icon: CheckCircle },
    { value: 5, label: 'Pending', color: 'from-orange-500 to-amber-500', icon: Zap },
    { value: '2.3h', label: 'Avg. TAT', color: 'from-blue-500 to-cyan-500', icon: TrendingUp }
  ], []);

  const particles = useMemo(() => Array.from({ length: 20 }, (_, i) => i), []);

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { x: -30, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  }), []);

  const floatingVariants = useMemo(() => ({
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }), []);

  // Memoize setHoveredMetric to prevent unnecessary re-renders
  const memoizedSetHoveredMetric = useCallback((value) => {
    setHoveredMetric(value);
  }, []);

  return (
    <section ref={ref} className="relative py-16 md:py-24 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ willChange: 'transform' }}>
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }} />
      </div>

      {/* Floating Orbs - Using transform for GPU acceleration */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full opacity-20 blur-3xl pointer-events-none"
        animate={shouldReduceMotion ? {} : {
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ willChange: 'transform' }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600 rounded-full opacity-20 blur-3xl pointer-events-none"
        animate={shouldReduceMotion ? {} : {
          x: [0, -30, 0],
          y: [0, -50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{ willChange: 'transform' }}
      />

      {/* Particle Effects - Memoized */}
      {!shouldReduceMotion && particles.map((i) => (
        <Particle key={i} index={i} />
      ))}

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left Side: Futuristic 3D Dashboard Card */}
          <div className="hidden lg:block relative order-2 lg:order-1">
            <motion.div
              initial={{ rotateY: -90, opacity: 0, z: -200 }}
              animate={inView ? { rotateY: 0, opacity: 1, z: 0 } : {}}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
                willChange: 'transform',
              }}
              className="relative"
            >
              {/* Holographic Frame */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-xl animate-pulse pointer-events-none" />

              {/* Main Card Container */}
              <div className="relative w-full h-[520px] rounded-3xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-slate-900/90 via-purple-900/50 to-slate-900/90 border border-purple-500/30 shadow-2xl shadow-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent pointer-events-none" />

                {/* Inner Content Card */}
                <div className="relative z-10 m-6 h-[calc(100%-3rem)] rounded-2xl bg-gradient-to-br from-slate-800/80 via-purple-900/40 to-slate-800/80 backdrop-blur-md border border-purple-500/20 overflow-hidden">

                  <div className="p-6 h-full relative">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <motion.h3
                          className="text-2xl font-bold bg-gradient-to-r from-purple-200 via-white to-blue-200 bg-clip-text text-transparent"
                          initial={{ opacity: 0, y: -20 }}
                          animate={inView ? { opacity: 1, y: 0 } : {}}
                          transition={{ delay: 0.8, duration: 0.6 }}
                        >
                          Admin Dashboard
                        </motion.h3>
                        <motion.p
                          className="text-purple-300/60 text-sm mt-1"
                          initial={{ opacity: 0 }}
                          animate={inView ? { opacity: 1 } : {}}
                          transition={{ delay: 1, duration: 0.6 }}
                        >
                          Real-time Intelligence
                        </motion.p>
                      </div>
                      <motion.div
                        className="relative"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={inView ? { scale: 1, rotate: 0 } : {}}
                        transition={{ delay: 0.9, duration: 0.8, type: 'spring' }}
                        style={{ willChange: 'transform' }}
                      >
                        <div className="absolute inset-0 bg-purple-500 rounded-xl blur-lg opacity-50 animate-pulse pointer-events-none" />
                        <div className="relative w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center border border-purple-400/30">
                          <BarChart3 className="w-7 h-7 text-white" />
                        </div>
                      </motion.div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {metrics.map((metric, index) => (
                        <MetricCard
                          key={index}
                          metric={metric}
                          index={index}
                          inView={inView}
                          hoveredMetric={hoveredMetric}
                          setHoveredMetric={memoizedSetHoveredMetric}
                        />
                      ))}
                    </div>

                    {/* Status Indicator */}
                    <motion.div
                      className="absolute bottom-4 left-6 right-6 flex items-center justify-between"
                      initial={{ opacity: 0 }}
                      animate={inView ? { opacity: 1 } : {}}
                      transition={{ delay: 2, duration: 0.6 }}
                    >
                      <div className="flex items-center space-x-2">
                        <motion.div
                          className="w-2 h-2 bg-green-400 rounded-full"
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="text-xs text-purple-300/60">System Online</span>
                      </div>
                      <span className="text-xs text-purple-300/40 font-mono">v4.5.0</span>
                    </motion.div>
                  </div>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-purple-500/50 rounded-tl-xl pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-purple-500/50 rounded-br-xl pointer-events-none" />
              </div>

              {/* Floating Icon Badge */}
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -180 }}
                animate={inView ? { scale: 1, opacity: 1, rotate: 0 } : {}}
                transition={{ duration: 0.8, delay: 1.8, type: 'spring', stiffness: 150 }}
                variants={floatingVariants}
                whileInView="animate"
                className="absolute -top-8 -left-8 w-20 h-20 rounded-2xl overflow-hidden"
                style={{ willChange: 'transform' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 animate-gradient" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                <div className="relative w-full h-full flex items-center justify-center border border-purple-400/30">
                  <Briefcase className="w-14 h-14 text-white drop-shadow-2xl" />
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Side: Content */}
          <motion.div
            className="space-y-8 text-center lg:text-left order-1 lg:order-2"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            {/* Heading */}
            <div className="space-y-4">
              <motion.div variants={itemVariants} className="inline-block">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 backdrop-blur-sm">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300 font-medium">For Administrators</span>
                </div>
              </motion.div>

              <motion.h2
                variants={itemVariants}
                className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight"
              >
                <span className="text-white">Tools Built for </span>
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                    Admins
                  </span>
                  <motion.div
                    className="absolute -inset-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-xl pointer-events-none"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </span>
              </motion.h2>

              <motion.p
                variants={itemVariants}
                className="text-lg sm:text-xl text-purple-200/70 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                Manage your society with powerful tools designed to simplify administration and enhance efficiency.
              </motion.p>
            </div>

            {/* Features List */}
            <motion.div
              className="space-y-3"
              variants={containerVariants}
            >
              {features.map((feature, index) => (
                <FeatureItem
                  key={index}
                  feature={feature}
                  index={index}
                  itemVariants={itemVariants}
                />
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div variants={itemVariants}>
              <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 rounded-xl font-bold text-lg text-white overflow-hidden shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer" style={{ willChange: 'transform' }}
                onClick={() => navigate("/admin-login")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  style={{ willChange: 'transform' }}
                />
                <span className="relative flex items-center justify-center space-x-3">
                  <span>Go to Admin Panel</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" style={{ willChange: 'transform' }} />
                </span>

                <div className="absolute inset-0 rounded-xl border-2 border-purple-400/50 group-hover:border-purple-300 transition-colors duration-300 pointer-events-none" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default ForAdmins;