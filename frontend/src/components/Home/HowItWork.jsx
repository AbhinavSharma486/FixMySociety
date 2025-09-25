import React from 'react';
import { Users, CheckCircle, MessageCircle } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

const HowItWork = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const steps = [
    {
      number: '01',
      title: 'Sign Up & Verify',
      description: 'Join using your building and flat details. Our system verifies your identity to ensure a secure community.',
      icon: Users
    },
    {
      number: '02',
      title: 'Raise & Track',
      description: 'Easily create complaints for maintenance issues. Attach photos and track real-time updates on their resolution.',
      icon: MessageCircle
    },
    {
      number: '03',
      title: 'Resolve & Review',
      description: 'Admins receive notifications and manage issues efficiently. Once resolved, you can review the outcome.',
      icon: CheckCircle
    }
  ];

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        ease: 'easeOut',
        duration: 0.6,
      },
    },
  };

  return (
    <section ref={ref} className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center mb-12 transition-all duration-1000 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How It <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Get started in three simple steps and transform your society management
          </p>
        </div>

        <motion.div
          className="grid md:grid-cols-3 gap-6 md:gap-8"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.3,
              },
            },
          }}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="relative p-6 sm:p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <div className="absolute top-0 right-0 -mr-2 -mt-2 w-10 h-10 flex items-center justify-center bg-blue-600 text-white font-extrabold rounded-full shadow-lg text-sm md:text-base transform group-hover:scale-110 transition-transform duration-200">
                {step.number}
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:from-blue-600 group-hover:to-purple-600 transition-colors duration-200">
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                {step.title}
              </h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWork;