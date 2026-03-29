import { useState, useEffect } from 'react';
import { useAuth, useApi } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  User, Calendar, CreditCard, Clock, MapPin, Phone, Mail, 
  Edit, Trash2, Plus, Check, Bell, LogOut, Dumbbell
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout, isAdmin } = useAuth();
  const api = useApi();
  const [activeTab, setActiveTab] = useState('subscription');
  const [subscription, setSubscription] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Форма записи
  const [bookingForm, setBookingForm] = useState({
    booking_date: '',
    booking_time: '',
    machine_level: 1,
    partner_machine_level: 1
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  
  // Промокод
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subRes, bookingsRes, notifRes] = await Promise.all([
        api.get('/subscriptions'),
        api.get('/bookings'),
        api.get('/notifications')
      ]);
      
      if (subRes.ok) setSubscription(await subRes.json());
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async (date) => {
    try {
      const res = await api.get(`/bookings/slots?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(data.slots);
      }
    } catch (error) {
      console.error('Ошибка загрузки слотов:', error);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setBookingForm({ ...bookingForm, booking_date: date });
    if (date) loadSlots(date);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/bookings', bookingForm);
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || 'Ошибка записи');
        return;
      }
      
      alert('Запись создана!');
      setBookingForm({ booking_date: '', booking_time: '', machine_level: 1, partner_machine_level: 1 });
      loadData();
    } catch (error) {
      alert('Ошибка записи');
    }
  };

  const handleCancelBooking = async (id) => {
    if (!confirm('Отменить запись?')) return;
    
    try {
      const res = await api.delete(`/bookings/${id}`);
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || 'Ошибка отмены');
        return;
      }
      
      alert('Запись отменена');
      loadData();
    } catch (error) {
      alert('Ошибка отмены');
    }
  };

  const handleActivatePromo = async (e) => {
    e.preventDefault();
    setPromoMessage('');
    
    try {
      const res = await api.post('/subscriptions/activate', { code: promoCode });
      const data = await res.json();
      
      if (!res.ok) {
        setPromoMessage(data.error || 'Ошибка');
        return;
      }
      
      setPromoMessage(`Успешно! Добавлено ${data.added_sessions} занятий`);
      setPromoCode('');
      loadData();
    } catch (error) {
      setPromoMessage('Ошибка активации');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time?.substring(0, 5);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const max = new Date();
    max.setDate(max.getDate() + 30);
    return max.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold">
            Freedom<span className="text-teal-500">Life</span>
          </a>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-400" />
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </div>
            <span className="text-gray-600">{user?.email}</span>
            <button onClick={logout} className="text-gray-400 hover:text-red-500">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Табы */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'subscription', label: 'Абонемент', icon: CreditCard },
            { id: 'booking', label: 'Запись', icon: Calendar },
            { id: 'history', label: 'История', icon: Clock },
            { id: 'promo', label: 'Промокод', icon: Plus }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Абонемент */}
        {activeTab === 'subscription' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h2 className="text-xl font-bold mb-4">Ваш абонемент</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-teal-50 rounded-xl p-4">
                  <p className="text-sm text-teal-600 mb-1">Осталось занятий</p>
                  <p className="text-3xl font-bold text-teal-600">{subscription?.sessions_left || 0}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-sm text-amber-600 mb-1">Срок действия</p>
                  <p className="text-xl font-bold text-amber-600">
                    {subscription?.end_date ? formatDate(subscription.end_date) : 'Без срока'}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-blue-600 mb-1">Тип</p>
                  <p className="text-xl font-bold text-blue-600">
                    {subscription?.is_premium_pair ? 'Премиум 1+1' : (subscription?.type || 'Нет')}
                  </p>
                </div>
              </div>
            </div>

            {/* Покупка абонемента */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Купить абонемент</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Старт', sessions: 10, price: 59900, months: 1 },
                  { name: 'Базовый', sessions: 30, price: 149900, months: 3 },
                  { name: 'Оптимальный', sessions: 55, price: 239900, months: 6 },
                  { name: 'Премиум', sessions: 96, price: 400000, months: 12 }
                ].map(tariff => (
                  <button
                    key={tariff.name}
                    onClick={async () => {
                      const res = await api.post('/subscriptions/purchase', {
                        sessions: tariff.sessions,
                        type: tariff.name,
                        months: tariff.months
                      });
                      if (res.ok) {
                        alert('Абонемент приобретён!');
                        loadData();
                      }
                    }}
                    disabled={!subscription || subscription.sessions_left > 0}
                    className="border-2 border-gray-200 rounded-xl p-4 hover:border-teal-500 hover:bg-teal-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <h3 className="font-bold text-lg">{tariff.name}</h3>
                    <p className="text-teal-600 font-bold text-xl">{tariff.sessions} занятий</p>
                    <p className="text-gray-500">{tariff.price} ₸</p>
                    <p className="text-xs text-gray-400">{tariff.months} мес.</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Запись на тренировку */}
        {activeTab === 'booking' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Записаться на тренировку</h2>
              
              <form onSubmit={handleBooking} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Дата</label>
                  <input
                    type="date"
                    value={bookingForm.booking_date}
                    onChange={handleDateChange}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                    required
                  />
                </div>

                {availableSlots.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Время</label>
                    <select
                      value={bookingForm.booking_time}
                      onChange={(e) => setBookingForm({ ...bookingForm, booking_time: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                      required
                    >
                      <option value="">Выберите время</option>
                      {availableSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Уровень тренажёра</label>
                  <select
                    value={bookingForm.machine_level}
                    onChange={(e) => setBookingForm({ ...bookingForm, machine_level: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                  >
                    <option value={1}>Уровень 1 (Начинающий)</option>
                    <option value={2}>Уровень 2 (Средний)</option>
                    <option value={3}>Уровень 3 (Продвинутый)</option>
                  </select>
                </div>

                {subscription?.is_premium_pair && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Тренажёр партнёра</label>
                    <select
                      value={bookingForm.partner_machine_level}
                      onChange={(e) => setBookingForm({ ...bookingForm, partner_machine_level: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                    >
                      <option value={1}>Уровень 1</option>
                      <option value={2}>Уровень 2</option>
                      <option value={3}>Уровень 3</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!subscription?.sessions_left}
                  className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {!subscription?.sessions_left ? 'Нет доступных занятий' : 'Записаться'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* История */}
        {activeTab === 'history' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Ваши записи</h2>
              
              {bookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Нет записей</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map(booking => (
                    <div key={booking.id} className="border border-gray-200 rounded-xl p-4 flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <p className="font-semibold">{formatDate(booking.booking_date)} в {formatTime(booking.booking_time)}</p>
                        <p className="text-sm text-gray-500">
                          Тренажёр: {booking.machine_level} уровень
                          {booking.partner_machine_level && ` | Партнёр: ${booking.partner_machine_level} уровень`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          booking.status === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                          booking.status === 'completed' ? 'bg-green-100 text-green-600' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {booking.status === 'scheduled' && 'Запланировано'}
                          {booking.status === 'completed' && 'Посетил'}
                          {booking.status === 'cancelled' && 'Отменено'}
                          {booking.status === 'no_show' && 'Не пришёл'}
                          {booking.status === 'excused' && 'Уважительная причина'}
                          {booking.status === 'error' && 'Ошибка клиента'}
                        </span>
                        
                        {booking.status === 'scheduled' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Промокод */}
        {activeTab === 'promo' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Активировать промокод</h2>
              
              <form onSubmit={handleActivatePromo} className="max-w-md">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Введите код"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium"
                  >
                    Активировать
                  </button>
                </div>
                {promoMessage && (
                  <p className={`mt-2 ${promoMessage.includes('Успешно') ? 'text-green-600' : 'text-red-600'}`}>
                    {promoMessage}
                  </p>
                )}
              </form>
            </div>
          </motion.div>
        )}

        {/* Уведомления */}
        {notifications.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Уведомления</h2>
            <div className="space-y-2">
              {notifications.slice(0, 5).map(notif => (
                <div key={notif.id} className={`p-3 rounded-lg ${notif.is_read ? 'bg-gray-50' : 'bg-teal-50'}`}>
                  <p className="font-medium">{notif.title}</p>
                  <p className="text-sm text-gray-600">{notif.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
