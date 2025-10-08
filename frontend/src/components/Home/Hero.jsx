import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Shield, Zap, Smartphone, Building, MessageCircle } from 'lucide-react';

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inView, setInView] = useState(false);
  const heroRef = useRef(null);
  const canvasRef = useRef(null);

  // Navigation function (placeholder for demo)
  const navigate = (path) => {
    console.log(`Navigating to ${path}`);
  };

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.2 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  // Mouse tracking for 3D parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Particle system canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 80;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = `rgba(96, 165, 250, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        particle.update();
        particle.draw();

        // Connect nearby particles
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.strokeStyle = `rgba(96, 165, 250, ${0.15 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const badges = [
    { icon: Shield, text: 'Secure' },
    { icon: Zap, text: 'Fast' },
    { icon: Smartphone, text: 'Mobile-friendly' }
  ];

  return (
    <div
      ref={heroRef}
      className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 text-white overflow-hidden"
    >
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Animated Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20">
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
          }}
        />
      </div>

      {/* Holographic Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6), transparent)',
            transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
            transition: 'transform 0.3s ease-out',
            animation: 'pulse 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-1/2 right-1/4 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.6), transparent)',
            transform: `translate(${mousePosition.x * -40}px, ${mousePosition.y * -40}px)`,
            transition: 'transform 0.3s ease-out',
            animation: 'pulse 10s ease-in-out infinite 2s',
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/2 w-80 h-80 rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.5), transparent)',
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
            transition: 'transform 0.3s ease-out',
            animation: 'pulse 12s ease-in-out infinite 4s',
          }}
        />
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
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl font-black leading-tight">
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
                <div
                  key={index}
                  className="group relative px-5 py-3 rounded-full overflow-hidden cursor-pointer"
                  style={{
                    transitionDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Holographic Border Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-60 blur-sm group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-[1px] bg-slate-900/90 backdrop-blur-xl rounded-full" />

                  {/* Content */}
                  <div className="relative flex items-center space-x-2 z-10">
                    <badge.icon className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300" />
                    <span className="text-sm font-semibold text-white group-hover:text-cyan-100 transition-colors duration-300">
                      {badge.text}
                    </span>
                  </div>

                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-blue-500/30 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                </div>
              ))}
            </div>

            {/* Futuristic CTAs */}
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start transition-all duration-1000 delay-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
            >
              {/* Primary Button */}
              <button
                onClick={() => navigate("/login")}
                className="group relative px-8 py-4 rounded-2xl overflow-hidden font-bold text-lg transform hover:scale-105 transition-all duration-300"
              >
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 animate-gradient" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

                {/* Content */}
                <div className="relative flex items-center justify-center space-x-2 text-white">
                  <span>Get Started</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>

                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>

              {/* Secondary Button */}
              <button className="group relative px-8 py-4 rounded-2xl font-bold text-lg transform hover:scale-105 transition-all duration-300 overflow-hidden">
                {/* Glass Border */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-purple-500/50 rounded-2xl blur-sm" />
                <div className="absolute inset-[2px] bg-slate-900/60 backdrop-blur-xl rounded-2xl" />

                {/* Content */}
                <span className="relative text-white group-hover:text-cyan-300 transition-colors duration-300">
                  Admin Login
                </span>

                {/* Hover Border Animation */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.5), transparent)',
                    animation: 'border-flow 2s linear infinite',
                  }}
                />
              </button>
            </div>
          </div>

          {/* Right Side: 3D Holographic Dashboard */}
          <div
            className={`relative hidden lg:block transition-all duration-1000 delay-700 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}
          >
            <div className="relative" style={{ perspective: '1500px' }}>
              {/* Main Holographic Card */}
              <div
                className="relative w-full h-[550px] rounded-3xl overflow-hidden transition-transform duration-700 cursor-pointer group"
                style={{
                  transform: `rotateY(${mousePosition.x * 5}deg) rotateX(${-mousePosition.y * 5}deg)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Holographic Glass Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-purple-600/20 backdrop-blur-xl border border-white/20 rounded-3xl" />

                {/* Animated Mesh Background */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `
                      repeating-linear-gradient(0deg, rgba(96, 165, 250, 0.1) 0px, transparent 1px, transparent 40px, rgba(96, 165, 250, 0.1) 41px),
                      repeating-linear-gradient(90deg, rgba(96, 165, 250, 0.1) 0px, transparent 1px, transparent 40px, rgba(96, 165, 250, 0.1) 41px)
                    `,
                  }}
                />

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-transparent to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-8"
                  style={{
                    transform: 'translateZ(50px)',
                  }}
                >
                  {/* Floating Building Icon */}
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

                  <h3 className="text-4xl font-black text-white mb-3"
                    style={{
                      textShadow: '0 0 30px rgba(96, 165, 250, 0.8)',
                    }}
                  >
                    Smart Dashboard
                  </h3>
                  <p className="text-xl text-blue-200 font-medium">
                    Real-time society management
                  </p>

                  {/* Decorative Elements */}
                  <div className="absolute top-8 right-8 w-20 h-20 border border-cyan-400/30 rounded-full animate-spin-slow" />
                  <div className="absolute bottom-8 left-8 w-16 h-16 border border-purple-400/30 rounded-lg animate-pulse" />
                </div>

                {/* Scan Line Effect */}
                <div
                  className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"
                  style={{
                    animation: 'scan 4s linear infinite',
                  }}
                />
              </div>

              {/* Floating Notification Card */}
              <div
                className="absolute -bottom-8 -right-8 w-72 p-5 rounded-2xl overflow-hidden transition-all duration-700 cursor-pointer group/card"
                style={{
                  transform: `translateZ(100px) rotateZ(-6deg)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Glass Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-black/90 backdrop-blur-xl border border-cyan-400/30 rounded-2xl" />

                {/* Neon Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 blur-xl" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <MessageCircle className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="font-bold text-white text-lg">Complaint Filed</div>
                  </div>
                  <p className="text-sm text-blue-200 mb-3">Water leakage in B-wing</p>
                  <div className="flex items-center">
                    <span className="relative px-3 py-1.5 rounded-full text-xs font-bold overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-80" />
                      <span className="relative text-white">In Progress</span>
                    </span>
                  </div>
                </div>

                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-bl-full" />
              </div>

              {/* Floating Particles around card */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-cyan-400 rounded-full blur-sm"
                  style={{
                    top: `${20 + i * 15}%`,
                    left: `${i % 2 === 0 ? '-5%' : '105%'}`,
                    animation: `float ${3 + i * 0.5}s ease-in-out infinite ${i * 0.3}s`,
                    opacity: 0.6,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
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