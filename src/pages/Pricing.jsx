import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Users, Clock, Sparkles } from 'lucide-react';

const tariffs = [
  {
    name: 'Старт',
    period: '1 месяц',
    lessons: '10 занятий',
    price: '59 900',
    pricePerLesson: '5 990 ₸',
    popular: false,
    features: ['Занятия 2-3 раза в неделю', 'Сопровождение специалиста', 'Современные тренажёры']
  },
  {
    name: 'Базовый',
    period: '3 месяца',
    lessons: '30 занятий',
    price: '149 900',
    pricePerLesson: '4 997 ₸',
    popular: true,
    features: ['Занятия 2-3 раза в неделю', 'Индивидуальный подход', 'Современные тренажёры', 'Заморозка абонемента']
  },
  {
    name: 'Оптимальный',
    period: '6 месяцев',
    lessons: '55 занятий',
    price: '239 900',
    pricePerLesson: '4 360 ₸',
    popular: false,
    features: ['Занятия 2-3 раза в неделю', 'Индивидуальный подход', 'Современные тренажёры', 'Заморозка абонемента', 'Персональный план']
  },
  {
    name: 'Премиум',
    period: '12 месяцев',
    lessons: '8 занятий/месяц',
    price: '400 000',
    pricePerLesson: '4 166 ₸',
    popular: false,
    features: ['8 занятий в месяц', 'Полное сопровождение', 'Все тренажёры', 'Заморозка абонемента', 'Приоритетная запись']
  },
  {
    name: 'Годовой 1+1',
    period: '12 месяцев',
    lessons: 'для двоих',
    subtitle: 'Каждый месяц — по 8 занятий',
    price: '500 000',
    pricePerLesson: '2 600 ₸',
    popular: false,
    features: ['Для двоих человек', '8 занятий в месяц каждому', 'Совместные тренировки', 'Полное сопровождение', 'Заморозка абонемента']
  }
];

const individualServices = [
  { name: 'Индивидуальное занятие', price: '20 000 ₸' },
  { name: 'Разовая оплата', price: '15 000 ₸' },
  { name: 'Первое полноценное занятие', price: '5 000 ₸' }
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
    <section id="pricing" className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom px-3 sm:px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <span className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-100 text-amber-700 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            Акции действуют до конца месяца!
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 px-2">
            Тарифы и акции FreedomLife
          </h2>
          <p className="text-gray-600 text-sm sm:text-lg mt-3 sm:mt-4 max-w-2xl mx-auto px-4">
            Чем больше занятий, тем дешевле каждое! Занятия проходят 2–3 раза в неделю по 1 часу.
          </p>
        </motion.div>

        {/* Tariffs Grid - Flexbox с одинаковой высотой */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-4 md:gap-5 mb-10 md:mb-16"
        >
          {tariffs.map((tariff, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -4 }}
              className={`relative flex flex-col bg-white rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg transition-all ${
                tariff.popular ? 'ring-2 ring-teal-500' : ''
              }`}
            >
              {tariff.popular && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-3 z-20 px-3 py-1 bg-teal-500 text-white text-xs font-semibold rounded-full whitespace-nowrap shadow-md">
                  Хит
                </div>
              )}
              
              {/* Название тарифа */}
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-1">
                {tariff.name}
              </h3>
              
              {/* Период и кол-во занятий */}
              <p className="text-gray-500 text-xs sm:text-sm text-center mb-1">
                {tariff.period}
              </p>
              <p className="text-gray-500 text-xs sm:text-sm text-center mb-3">
                {tariff.lessons}
              </p>
              {tariff.subtitle && (
                <p className="text-gray-500 text-xs text-center mb-2">
                  {tariff.subtitle}
                </p>
              )}
              
              {/* Цена */}
              <div className="text-center mb-3">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {tariff.price} ₸
                </span>
              </div>
              
              {/* Цена за занятие */}
              <div className="text-center mb-4 sm:mb-5">
                <span className="inline-block px-2 py-1 bg-teal-50 text-teal-600 text-xs sm:text-sm font-medium rounded-lg">
                  1 занятие = {tariff.pricePerLesson}
                </span>
              </div>
              
              {/* Список преимуществ - растягивается */}
              <ul className="flex-1 space-y-1.5 sm:space-y-2 mb-4 sm:mb-5">
                {tariff.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* Кнопка прижимается к низу через margin-top: auto */}
              <motion.a
                href={`https://wa.me/77077998898?text=${encodeURIComponent(`Здравствуйте! Я хочу купить тариф "${tariff.name}". Хочу узнать подробнее.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-auto py-2.5 sm:py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors text-sm"
              >
                Выбрать
                <ArrowRight className="w-4 h-4" />
              </motion.a>
            </motion.div>
          ))}
        </motion.div>

        {/* Individual Services */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl mb-10 md:mb-16"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6 text-center">
            Индивидуальные услуги
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {individualServices.map((service, index) => (
              <motion.a
                key={index}
                href={`https://wa.me/77077998898?text=${encodeURIComponent(`Здравствуйте! Интересует услуга "${service.name}". Хочу узнать подробнее.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                className="bg-gray-50 rounded-xl p-5 sm:p-6 text-center cursor-pointer hover:bg-teal-50 transition-colors"
              >
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-2">
                  {service.name}
                </h4>
                <p className="text-xl sm:text-2xl font-bold text-teal-600">
                  {service.price}
                </p>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Advantages */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-white"
        >
          <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-center">
            Преимущества FreedomLife
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {advantages.map((advantage, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center"
              >
                <advantage.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3" />
                <p className="text-xs sm:text-sm">{advantage.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
