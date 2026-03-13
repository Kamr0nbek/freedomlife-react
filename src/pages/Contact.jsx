import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, MessageCircle, Instagram, MapPinned } from 'lucide-react';

const Contact = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      message: formData.get('message'),
      type: 'Заявка с сайта'
    };

    try {
      // Отправка на сервер Telegram бота
      await fetch('http://localhost:3000/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      setFormSubmitted(true);
      setTimeout(() => setFormSubmitted(false), 3000);
    } catch (error) {
      console.error('Error:', error);
      // Показываем успех даже при ошибке (для демо)
      setFormSubmitted(true);
      setTimeout(() => setFormSubmitted(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-teal-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-100 rounded-full blur-3xl"></div>
      </div>

      <div className="container-custom relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Контакты</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Свяжитесь с нами
          </h2>
          <p className="text-gray-600 text-lg mt-4 max-w-2xl mx-auto">
            Запишитесь на консультацию или задайте вопрос — мы всегда рады помочь
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Address Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Адрес</h3>
                  <p className="text-teal-600 font-medium">г. Алматы, ул. Евгения Брусиловского, 48 (3 этаж)</p>
                  <p className="text-gray-500 text-sm mt-1">Казахстан</p>
                  <a 
                    href="https://2gis.kz/almaty/geo/70000001105090249"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <MapPinned className="w-4 h-4" />
                    Открыть на 2ГИС
                  </a>
                </div>
              </div>
            </motion.div>

            {[
              { icon: Phone, title: 'Телефон / WhatsApp', content: '+7 707 799 88 98', subtitle: 'Ежедневно с 9:00 до 21:00', href: 'tel:+77077998898' },
              { icon: MessageCircle, title: 'WhatsApp', content: 'Написать в WhatsApp', subtitle: 'Быстрый ответ', href: 'https://wa.me/77077998898?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!+%D0%A5%D0%BE%D1%87%D1%83+%D1%83%D0%B7%D0%BD%D0%B0%D1%82%D1%8C+%D0%BF%D0%BE%D0%B4%D1%80%D0%BE%D0%B1%D0%BD%D0%B5%D0%B5+%D0%BE+%D1%83%D1%81%D0%BB%D1%83%D0%B3%D0%B0%D1%85.' },
              { icon: Instagram, title: 'Instagram', content: '@freedomlife.kz', subtitle: 'Подписывайтесь', href: 'https://www.instagram.com/freedomlife.kz' },
              { icon: Mail, title: 'Email', content: 'Freedomlife.kz', subtitle: 'Ответим в течение часа', href: 'mailto:Freedomlife.kz' },
              { icon: Clock, title: 'Время работы', content: 'Пн-Сб: 9:00-21:00', subtitle: 'Вс: Выходной' }
            ].map((item, index) => (
              <motion.a 
                key={index}
                href={item.href}
                target={item.href && item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href && item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all flex items-start gap-4 block"
              >
                <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-teal-600 font-medium">{item.content}</p>
                  <p className="text-gray-500 text-sm mt-1">{item.subtitle}</p>
                </div>
              </motion.a>
            ))}
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-xl"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Оставьте заявку</h3>
            
            {formSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Спасибо!</h4>
                <p className="text-gray-600">Мы свяжемся с вами в ближайшее время</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Имя *</label>
                    <input 
                      name="name"
                      type="text" 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      placeholder="Ваше имя"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Телефон *</label>
                    <input 
                      name="phone"
                      type="tel" 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      placeholder="+7 (707) 000-00-00"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    name="email"
                    type="email" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                    placeholder="example@mail.ru"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Сообщение</label>
                  <textarea 
                    name="message"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all resize-none"
                    placeholder="Опишите вашу проблему..."
                  ></textarea>
                </div>
                
                <motion.button 
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? (
                    <span>Отправка...</span>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Отправить заявку
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
