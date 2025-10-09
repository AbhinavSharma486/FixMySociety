import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import HeroSection from '../components/Home/Hero';
import WhyChooseUs from '../components/Home/WhyChooseUs';
import HowItWork from '../components/Home/HowItWork';
import ForResidents from '../components/Home/ForResidents';
import ForAdmins from '../components/Home/ForAdmins';
import FeaturedModules from '../components/Home/FeaturedModules';
import Testimonials from '../components/Home/Testimonials';
import AnnouncementShowcase from '../components/Home/AnnouncementShowcase';
import Security from '../components/Home/Security';
import CTASection from '../components/Home/CTASection';
import FAQ from '../components/Home/FAQ';

// Optimized animation hook with improved performance
const useScrollAnimation = () => {
  const [visibleElements, setVisibleElements] = useState(new Set());
  const observerRef = useRef(null);

  useEffect(() => {
    // Use a single callback to minimize re-renders
    const handleIntersection = (entries) => {
      const newVisible = [];
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id) {
          newVisible.push(entry.target.id);
        }
      });

      if (newVisible.length > 0) {
        setVisibleElements(prev => {
          const updated = new Set(prev);
          newVisible.forEach(id => updated.add(id));
          return updated;
        });
      }
    };

    // Optimized observer with rootMargin for earlier loading
    observerRef.current = new IntersectionObserver(
      handleIntersection,
      {
        threshold: 0.1,
        rootMargin: '50px' // Start animation slightly before element enters viewport
      }
    );

    // Use requestIdleCallback for non-critical observation setup
    const setupObserver = () => {
      const elements = document.querySelectorAll('[data-animate]');
      elements.forEach(el => observerRef.current.observe(el));
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(setupObserver);
    } else {
      setTimeout(setupObserver, 1);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []); // Empty dependency array - only run once

  return visibleElements;
};

// Main Landing Page Component
const HomePage = () => {
  const visibleElements = useScrollAnimation();
  const smoothScrollSetupRef = useRef(false);

  useEffect(() => {
    // Only set up smooth scrolling once
    if (smoothScrollSetupRef.current) return;
    smoothScrollSetupRef.current = true;

    // Passive event listener for better scroll performance
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      const target = document.querySelector(targetId);

      if (target) {
        // Use native smooth scroll with will-change hint
        target.style.willChange = 'scroll-position';
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Remove will-change after scroll completes
        setTimeout(() => {
          target.style.willChange = 'auto';
        }, 1000);
      }
    };

    // Use event delegation on document for better performance
    document.addEventListener('click', handleAnchorClick, { passive: false });

    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []); // Empty dependency array - only run once

  // Memoize the component structure to prevent unnecessary re-renders
  const sections = useMemo(() => [
    { Component: HeroSection, key: 'hero' },
    { Component: WhyChooseUs, key: 'why' },
    { Component: HowItWork, key: 'how' },
    { Component: ForResidents, key: 'residents' },
    { Component: ForAdmins, key: 'admins' },
    { Component: FeaturedModules, key: 'modules' },
    { Component: Testimonials, key: 'testimonials' },
    { Component: AnnouncementShowcase, key: 'announcements' },
    { Component: Security, key: 'security' },
    { Component: CTASection, key: 'cta' },
    { Component: FAQ, key: 'faq' }
  ], []);

  return (
    <div className="font-sans antialiased overflow-x-hidden">
      {sections.map(({ Component, key }) => (
        <Component key={key} visibleElements={visibleElements} />
      ))}
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders when parent updates
export default React.memo(HomePage);