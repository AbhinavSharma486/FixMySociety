import React, { useState, useEffect } from 'react';
import { Shield, Users, CheckCircle, Lock, ChevronLeft, ChevronRight } from 'lucide-react';

const Security = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = document.getElementById('security-section')?.getBoundingClientRect();
      if (rect) {
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const securityFeatures = [
    { icon: Lock, title: 'Secure Sessions', description: 'HttpOnly cookies, strict same-site', id: 'secure-sessions', color: 'from-cyan-400 via-blue-500 to-purple-600' },
    { icon: Users, title: 'Role-based Access', description: 'Separate user & admin sessions', id: 'role-based-access', color: 'from-purple-400 via-pink-500 to-red-500' },
    { icon: CheckCircle, title: 'Verified Users', description: 'Email verification & password policies', id: 'verified-users', color: 'from-green-400 via-emerald-500 to-teal-600' },
    { icon: Shield, title: 'Data Storage', description: 'Built on MongoDB and Cloud-ready uploads', id: 'data-storage', color: 'from-blue-400 via-indigo-500 to-violet-600' }
  ];

  const handleNext = () => {
    if (currentIndex < securityFeatures.length - 1) {
      setDirection(1);
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  };

  return (
    <section
      id="security-section"
      className="relative py-24 md:py-32 bg-gray-900 overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%), linear-gradient(to bottom, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'
      }}
    >
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `perspective(500px) rotateX(60deg) scale(2)`,
            transformOrigin: 'center center'
          }}
        />
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 bg-gradient-to-r from-blue-500 to-purple-500"
          style={{
            top: '10%',
            left: '10%',
            animation: 'float 20s ease-in-out infinite'
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 bg-gradient-to-r from-purple-500 to-pink-500"
          style={{
            bottom: '10%',
            right: '10%',
            animation: 'float 25s ease-in-out infinite reverse'
          }}
        />
      </div>

      {/* Radial Gradient Following Mouse */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.15), transparent 40%)`
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header Section */}
        <div
          className={`text-center mb-16 md:mb-24 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
        >
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-xl opacity-50 animate-pulse" />
              <Shield className="relative w-16 h-16 text-blue-400 mx-auto" strokeWidth={1.5} />
            </div>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight">
            <span className="inline-block">Security & </span>
            <span className="inline-block relative">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                Privacy
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 blur-xl opacity-30 animate-pulse" />
            </span>
          </h2>

          <p className="text-lg sm:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
            Your data is protected with{' '}
            <span className="text-blue-400 font-medium">enterprise-grade</span> security measures.
          </p>
        </div>

        {/* Mobile/Tablet Card Navigation */}
        <div className="md:hidden flex flex-col items-center">
          <div className="relative w-full max-w-sm mx-auto h-[320px] flex items-center justify-center perspective-1000">
            {securityFeatures.map((feature, index) => {
              const offset = index - currentIndex;
              const isActive = index === currentIndex;

              return (
                <div
                  key={feature.id}
                  className={`absolute w-full transition-all duration-500 ${isActive ? 'z-20' : 'z-10'
                    }`}
                  style={{
                    transform: `
                      translateX(${offset * 100}%)
                      scale(${isActive ? 1 : 0.9})
                      rotateY(${offset * 15}deg)
                    `,
                    opacity: Math.abs(offset) > 1 ? 0 : isActive ? 1 : 0.5,
                    pointerEvents: isActive ? 'auto' : 'none'
                  }}
                >
                  <div className="relative group">
                    {/* Glow Effect */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300`} />

                    {/* Card */}
                    <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
                      {/* Icon Container */}
                      <div className="relative mb-6">
                        <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} blur-xl opacity-50 rounded-2xl`} />
                        <div className={`relative w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                          {React.createElement(feature.icon, { className: "w-8 h-8 text-white", strokeWidth: 2 })}
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="text-base text-gray-300 leading-relaxed">
                        {feature.description}
                      </p>

                      {/* Decorative Corner Elements */}
                      <div className="absolute top-4 right-4 w-20 h-20 border-t-2 border-r-2 border-blue-500/30 rounded-tr-2xl" />
                      <div className="absolute bottom-4 left-4 w-20 h-20 border-b-2 border-l-2 border-purple-500/30 rounded-bl-2xl" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center mt-12 space-x-6">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="group relative w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transform hover:scale-110 active:scale-95 transition-all duration-200"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <ChevronLeft className="relative w-6 h-6 text-white" strokeWidth={2.5} />
            </button>

            <div className="flex items-center space-x-2">
              {securityFeatures.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                    ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-500'
                    : 'w-2 bg-gray-600'
                    }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === securityFeatures.length - 1}
              className="group relative w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transform hover:scale-110 active:scale-95 transition-all duration-200"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <ChevronRight className="relative w-6 h-6 text-white" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {securityFeatures.map((feature, index) => (
            <div
              key={feature.id}
              className={`transition-all duration-700 delay-${index * 100} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                }`}
            >
              <div className="group relative h-full">
                {/* Animated Border Glow */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-3xl blur-lg opacity-0 group-hover:opacity-75 transition-all duration-500`} />

                {/* Card Container */}
                <div className="relative h-full bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 transform group-hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                  {/* Scanning Line Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div
                      className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent"
                      style={{
                        animation: 'scan 2s ease-in-out infinite'
                      }}
                    />
                  </div>

                  {/* Icon Container with 3D Effect */}
                  <div className="relative mb-8 transform-gpu">
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} blur-2xl opacity-50 rounded-2xl`} />
                    <div
                      className={`relative w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}
                      style={{
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                      }}
                    >
                      <div className="absolute inset-0 bg-white/10 rounded-2xl" />
                      {React.createElement(feature.icon, {
                        className: "relative w-10 h-10 text-white drop-shadow-lg",
                        strokeWidth: 2
                      })}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-base text-gray-300 leading-relaxed group-hover:text-white transition-colors duration-300">
                    {feature.description}
                  </p>

                  {/* Decorative Corner Elements */}
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
                    <div className={`absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 bg-gradient-to-br ${feature.color} rounded-tr-2xl`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
                  </div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 opacity-20">
                    <div className={`absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 bg-gradient-to-tr ${feature.color} rounded-bl-2xl`} style={{ clipPath: 'polygon(0 100%, 0 0, 100% 100%)' }} />
                  </div>

                  {/* Particle Effect on Hover */}
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-blue-400 rounded-full"
                        style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          animation: `particle ${2 + Math.random() * 2}s ease-out infinite`,
                          animationDelay: `${Math.random() * 2}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }

        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }

        @keyframes particle {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-50px) scale(0); opacity: 0; }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </section>
  );
};

export default Security;