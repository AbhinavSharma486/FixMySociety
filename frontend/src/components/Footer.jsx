import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Fix My Society</span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-md">
              Transforming society management with smart, secure, and user-friendly solutions.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <div className="space-y-2">
              {['Home', 'Features', 'How it Works', 'Pricing'].map((link) => (
                <a key={link} href="#" className="block text-gray-400 hover:text-white transition-colors duration-200">
                  {link}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Access</h3>
            <div className="space-y-2">
              {['Login', 'Admin Login', 'Privacy', 'Terms'].map((link) => (
                <a key={link} href="#" className="block text-gray-400 hover:text-white transition-colors duration-200">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="text-gray-400 mb-4 md:mb-0">
            © Fix My Society. All rights reserved.
          </div>
          <div className="text-gray-400">
            Contact: <a href="mailto:support@fixmysociety.app" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
              support@fixmysociety.app
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;