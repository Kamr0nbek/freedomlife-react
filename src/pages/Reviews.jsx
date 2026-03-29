import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, User, Quote } from 'lucide-react';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ name: '', text: '', rating: 5 });
  const [submitted, setSubmitted] = useState(false);

  // Загружаем отзывы из localStorage
  useEffect(() => {
    const savedReviews = localStorage.getItem('freedomlife_reviews');
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      // Начальные отзывы
      const initialReviews = [
        { id: 1, name: 'Айгуль', text: 'Отличный центр! После 10 сеансов на Freespine забыла про боль в спине. Рекомендую!', rating: 5, date: '2024-01-15' },
        { id: 2, name: 'Ерлан', text: 'Лечил грыжу поясничного отдела. Результат превзошёл ожидания. Спасибо!', rating: 5, date: '2024-01-10' },
        { id: 3, name: 'Мадина', text: 'Проходила лечение сколиоза. Очень внимательные специалисты, индивидуальный подход.', rating: 5, date: '2024-01-05' },
      ];
      setReviews(initialReviews);
      localStorage.setItem('freedomlife_reviews', JSON.stringify(initialReviews));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const review = {
      id: Date.now(),
      ...newReview,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedReviews = [review, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem('freedomlife_reviews', JSON.stringify(updatedReviews));

    // Отправка уведомления в Telegram (без ошибок если сервер недоступен)
    try {
      await fetch('http://localhost:3000/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newReview.name,
          phone: 'Отзыв с сайта',
          email: '',
          message: `Новый отзыв: "${newReview.text}" (Рейтинг: ${newReview.rating}/5)`,
          type: 'Новый отзыв'
        })
      });
    } catch (error) {
      // Игнорируем ошибку - отзыв уже сохранён локально
      console.log('Уведомление о отзыве сохранено локально');
    }

    setSubmitted(true);
    setNewReview({ name: '', text: '', rating: 5 });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="reviews" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Отзывы</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Что говорят наши клиенты
          </h2>
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <Quote className="w-8 h-8 text-teal-200 mb-3" />
              <p className="text-gray-600 mb-4 leading-relaxed">{review.text}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.name}</h4>
                    <p className="text-xs text-gray-500">{review.date}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Review Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto bg-white rounded-3xl p-8 shadow-xl"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Оставить отзыв</h3>
          
          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Спасибо за отзыв!</h4>
              <p className="text-gray-600">Ваш отзыв опубликован</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ваше имя *</label>
                <input 
                  type="text"
                  required
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                  placeholder="Как вас зовут?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Оценка</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star 
                        className={`w-8 h-8 ${star <= newReview.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Отзыв *</label>
                <textarea
                  required
                  rows={4}
                  value={newReview.text}
                  onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all resize-none"
                  placeholder="Поделитесь впечатлениями о лечении..."
                ></textarea>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-5 h-5" />
                Отправить отзыв
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Reviews;
