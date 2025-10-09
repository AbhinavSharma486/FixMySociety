import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Star, Quote, Sparkles, Zap } from 'lucide-react';

const Testimonials = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const rafRef = useRef(null);
  const lastMouseUpdate = useRef(0);

  // Memoize particles to prevent recreation on every render
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
    })), []
  );

  // Memoize testimonials data
  const testimonials = useMemo(() => [
    {
      quote: "Residents finally see transparent updates. Our TAT improved by 40%.",
      author: "Priya Sharma",
      position: "Flat 204, Green Valley Apartments",
      rating: 5,
      gradient: "from-cyan-500 via-blue-500 to-indigo-600",
      glowColor: "rgba(6, 182, 212, 0.4)"
    },
    {
      quote: "Admins can triage and resolve faster. The dashboard is simple and clear.",
      author: "Rajesh Kumar",
      position: "Flat 301, Sunrise Heights",
      rating: 5,
      gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
      glowColor: "rgba(139, 92, 246, 0.4)"
    },
    {
      quote: "Mobile-first and quick. Filing a complaint is super easy.",
      author: "Anita Desai",
      position: "Flat 102, Royal Gardens",
      rating: 5,
      gradient: "from-pink-500 via-rose-500 to-red-600",
      glowColor: "rgba(236, 72, 153, 0.4)"
    },
    {
      quote: "Our society meetings are more productive now. Everyone is on the same page.",
      author: "Vinod Gupta",
      position: "Admin, Silicon Towers",
      rating: 5,
      gradient: "from-blue-500 via-indigo-500 to-purple-600",
      glowColor: "rgba(59, 130, 246, 0.4)"
    }
  ], []);

  const doubledTestimonials = useMemo(() => [...testimonials, ...testimonials], [testimonials]);

  // Intersection Observer with useMemo
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Throttled mouse movement with RAF for smooth 60fps updates
  useEffect(() => {
    const handleMouseMove = (e) => {
      const now = performance.now();

      // Throttle to ~16ms (60fps)
      if (now - lastMouseUpdate.current < 16) {
        return;
      }

      lastMouseUpdate.current = now;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        setMousePosition({
          x: (e.clientX / window.innerWidth) * 100,
          y: (e.clientY / window.innerHeight) * 100,
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Memoize hover handlers
  const handleCardEnter = useCallback((index) => setHoveredCard(index), []);
  const handleCardLeave = useCallback(() => setHoveredCard(null), []);

  // Memoize orb transforms
  const orb1Transform = useMemo(() => ({
    transform: `translate3d(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px, 0)`,
    willChange: 'transform'
  }), [mousePosition.x, mousePosition.y]);

  const orb2Transform = useMemo(() => ({
    transform: `translate3d(-${mousePosition.x * 0.3}px, -${mousePosition.y * 0.3}px, 0)`,
    willChange: 'transform'
  }), [mousePosition.x, mousePosition.y]);

  return (
    <section ref={sectionRef} className="relative py-20 md:py-32 overflow-hidden bg-black">
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(3deg); }
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes grid-flow {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(50px) translateY(50px); }
        }

        @keyframes particle-float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { transform: translateY(-100vh) translateX(50px); }
        }

        @keyframes neon-pulse {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 20px currentColor); }
          50% { filter: brightness(1.5) drop-shadow(0 0 40px currentColor); }
        }

        @keyframes card-appear {
          from {
            opacity: 0;
            transform: translateY(50px) rotateX(20deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) rotateX(0);
          }
        }

        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(59, 182, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3); }
          50% { text-shadow: 0 0 30px rgba(59, 182, 246, 0.8), 0 0 60px rgba(139, 92, 246, 0.5); }
        }

        .animate-scroll {
          animation: scroll 40s linear infinite;
          will-change: transform;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
          will-change: transform;
        }

        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
          background-size: 2000px 100%;
          animation: shimmer 3s infinite;
        }

        .animate-grid {
          animation: grid-flow 20s linear infinite;
          will-change: transform;
        }

        .animate-particle {
          animation: particle-float var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
          will-change: transform, opacity;
        }

        .animate-neon {
          animation: neon-pulse 2s ease-in-out infinite;
        }

        .animate-card-appear {
          animation: card-appear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-text-glow {
          animation: text-glow 3s ease-in-out infinite;
        }

        .glass-morphism {
          background: rgba(15, 15, 25, 0.7);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
        }

        .glass-card {
          background: linear-gradient(135deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 40, 0.9) 100%);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        .transform-style-3d {
          transform-style: preserve-3d;
        }

        .magnetic-card {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          will-change: transform;
        }

        .magnetic-card:hover {
          transform: translateY(-10px) scale(1.03);
        }

        .holographic-border {
          position: relative;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
          border-radius: 24px;
        }

        .holographic-border::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 24px;
          padding: 2px;
          background: linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899, #06b6d4);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          background-size: 300% 300%;
          animation: gradient-rotate 4s ease infinite;
        }

        @keyframes gradient-rotate {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .scan-line {
          position: absolute;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.8), transparent);
          animation: scan 3s ease-in-out infinite;
        }

        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { top: 100%; }
        }

        .noise-texture {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
        }

        .testimonial-card-height {
          height: 320px;
        }

        @media (max-width: 640px) {
          .testimonial-card-height {
            height: 340px;
          }
        }
      `}</style>

      {/* Animated Grid Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-20 animate-grid" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 opacity-60 animate-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            '--duration': `${particle.duration}s`,
            '--delay': `${particle.delay}s`,
          }}
        />
      ))}

      {/* Radial Gradient Orbs - Optimized with translate3d */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 rounded-full blur-3xl"
        style={orb1Transform}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-600/30 rounded-full blur-3xl"
        style={orb2Transform}
      />

      {/* Header Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mb-16 md:mb-20">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 rounded-full glass-morphism border border-cyan-500/30 animate-float">
            <div className="relative">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-neon" />
              <div className="absolute inset-0 animate-pulse-ring">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              TESTIMONIALS
            </span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>

          {/* Main Heading */}
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 tracking-tight">
            <span className="text-white">What Our</span>
            <br />
            <span className="relative inline-block mt-2">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-text-glow">
                Community
              </span>
              <div className="absolute -bottom-3 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full"
                style={{
                  transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
                  transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s'
                }} />
              <div className="absolute -bottom-3 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full blur-md opacity-60"
                style={{
                  transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
                  transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s'
                }} />
            </span>
            <br />
            <span className="text-white">Says</span>
          </h2>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
            Trusted by residents and admins across{' '}
            <span className="font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              hundreds of societies
            </span>
          </p>
        </div>
      </div>

      {/* Continuous Scroll Section - AUTO SCROLLING */}
      <div className="relative z-10 overflow-hidden">
        {/* Fade Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none" />

        {/* Auto-Scrolling Cards Container */}
        <div className="flex w-max animate-scroll py-8 px-4 sm:px-6 lg:px-8">
          {doubledTestimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`flex-shrink-0 w-[340px] sm:w-[400px] mr-6 perspective-1000 ${isVisible ? 'animate-card-appear' : 'opacity-0'}`}
              style={{ animationDelay: `${(index % testimonials.length) * 0.15}s` }}
              onMouseEnter={() => handleCardEnter(index)}
              onMouseLeave={handleCardLeave}
            >
              <div className="relative group testimonial-card-height transform-style-3d magnetic-card">
                {/* Holographic Border */}
                <div className="absolute -inset-1 holographic-border opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Glow Effect */}
                <div
                  className="absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-60 blur-2xl transition-all duration-500"
                  style={{
                    background: `radial-gradient(circle, ${testimonial.glowColor}, transparent 70%)`
                  }}
                />

                {/* Main Card */}
                <div className="relative h-full glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-700/50 overflow-hidden noise-texture flex flex-col">
                  {/* Scan Line Effect */}
                  <div className="scan-line opacity-0 group-hover:opacity-100" />

                  {/* Shimmer Overlay */}
                  <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Corner Accents */}
                  <div className={`absolute top-0 left-0 w-20 h-20 bg-gradient-to-br ${testimonial.gradient} opacity-20 rounded-br-full`} />
                  <div className={`absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl ${testimonial.gradient} opacity-20 rounded-tl-full`} />

                  {/* Quote Icon */}
                  <div className="relative mb-6">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${testimonial.gradient} opacity-20 backdrop-blur-sm transform transition-transform duration-300 ${hoveredCard === index ? 'scale-110 rotate-6' : ''}`}>
                      <Quote className={`w-8 h-8 bg-gradient-to-br ${testimonial.gradient} bg-clip-text text-transparent`} />
                    </div>
                  </div>

                  {/* Quote Text */}
                  <blockquote className="relative z-10 text-gray-100 text-base sm:text-lg leading-relaxed mb-6 font-medium flex-grow">
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Author Section */}
                  <div className="relative z-10 mt-auto">
                    {/* Star Rating */}
                    <div className="flex items-center gap-1.5 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <div
                          key={i}
                          style={{
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-180deg)',
                            transition: `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1 + 0.5}s`
                          }}
                        >
                          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 drop-shadow-lg filter" style={{ filter: 'drop-shadow(0 0 4px rgba(250, 204, 21, 0.6))' }} />
                        </div>
                      ))}
                    </div>

                    {/* Author Info */}
                    <div className="space-y-2">
                      <div className="font-bold text-white text-lg tracking-wide">
                        {testimonial.author}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${testimonial.gradient}`} />
                        {testimonial.position}
                      </div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-1/2 right-4 w-32 h-32 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-full blur-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 mt-16">
        <div className="relative h-1 bg-gray-800/50 rounded-full overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
            style={{
              transform: isVisible ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s'
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;