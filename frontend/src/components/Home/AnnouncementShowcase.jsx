import React from 'react';
import { ChevronRight, ArrowRight, Bell, Send, Zap, Radio } from 'lucide-react';

const AnnouncementShowcase = ({ visibleElements }) => {
  const announcements = [
    { title: 'Water Maintenance', time: '2 hours ago', type: 'maintenance' },
    { title: 'Society Annual Meeting', time: '1 day ago', type: 'event' },
    { title: 'Power Outage Notice', time: '3 days ago', type: 'emergency' }
  ];

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Animated background with gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div
            id="announcements-content"
            data-animate
            className={`transition-all duration-1000 ${visibleElements.has('announcements-content')
              ? 'opacity-100 transform translate-x-0'
              : 'opacity-0 transform -translate-x-8'
              }`}
          >
            {/* Floating badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 backdrop-blur-xl mb-6 shadow-lg shadow-blue-500/20">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-sm font-medium text-cyan-300">Live Communication Hub</span>
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></div>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>

            <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Keep Everyone{' '}
              <span className="relative inline-block">
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 blur-2xl opacity-50"></span>
                <span className="relative bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Informed
                </span>
              </span>
            </h2>

            <p className="text-xl text-blue-100/80 leading-relaxed mb-8 font-light">
              Send notices for maintenance, events, outages, or emergencies.
              Residents get notified instantly through multiple channels.
            </p>

            {/* Status indicators with holographic effect */}
            <div className="flex flex-wrap gap-4 mb-10">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative flex items-center space-x-3 px-5 py-3 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-emerald-400/30">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-sm font-semibold text-emerald-300">Real-time delivery</span>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative flex items-center space-x-3 px-5 py-3 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-blue-400/30">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    <div className="absolute inset-0 w-2.5 h-2.5 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-blue-300">Multi-channel notifications</span>
                </div>
              </div>
            </div>

            {/* CTA Button with advanced effects */}
            <div className="relative inline-block group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
              <button className="relative flex items-center space-x-3 px-8 py-5 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 rounded-2xl border border-blue-400/50 transform hover:scale-105 transition-all duration-300 shadow-2xl">
                <Send className="w-6 h-6 text-cyan-300" />
                <span className="text-lg font-bold text-white">Send Announcement</span>
                <ArrowRight className="w-6 h-6 text-cyan-300 group-hover:translate-x-2 transition-transform duration-300" />

                {/* Shimmer effect */}
                <div className="absolute inset-0 -top-px overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>
              </button>
            </div>
          </div>

          {/* Right Visual */}
          <div
            id="announcements-visual"
            data-animate
            className={`relative transition-all duration-1000 delay-300 ${visibleElements.has('announcements-visual')
              ? 'opacity-100 transform translate-x-0'
              : 'opacity-0 transform translate-x-8'
              }`}
          >
            {/* 3D floating card effect */}
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>

              {/* Main card with glassmorphism */}
              <div className="relative bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-blue-400/20 shadow-2xl p-8 transform group-hover:scale-[1.02] transition-all duration-500">
                {/* Holographic overlay */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>

                {/* Header */}
                <div className="relative flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      Recent Announcements
                    </h3>
                    <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mt-2"></div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                    <div className="relative p-3 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-2xl border border-blue-400/30 backdrop-blur-xl">
                      <Bell className="w-7 h-7 text-cyan-300" />
                    </div>
                  </div>
                </div>

                {/* Announcements list */}
                <div className="space-y-4">
                  {announcements.map((announcement, index) => (
                    <div
                      key={index}
                      className="group/item relative"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Hover glow */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-0 group-hover/item:opacity-30 blur transition-opacity duration-300"></div>

                      {/* Item card */}
                      <div className="relative flex items-start space-x-4 p-5 bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 hover:border-blue-400/50 transform hover:translate-x-2 transition-all duration-300 cursor-pointer">
                        {/* Status indicator with ripple effect */}
                        <div className="relative mt-2">
                          <div className={`w-3 h-3 rounded-full ${announcement.type === 'emergency' ? 'bg-rose-500' :
                            announcement.type === 'maintenance' ? 'bg-amber-500' : 'bg-emerald-500'
                            } shadow-lg ${announcement.type === 'emergency' ? 'shadow-rose-500/50' :
                              announcement.type === 'maintenance' ? 'shadow-amber-500/50' : 'shadow-emerald-500/50'
                            }`}></div>
                          <div className={`absolute inset-0 w-3 h-3 rounded-full ${announcement.type === 'emergency' ? 'bg-rose-500' :
                            announcement.type === 'maintenance' ? 'bg-amber-500' : 'bg-emerald-500'
                            } animate-ping opacity-75`}></div>
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
                  ))}
                </div>

                {/* Bottom accent line */}
                <div className="mt-6 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
              </div>
            </div>

            {/* Floating particles effect */}
            <div className="absolute top-10 right-10 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-60"></div>
            <div className="absolute bottom-20 left-10 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 right-5 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>
      </div>

      {/* Bottom accent elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
    </section>
  );
};

export default AnnouncementShowcase;