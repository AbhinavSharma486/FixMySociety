import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Star, Quote, Sparkles, Zap } from 'lucide-react';

const Testimonials = ({ id }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const rafRef = useRef(null);
  const lastMouseUpdate = useRef(0);
  const mousePositionRef = useRef({ x: 0, y: 0 });

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
      quote: "Our society meetings are more productive now.",
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
      { threshold: 0.2, rootMargin: '50px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Optimized mouse movement with RAF batching
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Store mouse position immediately
      mousePositionRef.current = {
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      };

      const now = performance.now();

      // Throttle to ~33ms (30fps is sufficient for mouse tracking)
      if (now - lastMouseUpdate.current < 33) {
        return;
      }

      lastMouseUpdate.current = now;

      // Cancel pending frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Batch state update in RAF
      rafRef.current = requestAnimationFrame(() => {
        setMousePosition(mousePositionRef.current);
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

  // Memoize orb transforms with will-change optimization
  const orb1Style = useMemo(() => ({
    transform: `translate3d(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px, 0)`,
  }), [mousePosition.x, mousePosition.y]);

  const orb2Style = useMemo(() => ({
    transform: `translate3d(-${mousePosition.x * 0.3}px, -${mousePosition.y * 0.3}px, 0)`,
  }), [mousePosition.x, mousePosition.y]);

  // Memoize particle styles
  const particleElements = useMemo(() =>
    particles.map((particle) => (
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
    )), [particles]
  );

  // Memoize underline style
  const underlineStyle = useMemo(() => ({
    transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
    transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s'
  }), [isVisible]);

  // Memoize bottom accent style
  const accentStyle = useMemo(() => ({
    transform: isVisible ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s'
  }), [isVisible]);

  return (
    <section ref={sectionRef} id={id} className="relative py-12 sm:py-16 md:py-20 lg:py-32 overflow-hidden bg-black">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
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

        @media (min-width: 768px) {
          .magnetic-card:hover {
            transform: translateY(-10px) scale(1.03);
          }
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
          height: auto;
          min-height: 280px;
        }

        @media (min-width: 640px) {
          .testimonial-card-height {
            min-height: 320px;
          }
        }

        /* Performance optimization: contain layout and paint */
        .contained-layout {
          contain: layout style paint;
        }

        /* Optimize will-change usage */
        .orb-container {
          will-change: transform;
          transform: translateZ(0);
        }

        /* Responsive orb sizing */
        @media (max-width: 640px) {
          .orb-container {
            width: 200px !important;
            height: 200px !important;
          }
        }
      `}</style>

      {/* Animated Grid Background */}
      <div className="absolute inset-0 overflow-hidden contained-layout">
        <div className="absolute inset-0 opacity-20 animate-grid" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Floating Particles - Memoized */}
      <div className="hidden sm:block">
        {particleElements}
      </div>

      {/* Radial Gradient Orbs - Optimized with GPU acceleration */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 rounded-full blur-3xl orb-container"
        style={orb1Style}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-600/30 rounded-full blur-3xl orb-container"
        style={orb2Style}
      />

      {/* Header Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-12 md:mb-16 lg:mb-20">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 mb-6 sm:mb-8 rounded-full glass-morphism border border-cyan-500/30 animate-float">
            <div className="relative">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 animate-neon" />
              <div className="absolute inset-0 animate-pulse-ring">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
              </div>
            </div>
            <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              TESTIMONIALS
            </span>
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
          </div>

          {/* Main Heading */}
          <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black mb-4 sm:mb-6 tracking-tight px-2">
            <span className="text-white">What Our </span>
            <span className="relative inline-block mt-1 sm:mt-2">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-text-glow">
                Community
              </span>
              <div className="absolute -bottom-2 sm:-bottom-3 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full"
                style={underlineStyle} />
              <div className="absolute -bottom-2 sm:-bottom-3 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full blur-md opacity-60"
                style={underlineStyle} />
            </span>
            <span className="text-white"> Says</span>
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed px-4">
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
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 lg:w-48 bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 lg:w-48 bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none" />

        {/* Auto-Scrolling Cards Container */}
        <div className="flex w-max animate-scroll py-6 sm:py-8 px-2 sm:px-4 md:px-6 lg:px-8">
          {doubledTestimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`flex-shrink-0 w-[280px] xs:w-[300px] sm:w-[340px] md:w-[380px] lg:w-[400px] mr-4 sm:mr-6 perspective-1000 ${isVisible ? 'animate-card-appear' : 'opacity-0'}`}
              style={{ animationDelay: `${(index % testimonials.length) * 0.15}s` }}
              onMouseEnter={() => handleCardEnter(index)}
              onMouseLeave={handleCardLeave}
            >
              <div className="relative group testimonial-card-height transform-style-3d magnetic-card contained-layout">
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
                <div className="relative h-full glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl border border-gray-700/50 overflow-hidden noise-texture flex flex-col">
                  {/* Scan Line Effect */}
                  <div className="scan-line opacity-0 group-hover:opacity-100" />

                  {/* Shimmer Overlay */}
                  <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Corner Accents */}
                  <div className={`absolute top-0 left-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${testimonial.gradient} opacity-20 rounded-br-full`} />
                  <div className={`absolute bottom-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tl ${testimonial.gradient} opacity-20 rounded-tl-full`} />

                  {/* Quote Icon */}
                  <div className="relative mb-4 sm:mb-6">
                    <div className={`inline-flex p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${testimonial.gradient} opacity-20 backdrop-blur-sm transform transition-transform duration-300 ${hoveredCard === index ? 'scale-110 rotate-6' : ''}`}>
                      <Quote className={`w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br ${testimonial.gradient} bg-clip-text text-transparent`} />
                    </div>
                  </div>

                  {/* Quote Text */}
                  <blockquote className="relative z-10 text-gray-100 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6 font-medium flex-grow">
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Author Section */}
                  <div className="relative z-10 mt-auto">
                    {/* Star Rating */}
                    <div className="flex items-center gap-1 sm:gap-1.5 mb-3 sm:mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <div
                          key={i}
                          style={{
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-180deg)',
                            transition: `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1 + 0.5}s`
                          }}
                        >
                          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400 drop-shadow-lg filter" style={{ filter: 'drop-shadow(0 0 4px rgba(250, 204, 21, 0.6))' }} />
                        </div>
                      ))}
                    </div>

                    {/* Author Info */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="font-bold text-white text-base sm:text-lg tracking-wide">
                        {testimonial.author}
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 font-medium">
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r ${testimonial.gradient} flex-shrink-0`} />
                        <span className="break-words">{testimonial.position}</span>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-1/2 right-4 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-full blur-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 mt-10 sm:mt-12 md:mt-16">
        <div className="relative h-1 bg-gray-800/50 rounded-full overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
            style={accentStyle}
          />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;