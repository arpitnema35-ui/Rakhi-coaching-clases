import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShoppingCart, 
  Menu, 
  X, 
  User, 
  LogOut, 
  ChevronDown, 
  Moon, 
  Sun,
  ShieldAlert,
  Settings
} from 'lucide-react';
import { UserProfile, CartItem } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile | null;
  onLoginClick: () => void;
  onLogout: () => void;
  cart: CartItem[];
  setIsCartOpen: (open: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onSimulateRole: (role: 'student' | 'teacher' | 'admin') => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  user,
  onLoginClick,
  onLogout,
  cart,
  setIsCartOpen,
  darkMode,
  setDarkMode,
  onSimulateRole
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'courses', label: 'Courses' },
    { id: 'notes-store', label: 'Notes Store' },
    { id: 'test-series', label: 'Test Series' },
    { id: 'blog', label: 'Blog' },
    { id: 'contact', label: 'Contact Us' }
  ];

  const handleLinkClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav id="main-navbar" className="sticky top-0 z-40 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            onClick={() => handleLinkClick('home')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="bg-indigo-600 w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              R
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block">
                Rakhi Coaching
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5 uppercase tracking-widest font-bold">
                Learn Smart, Score Better
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${
                  activeTab === link.id
                    ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Action Utilities (Cart, DarkMode, Profile, Sim Role) */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            
            {/* Dark Mode Switch */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              title="Toggle Dark/Light Mode"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Cart Widget */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative transition-all cursor-pointer"
              title="View Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={18} />
              {cartItemsCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-bold">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Quick Emulator Switcher for evaluation */}
            <div className="relative">
              <button
                onClick={() => setIsRoleSwitcherOpen(!isRoleSwitcherOpen)}
                className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-mono transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                title="Simulate Role for Testing"
              >
                <Settings size={12} className="text-teal-500 animate-spin-slow" />
                <span>Test Role: {user?.role || 'Guest'}</span>
                <ChevronDown size={12} />
              </button>

              {isRoleSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-50 text-xs font-mono text-slate-700 dark:text-slate-300">
                  <div className="px-3 py-1 text-[10px] text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700 mb-1">
                    DEVELOPER CONTROLS
                  </div>
                  <button
                    onClick={() => { onSimulateRole('student'); setIsRoleSwitcherOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between cursor-pointer"
                  >
                    <span>Student Mock</span>
                    {user?.role === 'student' && <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>}
                  </button>
                  <button
                    onClick={() => { onSimulateRole('teacher'); setIsRoleSwitcherOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between cursor-pointer"
                  >
                    <span>Teacher Mock</span>
                    {user?.role === 'teacher' && <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>}
                  </button>
                  <button
                    onClick={() => { onSimulateRole('admin'); setIsRoleSwitcherOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between cursor-pointer text-indigo-600 dark:text-indigo-400 font-bold"
                  >
                    <span>Full Admin Mock</span>
                    {user?.role === 'admin' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
                  </button>
                </div>
              )}
            </div>

            {/* User Auth Section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-1.5 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  {user.photoURL ? (
                    <img 
                      referrerPolicy="no-referrer"
                      src={user.photoURL} 
                      alt={user.displayName} 
                      className="w-8 h-8 rounded-xl object-cover border border-teal-500/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <ChevronDown size={14} className="text-slate-500" />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-50 text-slate-700 dark:text-slate-300">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="font-semibold text-sm truncate">{user.displayName}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                      <span className="inline-block px-2 py-0.5 bg-teal-50 dark:bg-teal-950/50 text-[10px] text-teal-600 dark:text-teal-400 rounded mt-1 font-mono uppercase">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => { setActiveTab('dashboard-overview'); setIsProfileDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2 cursor-pointer"
                    >
                      <User size={14} />
                      <span>Student Dashboard</span>
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => { setActiveTab('admin-panel'); setIsProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 flex items-center space-x-2 font-medium cursor-pointer border-t border-slate-100 dark:border-slate-700"
                      >
                        <ShieldAlert size={14} />
                        <span>Admin Console</span>
                      </button>
                    )}

                    <button
                      onClick={() => { onLogout(); setIsProfileDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center space-x-2 cursor-pointer border-t border-slate-100 dark:border-slate-700"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-5 py-2 text-sm font-bold bg-indigo-600 rounded-full hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 text-white transition-all cursor-pointer"
              >
                Get Started
              </button>
            )}

            {/* Hamburger (Mobile Menu Toggle) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl md:hidden transition-all cursor-pointer"
              title="Menu"
              aria-label="Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all">
          <div className="px-2 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer block ${
                  activeTab === link.id
                    ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                {link.label}
              </button>
            ))}

            {/* Role switch in mobile for quick sandbox testing */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 px-4">
              <p className="text-[9px] font-mono text-slate-400 tracking-wider mb-2">QUICK SANDBOX ROLES</p>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => onSimulateRole('student')}
                  className={`py-1 text-[10px] font-mono border rounded text-center cursor-pointer ${user?.role === 'student' ? 'bg-teal-500 text-white border-teal-500' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                >
                  Student
                </button>
                <button 
                  onClick={() => onSimulateRole('teacher')}
                  className={`py-1 text-[10px] font-mono border rounded text-center cursor-pointer ${user?.role === 'teacher' ? 'bg-teal-500 text-white border-teal-500' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                >
                  Teacher
                </button>
                <button 
                  onClick={() => onSimulateRole('admin')}
                  className={`py-1 text-[10px] font-mono border rounded text-center cursor-pointer ${user?.role === 'admin' ? 'bg-indigo-500 text-white border-indigo-500' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                >
                  Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
