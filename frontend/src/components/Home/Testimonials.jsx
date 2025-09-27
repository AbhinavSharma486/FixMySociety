import React from 'react';
import { Star, Quote } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

const tailwindCss = `
.animate-scroll {
  animation: scroll 20s linear infinite;
}

.animate-scroll:hover {
  animation-play-state: paused;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
.testimonial-card-height {
  height: 250px;
}
`;

const Testimonials = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const testimonials = [
    {
      quote: "Residents finally see transparent updates. Our TAT improved by 40%.",
      author: "Priya Sharma",
      position: "Flat 204, Green Valley Apartments",
      rating: 5,
      id: "priya-sharma"
    },
    {
      quote: "Admins can triage and resolve faster. The dashboard is simple and clear.",
      author: "Rajesh Kumar",
      position: "Flat 301, Sunrise Heights",
      rating: 5,
      id: "rajesh-kumar"
    },
    {
      quote: "Mobile-first and quick. Filing a complaint is super easy.",
      author: "Anita Desai",
      position: "Flat 102, Royal Gardens",
      rating: 5,
      id: "anita-desai"
    },
    {
      quote: "Our society meetings are more productive now. Everyone is on the same page.",
      author: "Vinod Gupta",
      position: "Admin, Silicon Towers",
      rating: 5,
      id: "vinod-gupta"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section ref={ref} className="py-16 md:py-24 bg-white relative">
      <style>{tailwindCss}</style>

      {/* Header Section - This remains centered */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12 md:mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2">
            What Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Community</span> Says
          </h2>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Trusted by residents and admins across hundreds of societies.
          </p>
        </motion.div>
      </div>

      {/* Continuous Scroll for all screen sizes - Now a full-width container */}
      <div className="overflow-hidden">
        <div className="flex w-max animate-scroll py-4 px-4 sm:px-6 lg:px-8">
          {/* Duplicate the items to create a seamless loop */}
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <div
              key={index}
              className="group flex-shrink-0 w-80 mr-6 bg-white rounded-3xl p-6 shadow-xl border-none flex flex-col justify-between testimonial-card-height"
            >
              <div className="relative">
                <Quote className="absolute top-0 left-0 w-8 h-8 text-blue-100/80 -translate-x-2 -translate-y-2 opacity-50 group-hover:opacity-100 transition-opacity duration-300 transform-gpu" />
                <blockquote className="text-gray-700 text-base md:text-lg leading-relaxed mb-4">
                  "{testimonial.quote}"
                </blockquote>
              </div>
              <div className="mt-auto">
                <div className="flex items-center mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="font-semibold text-gray-900">{testimonial.author}</div>
                <div className="text-xs md:text-sm text-gray-600">{testimonial.position}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;