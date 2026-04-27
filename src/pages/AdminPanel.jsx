import { useState, useEffect } from 'react';
import { useAuth, useApi } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Users, Calendar, CreditCard, BarChart3, Plus, Check, X, 
  Clock, AlertCircle, LogOut, Bell, ChevronDown, Tag, 
  Trash2, MoreVertical, CalendarDays, Search, Download, 
  TrendingUp, TrendingDown, QrCode, Camera, CheckCircle
} from 'lucide-react';
import AdminSchedule from '../components/AdminSchedule';

// Конфигурация статусов записей
const STATUS_CONFIG = {
  scheduled: { label: 'Записан', color: 'bg-blue-100 text-blue-700', icon: CalendarDays },
  attended: { label: 'Пришёл', color: 'bg-green-100 text-green-700', icon: Check },
  no_show: { label: 'Не пришёл', color: 'bg-red-100 text-red-700', icon: X },
  excused: { label: 'Уважительная причина', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  client_error: { label: 'Ошибка клиента', color: 'bg-gray-100 text-gray-700', icon: Clock },
  cancelled: { label: 'Отменён', color: 'bg-gray-100 text-gray-500', icon: X },
};

// Типы абонементов для промокодов
const ABONEMENT_TYPES = [
  { value: 'Старт', label: 'Старт', sessions: 10, months: null, description: '10 занятий' },
  { value: 'Базовый', label: 'Базовый', sessions: 30, months: null, description: '30 занятий' },
  { value: 'Оптимальный', label: 'Оптимальный', sessions: 55, months: null, description: '55 занятий' },
  { value: 'Премиум', label: 'Премиум', sessions: 8, months: 12, description: '8 занятий/мес × 12 мес' },
  { value: 'Годовой 1+1', label: 'Годовой 1+1', sessions: 96, months: 12, description: 'Для двоих на год' },
];

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const api = useApi();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promoCodes, setPromoCodes] = useState([]);
  const [requests, setRequests] = useState([]);
  const [openActionsMenu, setOpenActionsMenu] = useState(null);
  
  // Формы
  const [promoForm, setPromoForm] = useState({ 
    code: '', 
    sessions: 10, 
    type: 'Старт',
    months: null
  });
  const [subForm, setSubForm] = useState({ user_id: '', sessions_change: 0, end_date: '' });
  const [filterDate, setFilterDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // QR Сканер
  const [qrInput, setQrInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  
  // Статистика выручки
  const [revenueStats, setRevenueStats] = useState(null);
  const [revenueFilter, setRevenueFilter] = useState('month');

  useEffect(() => {
    loadData();
  }, [filterDate]);

  useEffect(() => {
    if (activeTab === 'statistics') {
      loadRevenueStats();
    }
  }, [activeTab, revenueFilter]);

  const loadRevenueStats = async () => {
    try {
      const res = await api.get(`/admin/revenue-stats?filter=${revenueFilter}`);
      if (res.ok) {
        setRevenueStats(await res.json());
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  // Загрузка промокодов при переходе на вкладку
  useEffect(() => {
    if (activeTab === 'promo') {
      loadPromoCodes();
    }
    if (activeTab === 'requests') {
      loadRequests();
    }
  }, [activeTab]);

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

  const loadPromoCodes = async () => {
    try {
      const res = await api.get('/subscriptions/promo/all');
      if (res.ok) {
        setPromoCodes(await res.json());
      }
    } catch (error) {
      console.error('Ошибка загрузки промокодов:', error);
    }
  };

  const loadRequests = async () => {
    try {
      const res = await api.get('/subscriptions/admin/requests');
      if (res.ok) {
        setRequests(await res.json());
      }
    } catch (error) {
      console.error('Ошибка загрузки запросов:', error);
    }
  };

  const handleApproveRequest = async (id) => {
    if (!confirm('Подтвердить оплату и начислить абонемент?')) return;
    try {
      const res = await api.post(`/subscriptions/admin/requests/${id}/approve`);
      if (res.ok) {
        alert('Запрос подтвержден!');
        loadRequests();
        loadData(); // Обновить статистику
      } else {
        const data = await res.json();
        alert(data.error || 'Ошибка подтверждения');
      }
    } catch (error) {
      alert('Ошибка');
    }
  };

  const handleRejectRequest = async (id) => {
    if (!confirm('Отклонить запрос?')) return;
    try {
      const res = await api.post(`/subscriptions/admin/requests/${id}/reject`);
      if (res.ok) {
        alert('Запрос отклонен');
        loadRequests();
      } else {
        const data = await res.json();
        alert(data.error || 'Ошибка отклонения');
      }
    } catch (error) {
      alert('Ошибка');
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

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;
    
    try {
      const res = await api.delete(`/bookings/${bookingId}`);
      if (res.ok) {
        alert('Запись удалена');
        loadData();
      } else {
        alert('Ошибка удаления');
      }
    } catch (error) {
      alert('Ошибка удаления');
    }
  };

  const toggleActionsMenu = (bookingId) => {
    setOpenActionsMenu(openActionsMenu === bookingId ? null : bookingId);
  };

  // Закрыть меню при клике вне
  useEffect(() => {
    const handleClickOutside = () => setOpenActionsMenu(null);
    if (openActionsMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openActionsMenu]);

  // Обработчик изменения типа абонемента
  const handleTypeChange = (typeValue) => {
    const selectedType = ABONEMENT_TYPES.find(t => t.value === typeValue);
    if (selectedType) {
      setPromoForm({
        ...promoForm,
        type: selectedType.value,
        sessions: selectedType.sessions,
        months: selectedType.months
      });
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
      setPromoForm({ code: '', sessions: 10, type: 'Старт', months: null });
      loadPromoCodes(); // Обновить список
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

  // Экспорт в CSV
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Экранируем запятые и кавычки
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportBookings = () => {
    const exportData = bookings.map(b => ({
      ID: b.id,
      Клиент: b.user_name || '',
      Телефон: b.user_phone || '',
      Email: b.user_email || '',
      Дата: b.booking_date,
      Время: b.booking_time?.substring(0, 5),
      Тренажёр: b.machine_level,
      Статус: (STATUS_CONFIG[b.status] || STATUS_CONFIG.scheduled).label
    }));
    exportToCSV(exportData, 'bookings');
  };

  const handleExportUsers = () => {
    const exportData = users.map(u => ({
      ID: u.id,
      Имя: u.name || '',
      Email: u.email,
      Телефон: u.phone || '',
      Вес: u.weight || '',
      Тренажёр: u.machine_level || '',
      Занятий: u.sessions_left || 0,
      Срок: u.end_date || 'Без срока'
    }));
    exportToCSV(exportData, 'users');
  };

  // Сканирование QR-кода
  const handleScanQR = async (e) => {
    e.preventDefault();
    if (!qrInput.trim()) return;
    
    setScanLoading(true);
    setScanResult(null);
    
    try {
      const res = await api.post('/bookings/scan-qr', { qr_data: qrInput });
      const data = await res.json();
      
      if (res.ok) {
        setScanResult({ success: true, data });
        loadData(); // Обновить данные
      } else {
        setScanResult({ success: false, error: data.error || 'Ошибка сканирования' });
      }
    } catch (error) {
      setScanResult({ success: false, error: 'Ошибка соединения' });
    } finally {
      setScanLoading(false);
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
            {/* Расширенная статистика */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-teal-400">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.bookings_this_week || 0}</p>
                <p className="text-teal-200 text-sm">Записей за неделю</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.completed_this_month || 0}</p>
                <p className="text-teal-200 text-sm">Посещений за месяц</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.cancelled_this_month || 0}</p>
                <p className="text-teal-200 text-sm">Отменено</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.no_shows_this_month || 0}</p>
                <p className="text-teal-200 text-sm">Не пришли</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {stats.completed_this_month && stats.no_shows_this_month 
                    ? Math.round((stats.completed_this_month / (stats.completed_this_month + stats.no_shows_this_month)) * 100)
                    : 0}%
                </p>
                <p className="text-teal-200 text-sm">Посещаемость</p>
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
            { id: 'requests', label: 'Запросы', icon: Bell },
            { id: 'scanner', label: 'Сканер QR', icon: QrCode },
            { id: 'promo', label: 'Промокоды', icon: CreditCard },
            { id: 'subscription', label: 'Абонементы', icon: CreditCard },
            { id: 'statistics', label: 'Статистика', icon: BarChart3 }
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="h-[calc(100vh-280px)] min-h-[600px]"
          >
            <AdminSchedule 
              sessions={bookings}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteBooking}
              onAdd={() => setActiveTab('scanner')} // Example: redirect to scanner or open modal
            />
          </motion.div>
        )}

        {/* Пользователи */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold">Пользователи</h2>
                
                <div className="flex items-center gap-3">
                  {/* Поиск по номеру телефона */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Поиск по телефону или имени..."
                      className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none w-64"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={handleExportUsers}
                    className="flex items-center gap-2 px-4 py-2.5 bg-teal-50 text-teal-600 rounded-xl text-sm hover:bg-teal-100 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Экспорт
                  </button>
                </div>
              </div>

              {/* Фильтрованные пользователи */}
              {(() => {
                const filteredUsers = users.filter(u => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    (u.name && u.name.toLowerCase().includes(query)) ||
                    (u.phone && u.phone.toLowerCase().includes(query)) ||
                    u.email.toLowerCase().includes(query)
                  );
                });

                if (filteredUsers.length === 0) {
                  return (
                    <div className="text-center py-8">
                      {searchQuery ? (
                        <p className="text-gray-500">По запросу "{searchQuery}" ничего не найдено</p>
                      ) : (
                        <p className="text-gray-500">Нет пользователей</p>
                      )}
                    </div>
                  );
                }

                return (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Имя</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Телефон</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Вес</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Тренажёр</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Занятий</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Срок</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map(u => (
                            <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-3">{u.id}</td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium">{u.name || '-'}</p>
                                  <p className="text-xs text-gray-500">{u.email}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {u.phone ? (
                                  <a href={`tel:${u.phone}`} className="text-teal-600 hover:underline">
                                    {u.phone}
                                  </a>
                                ) : '-'}
                              </td>
                              <td className="px-4 py-3">{u.weight ? `${u.weight} кг` : '-'}</td>
                              <td className="px-4 py-3">
                                {u.machine_level ? (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    u.machine_level === 1 ? 'bg-green-100 text-green-700' :
                                    u.machine_level === 2 ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    Тренажёр {u.machine_level}
                                  </span>
                                ) : '-'}
                              </td>
                              <td className="px-4 py-3 font-medium text-teal-600">{u.sessions_left || 0}</td>
                              <td className="px-4 py-3">
                                {u.end_date ? formatDate(u.end_date) : 'Без срока'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      Показано {filteredUsers.length} из {users.length} пользователей
                    </div>
                  </>
                );
              })()}
            </div>
          </motion.div>
        )}

        {/* Запросы на абонементы */}
        {activeTab === 'requests' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Ожидающие запросы</h2>
              
              {requests.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                  <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Нет новых запросов</p>
                  <p className="text-sm text-gray-400 mt-1">Все оплаты обработаны</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Дата</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Пользователь</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Абонемент</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {requests.map(req => (
                        <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {new Date(req.created_at).toLocaleString('ru-RU')}
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-medium text-gray-900">{req.user_name}</p>
                            <p className="text-sm text-gray-500">{req.user_email}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-teal-50 text-teal-700">
                              <CreditCard className="w-4 h-4" />
                              {req.type}
                            </span>
                            <p className="text-sm text-gray-500 mt-1">{req.sessions} занятий</p>
                            {req.partner_email && (
                              <p className="text-xs text-purple-600 mt-1">Партнер: {req.partner_email}</p>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApproveRequest(req.id)}
                                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                Подтвердить
                              </button>
                              <button
                                onClick={() => handleRejectRequest(req.id)}
                                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors"
                              >
                                Отклонить
                              </button>
                            </div>
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

        {/* Сканер QR-кодов */}
        {activeTab === 'scanner' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Сканирование QR-кода</h2>
              <p className="text-gray-500 mb-6">Введите данные QR-кода для отметки посещения</p>
              
              <form onSubmit={handleScanQR} className="max-w-lg">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Данные QR-кода</label>
                  <textarea
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    placeholder='{"booking_id":1,"user_id":1,"date":"2024-01-15","time":"10:00",...}'
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm h-32"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={scanLoading || !qrInput.trim()}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {scanLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Проверка...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      Проверить QR-код
                    </>
                  )}
                </button>
              </form>

              {scanResult && (
                <div className={`mt-6 p-4 rounded-xl ${scanResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  {scanResult.success ? (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-800">Чек-ин выполнен!</p>
                        <p className="text-sm text-green-700 mt-1">
                          {scanResult.data.booking.user_name} - {scanResult.data.booking.date} в {scanResult.data.booking.time}
                        </p>
                        <p className="text-sm text-green-600">
                          Списано занятий: {scanResult.data.booking.sessions_deducted}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-800">Ошибка</p>
                        <p className="text-sm text-red-700 mt-1">{scanResult.error}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Промокоды */}
        {activeTab === 'promo' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Форма создания */}
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
                    className="px-4 py-3 border border-gray-200 rounded-xl w-40"
                    required
                  />
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Тип абонемента</label>
                  <select
                    value={promoForm.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl w-48 appearance-none bg-white cursor-pointer"
                    required
                  >
                    {ABONEMENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-9 w-5 h-5 text-gray-400 pointer-events-none" />
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

                {promoForm.months && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Срок (мес)</label>
                    <input
                      type="number"
                      value={promoForm.months}
                      onChange={(e) => setPromoForm({ ...promoForm, months: parseInt(e.target.value) })}
                      className="px-4 py-3 border border-gray-200 rounded-xl w-24"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Создать
                </button>
              </form>
            </div>

            {/* Список промокодов */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Все промокоды</h2>
              
              {promoCodes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Промокодов пока нет</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Код</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Тип</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Занятий</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Срок</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Статус</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Использован</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Дата</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promoCodes.map(promo => (
                        <tr key={promo.id} className="border-t border-gray-100">
                          <td className="px-4 py-3">
                            <span className="font-mono font-semibold text-teal-600">{promo.code}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                              {promo.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">{promo.sessions}</td>
                          <td className="px-4 py-3">{promo.months ? `${promo.months} мес` : '-'}</td>
                          <td className="px-4 py-3">
                            {promo.is_used ? (
                              <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs flex items-center gap-1 w-fit">
                                <X className="w-3 h-3" /> Использован
                              </span>
                            ) : promo.is_active ? (
                              <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs flex items-center gap-1 w-fit">
                                <Check className="w-3 h-3" /> Активен
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">Неактивен</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {promo.is_used ? (
                              <div className="text-sm">
                                <p className="font-medium">{promo.used_by_name || 'Пользователь'}</p>
                                <p className="text-gray-500 text-xs">{promo.used_by_email}</p>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {formatDate(promo.created_at)}
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

        {/* Статистика */}
        {activeTab === 'statistics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Финансовая статистика</h2>
                <div className="flex gap-2">
                  {['day', 'week', 'month'].map(f => (
                    <button
                      key={f}
                      onClick={() => setRevenueFilter(f)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        revenueFilter === f ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {f === 'day' ? 'День' : f === 'week' ? 'Неделя' : 'Месяц'}
                    </button>
                  ))}
                </div>
              </div>

              {revenueStats ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-teal-50 rounded-xl">
                      <p className="text-teal-800 text-sm font-medium mb-1">Общая выручка</p>
                      <p className="text-2xl font-bold text-teal-900">{revenueStats.totalRevenue.toLocaleString()} ₸</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-blue-800 text-sm font-medium mb-1">Количество продаж</p>
                      <p className="text-2xl font-bold text-blue-900">{revenueStats.totalSales}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <p className="text-purple-800 text-sm font-medium mb-1">Новые регистрации</p>
                      <p className="text-2xl font-bold text-purple-900">{revenueStats.newRegistrations}</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl">
                      <p className="text-amber-800 text-sm font-medium mb-1">Средний чек</p>
                      <p className="text-2xl font-bold text-amber-900">{revenueStats.averageCheck.toLocaleString()} ₸</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-4">Выручка по дням</h3>
                  <div className="h-64 flex items-end gap-2 px-4 py-6 border border-gray-100 rounded-xl bg-gray-50 overflow-x-auto">
                    {revenueStats.chartData.length > 0 ? (
                      revenueStats.chartData.map((d, i) => {
                        const maxRevenue = Math.max(...revenueStats.chartData.map(c => c.revenue));
                        const heightPercent = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0;
                        
                        return (
                          <div key={i} className="flex flex-col items-center flex-1 min-w-[40px] group relative">
                            {/* Туттип (Tooltip) */}
                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                              {d.revenue.toLocaleString()} ₸
                            </div>
                            
                            <div 
                              className="w-full bg-teal-500 rounded-t-sm hover:bg-teal-400 transition-colors"
                              style={{ height: `${Math.max(heightPercent, 2)}%` }}
                            ></div>
                            <span className="text-[10px] text-gray-500 mt-2 truncate w-full text-center">
                              {new Date(d.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Нет данных за выбранный период
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-12 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
