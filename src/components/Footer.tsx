import React from 'react';
import { Mail, Phone, MapPin, Award, BookOpen, GraduationCap, Shield } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export default function Footer({ setActiveTab }: FooterProps) {
  return (
    <footer id="main-footer" className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <GraduationCap className="h-8 w-8 text-indigo-400" />
              <span className="font-extrabold text-xl tracking-tight text-white">
                Rakhi Coaching
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Learn Smart, Score Better. Providing premier academic, competitive coaching and premium high-yield notes.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer">
                F
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer">
                T
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer">
                I
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors cursor-pointer">
                  Home Page
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('about')} className="hover:text-white transition-colors cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('courses')} className="hover:text-white transition-colors cursor-pointer">
                  Courses
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('faculty')} className="hover:text-white transition-colors cursor-pointer">
                  Expert Faculty
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('timetable')} className="hover:text-white transition-colors cursor-pointer">
                  Class Timetable
                </button>
              </li>
            </ul>
          </div>

          {/* Offerings */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Offerings</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => setActiveTab('notes-store')} className="hover:text-white transition-colors cursor-pointer">
                  Notes Store
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('test-series')} className="hover:text-white transition-colors cursor-pointer">
                  Online Test Series
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('blog')} className="hover:text-white transition-colors cursor-pointer">
                  Educational Blog
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('faq')} className="hover:text-white transition-colors cursor-pointer">
                  FAQs & Support
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('contact')} className="hover:text-white transition-colors cursor-pointer">
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 text-sm">
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-1">Contact Support</h3>
            <div className="flex items-start space-x-2">
              <MapPin size={16} className="text-indigo-400 mt-0.5 shrink-0" />
              <span>102, Shanti Vihar, Sector 4, Near City Plaza, India</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone size={16} className="text-indigo-400 shrink-0" />
              <span>+91 78289 08559</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail size={16} className="text-indigo-400 shrink-0" />
              <span>contact@rakhicoaching.com</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex flex-col space-y-1 text-xs">
              <button onClick={() => setActiveTab('privacy')} className="text-left hover:text-white transition-colors cursor-pointer">
                Privacy Policy
              </button>
              <button onClick={() => setActiveTab('terms')} className="text-left hover:text-white transition-colors cursor-pointer">
                Terms & Conditions
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Rakhi Coaching Classes. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="flex items-center">
              <Shield size={12} className="mr-1 text-indigo-400" /> Secure Payment by Razorpay
            </span>
            <span>SEO Optimized & PWA Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
