import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Users, Clock, Sparkles } from 'lucide-react';

const tariffs = [
  {
    name: 'Старт',
    period: '1 месяц',
    lessons: '10 занятий',
    price: '59 900',
    oldPrice: null,
    popular: false,
    features: ['Занятия 2-3 раза в неделю', 'Сопровождение специалиста', 'Современные тренажёры']
  },
  {
    name: 'Базовый',
    period: '3 месяца',
    lessons: '30 занятий',
    price: '149 900',
    oldPrice: '180 000',
    popular: true,
    features: ['Занятия 2-3 раза в неделю', 'Индивидуальный подход', 'Современные тренажёры', 'Заморозка абонемента']
  },
  {
    name: 'Оптимальный',
    period: '6 месяцев',
    lessons: '55 занятий',
    price: '239 900',
    oldPrice: '330 000',
    popular: false,
    features: ['Занятия 2-3 раза в неделю', 'Индивидуальный подход', 'Современные тренажёры', 'Заморозка абонемента', 'Персональный план']
  },
  {
    name: 'Премиум',
    period: '12 месяцев',
    lessons: '10 занятий/месяц',
    price: '400 000',
    oldPrice: '720 000',
    popular: false,
    features: ['10 занятий в месяц', 'Полное сопровождение', 'Все тренажёры', 'Заморозка абонемента', 'Приоритетная запись']
  },
  {
    name: 'Годовой 1+1',
    period: '12 месяцев',
    lessons: 'для двоих',
    price: '500 000',
    oldPrice: '1 400 000',
    popular: false,
    features: ['Для двоих человек', '10 занятий в месяц каждому', 'Совместные тренировки', 'Полное сопровождение', 'Заморозка абонемента']
  }
];

const individualServices = [
  { name: 'Индивидуальное занятие', price: '20 000 ₸' },
  { name: 'Разовая оплата', price: '15 000 ₸' },
  { name: 'Первое полноценное занятие', price: '3 000 ₸' }
];

const advantages = [
  { icon: Sparkles, text: 'Современные тренажёры Freespine и Качели Юлина' },
  { icon: Users, text: 'Индивидуальный подход и сопровождение специалистов' },
  { icon: Check, text: 'Первые результаты уже после 5–7 тренировок' },
  { icon: Clock, text: 'Возможность заморозки абонемента (отпуск, командировка, женские дни)' }
];

const Pricing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
            Акции действуют до конца месяца!
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Тарифы и акции FreedomLife
          </h2>
          <p className="text-gray-600 text-lg mt-4 max-w-2xl mx-auto">
            Чем больше занятий, тем дешевле каждое! Занятия проходят 2–3 раза в неделю по 1 часу.
          </p>
        </motion.div>

        {/* Tariffs Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-16"
        >
          {tariffs.map((tariff, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              className={`relative bg-white rounded-2xl p-4 sm:p-6 shadow-lg transition-all ${
                tariff.popular ? 'ring-2 ring-teal-500 sm:scale-105' : ''
              }`}
            >
              {tariff.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-teal-500 text-white text-xs font-semibold rounded-full">
                  Хит
                </div>
              )}
              
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">{tariff.name}</h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-1">{tariff.period}</p>
              <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">{tariff.lessons}</p>
              
              <div className="mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">{tariff.price} ₸</span>
                {tariff.oldPrice && (
                  <span className="ml-1 sm:ml-2 text-sm sm:text-lg text-gray-400 line-through">{tariff.oldPrice} ₸</span>
                )}
              </div>
              
              <ul className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                {tariff.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <motion.a
                href={`https://wa.me/77077998898?text=${encodeURIComponent(`Здравствуйте! Я хочу купить тариф "${tariff.name}". Хочу узнать подробнее.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 sm:py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
              >
                Выбрать
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.a>
            </motion.div>
          ))}
        </motion.div>

        {/* Individual Services */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 shadow-xl mb-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Индивидуальные услуги</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {individualServices.map((service, index) => (
              <motion.a
                key={index}
                href={`https://wa.me/77077998898?text=${encodeURIComponent(`Здравствуйте! Интересует услуга "${service.name}". Хочу узнать подробнее.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                className="bg-gray-50 rounded-xl p-6 text-center cursor-pointer hover:bg-teal-50 transition-colors"
              >
                <h4 className="font-semibold text-gray-900 mb-2">{service.name}</h4>
                <p className="text-2xl font-bold text-teal-600">{service.price}</p>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Advantages */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-8 md:p-12 text-white"
        >
          <h3 className="text-2xl font-bold mb-8 text-center">Преимущества FreedomLife</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((advantage, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
              >
                <advantage.icon className="w-8 h-8 mx-auto mb-3" />
                <p className="text-sm">{advantage.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
