import React from 'react';
import { CheckCircle, ArrowRight, BarChart3, Lock, MessageSquare, Briefcase } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';


const ForAdmins = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const features = [
    'Admin login with a dedicated dashboard',
    'Complaint triage and status management',
    'Building and resident data management',
    'Analytics: track resolution trends and performance',
    'Admin profile updates and secure sessions'
  ];

  const containerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
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
    <section ref={ref} className="py-16 md:py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left Side: Animated Card (Hidden on Mobile/Tablet) */}
          <div className="hidden lg:block relative order-2 lg:order-1">
            <motion.div
              initial={{ rotateY: 90, opacity: 0 }}
              animate={inView ? { rotateY: 0, opacity: 1 } : {}}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
              className="relative [perspective:1000px] transform-gpu"
            >
              <div className="relative w-full h-[500px] bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl shadow-2xl p-8 overflow-hidden">
                <div className="relative z-10 bg-white rounded-2xl h-full p-6 shadow-xl border border-gray-100 animate-slide-in">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Admin Dashboard</h3>
                    <BarChart3 className="w-8 h-8 text-purple-600 animate-wiggle" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {['Total Complaints', 'Resolved Today', 'Pending', 'Avg. TAT'].map((metric, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 1 + index * 0.15, duration: 0.5 }}
                        className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 hover:scale-105 transition-transform duration-200"
                      >
                        <div className="text-3xl font-bold text-purple-600">
                          {[42, 8, 5, '2.3h'][index]}
                        </div>
                        <div className="text-xs text-gray-600">{metric}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              <motion.div
                initial={{ scale: 0, opacity: 0, y: -50 }}
                animate={inView ? { scale: 1, opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 1.5, ease: 'easeOut' }}
                className="absolute -top-8 -left-8 w-32 h-32 bg-purple-600 rounded-2xl flex items-center justify-center shadow-2xl animate-spin-slow"
              >
                <Briefcase className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>
          </div>

          {/* Right Side: Text and Features */}
          <motion.div
            className="space-y-6 text-center lg:text-left order-1 lg:order-2"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Tools Built for <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Admins</span>
            </motion.h2>

            <motion.div variants={itemVariants} className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
              Manage your society with powerful tools designed to simplify administration and enhance efficiency.
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
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg text-gray-700">{feature}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants}>
              <button className="group px-6 sm:px-8 py-3 sm:py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transform hover:scale-105 transition-all duration-300 shadow-xl flex items-center justify-center space-x-2">
                <span className="text-base sm:text-lg font-semibold">Go to Admin Panel</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ForAdmins;