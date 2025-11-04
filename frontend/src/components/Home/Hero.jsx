import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { ChevronRight, Shield, Zap, Smartphone, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Memoized Badge Component to prevent unnecessary re-renders
const Badge = memo(({ icon: Icon, text, index }) => (
  <div
    className="group relative px-5 py-3 rounded-full overflow-hidden cursor-pointer"
    style={{
      transitionDelay: `${index * 100}ms`,
    }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-60 blur-sm group-hover:opacity-100 transition-opacity duration-300" />
    <div className="absolute inset-[1px] bg-slate-900/90 backdrop-blur-xl rounded-full" />
    <div className="relative flex items-center space-x-2 z-10">
      <Icon className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300" />
      <span className="text-sm font-semibold text-white group-hover:text-cyan-100 transition-colors duration-300">
        {text}
      </span>
    </div>
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-blue-500/30 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
  </div>
));

Badge.displayName = 'Badge';

// Memoized Button Component
const CTAButton = memo(({ onClick, isAdmin, children }) => (
  <button
    onClick={onClick}
    className="group relative px-8 py-4 rounded-2xl font-bold text-lg transform hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer"
  >
    {!isAdmin ? (
      <>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 animate-gradient" />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
        <div className="relative flex items-center justify-center space-x-2 text-white">
          <span>{children}</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </>
    ) : (
      <>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-purple-500/50 rounded-2xl blur-sm" />
        <div className="absolute inset-[2px] bg-slate-900/60 backdrop-blur-xl rounded-2xl" />
        <span className="relative text-white group-hover:text-cyan-300 transition-colors duration-300">
          {children}
        </span>
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.5), transparent)',
            animation: 'border-flow 2s linear infinite',
          }}
        />
      </>
    )}
  </button>
));

CTAButton.displayName = 'CTAButton';

// Memoized Particle Canvas Component
const ParticleCanvas = memo(({ canvasRef }) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    let particlesRef = [];
    let animationFrameRef = null;

    const setCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    setCanvasSize();

    class Particle {
      constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > window.innerWidth) this.x = 0;
        else if (this.x < 0) this.x = window.innerWidth;
        if (this.y > window.innerHeight) this.y = 0;
        else if (this.y < 0) this.y = window.innerHeight;
      }

      draw(ctx) {
        ctx.fillStyle = `rgba(96, 165, 250, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particleCount = 80;
    for (let i = 0; i < particleCount; i++) {
      particlesRef.push(new Particle());
    }

    const maxDist = 150;
    const maxDistSq = maxDist * maxDist;

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const len = particlesRef.length;

      for (let i = 0; i < len; i++) {
        particlesRef[i].update();
        particlesRef[i].draw(ctx);

        for (let j = i + 1; j < len; j++) {
          const dx = particlesRef[i].x - particlesRef[j].x;
          const dy = particlesRef[i].y - particlesRef[j].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const distance = Math.sqrt(distSq);
            ctx.strokeStyle = `rgba(96, 165, 250, ${0.15 * (1 - distance / maxDist)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particlesRef[i].x, particlesRef[i].y);
            ctx.lineTo(particlesRef[j].x, particlesRef[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameRef = requestAnimationFrame(animate);
    };

    animate();

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setCanvasSize();
      }, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef) {
        cancelAnimationFrame(animationFrameRef);
      }
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, [canvasRef]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
});

ParticleCanvas.displayName = 'ParticleCanvas';

// Memoized Orb Component
const Orb = memo(({ orbStyle, position }) => (
  <div
    className={`absolute rounded-full opacity-30 blur-3xl pointer-events-none ${position}`}
    style={orbStyle}
  />
));

Orb.displayName = 'Orb';

// Memoized Dashboard Card Component
const DashboardCard = memo(({ cardStyle, inView }) => (
  <div
    className={`relative hidden lg:block transition-all duration-1000 delay-700 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
      }`}
  >
    <div className="relative" style={{ perspective: '1500px' }}>
      <div
        className="relative w-full h-[550px] rounded-3xl overflow-hidden transition-transform duration-700 cursor-pointer group"
        style={cardStyle}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-purple-600/20 backdrop-blur-xl border border-white/20 rounded-3xl" />

        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, rgba(96, 165, 250, 0.1) 0px, transparent 1px, transparent 40px, rgba(96, 165, 250, 0.1) 41px),
              repeating-linear-gradient(90deg, rgba(96, 165, 250, 0.1) 0px, transparent 1px, transparent 40px, rgba(96, 165, 250, 0.1) 41px)
            `,
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-transparent to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />

        <div
          className="relative z-10 h-full flex flex-col justify-center items-center text-center p-8"
          style={{
            transform: 'translateZ(50px)',
          }}
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full animate-pulse" />
            <Building
              className="relative w-28 h-28 text-cyan-400"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(34, 211, 238, 0.8))',
                animation: 'float 4s ease-in-out infinite',
              }}
            />
          </div>

          <h3
            className="text-4xl font-black text-white mb-3"
            style={{
              textShadow: '0 0 30px rgba(96, 165, 250, 0.8)',
            }}
          >
            Smart Dashboard
          </h3>
          <p className="text-xl text-blue-200 font-medium">Real-time society management</p>

          <div className="absolute top-8 right-8 w-20 h-20 border border-cyan-400/30 rounded-full animate-spin-slow" />
          <div className="absolute bottom-8 left-8 w-16 h-16 border border-purple-400/30 rounded-lg animate-pulse" />
        </div>

        <div
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"
          style={{
            animation: 'scan 4s linear infinite',
          }}
        />
      </div>

      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-cyan-400 rounded-full blur-sm"
          style={{
            top: `${20 + i * 15}%`,
            left: `${i % 2 === 0 ? '-5%' : '105%'}`,
            animation: `float ${3 + i * 0.5}s ease-in-out infinite ${i * 0.3}s`,
            opacity: 0.6,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  </div>
));

DashboardCard.displayName = 'DashboardCard';

const Hero = ({ id }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [inView, setInView] = useState(false);
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const tickingRef = useRef(false);

  // Initialize useNavigate
  const navigate = useNavigate();

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    const currentHeroRef = heroRef.current;
    if (currentHeroRef) {
      observer.observe(currentHeroRef);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Optimized throttled mouse tracking for 3D parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!tickingRef.current) {
        requestAnimationFrame(() => {
          const x = (e.clientX / window.innerWidth - 0.5) * 2;
          const y = (e.clientY / window.innerHeight - 0.5) * 2;
          setMousePosition({ x, y });
          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const badges = useMemo(() => [
    { icon: Shield, text: 'Secure' },
    { icon: Zap, text: 'Fast' },
    { icon: Smartphone, text: 'Mobile-friendly' }
  ], []);

  // Updated handler to navigate to '/login'
  const handleGetStarted = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  // Updated handler to navigate to '/admin-login'
  const handleAdminLogin = useCallback(() => {
    navigate('/admin-login');
  }, [navigate]);

  // Memoized orb styles with transform-only updates
  const orbStyle1 = useMemo(() => ({
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6), transparent)',
    transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
    transition: 'transform 0.3s ease-out',
    animation: 'pulse 8s ease-in-out infinite',
    willChange: 'transform'
  }), [mousePosition.x, mousePosition.y]);

  const orbStyle2 = useMemo(() => ({
    background: 'radial-gradient(circle, rgba(147, 51, 234, 0.6), transparent)',
    transform: `translate(${mousePosition.x * -40}px, ${mousePosition.y * -40}px)`,
    transition: 'transform 0.3s ease-out',
    animation: 'pulse 10s ease-in-out infinite 2s',
    willChange: 'transform'
  }), [mousePosition.x, mousePosition.y]);

  const orbStyle3 = useMemo(() => ({
    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.5), transparent)',
    transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
    transition: 'transform 0.3s ease-out',
    animation: 'pulse 12s ease-in-out infinite 4s',
    willChange: 'transform'
  }), [mousePosition.x, mousePosition.y]);

  const cardStyle = useMemo(() => ({
    transform: `rotateY(${mousePosition.x * 5}deg) rotateX(${-mousePosition.y * 5}deg)`,
    transformStyle: 'preserve-3d',
    willChange: 'transform'
  }), [mousePosition.x, mousePosition.y]);

  return (
    <div
      ref={heroRef}
      id={id}
      className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 text-white overflow-hidden"
    >
      {/* Particle Canvas */}
      <ParticleCanvas canvasRef={canvasRef} />

      {/* Animated Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(96, 165, 250, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(96, 165, 250, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `perspective(500px) rotateX(60deg) scale(2) translateY(-50%)`,
            transformOrigin: 'center center',
            willChange: 'transform'
          }}
        />
      </div>

      {/* Holographic Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Orb orbStyle={orbStyle1} position="top-1/4 left-1/4 w-96 h-96" />
        <Orb orbStyle={orbStyle2} position="top-1/2 right-1/4 w-[500px] h-[500px]" />
        <Orb orbStyle={orbStyle3} position="bottom-1/4 left-1/2 w-80 h-80" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Side: Text and CTAs */}
          <div className="space-y-8 text-center lg:text-left">
            <div
              className={`space-y-6 transition-all duration-1000 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
            >
              {/* Main Heading with Neon Effect */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-6xl xl:text-6xl font-black leading-tight">
                <span
                  className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient"
                  style={{
                    textShadow: '0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(59, 130, 246, 0.3)',
                  }}
                >
                  Report & Resolve
                </span>
                <span className="text-white block mt-2 drop-shadow-2xl">
                  Society Issues
                </span>
                <span
                  className="block bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent animate-gradient-reverse"
                  style={{
                    textShadow: '0 0 30px rgba(147, 51, 234, 0.5), 0 0 60px rgba(147, 51, 234, 0.3)',
                  }}
                >
                  Effortlessly
                </span>
              </h1>

              <p
                className="text-lg sm:text-xl text-blue-200 leading-relaxed max-w-2xl mx-auto lg:mx-0"
                style={{
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                }}
              >
                A seamless platform for apartment residents to report and track maintenance issues,
                ensuring a safer and more comfortable living environment.
              </p>
            </div>

            {/* Futuristic Trust Badges */}
            <div
              className={`flex flex-wrap justify-center lg:justify-start gap-4 items-center transition-all duration-1000 delay-300 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
            >
              {badges.map((badge, index) => (
                <Badge key={`badge-${index}`} icon={badge.icon} text={badge.text} index={index} />
              ))}
            </div>

            {/* Futuristic CTAs */}
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start transition-all duration-1000 delay-500  ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
            >
              <CTAButton onClick={handleGetStarted} isAdmin={false}>
                Get Started
              </CTAButton>
              <CTAButton onClick={handleAdminLogin} isAdmin={true}>
                Admin Login
              </CTAButton>
            </div>
          </div>

          {/* Right Side: 3D Holographic Dashboard */}
          <DashboardCard cardStyle={cardStyle} inView={inView} />
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx="true">{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes gradient-reverse {
          0%, 100% { background-position: 100% 50%; }
          50% { background-position: 0% 50%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }

        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes border-flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 6s ease infinite;
        }

        .animate-gradient-reverse {
          background-size: 200% 200%;
          animation: gradient-reverse 6s ease infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Hero;