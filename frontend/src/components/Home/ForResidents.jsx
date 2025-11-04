import React, { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import { CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock useInView hook with Intersection Observer
const useInView = (options = {}) => {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (options.triggerOnce) {
          observer.unobserve(entry.target);
        }
      }
    }, {
      threshold: options.threshold || 0.2,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.triggerOnce]);

  return { ref, inView };
};

// Lightweight motion wrapper for CSS-only animations
const Motion = ({ children, className = '', style = {}, animate = {}, transition = {}, ...props }) => {
  const animatedStyle = {
    ...style,
    willChange: 'transform, opacity',
  };

  return <div className={className} style={animatedStyle} {...props}>{children}</div>;
};

// Memoized particle component with CSS animations
const Particle = memo(({ particle }) => (
  <div
    className="absolute w-1 h-1 bg-blue-400 rounded-full"
    style={{
      left: `${particle.x}%`,
      top: `${particle.y}%`,
      width: `${particle.size}px`,
      height: `${particle.size}px`,
      willChange: 'transform, opacity',
      animation: `float ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
      pointerEvents: 'none',
    }}
  />
));

// Memoized feature item component
const FeatureItem = memo(({ feature, index }) => (
  <div
    className="group flex items-start space-x-4 p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-blue-400/50 hover:bg-white/10 transition-all duration-300 cursor-pointer"
    style={{
      animation: `slideIn 0.5s ease-out ${index * 0.15}s both`,
      willChange: 'transform',
    }}
  >
    <div
      className="relative w-7 h-7 flex-shrink-0 mt-0.5 group-hover:animate-spin-fast"
      style={{
        willChange: 'transform',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-md opacity-70"></div>
      <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <CheckCircle className="w-4 h-4 text-white" />
      </div>
    </div>
    <span className="text-base sm:text-lg text-white/90 group-hover:text-white transition-colors">
      {feature}
    </span>
    <div
      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
      style={{
        willChange: 'transform, opacity',
      }}
    >
      <ArrowRight className="w-5 h-5 text-blue-400" />
    </div>
  </div>
));

// Memoized complaint item component
const ComplaintItem = memo(({ complaint, index, inView }) => (
  <div
    className="group relative"
    style={{
      animation: inView ? `complaintSlide 0.6s ease-out ${1 + index * 0.2}s both` : 'none',
      willChange: 'transform',
    }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-purple-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
    <div className="relative flex items-center justify-between p-4 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-xl border border-white/10 group-hover:border-blue-400/50 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
        <span className="text-white/90 font-medium">{complaint}</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 bg-green-400 rounded-full"
          style={{
            animation: `pulse-dot 2s ease-in-out ${index * 0.3}s infinite`,
            willChange: 'transform, opacity',
          }}
        />
        <span className="text-xs text-green-400 font-semibold px-2 py-1 rounded-full bg-green-400/10">
          In Progress
        </span>
      </div>
    </div>
  </div>
));

// Memoized stat card component
const StatCard = memo(({ stat, colorClass }) => (
  <div
    className={`text-center p-3 rounded-lg bg-${colorClass}-500/10 border border-${colorClass}-400/30 transition-transform duration-300 hover:scale-105`}
    style={{ willChange: 'transform', cursor: 'pointer' }}
  >
    <div className={`text-2xl font-bold text-${colorClass}-400`}>{stat.value}</div>
    <div className="text-xs text-white/60 mt-1">{stat.label}</div>
  </div>
));

const ForResidents = ({ id }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const throttleTimer = useRef(null);
  const navigate = useNavigate();

  // Memoize particles - only generate once
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    })), []
  );

  // Throttled mouse move handler for better performance (only updates 60 times/sec)
  const handleMouseMove = useCallback((e) => {
    if (throttleTimer.current) return;

    throttleTimer.current = setTimeout(() => {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
      throttleTimer.current = null;
    }, 16); // ~60 FPS
  }, []);

  // Memoize static data
  const features = useMemo(() => [
    'One-tap complaint creation with attachments',
    'Status tracking: Open → In Progress → Resolved',
    'Notification center for updates & notices',
    'Profile & password management',
    'Search across notices and complaints'
  ], []);

  const complaints = useMemo(() => [
    'Water leak in bathroom',
    'Elevator not working',
    'Parking issue'
  ], []);

  const stats = useMemo(() => [
    { label: 'Active', value: '3', color: 'blue' },
    { label: 'Resolved', value: '12', color: 'green' },
    { label: 'Total', value: '15', color: 'purple' }
  ], []);

  // Memoize button click handler
  const handleJoinClick = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  // Calculate 3D transform more efficiently
  const cardTransform = useMemo(() => ({
    transform: `perspective(1000px) rotateX(${(mousePosition.y - 50) * 0.1}deg) rotateY(${(mousePosition.x - 50) * 0.1}deg)`,
    transition: 'transform 0.3s ease-out',
    willChange: 'transform',
  }), [mousePosition.x, mousePosition.y]);

  const colorMap = {
    blue: 'blue',
    green: 'green',
    purple: 'purple'
  };

  return (
    <section
      ref={ref}
      id={id}
      className="relative py-16 md:py-24 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background Grid - CSS-only animation */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div
          className="absolute inset-0 animate-grid-move"
          style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            willChange: 'transform',
          }}
        ></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <Particle key={particle.id} particle={particle} />
        ))}
      </div>

      {/* Gradient Orbs - Optimized with pure CSS animations */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20 pointer-events-none animate-orb-1"
        style={{ willChange: 'transform' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20 pointer-events-none animate-orb-2"
        style={{ willChange: 'transform' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side: Text and Features */}
          <div
            className="space-y-6 text-center lg:text-left"
            style={{
              animation: inView ? 'fadeInUp 0.6s ease-out' : 'none',
            }}
          >
            {/* Glowing Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-400/30 backdrop-blur-sm"
              style={{
                animation: 'slideInDown 0.5s ease-out 0s',
                willChange: 'transform, opacity',
              }}
            >
              <Zap className="w-4 h-4 text-blue-400 animate-pulse" />
              <span className="text-sm font-medium text-blue-200">Next-Gen Living</span>
            </div>

            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight"
              style={{
                textShadow: '0 0 40px rgba(59, 130, 246, 0.5), 0 0 80px rgba(147, 51, 234, 0.3)',
                animation: 'slideInDown 0.6s ease-out 0.1s both',
                willChange: 'transform',
              }}
            >
              Everything{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
                  Residents
                </span>
                <div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                  style={{
                    animation: inView ? 'scaleInX 0.8s ease-out 0.5s both' : 'none',
                    transformOrigin: 'left',
                    willChange: 'transform',
                  }}
                />
              </span>
              <br />
              Need
            </h2>

            <div
              className="text-lg sm:text-xl text-blue-100/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              style={{
                animation: 'slideInDown 0.6s ease-out 0.2s both',
              }}
            >
              Our intuitive app puts the power of community management in your hands, making it easy to report issues and stay informed.
            </div>

            <div className="space-y-3 mb-8 pt-6">
              {features.map((feature, index) => (
                <FeatureItem key={feature} feature={feature} index={index} />
              ))}
            </div>

            <div style={{ animation: 'slideInUp 0.5s ease-out 0.8s both' }}>
              <button
                className="group relative px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/50 flex items-center justify-center space-x-3 mx-auto lg:mx-0 transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                onClick={handleJoinClick}
                style={{ willChange: 'transform' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div
                  className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                  style={{ willChange: 'transform' }}
                ></div>
                <span className="relative text-lg sm:text-xl font-bold z-10">Join Your Society</span>
                <ArrowRight className="relative w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform duration-300 z-10" style={{ willChange: 'transform' }} />
              </button>
            </div>
          </div>

          {/* Right Side: 3D Holographic Card (Hidden on Mobile/Tablet) */}
          <div className="hidden lg:block relative" style={{ perspective: '1000px' }}>
            <div
              className="relative"
              style={{
                animation: inView ? 'rotateInY 1.2s ease-out 0.5s both' : 'none',
                transformStyle: 'preserve-3d',
                ...cardTransform,
              }}
            >
              {/* Holographic Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-30 blur-2xl animate-pulse pointer-events-none"></div>

              {/* Main Card */}
              <div className="relative w-full h-[500px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl p-1 overflow-hidden border border-white/20">
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50 animate-spin-slow"></div>
                  <div className="absolute inset-[1px] bg-slate-900 rounded-3xl"></div>
                </div>

                {/* Card Content */}
                <div className="relative z-10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-[22px] h-full p-8 border border-white/10 overflow-y-auto">
                  <div className="flex items-center justify-between mb-8 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 bg-green-400 rounded-full"
                        style={{
                          animation: 'pulse-dot 2s ease-in-out infinite',
                          willChange: 'transform, opacity',
                        }}
                      />
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                        My Complaints
                      </h3>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full bg-green-500/20 border border-green-400/50"
                      style={{
                        animation: 'fadeInOut 2s ease-in-out infinite',
                        willChange: 'opacity',
                      }}
                    >
                      <span className="text-xs font-semibold text-green-400">Live</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {complaints.map((complaint, index) => (
                      <ComplaintItem
                        key={index}
                        complaint={complaint}
                        index={index}
                        inView={inView}
                      />
                    ))}
                  </div>

                  {/* Stats Bar */}
                  <div
                    className="mt-8 pt-6 border-t border-white/10"
                    style={{
                      animation: inView ? 'fadeInUp 0.6s ease-out 1.8s both' : 'none',
                    }}
                  >
                    <div className="grid grid-cols-3 gap-4">
                      {stats.map((stat) => (
                        <StatCard
                          key={stat.label}
                          stat={stat}
                          colorClass={colorMap[stat.color]}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
          50% { transform: translateY(-30px) scale(1.5); opacity: 0.8; }
        }
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleInX {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes fadeInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes rotateInY {
          from { transform: perspective(1000px) rotateY(-90deg); opacity: 0; }
          to { transform: perspective(1000px) rotateY(0); opacity: 1; }
        }
        @keyframes complaintSlide {
          from { transform: translateX(-20px) rotateX(-90deg); opacity: 0; }
          to { transform: translateX(0) rotateX(0); opacity: 1; }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 1; }
        }
        @keyframes pulse-badge {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes popIn {
          from { transform: scale(0) rotate(-180deg); opacity: 0; }
          to { transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes ring {
          0%, 100% { transform: rotate(0deg); }
          5%, 15% { transform: rotate(-15deg); }
          10%, 20% { transform: rotate(15deg); }
        }
        .animate-grid-move {
          animation: gridMove 20s linear infinite;
        }
        .animate-orb-1 {
          animation: orb1 15s ease-in-out infinite;
        }
        .animate-orb-2 {
          animation: orb2 18s ease-in-out infinite;
        }
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, 30px) scale(1.2); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, -30px) scale(1.3); }
        }
        .animate-spin-fast {
          animation: spin-fast 0.6s linear 1;
        }
        @keyframes spin-fast {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default ForResidents;