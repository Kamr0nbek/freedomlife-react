import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid md:grid-cols-4 gap-8">
          
          {/* Логотип и описание */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">FL</span>
              </div>
              <span className="text-xl font-semibold text-white">FreedomLife</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-sm">
              Центр восстановления позвоночника. Помогаем жить без боли с 2015 года.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          {/* Навигация */}
          <div>
            <h4 className="text-white font-semibold mb-4">Навигация</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-white transition-colors">Главная</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">О нас</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Услуги</Link></li>
              <li><Link to="/schedule" className="hover:text-white transition-colors">Расписание</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Контакты</Link></li>
            </ul>
          </div>
          
          {/* Контакты */}
          <div>
            <h4 className="text-white font-semibold mb-4">Контакты</h4>
            <ul className="space-y-2 text-gray-400">
              <li>ул. Брусиловского, 48</li>
              <li>Алматы, Казахстан</li>
              <li>+7 707 799 8898</li>
              <li>info@freedomlife.kz</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} FreedomLife.kz. Все права защищены.
          </p>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-4 md:mt-0">
            Сделано с <Heart size={14} className="text-red-500 fill-current" /> для вашего здоровья
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;