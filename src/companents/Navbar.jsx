import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Главная', path: '/' },
    { name: 'О нас', path: '/about' },
    { name: 'Услуги', path: '/services' },
    { name: 'Расписание', path: '/schedule' },
    { name: 'Контакты', path: '/contact' }
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          
          {/* Логотип */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">FL</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">FreedomLife</span>
          </Link>

          {/* Десктоп меню */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-gray-600 hover:text-teal-600 font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Кнопка записи (десктоп) */}
          <Link
            to="/contact"
            className="hidden md:block btn-primary text-sm px-5 py-2.5"
          >
            Записаться
          </Link>

          {/* Мобильная кнопка */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Мобильное меню */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block py-2 text-gray-600 hover:text-teal-600 font-medium"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/contact"
              className="block mt-4 btn-primary text-center"
              onClick={() => setIsOpen(false)}
            >
              Записаться
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;