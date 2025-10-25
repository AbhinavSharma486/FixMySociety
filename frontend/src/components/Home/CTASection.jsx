import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Memoized Trust Indicator Component - Enhanced with 3D effect
const TrustIndicator = memo(({ text, delay }) => (
  <div className="flex items-center gap-2 sm:gap-3 group">
    <div className="relative">
      <div
        className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse"
        style={{
          animationDelay: `${delay}s`,
          boxShadow: '0 0 20px rgba(34, 211, 238, 0.6)'
        }}
      />
      <div
        className="absolute inset-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full opacity-40 blur-sm animate-pulse"
        style={{ animationDelay: `${delay}s` }}
      />
    </div>
    <span className="text-xs sm:text-sm md:text-base text-blue-100 font-semibold tracking-wide transition-all duration-300 group-hover:text-white group-hover:tracking-wider">
      {text}
    </span>
  </div>
));

TrustIndicator.displayName = 'TrustIndicator';

// Memoized Floating Particle Component - Enhanced with glow
const FloatingParticle = memo(({ top, left, right, bottom, color, delay }) => {
  const style = {
    position: 'absolute',
    width: '0.5rem',
    height: '0.5rem',
    borderRadius: '9999px',
    ...(top && { top }),
    ...(left && { left }),
    ...(right && { right }),
    ...(bottom && { bottom }),
    ...(delay && { animationDelay: delay }),
    filter: 'blur(1px)',
    boxShadow: '0 0 15px currentColor'
  };

  return <div className={`${color} animate-float opacity-60`} style={style} />;
});

FloatingParticle.displayName = 'FloatingParticle';

