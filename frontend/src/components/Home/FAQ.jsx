import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const FAQ = ({ visibleElements }) => {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [hoveredFAQ, setHoveredFAQ] = useState(null);

  const faqs = [
    { q: 'Is it free to start?', a: 'Yes, you can start immediately.' },
    { q: 'How do admins onboard residents?', a: 'Invite via notices; residents sign up with building & flat details.' },
    { q: 'Can I attach photos/videos?', a: 'Yes, file uploads are supported.' },
    { q: 'Are sessions secure?', a: 'Yes, JWT via secure cookies per role.' },
    { q: 'Do I need training?', a: 'No, it\'s designed to be intuitive.' }
  ];

  return (
    <section className="relative py-32 bg-gradient-to-b from-gray-950 via-blue-950/20 to-gray-950 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          id="faq-header"
          data-animate
          className={`text-center mb-20 transition-all duration-1000 ${visibleElements.has('faq-header')
            ? 'opacity-100 transform translate-y-0'
            : 'opacity-0 transform translate-y-8'
            }`}
        >
          <div className="inline-block mb-6">
            <span className="px-6 py-2 text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full text-blue-300">
              FAQ
            </span>
          </div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight">
            Frequently Asked{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                Questions
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 blur-2xl opacity-50"></span>
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about Fix My Society
          </p>
        </div>

        <div className="space-y-5">
          {faqs.map((faq, index) => (
            <div
              key={index}
              id={`faq-${index}`}
              data-animate
              className={`group relative transition-all duration-1000 ${visibleElements.has(`faq-${index}`)
                ? 'opacity-100 transform translate-y-0'
                : 'opacity-0 transform translate-y-8'
                }`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredFAQ(index)}
              onMouseLeave={() => setHoveredFAQ(null)}
            >
              {/* Glow effect on hover */}
              <div className={`absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 blur-xl transition-all duration-500 ${hoveredFAQ === index ? 'opacity-20' : ''}`}></div>

              {/* Card container */}
              <div className="relative bg-gradient-to-br from-gray-900/90 via-gray-900/70 to-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-800/50 overflow-hidden shadow-2xl">
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                {/* Top border gradient */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-opacity duration-300 ${openFAQ === index || hoveredFAQ === index ? 'opacity-100' : 'opacity-0'}`}></div>

                <button
                  className="relative w-full px-6 sm:px-8 py-6 sm:py-7 text-left flex items-start sm:items-center justify-between gap-4 transition-all duration-300"
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Number indicator */}
                    <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${openFAQ === index
                      ? 'from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50'
                      : 'from-gray-800 to-gray-700 text-gray-400 group-hover:from-gray-700 group-hover:to-gray-600'
                      }`}>
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    <span className={`text-base sm:text-lg font-bold transition-all duration-300 ${openFAQ === index
                      ? 'text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text'
                      : 'text-gray-100 group-hover:text-white'
                      }`}>
                      {faq.q}
                    </span>
                  </div>

                  {/* Animated icon container */}
                  <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${openFAQ === index
                    ? 'bg-gradient-to-br from-blue-500 to-purple-500 rotate-90 shadow-lg shadow-blue-500/50'
                    : 'bg-gray-800/50 group-hover:bg-gray-700/50'
                    }`}>
                    <ChevronRight className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-500 ${openFAQ === index ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                      }`} />
                  </div>
                </button>

                {/* Answer panel with smooth animation */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                  <div className="px-6 sm:px-8 pb-6 sm:pb-7 pt-0">
                    <div className="pl-0 sm:pl-14">
                      {/* Decorative line */}
                      <div className="h-px bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-transparent mb-5"></div>

                      <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom glow for open state */}
                {openFAQ === index && (
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Floating particles effect */}
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-20"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-20" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-ping opacity-20" style={{ animationDelay: '1s' }}></div>
      </div>
    </section>
  );
};

export default FAQ;