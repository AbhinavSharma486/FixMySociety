import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-40 h-40 sm:w-56 sm:h-56 lg:w-72 lg:h-72 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      <div className="relative py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-8 lg:gap-12">
            {/* About/Company Info */}
            <section className="col-span-1 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                <div className="relative">
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    FixMySociety
                  </h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full mb-3 sm:mb-4 transform group-hover:w-20 transition-all duration-500"></div>
                  <p className="text-gray-300 text-sm leading-relaxed backdrop-blur-sm">
                    FixMySociety is dedicated to improving community living by providing a platform for residents and administration to address and resolve local issues efficiently.
                  </p>
                </div>
              </div>
            </section>

            {/* Quick Links */}
            <nav className="col-span-1">
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 relative inline-block">
                <span className="relative z-10">Quick Links</span>
                <span className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 blur-sm"></span>
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  { href: '#hero', text: 'Home' },
                  { href: '#why', text: 'Why Choose Us' },
                  { href: '#how', text: 'How It Works' },
                  { href: '#admins', text: 'Admin' },
                  { href: '#modules', text: 'Services' },
                  { href: '#testimonials', text: 'Testimonials' },
                  { href: '#cta', text: 'CTA' },
                  { href: '#faq', text: 'FAQ' }
                ].map((link, index) => (
                  <li key={index} className="transform hover:translate-x-2 transition-all duration-300">
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-transparent hover:bg-gradient-to-r hover:from-cyan-400 hover:to-purple-400 hover:bg-clip-text transition-all duration-300 inline-flex items-center group text-sm sm:text-base"
                    >
                      <span className="w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 group-hover:w-4 mr-0 group-hover:mr-2 transition-all duration-300 rounded-full"></span>
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Contact Information */}
            <section className="col-span-1">
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 relative inline-block">
                <span className="relative z-10">Contact Us</span>
                <span className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-sm"></span>
              </h3>
              <address className="not-italic space-y-3 sm:space-y-4">
                <div className="flex items-center text-gray-300 group hover:text-white transition-all duration-300">
                  <div className="relative mr-3 sm:mr-4 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-300"></div>
                    <div className="relative bg-gray-800/50 p-2 rounded-lg backdrop-blur-sm border border-gray-700 group-hover:border-cyan-500/50 transition-all duration-300">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                    </div>
                  </div>
                  <a href="mailto:abhinavparashar486@gmail.com" className="hover:text-cyan-400 transition-colors duration-300 text-xs sm:text-sm break-all">
                    abhinavparashar486@gmail.com
                  </a>
                </div>
                <div className="flex items-center text-gray-300 group hover:text-white transition-all duration-300">
                  <div className="relative mr-3 sm:mr-4 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-300"></div>
                    <div className="relative bg-gray-800/50 p-2 rounded-lg backdrop-blur-sm border border-gray-700 group-hover:border-purple-500/50 transition-all duration-300">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                    </div>
                  </div>
                  <a href="tel:+917819872024" className="hover:text-purple-400 transition-colors duration-300 text-xs sm:text-sm">
                    +91 7819872024
                  </a>
                </div>
                <div className="flex items-center text-gray-300 group hover:text-white transition-all duration-300">
                  <div className="relative mr-3 sm:mr-4 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-300"></div>
                    <div className="relative bg-gray-800/50 p-2 rounded-lg backdrop-blur-sm border border-gray-700 group-hover:border-pink-500/50 transition-all duration-300 mt-1">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-pink-400" />
                    </div>
                  </div>
                  <a href="tel:+917819872024" className="hover:text-purple-400 transition-colors duration-300 text-xs sm:text-sm">
                    Baraut Uttar Pradesh, India
                  </a>
                </div>
              </address>
            </section>

            {/* Social Media */}
            <section className="col-span-1">
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 relative inline-block">
                <span className="relative z-10">Follow Us</span>
                <span className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500/30 to-cyan-500/30 blur-sm"></span>
              </h3>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {[
                  { Icon: FaInstagram, color: 'from-pink-500 to-purple-500', href: 'https://www.instagram.com/theabhinav.dev?igsh=bXA5ZmoyNTdoNzFx' },
                  { Icon: FaLinkedinIn, color: 'from-blue-500 to-cyan-500', href: 'https://www.linkedin.com/in/abhinav-sharma-mern/' },
                  { Icon: FaGithub, color: 'from-gray-400 to-gray-600', href: 'https://github.com/AbhinavSharma486' }
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="group relative"
                  >
                    <div className={`absolute -inset-1 bg-gradient-to-r ${social.color} rounded-lg blur opacity-0 group-hover:opacity-75 transition duration-500`}></div>
                    <div className="relative bg-gray-800/50 backdrop-blur-sm p-2.5 sm:p-3 rounded-lg border border-gray-700 group-hover:border-transparent transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-1">
                      <social.Icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </a>
                ))}
              </div>
            </section>
          </div>

          {/* Bottom Bar */}
          <div className="relative mt-8 sm:mt-12 lg:mt-16 pt-6 sm:pt-8 border-t border-gray-700/50">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
              <p className="text-gray-500 text-xs sm:text-sm text-center md:text-left">
                &copy; {new Date().getFullYear()} FixMySociety. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
                <a href="#" className="text-gray-500 hover:text-cyan-400 transition-colors duration-300 whitespace-nowrap">Privacy Policy</a>
                <span className="text-gray-700">•</span>
                <a href="#" className="text-gray-500 hover:text-cyan-400 transition-colors duration-300 whitespace-nowrap">Terms of Service</a>
                <span className="text-gray-700">•</span>
                <a href="#" className="text-gray-500 hover:text-cyan-400 transition-colors duration-300 whitespace-nowrap">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Glow Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
    </footer>
  );
};

export default Footer;