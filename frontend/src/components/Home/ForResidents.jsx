import React from 'react';
import { CheckCircle, ArrowRight, Bell } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

const ForResidents = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const features = [
    'One-tap complaint creation with attachments',
    'Status tracking: Open → In Progress → Resolved',
    'Notification center for updates & notices',
    'Profile & password management',
    'Search across notices and complaints'
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        ease: 'easeOut',
        duration: 0.5,
      },
    },
  };

  return (
    <section ref={ref} className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left Side: Text and Features */}
          <motion.div
            className="space-y-6 text-center lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Everything <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Residents</span> Need
            </motion.h2>

            <motion.div variants={itemVariants} className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
              Our intuitive app puts the power of community management in your hands, making it easy to report issues and stay informed.
            </motion.div>

            <motion.div
              className="space-y-4 mb-8"
              variants={containerVariants}
            >
              {features.map((feature) => (
                <motion.div
                  key={feature}
                  variants={itemVariants}
                  className="flex items-start space-x-4 p-3 rounded-xl transition-all duration-200"
                >
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-700">{feature}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants}>
              <button className="group px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-xl flex items-center justify-center space-x-2">
                <span className="text-base sm:text-lg font-semibold">Join Your Society</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </motion.div>
          </motion.div>

          {/* Right Side: Animated Card (Hidden on Mobile/Tablet) */}
          <div className="hidden lg:block relative">
            <motion.div
              initial={{ rotateY: -90, opacity: 0 }}
              animate={inView ? { rotateY: 0, opacity: 1 } : {}}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
              className="relative [perspective:1000px] transform-gpu"
            >
              <div className="relative w-full h-[500px] bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl shadow-2xl p-8 overflow-hidden">
                <div className="relative z-10 bg-white rounded-2xl h-full p-6 shadow-xl border border-gray-100 animate-slide-in">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">My Complaints</h3>
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse-slow"></div>
                  </div>
                  <div className="space-y-4">
                    {['Water leak in bathroom', 'Elevator not working', 'Parking issue'].map((complaint, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 1 + index * 0.2, duration: 0.5 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                      >
                        <span className="text-gray-700">{complaint}</span>
                        <span className="text-xs text-green-600 font-semibold">In Progress</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              <motion.div
                initial={{ scale: 0, opacity: 0, y: 50 }}
                animate={inView ? { scale: 1, opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 1.5, ease: 'easeOut' }}
                className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl animate-spin-slow"
              >
                <Bell className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForResidents;