import React, { useState, useEffect } from 'react';

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

// Animation hook for scroll-based reveals
const useScrollAnimation = () => {
  const [visibleElements, setVisibleElements] = useState(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return visibleElements;
};

// Main Landing Page Component
const HomePage = () => {
  const visibleElements = useScrollAnimation();

  useEffect(() => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }, []);

  return (
    <div className="font-sans antialiased overflow-x-hidden">
      <HeroSection visibleElements={visibleElements} />
      <WhyChooseUs visibleElements={visibleElements} />
      <HowItWork visibleElements={visibleElements} />
      <ForResidents visibleElements={visibleElements} />
      <ForAdmins visibleElements={visibleElements} />
      <FeaturedModules visibleElements={visibleElements} />
      <Testimonials visibleElements={visibleElements} />
      <AnnouncementShowcase visibleElements={visibleElements} />
      <Security visibleElements={visibleElements} />
      <CTASection visibleElements={visibleElements} />
      <FAQ visibleElements={visibleElements} />
    </div>
  );
};

export default HomePage;