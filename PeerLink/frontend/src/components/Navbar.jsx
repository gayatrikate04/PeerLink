import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, User, BookOpen, Users, MessageSquare, Video, FileText, LogOut, LogIn, UserPlus, Menu, X } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Re-render on route changes
  const token = localStorage.getItem('token');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const NavLink = ({ to, icon: Icon, children, onClick }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        onClick={() => {
          if (onClick) onClick();
          setIsMobileMenuOpen(false);
        }}
        className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive 
            ? 'bg-blue-50 text-blue-600 shadow-sm' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-blue-500'
        }`}
      >
        <Icon size={18} className={isActive ? 'text-blue-500' : 'text-slate-400'} />
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:shadow-lg transition-all transform group-hover:-translate-y-0.5">
              L²
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              Platform
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-2">
            {token ? (
              <>
                <NavLink to="/" icon={Home}>Feed</NavLink>
                <NavLink to="/profile" icon={User}>Profile</NavLink>
                <NavLink to="/skills" icon={BookOpen}>Skills</NavLink>
                <NavLink to="/match" icon={Users}>Match</NavLink>
                <NavLink to="/chat" icon={MessageSquare}>Chat</NavLink>
                <NavLink to="/video" icon={Video}>Video</NavLink>
                <NavLink to="/requests" icon={FileText}>Requests</NavLink>
                
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                
                <button 
                  onClick={handleLogout} 
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink to="/" icon={Home}>Home</NavLink>
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <Link 
                  to="/login" 
                  className="flex items-center space-x-1.5 px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <LogIn size={18} className="mr-1" />
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <UserPlus size={18} className="mr-1" />
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50 focus:outline-none transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 shadow-inner">
            {token ? (
              <>
                <NavLink to="/" icon={Home}>Feed</NavLink>
                <NavLink to="/profile" icon={User}>Profile</NavLink>
                <NavLink to="/skills" icon={BookOpen}>Skills</NavLink>
                <NavLink to="/match" icon={Users}>Match</NavLink>
                <NavLink to="/chat" icon={MessageSquare}>Chat</NavLink>
                <NavLink to="/video" icon={Video}>Video</NavLink>
                <NavLink to="/requests" icon={FileText}>Requests</NavLink>
                
                <div className="border-t border-slate-200 my-2 pt-2"></div>
                
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center space-x-1.5 px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink to="/" icon={Home}>Home</NavLink>
                <div className="border-t border-slate-200 my-2 pt-2"></div>
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <LogIn size={18} className="mr-1" />
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-1.5 px-3 py-2 mt-2 rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <UserPlus size={18} className="mr-1" />
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
