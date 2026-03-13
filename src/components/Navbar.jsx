import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Главная', path: '/' },
    { name: 'О нас', path: '/#about' },
    { name: 'Услуги', path: '/#services' },
    { name: 'Тарифы', path: '/#pricing' },
    { name: 'Отзывы', path: '/#reviews' },
    { name: 'Контакты', path: '/#contact' }
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.a 
            href="/"
            whileHover={{ scale: 1.02 }}
            className={`text-2xl font-bold transition-colors ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}
          >
            Freedom<span className="text-teal-500">Life</span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <motion.a
                key={index}
                href={link.path}
                whileHover={{ y: -2 }}
                className={`font-medium transition-colors ${
                  isScrolled 
                    ? 'text-gray-600 hover:text-teal-600' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {link.name}
              </motion.a>
            ))}
          </div>

          {/* CTA Button & Mobile Menu */}
          <div className="flex items-center gap-4">
            <motion.a 
              href="tel:+77077998898"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                isScrolled 
                  ? 'bg-teal-500 text-white hover:bg-teal-600' 
                  : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>+7 (707) 799-88-98</span>
            </motion.a>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white shadow-xl"
          >
            <div className="container-custom py-6 space-y-4">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 px-4 text-gray-700 hover:bg-teal-50 hover:text-teal-600 rounded-xl font-medium transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <a 
                href="tel:+77077998898"
                className="block py-3 px-4 bg-teal-500 text-white text-center rounded-xl font-medium hover:bg-teal-600 transition-colors"
              >
                +7 (707) 799-88-98
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
