import { useState, useEffect } from 'react';
import { useAuth, useApi } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Users, Calendar, CreditCard, BarChart3, Plus, Check, X, 
  Clock, AlertCircle, LogOut, Bell
} from 'lucide-react';

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const api = useApi();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Формы
  const [promoForm, setPromoForm] = useState({ code: '', sessions: 10, type: 'Стандартный' });
  const [subForm, setSubForm] = useState({ user_id: '', sessions_change: 0, end_date: '' });
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    loadData();
  }, [filterDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, usersRes, statsRes] = await Promise.all([
        api.get(`/bookings/all${filterDate ? `?date=${filterDate}` : ''}`),
        api.get('/auth/users'),
        api.get('/admin/stats')
      ]);
      
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, status) => {
    try {
      const res = await api.put(`/bookings/${bookingId}/status`, { status });
      if (res.ok) {
        alert('Статус обновлён');
        loadData();
      }
    } catch (error) {
      alert('Ошибка');
    }
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/subscriptions/promo/create', promoForm);
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || 'Ошибка');
        return;
      }
      
      alert('Промокод создан!');
      setPromoForm({ code: '', sessions: 10, type: 'Стандартный' });
    } catch (error) {
      alert('Ошибка');
    }
  };

  const handleUpdateSubscription = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/subscriptions/admin/update', {
        user_id: parseInt(subForm.user_id),
        sessions_change: parseInt(subForm.sessions_change),
        end_date: subForm.end_date || null
      });
      
      if (res.ok) {
        alert('Абонемент обновлён');
        setSubForm({ user_id: '', sessions_change: 0, end_date: '' });
        loadData();
      }
    } catch (error) {
      alert('Ошибка');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU');
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
      <header className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold">
              Freedom<span className="text-teal-500">Life</span>
            </span>
            <span className="bg-teal-500 text-xs px-2 py-1 rounded">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">{user?.email}</span>
            <button onClick={logout} className="text-gray-400 hover:text-white">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Статистика */}
      {stats && (
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.users}</p>
                <p className="text-teal-100">Пользователей</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.bookings_today}</p>
                <p className="text-teal-100">Записей сегодня</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.completed_today}</p>
                <p className="text-teal-100">Посетили</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.total_sessions}</p>
                <p className="text-teal-100">Всего занятий</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Табы */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'bookings', label: 'Записи', icon: Calendar },
            { id: 'users', label: 'Пользователи', icon: Users },
            { id: 'promo', label: 'Промокоды', icon: CreditCard },
            { id: 'subscription', label: 'Абонементы', icon: CreditCard }
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

        {/* Записи */}
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Все записи</h2>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl"
                />
              </div>
              
              {bookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Нет записей</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Клиент</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Дата</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Время</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Тренажёр</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Статус</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(booking => (
                        <tr key={booking.id} className="border-t border-gray-100">
                          <td className="px-4 py-3">
                            <p className="font-medium">{booking.user_name || 'Неизвестно'}</p>
                            <p className="text-sm text-gray-500">{booking.user_phone || booking.user_email}</p>
                          </td>
                          <td className="px-4 py-3">{formatDate(booking.booking_date)}</td>
                          <td className="px-4 py-3">{booking.booking_time?.substring(0, 5)}</td>
                          <td className="px-4 py-3">
                            {booking.machine_level} ур.
                            {booking.partner_machine_level && ` + ${booking.partner_machine_level} ур. (партнёр)`}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              booking.status === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                              booking.status === 'completed' ? 'bg-green-100 text-green-600' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {booking.status === 'scheduled' && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleStatusChange(booking.id, 'completed')}
                                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                  title="Пришёл"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(booking.id, 'no_show')}
                                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                  title="Не пришёл"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(booking.id, 'excused')}
                                  className="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200"
                                  title="Уважительная причина"
                                >
                                  <AlertCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(booking.id, 'error')}
                                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                                  title="Ошибка клиента"
                                >
                                  <Clock className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Пользователи */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Пользователи</h2>
              
              {users.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Нет пользователей</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Имя</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Телефон</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Занятий</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Срок</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-t border-gray-100">
                          <td className="px-4 py-3">{u.id}</td>
                          <td className="px-4 py-3">{u.name || '-'}</td>
                          <td className="px-4 py-3">{u.email}</td>
                          <td className="px-4 py-3">{u.phone || '-'}</td>
                          <td className="px-4 py-3 font-medium text-teal-600">{u.sessions_left || 0}</td>
                          <td className="px-4 py-3">
                            {u.end_date ? formatDate(u.end_date) : 'Без срока'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Промокоды */}
        {activeTab === 'promo' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h2 className="text-xl font-bold mb-4">Создать промокод</h2>
              
              <form onSubmit={handleCreatePromo} className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Код</label>
                  <input
                    type="text"
                    value={promoForm.code}
                    onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER2024"
                    className="px-4 py-3 border border-gray-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Занятий</label>
                  <input
                    type="number"
                    value={promoForm.sessions}
                    onChange={(e) => setPromoForm({ ...promoForm, sessions: parseInt(e.target.value) })}
                    className="px-4 py-3 border border-gray-200 rounded-xl w-24"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Тип</label>
                  <input
                    type="text"
                    value={promoForm.type}
                    onChange={(e) => setPromoForm({ ...promoForm, type: e.target.value })}
                    className="px-4 py-3 border border-gray-200 rounded-xl"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium"
                >
                  Создать
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Управление абонементами */}
        {activeTab === 'subscription' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Изменить абонемент</h2>
              
              <form onSubmit={handleUpdateSubscription} className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Пользователь</label>
                  <select
                    value={subForm.user_id}
                    onChange={(e) => setSubForm({ ...subForm, user_id: e.target.value })}
                    className="px-4 py-3 border border-gray-200 rounded-xl min-w-48"
                    required
                  >
                    <option value="">Выберите пользователя</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name || u.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Изменение занятий</label>
                  <input
                    type="number"
                    value={subForm.sessions_change}
                    onChange={(e) => setSubForm({ ...subForm, sessions_change: parseInt(e.target.value) })}
                    placeholder="+5 или -2"
                    className="px-4 py-3 border border-gray-200 rounded-xl w-32"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Новый срок</label>
                  <input
                    type="date"
                    value={subForm.end_date}
                    onChange={(e) => setSubForm({ ...subForm, end_date: e.target.value })}
                    className="px-4 py-3 border border-gray-200 rounded-xl"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium"
                >
                  Обновить
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
