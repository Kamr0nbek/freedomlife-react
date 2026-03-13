import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Heart, Users, ArrowRight, Activity, Bike, Waves } from 'lucide-react';

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.span variants={itemVariants} className="text-teal-600 font-semibold text-sm uppercase tracking-wider">
              О нас
            </motion.span>
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">
              Мягкое восстановление — наша философия
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-600 text-lg mb-8 leading-relaxed">
              Мы помогаем людям с заболеваниями позвоночника вернуться к полноценной жизни 
              без боли, страха и длительного восстановления в Алматы.
            </motion.p>
            
            <div className="space-y-6 mb-8">
              {[
                { icon: Shield, title: 'Безопасные методики', desc: 'Только проверенные, щадящие подходы' },
                { icon: Heart, title: 'Индивидуальный подход', desc: 'Программа лечения под каждого пациента' },
                { icon: Users, title: 'Команда экспертов', desc: 'Врачи с многолетним стажем' }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 10 }}
                  className="flex gap-4 items-start p-4 rounded-xl hover:bg-teal-50 transition-colors cursor-default"
                >
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
            >
              Подробнее о центре
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-teal-200 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-amber-200 rounded-full blur-3xl opacity-50"></div>
            
            <div className="relative bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-1 shadow-2xl">
              <div className="bg-white rounded-[22px] p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center">
                    <span className="text-3xl">🏥</span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Основано в</div>
                    <div className="text-2xl font-bold text-gray-900">2010 году</div>
                  </div>
                </div>
                
                {/* Training Equipment */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Тренировочные аппараты</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Activity, name: 'Freespine' },
                      { icon: Waves, name: 'Качели Юлина' },
                      { icon: Bike, name: 'Велотренажер' }
                    ].map((item, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                        <item.icon className="w-5 h-5 text-teal-600" />
                        <span className="text-sm text-gray-700">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { number: '5000+', label: 'Пациентов' },
                    { number: '98%', label: 'Выздоровлений' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-teal-600">{stat.number}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-4 text-white text-center">
                  <div className="text-3xl font-bold">15+ лет</div>
                  <div className="text-teal-100">успешной работы</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