const CTASection = ({ id }) => {
  const navigate = useNavigate();
  const [ripples, setRipples] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const rippleTimeoutRefs = useRef([]);
  const buttonRef = useRef(null);
  const sectionRef = useRef(null);

  // Track mouse position for 3D parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Cleanup ripple timeouts on unmount
  useEffect(() => {
    return () => rippleTimeoutRefs.current.forEach(id => clearTimeout(id));
  }, []);

  // Optimized ripple handler
  const handleButtonHover = useCallback((e) => {
    if (ripples.length >= 3) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const newRipple = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      id: Date.now()
    };

    setRipples(prev => [...prev.slice(-2), newRipple]);

    const timeoutId = setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 800);

    rippleTimeoutRefs.current.push(timeoutId);
  }, [ripples.length]);

  // Navigation handlers
  const handleResidentLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleAdminLogin = useCallback(() => {
    navigate('/admin-login');
  }, [navigate]);

  const trustIndicators = ['Secure', 'Fast', 'Reliable', 'Modern'];

  const parallaxStyle = {
    transform: `translate(${(mousePosition.x - 0.5) * 20}px, ${(mousePosition.y - 0.5) * 20}px)`
  };

  return (
    <section
      ref={sectionRef}
      id={id}
      className="relative py-20 sm:py-32 lg:py-40 overflow-hidden min-h-screen flex items-center"
      style={{
        background: 'linear-gradient(135deg, #0a0a1f 0%, #1a0a2e 25%, #16001e 50%, #0a0015 75%, #000000 100%)'
      }}
    >
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)',
            filter: 'blur(60px)'
          }}
        />
      </div>

      {/* Grid overlay for depth */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          transform: 'perspective(500px) rotateX(60deg) scale(2)',
          transformOrigin: 'center top'
        }}
      />

      {/* Enhanced floating particles with parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{ ...parallaxStyle, transition: 'transform 0.3s ease-out' }}>
          <FloatingParticle top="5rem" left="2.5rem" color="bg-cyan-400" />
          <FloatingParticle top="10rem" right="5rem" color="bg-purple-400" delay="1s" />
          <FloatingParticle bottom="10rem" left="25%" color="bg-pink-400" delay="2s" />
          <FloatingParticle top="33%" right="33%" color="bg-cyan-400" delay="3s" />
          <FloatingParticle top="60%" left="15%" color="bg-blue-400" delay="1.5s" />
          <FloatingParticle bottom="25%" right="20%" color="bg-purple-500" delay="2.5s" />
        </div>
      </div>

      {/* Radial glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div id="cta-content" className="opacity-100 transform translate-y-0">
          {/* Enhanced Status Badge with glassmorphism */}
          <div className="flex justify-center mb-10 sm:mb-16">
            <div className="relative group cursor-default">
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full opacity-30 blur-2xl group-hover:opacity-50 transition-opacity duration-500" />
              <div
                className="relative px-6 sm:px-10 py-3 sm:py-4 rounded-full border backdrop-blur-xl transition-all duration-500 group-hover:scale-105"
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  borderColor: 'rgba(34, 211, 238, 0.4)',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 0 20px rgba(34, 211, 238, 0.1)'
                }}
              >
                <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                  <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-cyan-400" style={{ boxShadow: '0 0 10px rgba(34, 211, 238, 0.8)' }}></span>
                  </span>
                  <span className="tracking-wider">NEXT-GENERATION PLATFORM</span>
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Typography with 3D text effect */}
          <div className="text-center mb-6 sm:mb-10 space-y-3 sm:space-y-6">
            <h2
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-tight leading-none px-4 transition-all duration-300"
              style={{
                textShadow: '0 0 40px rgba(255, 255, 255, 0.3), 0 2px 4px rgba(0, 0, 0, 0.8)',
                filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5))'
              }}
            >
              Bring Your Society
            </h2>

            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-none px-4">
              <span className="relative inline-block group">
                <span className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 blur-3xl opacity-40 animate-pulse group-hover:opacity-60 transition-opacity duration-500" />
                <span
                  className="relative bg-gradient-to-r from-yellow-200 via-orange-400 to-pink-400 bg-clip-text text-transparent font-black transition-all duration-300"
                  style={{
                    textShadow: '0 0 60px rgba(251, 191, 36, 0.5)',
                    filter: 'drop-shadow(0 10px 30px rgba(251, 146, 60, 0.6))'
                  }}
                >
                  Online Today
                </span>
              </span>
            </h2>
          </div>

          <p
            className="text-center text-base sm:text-xl md:text-2xl lg:text-3xl text-blue-200/90 mb-12 sm:mb-20 max-w-3xl mx-auto font-light tracking-wide px-4"
            style={{
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
            }}
          >
            Fast setup, no training required.
          </p>

          {/* Enhanced CTA Buttons with advanced effects */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-6 sm:mb-8 px-4">
            {/* Primary Button - Glassmorphic with 3D depth */}
            <button
              ref={buttonRef}
              onMouseMove={handleButtonHover}
              onClick={handleResidentLogin}
              className="group relative w-full sm:w-auto px-8 sm:px-12 py-5 sm:py-7 overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 cursor-pointer"
              style={{
                boxShadow: '0 20px 60px rgba(59, 130, 246, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(219, 234, 254, 0.95) 50%, rgba(233, 213, 255, 0.95) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              {/* Animated gradient overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(135deg, transparent 0%, rgba(34, 211, 238, 0.2) 50%, transparent 100%)',
                  animation: 'shimmer 2s infinite'
                }}
              />

              {/* Enhanced glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />

              {ripples.map(ripple => (
                <span
                  key={ripple.id}
                  className="absolute rounded-full bg-blue-400/40 animate-ripple"
                  style={{
                    left: ripple.x,
                    top: ripple.y,
                    width: '10px',
                    height: '10px',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}

              <div className="relative flex items-center justify-center space-x-2 sm:space-x-3 z-10">
                <span
                  className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105"
                  style={{
                    textShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  Login as Resident
                </span>
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110" />
              </div>
            </button>

            {/* Secondary Button - Advanced glassmorphism */}
            <button
              onClick={handleAdminLogin}
              className="group relative w-full sm:w-auto px-8 sm:px-12 py-5 sm:py-7 overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 0 20px rgba(255, 255, 255, 0.05)'
              }}
            >
              {/* Animated border glow */}
              <div
                className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-lg"
                style={{
                  background: 'linear-gradient(90deg, rgba(34, 211, 238, 0.8), rgba(168, 85, 247, 0.8), rgba(236, 72, 153, 0.8))',
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shift 3s ease infinite'
                }}
              />

              {/* Inner glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.2) 0%, transparent 70%)'
                }}
              />

              <span
                className="relative text-lg sm:text-xl md:text-2xl font-black text-white z-10 transition-all duration-300 group-hover:scale-105"
                style={{
                  textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 2px 4px rgba(0, 0, 0, 0.8)'
                }}
              >
                Admin Login
              </span>
            </button>
          </div>

          {/* Enhanced Trust Indicators */}
          <div className="mt-12 sm:mt-20 flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-12 px-4">
            {trustIndicators.map((text, i) => (
              <TrustIndicator key={text} text={text} delay={i * 0.3} />
            ))}
          </div>
        </div>
      </div>

      {/* Add keyframe animations via style tag */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-15px) translateX(5px); }
        }
        
        @keyframes ripple {
          0% { width: 10px; height: 10px; opacity: 1; }
          100% { width: 200px; height: 200px; opacity: 0; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-ripple {
          animation: ripple 0.8s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default memo(CTASection);