import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { ChevronRight } from 'lucide-react';

// Memoized Trust Indicator Component
const TrustIndicator = memo(({ text, delay }) => (
  <div className="flex items-center gap-2 sm:gap-3">
    {/* The animate-pulse is a standard Tailwind utility */}
    <div
      className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse"
      style={{ animationDelay: `${delay}s` }}
    />
    <span className="text-xs sm:text-sm md:text-base text-blue-100 font-semibold tracking-wide">
      {text}
    </span>
  </div>
));

TrustIndicator.displayName = 'TrustIndicator';

// Memoized Floating Particle Component
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
    ...(delay && { animationDelay: delay })
  };

  // NOTE: The 'animate-float' class must be defined in your global CSS (see step 2)
  return <div className={`${color} animate-float`} style={style} />;
});

FloatingParticle.displayName = 'FloatingParticle';

const CTASection = () => { // Removed 'visibleElements' prop to ensure rendering
  const [ripples, setRipples] = useState([]);
  const rippleTimeoutRefs = useRef([]);
  const buttonRef = useRef(null);

  // Cleanup ripple timeouts on unmount
  useEffect(() => {
    return () => rippleTimeoutRefs.current.forEach(id => clearTimeout(id));
  }, []);

  // Optimized ripple handler
  const handleButtonHover = useCallback((e) => {
    // Limit ripples to prevent performance issues
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
    console.log('Navigate to resident login');
    alert('Resident Login clicked - Connect to your router');
  }, []);

  const handleAdminLogin = useCallback(() => {
    console.log('Navigate to admin login');
    alert('Admin Login clicked - Connect to your router');
  }, []);

  const trustIndicators = ['Secure', 'Fast', 'Reliable', 'Modern'];

  return (
    <section className="relative py-20 sm:py-32 lg:py-40 overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-black min-h-screen flex items-center">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 animate-pulse" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <FloatingParticle top="5rem" left="2.5rem" color="bg-blue-400" />
        <FloatingParticle top="10rem" right="5rem" color="bg-purple-400" delay="1s" />
        <FloatingParticle bottom="10rem" left="25%" color="bg-pink-400" delay="2s" />
        <FloatingParticle top="33%" right="33%" color="bg-cyan-400" delay="3s" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Removed conditional opacity/transform for guaranteed visibility */}
        <div id="cta-content" className="opacity-100 transform translate-y-0">
          {/* Status Badge */}
          <div className="flex justify-center mb-10 sm:mb-16">
            <div className="relative group cursor-default">
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full opacity-20 blur-xl" />
              <div className="relative px-6 sm:px-10 py-3 sm:py-4 bg-black/80 backdrop-blur-sm rounded-full border border-cyan-400/40">
                <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                  <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-cyan-400"></span>
                  </span>
                  <span className="tracking-wider">NEXT-GENERATION PLATFORM</span>
                </span>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="text-center mb-6 sm:mb-10 space-y-3 sm:space-y-6">
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-tight leading-none px-4">
              Bring Your Society
            </h2>

            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-none px-4">
              <span className="relative inline-block">
                <span className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 blur-2xl opacity-30 animate-pulse" />
                <span className="relative bg-gradient-to-r from-yellow-200 via-orange-400 to-pink-400 bg-clip-text text-transparent font-black">
                  Online Today
                </span>
              </span>
            </h2>
          </div>

          <p className="text-center text-base sm:text-xl md:text-2xl lg:text-3xl text-blue-200/90 mb-12 sm:mb-20 max-w-3xl mx-auto font-light tracking-wide px-4">
            Fast setup, no training required.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-6 sm:mb-8 px-4">
            {/* Primary Button */}
            <button
              ref={buttonRef}
              onMouseMove={handleButtonHover}
              onClick={handleResidentLogin}
              className="group relative w-full sm:w-auto px-8 sm:px-12 py-5 sm:py-7 overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-purple-50" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300" />

              {ripples.map(ripple => (
                <span
                  key={ripple.id}
                  // NOTE: The 'animate-ripple' class must be defined in your global CSS
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
                <span className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Login as Resident
                </span>
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 transition-transform duration-300 group-hover:translate-x-2" />
              </div>
            </button>

            {/* Secondary Button */}
            <button
              onClick={handleAdminLogin}
              className="group relative w-full sm:w-auto px-8 sm:px-12 py-5 sm:py-7 overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl transition-all duration-300 group-hover:bg-white/15 group-hover:border-white/40" />
              <div className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-300 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 blur-md" />

              <span className="relative text-lg sm:text-xl md:text-2xl font-black text-white z-10">
                Admin Login
              </span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 sm:mt-20 flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-12 px-4">
            {trustIndicators.map((text, i) => (
              <TrustIndicator key={text} text={text} delay={i * 0.3} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(CTASection);