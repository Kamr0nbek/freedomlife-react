import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CalendarDays, ArrowRight } from 'lucide-react';

const scheduleData = [
  { day: 'Понедельник', time: '09:00 – 21:00', status: 'open' },
  { day: 'Вторник', time: '09:00 – 21:00', status: 'open' },
  { day: 'Среда', time: '09:00 – 21:00', status: 'open' },
  { day: 'Четверг', time: '09:00 – 21:00', status: 'open' },
  { day: 'Пятница', time: '09:00 – 21:00', status: 'open' },
  { day: 'Суббота', time: '09:00 – 21:00', status: 'open' },
  { day: 'Воскресенье', time: 'Выходной', status: 'closed' }
];

const Schedule = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container-custom relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-teal-400 font-semibold text-sm uppercase tracking-wider">Расписание</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            График работы
          </h2>
          <p className="text-slate-400 text-lg mt-4 max-w-2xl mx-auto">
            Мы работаем каждый день, чтобы вы могли получить помощь в удобное время
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50"
          >
            <div className="space-y-4">
              {scheduleData.map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    item.status === 'closed' 
                      ? 'bg-slate-700/30' 
                      : 'bg-slate-700/50 hover:bg-slate-600/50'
                  } transition-colors`}
                >
                  <div className="flex items-center gap-4">
                    {item.status === 'open' ? (
                      <CalendarDays className="w-5 h-5 text-teal-400" />
                    ) : (
                      <CalendarDays className="w-5 h-5 text-slate-500" />
                    )}
                    <span className={`font-medium ${item.status === 'closed' ? 'text-slate-500' : 'text-white'}`}>
                      {item.day}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className={`w-4 h-4 ${item.status === 'closed' ? 'text-slate-500' : 'text-teal-400'}`} />
                    <span className={`${item.status === 'closed' ? 'text-slate-500' : 'text-slate-300'}`}>
                      {item.time}
                    </span>
                    {item.status === 'open' && (
                      <span className="ml-2 px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded-full">
                        Открыто
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="mt-8 pt-6 border-t border-slate-700/50 text-center"
            >
              <p className="text-slate-400 mb-4">Запишитесь на приём прямо сейчас</p>
              <motion.a 
                href="https://wa.me/77077998898?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!+%D0%AF+%D1%85%D0%BE%D1%87%D1%83+%D0%B7%D0%B0%D0%BF%D0%B8%D1%81%D0%B0%D1%82%D1%8C%D1%81%D1%8F+%D0%BD%D0%B0+%D0%BF%D1%80%D0%B8%D1%91%D0%BC.+%D0%A5%D0%BE%D1%87%D1%83+%D1%83%D0%B7%D0%BD%D0%B0%D1%82%D1%8C+%D0%BF%D0%BE%D0%B4%D1%80%D0%BE%D0%B1%D0%BD%D0%B5%D0%B5."
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium inline-flex items-center gap-2 transition-colors"
              >
                Записаться на приём
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Schedule;
