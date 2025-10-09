import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

const CTASection = ({ visibleElements }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState([]);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 0.016);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const handleButtonHover = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRipples(prev => [...prev, { x, y, id: Date.now() }]);

    setTimeout(() => {
      setRipples(prev => prev.slice(1));
    }, 1000);
  };

  return (
    <section className="relative py-32 overflow-hidden bg-black">
      {/* Quantum Field Background */}
      <div className="absolute inset-0">
        {/* Deep Space Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-black opacity-90" />

        {/* Nebula Effect */}
        <div
          className="absolute inset-0 opacity-40 mix-blend-screen"
          style={{
            background: `radial-gradient(ellipse at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.6) 0%, rgba(59, 130, 246, 0.3) 25%, transparent 50%)`
          }}
        />

        {/* Secondary Glow */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, rgba(236, 72, 153, 0.4) 0%, transparent 40%)`
          }}
        />
      </div>

      {/* Quantum Grid with Perspective */}
      <div className="absolute inset-0 opacity-25">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            transform: 'perspective(1000px) rotateX(65deg) scale(2)',
            transformOrigin: 'center 40%',
            maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)'
          }}
        />
      </div>

      {/* Holographic Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(99, 102, 241, 0.5) 2px, rgba(99, 102, 241, 0.5) 4px)',
          animation: 'scanlines 8s linear infinite'
        }} />
      </div>

      {/* Energy Orbs with Quantum Motion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => {
          const angle = (time * (0.2 + i * 0.1)) + (i * Math.PI / 3);
          const radius = 30 + i * 10;
          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;

          return (
            <div
              key={i}
              className="absolute rounded-full transition-all duration-300"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${200 + i * 40}px`,
                height: `${200 + i * 40}px`,
                background: i % 3 === 0
                  ? 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(139, 92, 246, 0.2) 30%, transparent 70%)'
                  : i % 3 === 1
                    ? 'radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, rgba(219, 39, 119, 0.15) 30%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(37, 99, 235, 0.2) 30%, transparent 70%)',
                filter: 'blur(60px)',
                transform: 'translate(-50%, -50%)',
                mixBlendMode: 'screen'
              }}
            />
          );
        })}
      </div>

      {/* Laser Scan Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-70"
          style={{
            boxShadow: '0 0 20px rgba(34, 211, 238, 0.8), 0 0 40px rgba(34, 211, 238, 0.4)',
            animation: 'verticalScan 6s ease-in-out infinite'
          }}
        />
      </div>

      {/* Floating Particles with Depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 ? 'rgba(59, 130, 246, 0.8)' : i % 3 === 1 ? 'rgba(139, 92, 246, 0.8)' : 'rgba(236, 72, 153, 0.8)',
              boxShadow: `0 0 ${4 + Math.random() * 6}px currentColor`,
              animation: `floatParticle ${8 + Math.random() * 12}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.4 + Math.random() * 0.4
            }}
          />
        ))}
      </div>

      {/* Energy Waves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-500"
            style={{
              width: '100px',
              height: '100px',
              animation: `expandRing ${3 + i}s ease-out infinite`,
              animationDelay: `${i * 1}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          id="cta-content"
          data-animate
          className={`transition-all duration-1000 ${visibleElements.has('cta-content')
            ? 'opacity-100 transform translate-y-0'
            : 'opacity-0 transform translate-y-8'
            }`}
        >
          {/* Quantum Badge */}
          <div className="flex justify-center mb-12">
            <div className="relative group cursor-default">
              {/* Outer Glow Ring */}
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full opacity-30 blur-xl group-hover:opacity-50 transition-all duration-500 animate-pulse" />

              {/* Badge Container */}
              <div className="relative px-8 py-3 bg-black/60 backdrop-blur-2xl border border-cyan-400/40 rounded-full shadow-2xl group-hover:border-cyan-400/70 transition-all duration-300">
                {/* Inner Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-full" />

                <span className="relative text-sm font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent flex items-center gap-3">
                  {/* Quantum Pulse Indicator */}
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" style={{ animationDelay: '0.5s' }}></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-lg shadow-cyan-500/50"></span>
                  </span>
                  NEXT-GENERATION PLATFORM
                </span>
              </div>

              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>

          {/* Holographic Heading */}
          <div className="text-center mb-8 space-y-4">
            {/* Top Line */}
            <div className="relative inline-block">
              <h2 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-black text-white tracking-tight leading-none">
                <span className="inline-block relative">
                  Bring Your Society
                  {/* Holographic Layer */}
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-2xl animate-pulse" style={{ animationDuration: '3s' }} />
                </span>
              </h2>
            </div>

            {/* Featured Line with Quantum Effect */}
            <div className="relative inline-block">
              <h2 className="text-5xl sm:text-6xl lg:text-8xl xl:text-9xl font-black leading-none">
                <span className="relative inline-block group/text">
                  {/* Mega Glow Effect */}
                  <span className="absolute -inset-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 blur-3xl opacity-40 group-hover/text:opacity-60 transition-opacity duration-500" style={{ animation: 'pulse 2s ease-in-out infinite' }} />

                  {/* Secondary Glow */}
                  <span className="absolute -inset-4 bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 blur-2xl opacity-50" style={{ animation: 'pulse 2s ease-in-out infinite 0.5s' }} />

                  {/* Main Text */}
                  <span className="relative bg-gradient-to-r from-yellow-200 via-orange-400 to-pink-400 bg-clip-text text-transparent font-black" style={{
                    backgroundSize: '200% 100%',
                    animation: 'shimmerFlow 4s ease-in-out infinite'
                  }}>
                    Online Today
                  </span>

                  {/* Glitch Layers */}
                  <span className="absolute inset-0 bg-gradient-to-r from-yellow-200 via-orange-400 to-pink-400 bg-clip-text text-transparent opacity-0 group-hover/text:opacity-100 transition-opacity" style={{
                    animation: 'glitchShift 0.3s ease-in-out infinite',
                    transform: 'translateX(2px)'
                  }}>
                    Online Today
                  </span>
                </span>
              </h2>
            </div>
          </div>

          {/* Animated Subtitle */}
          <p className="text-center text-xl sm:text-2xl lg:text-3xl text-blue-200/90 mb-20 max-w-3xl mx-auto font-light tracking-wide">
            <span className="inline-block relative">
              <span className="relative z-10">Fast setup, no training required.</span>
              <span className="absolute right-0 top-0 bottom-0 w-0.5 bg-cyan-400 animate-blink shadow-lg shadow-cyan-400/50" />
            </span>
          </p>

          {/* Revolutionary CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-4">
            {/* Primary Quantum Button */}
            <button
              onMouseMove={handleButtonHover}
              className="group relative px-12 py-7 overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl"
            >
              {/* Base Layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-purple-50 transition-all duration-500" />

              {/* Quantum Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                animation: 'slideShimmer 3s ease-in-out infinite'
              }} />

              {/* Energy Field */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />

              {/* Ripple Effects */}
              {ripples.map(ripple => (
                <span
                  key={ripple.id}
                  className="absolute rounded-full bg-gradient-to-r from-blue-400/40 to-purple-400/40"
                  style={{
                    left: ripple.x,
                    top: ripple.y,
                    width: '8px',
                    height: '8px',
                    transform: 'translate(-50%, -50%)',
                    animation: 'quantumRipple 1s ease-out forwards'
                  }}
                />
              ))}

              {/* Holographic Border */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
                boxShadow: '0 0 40px rgba(59, 130, 246, 0.6), inset 0 0 30px rgba(59, 130, 246, 0.2), 0 0 80px rgba(139, 92, 246, 0.4)'
              }} />

              {/* Content */}
              <div className="relative flex items-center justify-center space-x-3 z-10">
                <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent" style={{
                  backgroundSize: '200% 100%',
                  animation: 'shimmerFlow 3s ease-in-out infinite'
                }}>
                  Login as Resident
                </span>
                <ChevronRight className="w-7 h-7 text-blue-600 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-125 drop-shadow-lg" />
              </div>

              {/* Prismatic Shine */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />

              {/* Corner Energy */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-cyan-400/30 to-transparent rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-purple-400/30 to-transparent rounded-br-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
            </button>

            {/* Secondary Glassmorphic Button */}
            <button className="group relative px-12 py-7 overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95">
              {/* Ultra Glass Layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-purple-500/5 to-pink-500/10 backdrop-blur-2xl border-2 border-white/30 rounded-2xl transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-white/20 group-hover:via-purple-500/10 group-hover:to-pink-500/15 group-hover:border-white/50" />

              {/* Rotating Energy Ring */}
              <div className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-60 blur-md" style={{
                  animation: 'rotateSlow 6s linear infinite'
                }} />
              </div>

              {/* Plasma Glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
                boxShadow: '0 0 60px rgba(139, 92, 246, 0.5), inset 0 0 40px rgba(255, 255, 255, 0.15), 0 0 100px rgba(236, 72, 153, 0.3)'
              }} />

              {/* Content */}
              <span className="relative text-xl sm:text-2xl font-black text-white transition-all duration-300 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-200 group-hover:via-purple-200 group-hover:to-pink-200 group-hover:bg-clip-text z-10" style={{
                textShadow: '0 0 20px rgba(255, 255, 255, 0.5)'
              }}>
                Admin Login
              </span>

              {/* Quantum Corners */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-lg shadow-cyan-400/50" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-purple-400 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-lg shadow-purple-400/50" style={{ transitionDelay: '0.1s' }} />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-pink-400 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-lg shadow-pink-400/50" style={{ transitionDelay: '0.2s' }} />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-orange-400 rounded-br-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-lg shadow-orange-400/50" style={{ transitionDelay: '0.3s' }} />

              {/* Diagonal Light Sweep */}
              <div className="absolute inset-0 -translate-x-full -translate-y-full group-hover:translate-x-full group-hover:translate-y-full transition-transform duration-1000 bg-gradient-to-br from-transparent via-white/20 to-transparent" />
            </button>
          </div>

          {/* Trust Indicators with Quantum Animation */}
          <div className="mt-20 flex flex-wrap justify-center items-center gap-8 sm:gap-12">
            {['Secure', 'Fast', 'Reliable', 'Modern'].map((text, i) => (
              <div key={i} className="group flex items-center gap-3 cursor-default">
                {/* Quantum Dot */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-300" />
                  <div
                    className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full shadow-lg"
                    style={{
                      animation: 'quantumPulse 2s ease-in-out infinite',
                      animationDelay: `${i * 0.3}s`,
                      boxShadow: '0 0 10px currentColor'
                    }}
                  />
                </div>

                <span className="text-sm sm:text-base text-blue-100/80 font-semibold tracking-wide group-hover:text-blue-50 transition-colors duration-300 group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-purple-300 group-hover:bg-clip-text">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes floatParticle {
          0%, 100% { 
            transform: translate(0, 0) scale(1);
            opacity: 0.6;
          }
          25% { 
            transform: translate(10px, -20px) scale(1.1);
            opacity: 1;
          }
          50% { 
            transform: translate(-5px, -40px) scale(0.9);
            opacity: 0.8;
          }
          75% { 
            transform: translate(-15px, -20px) scale(1.05);
            opacity: 1;
          }
        }
        
        @keyframes verticalScan {
          0% { top: -2%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 102%; opacity: 0; }
        }
        
        @keyframes shimmerFlow {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        
        @keyframes quantumRipple {
          0% { 
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% { 
            transform: translate(-50%, -50%) scale(25);
            opacity: 0;
          }
        }
        
        @keyframes slideShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes quantumPulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.4);
            opacity: 0.7;
          }
        }
        
        @keyframes expandRing {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(8);
            opacity: 0;
          }
        }
        
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(20px); }
        }
        
        @keyframes glitchShift {
          0%, 100% { transform: translateX(0); }
          33% { transform: translateX(2px); }
          66% { transform: translateX(-2px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </section>
  );
};

export default CTASection;