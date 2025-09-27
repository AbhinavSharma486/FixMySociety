import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const FAQ = ({ visibleElements }) => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    { q: 'Is it free to start?', a: 'Yes, you can start immediately.' },
    { q: 'How do admins onboard residents?', a: 'Invite via notices; residents sign up with building & flat details.' },
    { q: 'Can I attach photos/videos?', a: 'Yes, file uploads are supported.' },
    { q: 'Are sessions secure?', a: 'Yes, JWT via secure cookies per role.' },
    { q: 'Do I need training?', a: 'No, it\'s designed to be intuitive.' }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div
          id="faq-header"
          data-animate
          className={`text-center mb-16 transition-all duration-1000 ${visibleElements.has('faq-header')
            ? 'opacity-100 transform translate-y-0'
            : 'opacity-0 transform translate-y-8'
            }`}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about Fix My Society
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              id={`faq-${index}`}
              data-animate
              className={`bg-gray-50 rounded-2xl overflow-hidden transition-all duration-1000 ${visibleElements.has(`faq-${index}`)
                ? 'opacity-100 transform translate-y-0'
                : 'opacity-0 transform translate-y-8'
                }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <button
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-100 transition-colors duration-200"
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              >
                <span className="text-lg font-semibold text-gray-900">{faq.q}</span>
                <ChevronRight
                  className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${openFAQ === index ? 'rotate-90' : ''
                    }`}
                />
              </button>

              {openFAQ === index && (
                <div className="px-8 pb-6 animate-in slide-in-from-top duration-200">
                  <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;