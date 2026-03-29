import React from 'react';
import { MapPin, Phone, Instagram, Mail, Send } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="section-title">Свяжитесь с нами</h2>
          <p className="section-subtitle">
            Ответим на все вопросы и подберем удобное время
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Контактная информация */}
          <div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Контакты</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-teal-100 p-3 rounded-lg">
                    <Phone className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Телефон</p>
                    <a href="tel:+77077998898" className="text-lg font-medium text-gray-900 hover:text-teal-600">
                      +7 707 799 8898
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-teal-100 p-3 rounded-lg">
                    <MapPin className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Адрес</p>
                    <p className="text-lg font-medium text-gray-900">
                      Алматы, ул. Е. Брусиловского, 48
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-teal-100 p-3 rounded-lg">
                    <Instagram className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Instagram</p>
                    <a 
                      href="https://instagram.com/freedomlife.kz" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-lg font-medium text-gray-900 hover:text-teal-600"
                    >
                      @freedomlife.kz
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4">Как добраться</h4>
                <div className="bg-gray-100 h-48 rounded-xl flex items-center justify-center text-gray-500">
                  Карта проезда
                </div>
              </div>
            </div>
          </div>
          
          {/* Форма обратной связи */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Напишите нам</h3>
            
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ваше имя
                </label>
                <input
                  type="text"
                  placeholder="Иван Иванов"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="ivan@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сообщение
                </label>
                <textarea
                  rows="4"
                  placeholder="Опишите ваш вопрос..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none"
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full btn-primary inline-flex items-center justify-center gap-2 py-4"
              >
                <Send size={18} />
                Отправить сообщение
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                Нажимая кнопку, вы соглашаетесь с политикой обработки данных
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;