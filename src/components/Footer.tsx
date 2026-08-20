import React from 'react';
import { Mail, Phone, MapPin, Award, BookOpen, GraduationCap, Shield } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export default function Footer({ setActiveTab }: FooterProps) {
  return (
    <footer id="main-footer" className="bg-white/80 dark:bg-[#120a06]/90 backdrop-blur-2xl text-slate-600 dark:text-stone-300 border-t border-orange-200/80 dark:border-orange-950/60 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-red-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 dark:from-orange-400 dark:via-red-400 dark:to-amber-400 bg-clip-text text-transparent">
                Rakhi Coaching
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-stone-300">
              Learn Smart, Score Better. Providing premier academic, competitive coaching and premium high-yield notes.
            </p>
            <div className="flex space-x-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100/80 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-900/30 text-orange-700 dark:text-orange-300 flex items-center justify-center hover:bg-gradient-to-tr hover:from-orange-500 hover:to-red-500 hover:text-white transition-all cursor-pointer font-bold text-xs shadow-sm">
                F
              </div>
              <div className="w-9 h-9 rounded-xl bg-orange-100/80 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-900/30 text-orange-700 dark:text-orange-300 flex items-center justify-center hover:bg-gradient-to-tr hover:from-orange-500 hover:to-red-500 hover:text-white transition-all cursor-pointer font-bold text-xs shadow-sm">
                T
              </div>
              <div className="w-9 h-9 rounded-xl bg-orange-100/80 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-900/30 text-orange-700 dark:text-orange-300 flex items-center justify-center hover:bg-gradient-to-tr hover:from-orange-500 hover:to-red-500 hover:text-white transition-all cursor-pointer font-bold text-xs shadow-sm">
                I
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-slate-900 dark:text-white font-extrabold text-sm tracking-wider uppercase mb-4">Commerce Notes</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => setActiveTab('class12')} className="hover:text-orange-600 dark:hover:text-orange-400 font-bold transition-colors cursor-pointer">
                  Class 12th Commerce Notes
                </button>
              </li>
            </ul>
          </div>

          {/* Director & Institute Details */}
          <div>
            <h3 className="text-slate-900 dark:text-white font-extrabold text-sm tracking-wider uppercase mb-4">Leadership</h3>
            <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-300">
              <li><strong>Director:</strong> Arpit Nema</li>
              <li><strong>Coaching:</strong> Rakhi Coaching Classes</li>
              <li><strong>Coverage:</strong> All India Online & MP Offlines</li>
              <li><strong>Support:</strong> 24x7 Student Helpdesk</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 text-sm">
            <h3 className="text-slate-900 dark:text-white font-extrabold text-sm tracking-wider uppercase mb-1">Contact Support</h3>
            <div className="flex items-start space-x-2">
              <MapPin size={16} className="text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
              <span>Main Road, Kudan, Katangi - 483105</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone size={16} className="text-orange-600 dark:text-orange-400 shrink-0" />
              <span>+91 78289 08559</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail size={16} className="text-orange-600 dark:text-orange-400 shrink-0" />
              <span>arpitnema35@gmail.com</span>
            </div>
            <div className="pt-2 border-t border-orange-100 dark:border-orange-950/60 flex flex-col space-y-1 text-xs">
              <button onClick={() => setActiveTab('privacy')} className="text-left hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer">
                Privacy Policy
              </button>
              <button onClick={() => setActiveTab('terms')} className="text-left hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer">
                Terms & Conditions
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-8 border-t border-orange-200/60 dark:border-orange-950/60 flex flex-col md:flex-row items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <p>© 2026 Rakhi Coaching Classes. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="flex items-center text-orange-600 dark:text-orange-400 font-semibold">
              <Shield size={12} className="mr-1 text-orange-600 dark:text-orange-400" /> Secure Payment by Razorpay
            </span>
            <span>SEO Optimized & PWA Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
