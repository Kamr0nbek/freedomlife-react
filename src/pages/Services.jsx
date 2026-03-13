import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Bone, Disc, ArrowRight, Heart, Sparkles } from 'lucide-react';

const servicesData = [
  {
    icon: Disc,
    title: 'Грыжи позвоночника',
    description: 'Консервативное и хирургическое лечение. Физиотерапия, мануальная терапия, современные методики на аппаратах Freespine.',
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50'
  },
  {
    icon: Activity,
    title: 'Протрузии',
    description: 'Комплексные программы: медикаменты, упражнения, укрепление мышечного корсета на качелях Юлина и велотренажере.',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50'
  },
  {
    icon: Bone,
    title: 'Хронические боли',
    description: 'Индивидуальные программы реабилитации. Быстрое снятие боли и восстановление под наблюдением специалистов.',
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-indigo-50'
  },
  {
    icon: Heart,
    title: 'Остеохондроз',
    description: 'Комплексное лечение: массаж, ЛФК, физиотерапия. Возвращаем подвижность и качество жизни.',
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50'
  },
  {
    icon: Sparkles,
    title: 'Сколиоз',
    description: 'Специализированные упражнения и коррекция. Лечение для детей и взрослых с индивидуальным подходом.',
    color: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-50'
  },
  {
    icon: Activity,
    title: 'Реабилитация',
    description: 'Восстановительные программы после травм и операций. Тренировочные аппараты и наблюдение врача.',
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-50'
  }
];

const Services = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="services" className="py-24 bg-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="container-custom relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Услуги</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Наши услуги
          </h2>
          <p className="text-gray-600 text-lg mt-4 max-w-2xl mx-auto">
            Современные методы лечения позвоночника без боли и длительного восстановления в Алматы
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {servicesData.map((service, index) => (
            <motion.div 
              key={index}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 relative overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className={`relative ${service.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="w-8 h-8 text-gray-700" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>
              
              <motion.button 
                whileHover={{ x: 4 }}
                className="text-teal-600 font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all"
              >
                Подробнее
                <ArrowRight size={18} />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
