import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Instagram, MessageCircle, MapPinned } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'Услуги': ['Грыжи позвоночника', 'Протрузии', 'Хронические боли', 'Остеохондроз', 'Сколиоз'],
    'О центре': ['О нас', 'Врачи', 'Отзывы', 'Сертификаты', 'Контакты'],
    'Информация': ['Цены', 'FAQ', 'Блог', 'Пациентам']
  };

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.a 
              href="/"
              whileHover={{ scale: 1.02 }}
              className="text-2xl font-bold inline-block mb-4"
            >
              Freedom<span className="text-teal-500">Life</span>
            </motion.a>
            <p className="text-slate-400 mb-6 max-w-sm">
              Клиника современной вертебрологии в Алматы. Лечим грыжи, протрузии и хронические боли без операций.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="tel:+77077998898" className="flex items-center gap-3 text-slate-300 hover:text-teal-400 transition-colors">
                <Phone className="w-5 h-5 text-teal-500" />
                <span>+7 707 799 88 98</span>
              </a>
              <a href="https://wa.me/77077998898" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-teal-400 transition-colors">
                <MessageCircle className="w-5 h-5 text-teal-500" />
                <span>WhatsApp</span>
              </a>
              <a href="mailto:Freedomlife.kz" className="flex items-center gap-3 text-slate-300 hover:text-teal-400 transition-colors">
                <Mail className="w-5 h-5 text-teal-500" />
                <span>Freedomlife.kz</span>
              </a>
              <div className="flex items-start gap-3 text-slate-300">
                <MapPin className="w-5 h-5 text-teal-500 mt-0.5" />
                <div>
                  <span>г. Алматы, ул. Евгения Брусиловского, 48 (3 этаж)</span>
                </div>
              </div>
              <a 
                href="https://2gis.kz/almaty/geo/70000001105090249"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm transition-colors"
              >
                <MapPinned className="w-4 h-4" />
                Открыть на 2ГИС
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links], index) => (
            <div key={index}>
              <h4 className="font-semibold text-lg mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social & Bottom */}
        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {currentYear} FreedomLife. Все права защищены.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <motion.a
                href="https://www.instagram.com/freedomlife.kz"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-teal-500 hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://wa.me/77077998898"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-teal-500 hover:text-white transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
