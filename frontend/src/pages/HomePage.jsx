import React from 'react';
import { Building2, Wrench, Shield, Trash2, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { Link } from "react-router-dom";
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { IoMail } from "react-icons/io5";

function HomePage() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.error(`Element with id "${id}" not found.`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-indigo-600 py-24 md:py-32" id="hero">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl text-white mb-6 font-hero-title">
            Report & Resolve Society Issues Effortlessly
          </h1>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto font-body">
            A seamless platform for apartment residents to report and track maintenance issues,
            ensuring a safer and more comfortable living environment.
          </p>
          <Link to="/login" className="btn-home-report font-button">
            Report an Issue
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-base-200" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl text-center text-base-content mb-12 font-section-title">
            Easy Steps to Fix Your Society Issues
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageSquare className="w-12 h-12 text-blue-600" />,
                title: "1. Report the Problem",
                description: "Tell us what's wrong! Use our simple form to submit your maintenance request."
              },
              {
                icon: <Clock className="w-12 h-12 text-blue-600" />,
                title: "2. Follow the Progress",
                description: "See exactly where your request is in the process. We'll keep you updated."
              },
              {
                icon: <CheckCircle className="w-12 h-12 text-blue-600" />,
                title: "3. Issue Resolved!",
                description: "We'll fix it fast! Get notified when your issue is completely resolved."
              }
            ].map((step, index) => (
              <div key={index} className="text-center p-6 bg-base-100 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-center mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-base-content font-section-subtitle">{step.title}</h3>
                <p className="text-base-content/70 font-body">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Clearer User Understanding */}
      <section className="py-16 bg-base-100" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl text-center text-base-content mb-12 font-section-title">
            Our Services
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Wrench className="w-12 h-12 text-green-600" />,
                title: "Plumbing Repairs",
                description: "From leaky faucets to major pipe fixes, we handle all plumbing problems quickly."
              },
              {
                icon: <Shield className="w-12 h-12 text-green-600" />,
                title: "Security Solutions",
                description: "We provide services to keep your community safe and secure, including system maintenance."
              },
              {
                icon: <Trash2 className="w-12 h-12 text-green-600" />,
                title: "Waste & Recycling",
                description: "Reliable and efficient waste collection and recycling to keep your area clean."
              }
            ].map((service, index) => (
              <div key={index} className="p-6 bg-base-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-center mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-center text-base-content font-section-subtitle">{service.title}</h3>
                <p className="text-base-content/70 text-center font-body">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-base-200" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl text-center text-base-content mb-12 font-section-title">
            What Residents Say
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                text: "The response time is incredible! My plumbing issue was resolved within hours of reporting.",
                author: "Sarah Johnson",
                role: "Resident"
              },
              {
                text: "This platform has made it so much easier to communicate maintenance issues. Highly recommended!",
                author: "Michael Chen",
                role: "Resident"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-base-100 p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 font-testimonial">
                <p className="text-base-content/70 mb-4">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-base-content font-author">{testimonial.author}</p>
                    <p className="text-sm text-base-content/70">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-teal-600 py-16 text-center" id="cta">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl text-white mb-4 font-cta-title">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white mb-8 font-body">
            Join thousands of residents who trust FixMySociety for their maintenance needs
          </p>
          <a href='/signup' className="btn-signup font-button">
            Register New Account
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-base-300 text-base-content py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8"> {/* Corrected grid-cols */}
            <div>
              <div className="flex items-center mb-4 justify-center md:justify-start">
                <Building2 className="w-8 h-8 mr-2" />
                <span className="text-xl font-bold font-footer-logo">FixMySociety</span>
              </div>
              <p className="text-base-content/70 font-body text-center md:text-left">Making community living better</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 font-footer-title text-center md:text-left">Quick Links</h3>
              <ul className="space-y-2 text-center md:text-left">
                <li>
                  <button
                    onClick={() => scrollToSection('how-it-works')}
                    className="text-base-content/70 hover:text-base-content transition-colors font-body"
                    aria-label="Scroll to How It Works section"
                  >
                    Steps to Fix Society Issues
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('services')}
                    className="text-base-content/70 hover:text-base-content transition-colors font-body"
                    aria-label="Scroll to Services section"
                  >
                    Services
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('testimonials')}
                    className="text-base-content/70 hover:text-base-content transition-colors font-body"
                    aria-label="Scroll to Testimonials section"
                  >
                    Testimonials
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('cta')}
                    className="text-base-content/70 hover:text-base-content transition-colors font-body"
                    aria-label="Scroll to Sign Up section"
                  >
                    Sign Up
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 font-footer-title text-center md:text-left">Legal</h3>
              <ul className="space-y-2 text-center md:text-left">
                <li><a className="text-base-content/70 hover:text-base-content transition-colors font-body">Privacy Policy</a></li>
                <li><a className="text-base-content/70 hover:text-base-content transition-colors font-body">Terms of Service</a></li>
                <li><a className="text-base-content/70 hover:text-base-content transition-colors font-body">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 font-footer-title text-center md:text-left">Connect With Us</h3>
              <div className="flex justify-center md:justify-start space-x-4">
                <a
                  href="https://www.linkedin.com/in/abhinav-sharma-6254252a5/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit our LinkedIn"
                  className="text-base-content/70 hover:text-base-content transition-colors"
                >
                  <FaLinkedin className="h-6 w-6" />
                </a>
                <a
                  href="mailto:abhinavparashar486@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Send us an email"
                  className="text-base-content/70 hover:text-base-content transition-colors"
                >
                  <IoMail className="h-6 w-6" />
                </a>
                <a
                  href="https://github.com/AbhinavSharma486"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit our GitHub"
                  className="text-base-content/70 hover:text-base-content transition-colors"
                >
                  <FaGithub className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-base-content/20 text-center font-body">
            <p>&copy; {new Date().getFullYear()} FixMySociety. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;