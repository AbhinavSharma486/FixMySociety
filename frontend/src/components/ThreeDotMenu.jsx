import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ThreeDotMenu = ({ onView, onEdit, onDelete, isAuthor, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Memoized toggle function to prevent recreation on every render
  const toggleMenu = useCallback(() => setIsOpen(prev => !prev), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  // Memoized handlers to prevent recreation on every render
  const handleView = useCallback((e) => {
    e.stopPropagation();
    onView();
    closeMenu();
  }, [onView, closeMenu]);

  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    onEdit();
    closeMenu();
  }, [onEdit, closeMenu]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    onDelete();
    closeMenu();
  }, [onDelete, closeMenu]);

  // Optimized click outside handler with passive event listener
  useEffect(() => {
    if (!isOpen) return; // Only attach listener when menu is open

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    // Use capture phase for better performance
    document.addEventListener("mousedown", handleClickOutside, { capture: true, passive: true });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, { capture: true, passive: true });
    };
  }, [isOpen, closeMenu]);

  // Memoized animation variants to prevent recreation
  const menuVariants = {
    initial: { opacity: 0, scale: 0.95, y: -10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -10 }
  };

  const buttonHoverVariants = {
    hover: { x: 3, backgroundColor: "rgba(6, 182, 212, 0.1)" }
  };

  const editButtonHoverVariants = {
    hover: { x: 3, backgroundColor: "rgba(34, 197, 94, 0.1)" }
  };

  const deleteButtonHoverVariants = {
    hover: { x: 3, backgroundColor: "rgba(239, 68, 68, 0.1)" }
  };

  return (
    <div className="relative z-50 inline-block" ref={menuRef}>
      <motion.button
        onClick={toggleMenu}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-1.5 rounded-full hover:bg-gray-100/10 transition-colors duration-200 cursor-pointer"
        aria-label="More options"
        aria-expanded={isOpen}
      >
        <MoreVertical className="w-4 h-4 text-gray-300 hover:text-cyan-400 transition-colors" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-40 bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 py-2 z-50 overflow-hidden"
            style={{ willChange: 'transform, opacity' }}
          >
            {/* View Details */}
            <motion.button
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap={{ scale: 0.98 }}
              onClick={handleView}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-cyan-400 transition-all duration-200 cursor-pointer"
              style={{ willChange: 'transform' }}
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </motion.button>

            {/* Edit Issue */}
            {(isAuthor || isAdmin) && (
              <motion.button
                variants={editButtonHoverVariants}
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
                onClick={handleEdit}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-green-400 transition-all duration-200 cursor-pointer"
                style={{ willChange: 'transform' }}
              >
                <Edit className="w-4 h-4" />
                <span>Edit Issue</span>
              </motion.button>
            )}

            {/* Delete Issue */}
            {(isAuthor || isAdmin) && (
              <motion.button
                variants={deleteButtonHoverVariants}
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
                onClick={handleDelete}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-all duration-200 cursor-pointer"
                style={{ willChange: 'transform' }}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Issue</span>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThreeDotMenu;