import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-teal-50 to-white overflow-hidden">
      <div className="container-custom py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Текстовая часть */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Без боли и <br />
              <span className="text-teal-600">резких методов</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto md:mx-0">
              Восстановление позвоночника. Грыжи, протрузии, защемления — мягко, безопасно, эффективно.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button className="btn-primary inline-flex items-center justify-center gap-2">
                <Calendar size={20} />
                Записаться
                <ArrowRight size={18} />
              </button>
              <button className="btn-outline">
                Узнать больше
              </button>
            </div>
            
            {/* Цифры */}
            <div className="flex justify-center md:justify-start gap-8 mt-12">
              <div>
                <div className="text-2xl font-bold text-teal-600">500+</div>
                <div className="text-sm text-gray-500">довольных пациентов</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-teal-600">10 лет</div>
                <div className="text-sm text-gray-500">опыта работы</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-teal-600">24/7</div>
                <div className="text-sm text-gray-500">поддержка</div>
              </div>
            </div>
          </div>

          {/* Изображение (замените на реальное) */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-teal-200 to-teal-400 rounded-3xl shadow-2xl flex items-center justify-center">
                <span className="text-white text-2xl font-bold">Фото центра</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Декоративные элементы */}
      <div className="absolute top-20 left-0 w-64 h-64 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-20 right-0 w-80 h-80 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
    </section>
  );
};

export default Hero;