import React from 'react';
import { ChevronRight, ArrowRight, Bell, Send } from 'lucide-react';

const AnnouncementShowcase = ({ visibleElements }) => {
  const announcements = [
    { title: 'Water Maintenance', time: '2 hours ago', type: 'maintenance' },
    { title: 'Society Annual Meeting', time: '1 day ago', type: 'event' },
    { title: 'Power Outage Notice', time: '3 days ago', type: 'emergency' }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div
            id="announcements-content"
            data-animate
            className={`transition-all duration-1000 ${visibleElements.has('announcements-content')
              ? 'opacity-100 transform translate-x-0'
              : 'opacity-0 transform -translate-x-8'
              }`}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Keep Everyone <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Informed</span>
            </h2>

            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Send notices for maintenance, events, outages, or emergencies.
              Residents get notified instantly through multiple channels.
            </p>

            <div className="flex items-center space-x-4 mb-8">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Real-time delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Multi-channel notifications</span>
              </div>
            </div>

            <button className="group px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2">
              <Send className="w-5 h-5" />
              <span className="text-lg font-semibold">Send Announcement</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>

          <div
            id="announcements-visual"
            data-animate
            className={`relative transition-all duration-1000 delay-300 ${visibleElements.has('announcements-visual')
              ? 'opacity-100 transform translate-x-0'
              : 'opacity-0 transform translate-x-8'
              }`}
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Recent Announcements</h3>
                <Bell className="w-6 h-6 text-blue-600" />
              </div>

              <div className="space-y-4">
                {announcements.map((announcement, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 hover:scale-105 transition-all duration-200 cursor-pointer"
                  >
                    <div className={`w-3 h-3 rounded-full mt-2 ${announcement.type === 'emergency' ? 'bg-red-500' :
                      announcement.type === 'maintenance' ? 'bg-yellow-500' : 'bg-green-500'
                      } animate-pulse`}></div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                      <p className="text-sm text-gray-600">{announcement.time}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnnouncementShowcase;