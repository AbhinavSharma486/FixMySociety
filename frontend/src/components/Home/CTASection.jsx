import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';

const CTASection = ({ visibleElements = new Set(['cta-content']) }) => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [ripples, setRipples] = useState([]);
  const [time, setTime] = useState(0);
  const rafRef = useRef(null);
  const mousePositionRef = useRef({ x: 50, y: 50 });
  const sectionRef = useRef(null);
  const lastMouseUpdateRef = useRef(0);
  const rippleTimeoutRefs = useRef([]);

  // Optimized mouse tracking with throttling (16ms = 60fps)
  useEffect(() => {
    const handleMouseMove = (e) => {
      const now = performance.now();
      if (now - lastMouseUpdateRef.current < 16) return;

      lastMouseUpdateRef.current = now;
      const newPos = {
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      };

      mousePositionRef.current = newPos;
      setMousePosition(newPos);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Single RAF loop for time animation
  useEffect(() => {
    let lastTime = performance.now();
    const animate = (currentTime) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      setTime(prev => prev + delta);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Optimized ripple management with cleanup
  const handleButtonHover = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newRipple = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      id: Date.now()
    };

    setRipples(prev => {
      const updated = [...prev, newRipple];
      return updated.length > 3 ? updated.slice(-3) : updated;
    });

    const timeoutId = setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1000);

    rippleTimeoutRefs.current.push(timeoutId);
    if (rippleTimeoutRefs.current.length > 3) {
      const oldTimeout = rippleTimeoutRefs.current.shift();
      clearTimeout(oldTimeout);
    }
  }, []);

  // Cleanup ripple timeouts on unmount
  useEffect(() => {
    return () => {
      rippleTimeoutRefs.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // Precomputed constants
  const orbConfig = useMemo(() => ({
    baseRadius: 30,
    radiusIncrement: 10,
    baseSize: 200,
    sizeIncrement: 40,
    PI_THIRD: Math.PI / 3,
    gradients: [
      'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(139, 92, 246, 0.2) 30%, transparent 70%)',
      'radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, rgba(219, 39, 119, 0.15) 30%, transparent 70%)',
      'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(37, 99, 235, 0.2) 30%, transparent 70%)'
    ]
  }), []);

  // Optimized energy orbs with reduced recalculations
  const energyOrbs = useMemo(() => {
    const { baseRadius, radiusIncrement, baseSize, sizeIncrement, PI_THIRD, gradients } = orbConfig;
    const orbs = [];

    for (let i = 0; i < 6; i++) {
      const angle = (time * (0.2 + i * 0.1)) + (i * PI_THIRD);
      const radius = baseRadius + i * radiusIncrement;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      orbs.push({
        id: i,
        x: 50 + cos * radius,
        y: 50 + sin * radius,
        size: baseSize + i * sizeIncrement,
        background: gradients[i % 3]
      });
    }
    return orbs;
  }, [time, orbConfig]);

  // Static floating particles - computed once
  const floatingParticles = useMemo(() => {
    const particles = [];
    const colors = ['rgba(59, 130, 246, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(236, 72, 153, 0.8)'];

    for (let i = 0; i < 30; i++) {
      const rand1 = Math.random();
      const rand2 = Math.random();
      const rand3 = Math.random();
      const rand4 = Math.random();
      const rand5 = Math.random();

      particles.push({
        id: i,
        size: 2 + rand1 * 3,
        left: rand2 * 100,
        top: rand3 * 100,
        color: colors[i % 3],
        duration: 8 + rand4 * 12,
        delay: rand5 * 5,
        opacity: 0.4 + rand1 * 0.4,
        shadowSize: 6 + rand2 * 8
      });
    }
    return particles;
  }, []);

  const trustIndicators = useMemo(() => ['Secure', 'Fast', 'Reliable', 'Modern'], []);

  // Memoized mesh gradient with rounded values
  const meshGradientStyle = useMemo(() => {
    const x = Math.round(mousePosition.x * 10) / 10;
    const y = Math.round(mousePosition.y * 10) / 10;
    const invX = Math.round((100 - mousePosition.x) * 10) / 10;
    const invY = Math.round((100 - mousePosition.y) * 10) / 10;

    return {
      background: `radial-gradient(ellipse at ${x}% ${y}%, rgba(59, 130, 246, 0.4) 0%, transparent 50%), radial-gradient(ellipse at ${invX}% ${invY}%, rgba(236, 72, 153, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.25) 0%, transparent 50%)`,
      filter: 'blur(100px)',
      mixBlendMode: 'screen'
    };
  }, [mousePosition.x, mousePosition.y]);

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-32 lg:py-40 overflow-hidden bg-black min-h-screen flex items-center">
      {/* Revolutionary Quantum Field Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-black opacity-95" />

        {/* Animated Mesh Gradient - Optimized */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0 will-change-transform"
            style={meshGradientStyle}
          />
        </div>
      </div>

      {/* Energy Orbs with Quantum Motion - GPU Accelerated */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {energyOrbs.map((orb) => (
          <div
            key={orb.id}
            className="absolute rounded-full will-change-transform"
            style={{
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              background: orb.background,
              filter: 'blur(70px)',
              transform: 'translate(-50%, -50%) translateZ(0)',
              mixBlendMode: 'screen'
            }}
          />
        ))}
      </div>

      {/* Floating Quantum Particles - CSS Only Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingParticles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full will-change-transform"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              background: particle.color,
              boxShadow: `0 0 ${particle.shadowSize}px currentColor`,
              animation: `quantumFloat ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
              opacity: particle.opacity,
              transform: 'translateZ(0)'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div
          id="cta-content"
          data-animate
          className={`transition-all duration-1000 ease-out ${visibleElements.has('cta-content')
            ? 'opacity-100 transform translate-y-0'
            : 'opacity-0 transform translate-y-12'
            }`}
        >
          {/* Quantum Status Badge */}
          <div className="flex justify-center mb-10 sm:mb-16">
            <div className="relative group cursor-default">
              <div className="absolute -inset-6 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-all duration-700 animate-pulse" />

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-full backdrop-blur-xl" />

                <div className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-full h-full bg-black/80 rounded-full backdrop-blur-xl" />
                </div>

                <div className="relative px-6 sm:px-10 py-3 sm:py-4">
                  <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                    <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" style={{ animationDelay: '0.5s' }}></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-lg shadow-cyan-500/50"></span>
                    </span>
                    <span className="tracking-wider">NEXT-GENERATION PLATFORM</span>
                  </span>
                </div>
              </div>

              <div className="absolute -top-1 -left-1 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-l-2 border-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-tl" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-r-2 border-pink-400 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-br" />
            </div>
          </div>

          {/* Revolutionary Typography */}
          <div className="text-center mb-6 sm:mb-10 space-y-3 sm:space-y-6">
            <div className="relative">
              <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-tight leading-none px-4">
                <span className="inline-block relative">
                  <span className="relative z-10">Bring Your Society</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                </span>
              </h2>
            </div>

            <div className="relative px-4">
              <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-none">
                <span className="relative inline-block group/mega">
                  <span className="absolute -inset-4 sm:-inset-8 md:-inset-12 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 blur-3xl opacity-50 will-change-transform" style={{ animation: 'megaPulse 3s ease-in-out infinite' }} />

                  <span className="absolute -inset-2 sm:-inset-4 md:-inset-6 bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 blur-2xl opacity-60 will-change-transform" style={{ animation: 'megaPulse 3s ease-in-out infinite 0.5s' }} />

                  <span className="relative bg-gradient-to-r from-yellow-200 via-orange-400 to-pink-400 bg-clip-text text-transparent font-black will-change-transform" style={{
                    backgroundSize: '200% 100%',
                    animation: 'gradientFlow 5s ease-in-out infinite',
                    filter: 'drop-shadow(0 0 20px rgba(251, 146, 60, 0.5))'
                  }}>
                    Online Today
                  </span>

                  <span className="absolute inset-0 bg-gradient-to-r from-yellow-200 via-orange-400 to-pink-400 bg-clip-text text-transparent opacity-0 group-hover/mega:opacity-100 transition-opacity will-change-transform" style={{
                    animation: 'glitch 0.4s ease-in-out infinite',
                    transform: 'translateX(3px)'
                  }}>
                    Online Today
                  </span>
                </span>
              </h2>
            </div>
          </div>

          <p className="text-center text-base sm:text-xl md:text-2xl lg:text-3xl text-blue-200/90 mb-12 sm:mb-20 max-w-3xl mx-auto font-light tracking-wide px-4">
            <span className="inline-block relative">
              <span className="relative z-10">Fast setup, no training required.</span>
              <span className="absolute right-0 top-0 bottom-0 w-0.5 bg-cyan-400 shadow-lg shadow-cyan-400/50" style={{ animation: 'cursorBlink 1s step-end infinite' }} />
            </span>
          </p>

          {/* Revolutionary CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-6 sm:mb-8 px-4">
            {/* Primary Quantum Button */}
            <button
              onMouseMove={handleButtonHover}
              className="group relative w-full sm:w-auto px-8 sm:px-12 py-5 sm:py-7 overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl will-change-transform"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-purple-50 transition-all duration-500" />

              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 will-change-transform" style={{
                animation: 'shimmerSlide 3s ease-in-out infinite'
              }} />

              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />

              {ripples.map(ripple => (
                <span
                  key={ripple.id}
                  className="absolute rounded-full bg-gradient-to-r from-blue-400/50 to-purple-400/50 will-change-transform"
                  style={{
                    left: ripple.x,
                    top: ripple.y,
                    width: '10px',
                    height: '10px',
                    transform: 'translate(-50%, -50%) translateZ(0)',
                    animation: 'rippleExpand 1s ease-out forwards'
                  }}
                />
              ))}

              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
                boxShadow: '0 0 50px rgba(59, 130, 246, 0.7), inset 0 0 40px rgba(59, 130, 246, 0.3), 0 0 100px rgba(139, 92, 246, 0.5)'
              }} />

              <div className="relative flex items-center justify-center space-x-2 sm:space-x-3 z-10">
                <span className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent will-change-transform" style={{
                  backgroundSize: '200% 100%',
                  animation: 'gradientFlow 4s ease-in-out infinite'
                }}>
                  Login as Resident
                </span>
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-125 drop-shadow-lg will-change-transform" />
              </div>

              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 will-change-transform" />

              <div className="absolute top-0 left-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-400/40 to-transparent rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
              <div className="absolute bottom-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tl from-purple-400/40 to-transparent rounded-br-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
            </button>

            {/* Secondary Glassmorphic Button */}
            <button className="group relative w-full sm:w-auto px-8 sm:px-12 py-5 sm:py-7 overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 will-change-transform">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-purple-500/5 to-pink-500/10 backdrop-blur-2xl border-2 border-white/30 rounded-2xl transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-white/20 group-hover:via-purple-500/10 group-hover:to-pink-500/15 group-hover:border-white/50" />

              <div className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-70 blur-md will-change-transform" style={{
                  animation: 'rotateGlow 6s linear infinite'
                }} />
              </div>

              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
                boxShadow: '0 0 70px rgba(139, 92, 246, 0.6), inset 0 0 50px rgba(255, 255, 255, 0.2), 0 0 120px rgba(236, 72, 153, 0.4)'
              }} />

              <span className="relative text-lg sm:text-xl md:text-2xl font-black text-white transition-all duration-300 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-200 group-hover:via-purple-200 group-hover:to-pink-200 group-hover:bg-clip-text z-10" style={{
                textShadow: '0 0 25px rgba(255, 255, 255, 0.6)'
              }}>
                Admin Login
              </span>

              <div className="absolute top-0 left-0 w-5 h-5 sm:w-6 sm:h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-lg shadow-cyan-400/50" />
              <div className="absolute top-0 right-0 w-5 h-5 sm:w-6 sm:h-6 border-t-2 border-r-2 border-purple-400 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-lg shadow-purple-400/50" style={{ transitionDelay: '0.1s' }} />
              <div className="absolute bottom-0 left-0 w-5 h-5 sm:w-6 sm:h-6 border-b-2 border-l-2 border-pink-400 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-lg shadow-pink-400/50" style={{ transitionDelay: '0.2s' }} />
              <div className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 border-b-2 border-r-2 border-orange-400 rounded-br-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-lg shadow-orange-400/50" style={{ transitionDelay: '0.3s' }} />

              <div className="absolute inset-0 -translate-x-full -translate-y-full group-hover:translate-x-full group-hover:translate-y-full transition-transform duration-1000 bg-gradient-to-br from-transparent via-white/25 to-transparent will-change-transform" />
            </button>
          </div>

          {/* Trust Indicators with Quantum Animation */}
          <div className="mt-12 sm:mt-20 flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-12 px-4">
            {trustIndicators.map((text, i) => (
              <div key={i} className="group flex items-center gap-2 sm:gap-3 cursor-default">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full opacity-20 blur-lg group-hover:opacity-50 transition-opacity duration-300" />
                  <div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full shadow-lg will-change-transform"
                    style={{
                      animation: 'dotPulse 2s ease-in-out infinite',
                      animationDelay: `${i * 0.3}s`,
                      boxShadow: '0 0 12px currentColor'
                    }}
                  />
                </div>

                <span className="text-xs sm:text-sm md:text-base text-blue-100/80 font-semibold tracking-wide group-hover:text-blue-50 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-purple-300 group-hover:bg-clip-text">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes quantumFloat {
          0%, 100% { 
            transform: translate(0, 0) scale(1) rotate(0deg) translateZ(0);
            opacity: 0.6;
          }
          25% { 
            transform: translate(12px, -25px) scale(1.2) rotate(90deg) translateZ(0);
            opacity: 1;
          }
          50% { 
            transform: translate(-8px, -50px) scale(0.9) rotate(180deg) translateZ(0);
            opacity: 0.8;
          }
          75% { 
            transform: translate(-18px, -25px) scale(1.1) rotate(270deg) translateZ(0);
            opacity: 1;
          }
        }
        
        @keyframes gradientFlow {
          0% { background-position: 0% center; }
          50% { background-position: 100% center; }
          100% { background-position: 0% center; }
        }
        
        @keyframes cursorBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        
        @keyframes rippleExpand {
          0% { 
            transform: translate(-50%, -50%) scale(0) translateZ(0);
            opacity: 1;
          }
          100% { 
            transform: translate(-50%, -50%) scale(30) translateZ(0);
            opacity: 0;
          }
        }
        
        @keyframes shimmerSlide {
          0% { transform: translateX(-100%) skewX(-12deg) translateZ(0); }
          100% { transform: translateX(200%) skewX(-12deg) translateZ(0); }
        }
        
        @keyframes rotateGlow {
          from { transform: rotate(0deg) translateZ(0); }
          to { transform: rotate(360deg) translateZ(0); }
        }
        
        @keyframes dotPulse {
          0%, 100% { 
            transform: scale(1) translateZ(0);
            opacity: 1;
          }
          50% { 
            transform: scale(1.5) translateZ(0);
            opacity: 0.6;
          }
        }
        
        @keyframes glitch {
          0%, 100% { transform: translateX(0) translateZ(0); }
          20% { transform: translateX(3px) translateZ(0); }
          40% { transform: translateX(-3px) translateZ(0); }
          60% { transform: translateX(2px) translateZ(0); }
          80% { transform: translateX(-2px) translateZ(0); }
        }
        
        @keyframes megaPulse {
          0%, 100% { 
            opacity: 0.5;
            transform: scale(1) translateZ(0);
          }
          50% { 
            opacity: 0.7;
            transform: scale(1.05) translateZ(0);
          }
        }
      `}</style>
    </section>
  );
};

export default CTASection;