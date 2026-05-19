import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLink, useNavigation } from '../context/NavigationContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Activity, Home, LayoutDashboard, Cpu, Menu, X } from 'lucide-react';

const NavLink = ({ href, icon: Icon, children, onClick }) => (
  <a
    href={href}
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-primary transition-colors duration-300 group relative"
  >
    <Icon size={16} className="group-hover:text-primary transition-colors" />
    <span>{children}</span>
    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
  </a>
);

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { navigate } = useNavigation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: "#home", icon: Home, label: "Home" },
    { href: "#dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "#features", icon: Cpu, label: "Features" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-white/5 py-4 shadow-[0_4px_30px_rgba(0,229,255,0.05)]' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
        
        {/* Logo */}
        <AppLink to="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 group-hover:border-primary transition-colors duration-300">
            <Activity className="text-primary group-hover:animate-pulse" size={20} />
            <div className="absolute inset-0 rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.3)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <span className="text-xl font-bold font-heading tracking-wider text-white">
            DriveSense <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">AI</span>
          </span>
        </AppLink>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1 backdrop-blur-md">
          {navLinks.map((link) => (
            <NavLink key={link.label} href={link.href} icon={link.icon}>
              {link.label}
            </NavLink>
          ))}
          
          <div className="w-[1px] h-6 bg-white/20 mx-2" />

          {user ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-heading uppercase tracking-wider text-gray-300 border border-white/20 rounded-full hover:bg-white/5 hover:border-white/40 transition-all duration-300"
            >
              Sign out
            </button>
          ) : (
            <AppLink
              to="/login"
              className="px-4 py-2 text-sm font-heading uppercase tracking-wider text-primary border border-primary/40 rounded-full hover:bg-primary/10 hover:border-primary transition-all duration-300"
            >
              Sign in
            </AppLink>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-gray-300 hover:text-white transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-lg font-medium text-gray-300 hover:text-primary transition-colors py-2 border-b border-white/5"
                >
                  <link.icon size={20} />
                  {link.label}
                </a>
              ))}
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex w-full text-left items-center gap-3 text-lg font-medium text-gray-300 hover:text-white py-2 border-b border-white/5"
                >
                  Sign out
                </button>
              ) : (
                <AppLink
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-lg font-medium text-primary py-2 border-b border-white/5"
                >
                  Sign in
                </AppLink>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
