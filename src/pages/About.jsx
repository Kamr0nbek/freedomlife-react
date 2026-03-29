import React from 'react';
import { Shield, Heart, Users } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">О нас</span>
            <h2 className="section-title mt-2">Мягкое восстановление — наша философия</h2>
            <p className="text-gray-600 text-lg mb-6">
              Мы помогаем людям с заболеваниями позвоночника вернуться к полноценной жизни 
              без боли, страха и длительного восстановления.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex gap-4">
                <Shield className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Безопасные методики</h4>
                  <p className="text-gray-600">Только проверенные, щадящие подходы</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Heart className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Индивидуальный подход</h4>
                  <p className="text-gray-600">Программа лечения под каждого пациента</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Users className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Команда экспертов</h4>
                  <p className="text-gray-600">Врачи с многолетним стажем</p>
                </div>
              </div>
            </div>
            
            <button className="btn-outline">
              Подробнее о центре
            </button>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-teal-100 to-teal-200 rounded-3xl p-8 shadow-xl">
              <div className="bg-white rounded-2xl p-6">
                <p className="text-sm text-gray-500 mb-2">Основано в</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">2021 году</h3>
                
                {/* Тренировочные аппараты */}
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-3">Тренировочные аппараты</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                      Freespine
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                      Качели Юлина
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                      Велотренажер
                    </div>
                  </div>
                </div>
                
                {/* Статистика */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-teal-600">5000+</div>
                    <div className="text-xs text-gray-500">Пациентов</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-teal-600">98%</div>
                    <div className="text-xs text-gray-500">Выздоровлений</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-teal-600">15+</div>
                    <div className="text-xs text-gray-500">лет работы</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;