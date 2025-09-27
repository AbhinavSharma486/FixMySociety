import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CTASection = ({ visibleElements }) => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-white/5 rounded-full animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <div
          id="cta-content"
          data-animate
          className={`transition-all duration-1000 ${visibleElements.has('cta-content')
            ? 'opacity-100 transform translate-y-0'
            : 'opacity-0 transform translate-y-8'
            }`}
        >
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Bring Your Society <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Online Today
            </span>
          </h2>

          <p className="text-2xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Fast setup, no training required.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="group px-10 py-5 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl flex items-center justify-center space-x-3"
            >
              <span className="text-xl font-bold">Login as Resident</span>
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            <button className="px-10 py-5 bg-transparent text-white rounded-xl border-2 border-white hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl">
              <span className="text-xl font-semibold">Admin Login</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};


export default CTASection;