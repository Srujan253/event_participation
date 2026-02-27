import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User, Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Magnetic from './Magnetic';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const admin = JSON.parse(localStorage.getItem('attendqr_admin') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('attendqr_token');
    localStorage.removeItem('attendqr_admin');
    navigate('/auth');
  };

  const navLinks = [
    { label: 'Event List', path: '/', active: true },
  ];

  return (
    <nav className="glass-nav px-6 py-4 flex justify-between items-center">
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => navigate('/')}
      >
        <div className="p-2 bg-blue-600 rounded-lg text-white group-hover:scale-110 transition-transform duration-300">
          <Zap size={20} fill="white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-none">AttendQR</h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mt-1">Lumina Admin</p>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-8">
        <div className="flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.label}
              className={`text-sm font-semibold transition-colors ${
                link.active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-gray-200" />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
              <User size={16} />
            </div>
            <span className="text-sm font-semibold">{admin.username || 'Admin'}</span>
          </div>
          <Magnetic>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm cursor-pointer"
            >
              Logout
            </motion.button>
          </Magnetic>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button 
        className="md:hidden p-2 text-gray-500 hover:text-gray-900"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 p-6 flex flex-col gap-4 md:hidden shadow-xl"
        >
          {navLinks.map((link) => (
            <button
              key={link.label}
              className="text-left text-sm font-semibold text-gray-700 py-2 border-b border-gray-50"
            >
              {link.label}
            </button>
          ))}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-gray-700">
              <User size={16} />
              <span className="text-sm font-semibold">{admin.username}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="text-sm font-bold text-red-600"
            >
              Logout
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
