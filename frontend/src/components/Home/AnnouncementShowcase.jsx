import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { ChevronRight, ArrowRight, Bell, Send, Zap, Radio } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const AnnouncementShowcase = ({ visibleElements }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  // Use internal Intersection Observer for immediate response
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Once visible, stop observing
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: '50px' // Start animation slightly before visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Memoize static data
  const announcements = useMemo(() => [
    { title: 'Water Maintenance', time: '2 hours ago', type: 'maintenance' },
    { title: 'Society Annual Meeting', time: '1 day ago', type: 'event' },
    { title: 'Power Outage Notice', time: '3 days ago', type: 'emergency' }
  ], []);

  // Memoize announcement type styles
  const getAnnouncementStyles = useMemo(() => ({
    emergency: { bg: 'bg-rose-500', shadow: 'shadow-rose-500/50' },
    maintenance: { bg: 'bg-amber-500', shadow: 'shadow-amber-500/50' },
    event: { bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/50' }
  }), []);

  const handleButtonClick = useCallback(() => {
    console.log('Send announcement clicked');
  }, []);

  const handleAnnouncementClick = useCallback((announcement) => {
    console.log('Announcement clicked:', announcement);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950"
    >
      {/* Background - Always rendered */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-500/30 rounded-full"></div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `linear-gradient(to right, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }}></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content - Always visible, animates in */}
          <div
            className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              }`}
          >
            {/* Floating badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/30 mb-6">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">Live Communication Hub</span>
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
              </div>
            </div>

            <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Keep Everyone{' '}
              <span className="relative inline-block">
                <span className="relative bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Informed
                </span>
              </span>
            </h2>

            <p className="text-xl text-blue-100/80 leading-relaxed mb-8 font-light">
              Send notices for maintenance, events, outages, or emergencies.
              Residents get notified instantly through multiple channels.
            </p>

            {/* Status indicators */}
            <div className="flex flex-wrap gap-4 mb-10">
              <div className="flex items-center space-x-3 px-5 py-3 bg-slate-900/50 rounded-2xl border border-emerald-400/30">
                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full"></div>
                <span className="text-sm font-semibold text-emerald-300">Real-time delivery</span>
              </div>

              <div className="flex items-center space-x-3 px-5 py-3 bg-slate-900/50 rounded-2xl border border-blue-400/30">
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
                <span className="text-sm font-semibold text-blue-300">Multi-channel notifications</span>
              </div>
            </div>

            {/* CTA Button */}
            <div
              className="relative inline-block group"
              onClick={() => navigate("/admin-login")}
            >
              <button
                onClick={handleButtonClick}
                className="relative flex items-center space-x-3 px-8 py-5 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 rounded-2xl border cursor-pointer border-blue-400/50 hover:scale-105 transition-all duration-300 shadow-xl"
              >
                <Send className="w-6 h-6 text-cyan-300" />
                <span className="text-lg font-bold text-white">Send Announcement</span>
                <ArrowRight className="w-6 h-6 text-cyan-300 group-hover:translate-x-2 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* Right Visual - Always visible, animates in */}
          <div
            className={`relative transition-all duration-700 delay-150 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
          >
            <div className="relative group">
              {/* Main card */}
              <div className="relative bg-slate-900/90 rounded-3xl border border-blue-400/20 shadow-2xl p-8 hover:scale-[1.02] transition-all duration-300">
                {/* Header */}
                <div className="relative flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      Recent Announcements
                    </h3>
                    <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mt-2"></div>
                  </div>

                  <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-400/30">
                    <Bell className="w-7 h-7 text-cyan-300" />
                  </div>
                </div>

                {/* Announcements list */}
                <div className="space-y-4">
                  {announcements.map((announcement, index) => {
                    const styles = getAnnouncementStyles[announcement.type];
                    return (
                      <div key={index} className="group/item relative">
                        {/* Item card */}
                        <div
                          onClick={() => handleAnnouncementClick(announcement)}
                          className="relative flex items-start space-x-4 p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-blue-400/50 hover:translate-x-2 transition-all duration-300 cursor-pointer"
                        >
                          {/* Status indicator */}
                          <div className="relative mt-2">
                            <div className={`w-3 h-3 rounded-full ${styles.bg} shadow-lg ${styles.shadow}`}></div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-lg mb-1 group-hover/item:text-cyan-300 transition-colors">
                              {announcement.title}
                            </h4>
                            <p className="text-sm text-slate-400 flex items-center space-x-2">
                              <Zap className="w-3 h-3" />
                              <span>{announcement.time}</span>
                            </p>
                          </div>

                          {/* Arrow indicator */}
                          <ChevronRight className="w-6 h-6 text-slate-500 group-hover/item:text-cyan-400 group-hover/item:translate-x-1 transition-all duration-300 flex-shrink-0" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom accent line */}
                <div className="mt-6 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
    </section>
  );
};

export default AnnouncementShowcase;