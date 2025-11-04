import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Users, CheckCircle, MessageCircle } from 'lucide-react';

// Memoized step card component to prevent unnecessary re-renders
const StepCard = memo(({ step, index, isActive, isVisible, handleMouseMove, handleStepHover, mousePosition }) => {
  const Icon = step.icon;
  const delay = index * 200;

  return (
    <div
      className={`relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => handleStepHover(index)}
    >
      {/* Holographic Card */}
      <div className="relative group h-full">
        {/* Glow Effect */}
        <div
          className={`absolute -inset-0.5 bg-gradient-to-r ${step.gradient} rounded-3xl opacity-0 group-hover:opacity-75 blur-xl transition-all duration-500 will-change-transform ${isActive ? 'opacity-60' : ''}`}
        ></div>

        {/* Main Card */}
        <div className="relative h-full p-8 rounded-3xl backdrop-blur-xl bg-slate-900/40 border border-white/10 group-hover:border-white/20 transition-all duration-500 overflow-hidden">
          {/* Shimmer Effect */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1) 0%, transparent 50%)`,
              willChange: 'background'
            }}
          ></div>

          {/* Step Number Badge */}
          <div className="absolute -top-4 -right-4 w-16 h-16 flex items-center justify-center">
            <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-2xl rotate-45 group-hover:rotate-90 transition-transform duration-500 will-change-transform`}></div>
            <span className="relative z-10 text-white font-black text-xl">
              {step.number}
            </span>
          </div>

          {/* Icon Container */}
          <div className="relative mb-8">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.gradient} p-0.5 group-hover:scale-110 transition-transform duration-500 will-change-transform ${isActive ? 'scale-110' : ''}`}>
              <div className="w-full h-full rounded-2xl bg-slate-900/90 flex items-center justify-center backdrop-blur-sm">
                <Icon className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <h3 className={`text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 origin-left will-change-transform`}>
              {step.title}
            </h3>
            <p className="text-blue-200/70 leading-relaxed text-base group-hover:text-blue-100/80 transition-colors duration-300">
              {step.description}
            </p>
          </div>

          {/* Bottom Accent Line */}
          <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${step.gradient} transition-all duration-500 will-change-transform ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
        </div>
      </div>

      {/* Connector Dot */}
      {index < 2 && (
        <div className="hidden md:block absolute top-1/2 -right-6 w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 z-20 animate-pulse"></div>
      )}
    </div>
  );
});

StepCard.displayName = 'StepCard';

// Memoized particle component
const Particles = memo(({ particles }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {particles.map((particle) => (
      <div
        key={particle.id}
        className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60 will-change-transform"
        style={{
          left: particle.left,
          top: particle.top,
          animation: `float ${particle.duration}s ease-in-out infinite`,
          animationDelay: `${particle.delay}s`,
          transform: 'translate3d(0, 0, 0)'
        }}
      ></div>
    ))}
  </div>
));

Particles.displayName = 'Particles';

// Memoized progress indicator
const ProgressIndicator = memo(({ steps, activeStep, handleProgressClick }) => (
  <div className="flex justify-center gap-3 mt-16">
    {steps.map((_, index) => (
      <button
        key={index}
        onClick={() => handleProgressClick(index)}
        className={`h-2 rounded-full transition-all duration-500 will-change-transform ${activeStep === index
          ? 'w-12 bg-gradient-to-r from-blue-500 to-purple-500'
          : 'w-2 bg-white/20 hover:bg-white/40'
          }`}
      ></button>
    ))}
  </div>
));

ProgressIndicator.displayName = 'ProgressIndicator';

const HowItWork = ({ id }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const rafIdRef = useRef(null);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mousePositionRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(() => {
        setMousePosition(mousePositionRef.current);
        rafIdRef.current = null;
      });
    }
  }, []);

  const handleStepHover = useCallback((index) => {
    setActiveStep(index);
  }, []);

  const handleProgressClick = useCallback((index) => {
    setActiveStep(index);
  }, []);

  const steps = useMemo(() => [
    {
      number: '01',
      title: 'Sign Up & Verify',
      description: 'Join using your building and flat details. Our system verifies your identity to ensure a secure community.',
      icon: Users,
      gradient: 'from-cyan-400 via-blue-500 to-purple-600',
      glow: 'rgba(59, 130, 246, 0.5)'
    },
    {
      number: '02',
      title: 'Raise & Track',
      description: 'Easily create complaints for maintenance issues. Attach photos and track real-time updates on their resolution.',
      icon: MessageCircle,
      gradient: 'from-purple-400 via-pink-500 to-red-500',
      glow: 'rgba(168, 85, 247, 0.5)'
    },
    {
      number: '03',
      title: 'Resolve & Review',
      description: 'Admins receive notifications and manage issues efficiently. Once resolved, you can review the outcome.',
      icon: CheckCircle,
      gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
      glow: 'rgba(20, 184, 166, 0.5)'
    }
  ], []);

  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 5 + Math.random() * 10,
      delay: Math.random() * 5
    }))
    , []);

  return (
    <section className="relative min-h-screen py-20 md:py-32 overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" ref={containerRef} id={id}>
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20 will-change-transform" style={{ transform: 'translate3d(0, 0, 0)' }}>
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'grid-flow 20s linear infinite',
          willChange: 'transform',
          backfaceVisibility: 'hidden'
        }}></div>
      </div>

      {/* Floating Particles */}
      <Particles particles={particles} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 md:mb-24 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ willChange: 'opacity, transform', backfaceVisibility: 'hidden' }}>
          <div className="inline-block mb-4">
            <span className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-semibold tracking-wider backdrop-blur-sm">
              PROCESS
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 relative">
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                How It
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 opacity-30 blur-2xl"></div>
            </span>
            {' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                Works
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 opacity-50 blur-3xl animate-pulse"></div>
            </span>
          </h2>
          <p className="text-lg md:text-xl text-blue-200/80 max-w-3xl mx-auto leading-relaxed">
            Experience seamless society management through our revolutionary three-step process
          </p>
        </div>

        {/* Connection Lines */}
        <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 w-full max-w-5xl h-1 pointer-events-none" style={{ transform: 'translate3d(-50%, -50%, 0)' }}>
          <svg className="w-full h-full" style={{ minHeight: '2px', willChange: 'auto' }}>
            <line
              x1="15%"
              y1="0"
              x2="85%"
              y2="0"
              stroke="url(#line-gradient)"
              strokeWidth="2"
              strokeDasharray="8 4"
              className="animate-dash"
              style={{ willChange: 'stroke-dashoffset' }}
            />
            <defs>
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
                <stop offset="50%" stopColor="rgba(168, 85, 247, 0.6)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.2)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
          {steps.map((step, index) => (
            <StepCard
              key={index}
              step={step}
              index={index}
              isActive={activeStep === index}
              isVisible={isVisible}
              handleMouseMove={handleMouseMove}
              handleStepHover={handleStepHover}
              mousePosition={mousePosition}
            />
          ))}
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator
          steps={steps}
          activeStep={activeStep}
          handleProgressClick={handleProgressClick}
        />
      </div>

      <style jsx="true">{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateZ(0); }
          50% { transform: translateY(-20px) translateZ(0); }
        }
        @keyframes grid-flow {
          0% { transform: translateY(0) translateZ(0); }
          100% { transform: translateY(50px) translateZ(0); }
        }
        @keyframes dash {
          to { stroke-dashoffset: -24; }
        }
        .animate-dash {
          animation: dash 1.5s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default HowItWork;