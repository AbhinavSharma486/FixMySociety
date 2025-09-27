import React, { useState } from 'react';
import { Building, MessageCircle, BarChart3, Search, Upload, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';

const FeaturedModules = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const modules = [
    { icon: MessageCircle, title: 'Complaints & Workflows', description: 'Priorities, categories, attachments, timelines', id: 'complaints-workflow', color: 'from-blue-500 to-blue-600' },
    { icon: Building, title: 'Buildings', description: 'Pre-seeded buildings, occupancy stats', id: 'buildings-module', color: 'from-green-500 to-green-600' },
    { icon: Bell, title: 'Notifications', description: 'Role-based announcements and updates', id: 'notifications-module', color: 'from-purple-500 to-purple-600' },
    { icon: Search, title: 'Search', description: 'Advanced search for residents and admins', id: 'search-module', color: 'from-red-500 to-red-600' },
    { icon: Upload, title: 'File Uploads', description: 'Cloud-ready media storage', id: 'file-uploads', color: 'from-yellow-500 to-yellow-600' },
    { icon: BarChart3, title: 'Analytics', description: 'Insights and performance metrics', id: 'analytics-module', color: 'from-cyan-500 to-cyan-600' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    if (currentIndex < modules.length - 1) {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        ease: 'easeOut',
        duration: 0.6,
      },
    },
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <section ref={ref} className="py-16 md:py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2">
            Featured <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Modules</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive tools designed to handle every aspect of society management.
          </p>
        </motion.div>

        {/* Mobile/Tablet Card Navigation */}
        <div className="md:hidden flex flex-col items-center">
          <div className="relative w-full max-w-sm mx-auto h-[250px] flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={modules[currentIndex].id}
                variants={slideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="group w-full bg-white rounded-3xl p-6 shadow-xl border-none absolute"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${modules[currentIndex].color} rounded-2xl flex items-center justify-center mb-4`}>
                  {React.createElement(modules[currentIndex].icon, { className: "w-7 h-7 text-white" })}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{modules[currentIndex].title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{modules[currentIndex].description}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center items-center mt-8 space-x-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="w-10 h-10 rounded-full bg-white text-gray-800 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-sm text-gray-600">
              {currentIndex + 1} / {modules.length}
            </div>
            <button
              onClick={handleNext}
              disabled={currentIndex === modules.length - 1}
              className="w-10 h-10 rounded-full bg-white text-gray-800 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop Grid Layout */}
        <motion.div
          className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {modules.map((module) => (
            <motion.div
              key={module.id}
              variants={itemVariants}
              className="group bg-white rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 hover:border-blue-200"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${module.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                {React.createElement(module.icon, { className: "w-8 h-8 text-white" })}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                {module.title}
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">
                {module.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedModules;