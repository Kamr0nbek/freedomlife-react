import { useState, useEffect, useMemo } from 'react';
import { useAuth, useApi } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Calendar, CreditCard, Clock, Bell, LogOut, Dumbbell,
  ChevronLeft, ChevronRight, Check, X, Plus, AlertCircle,
  CalendarDays, Timer, Gauge, Edit, Trash2, CheckCircle, XCircle,
  User as UserIcon, LogOut as LogoutIcon, Users, QrCode
} from 'lucide-react';

// Компонент календаря
function CalendarPicker({ selectedDate, onSelectDate, minDate, maxDate, disabledDates = [] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate || new Date()));

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatDateStr = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const isDisabled = (date) => {
    if (!date) return true;
    
    // Воскресенье недоступно (день недели = 0)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) return true;
    
    const dateStr = formatDateStr(date);
    
    // Проверка минимальной даты (завтрашний день)
    if (minDate) {
      const minDateObj = new Date(minDate);
      minDateObj.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      if (checkDate < minDateObj) return true;
    }
    
    // Проверка максимальной даты
    if (maxDate) {
      const maxDateObj = new Date(maxDate);
      maxDateObj.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      if (checkDate > maxDateObj) return true;
    }
    
    // Проверка кастомных заблокированных дат
    if (disabledDates.includes(dateStr)) return true;
    
    return false;
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return formatDateStr(date) === selectedDate;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return formatDateStr(date) === today.toISOString().split('T')[0];
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="font-semibold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button 
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <button
            key={index}
            disabled={isDisabled(date)}
            onClick={() => date && !isDisabled(date) && onSelectDate(formatDateStr(date))}
            className={`
              aspect-square flex items-center justify-center text-sm rounded-xl transition-all
              ${!date ? 'invisible' : ''}
              ${isDisabled(date) ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
              ${isSelected(date) ? 'bg-teal-500 text-white hover:bg-teal-600 font-semibold' : 'text-gray-700'}
              ${isToday(date) && !isSelected(date) ? 'ring-2 ring-teal-200' : ''}
            `}
          >
            {date?.getDate()}
          </button>
        ))}
      </div>
    </div>
  );
}

// Компонент карточки уровня
function LevelCard({ level, selected, onClick, disabled, userLevel }) {
  const levelInfo = {
    1: { name: 'Уровень 1', color: 'from-green-400 to-emerald-500', weight: '50-65 кг', max: '2 чел./час' },
    2: { name: 'Уровень 2', color: 'from-amber-400 to-orange-500', weight: '65-85 кг', max: '4 чел./час' },
    3: { name: 'Уровень 3', color: 'from-red-400 to-rose-500', weight: '85-100 кг', max: '4 чел./час' }
  };
  
  const info = levelInfo[level];
  const isLocked = userLevel && userLevel !== level;
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLocked}
      className={`
        relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300
        ${selected ? 'ring-2 ring-teal-500 ring-offset-2' : 'hover:shadow-md'}
        ${disabled || isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isLocked ? 'bg-gray-200' : `bg-gradient-to-br ${info.color}`}
      `}
    >
      <div className="relative z-10">
        <p className="text-white font-bold text-lg">{info.name}</p>
        <p className="text-white/80 text-xs mt-1">{info.weight}</p>
        <p className="text-white/60 text-xs">макс {info.max}</p>
      </div>
      <Gauge className="absolute right-3 bottom-3 w-8 h-8 text-white/30" />
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <span className="text-white text-xs font-medium">По весу</span>
        </div>
      )}
    </button>
  );
}

// Компонент времени
function TimeSlot({ time, selected, onClick, available }) {
  return (
    <button
      onClick={onClick}
      disabled={!available}
      className={`
        px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
        ${selected 
          ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' 
          : available 
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
            : 'bg-gray-50 text-gray-300 cursor-not-allowed line-through'
        }
      `}
    >
      {time}
    </button>
  );
}

// Компонент статуса
function StatusBadge({ status }) {
  const statusConfig = {
    scheduled: { label: 'Запланировано', bg: 'bg-blue-100', text: 'text-blue-600', icon: Clock },
    completed: { label: 'Посетил', bg: 'bg-green-100', text: 'text-green-600', icon: CheckCircle },
    cancelled: { label: 'Отменено', bg: 'bg-red-100', text: 'text-red-600', icon: XCircle },
    no_show: { label: 'Не пришёл', bg: 'bg-red-100', text: 'text-red-600', icon: XCircle },
    excused: { label: 'Уважительная', bg: 'bg-amber-100', text: 'text-amber-600', icon: AlertCircle },
    error: { label: 'Ошибка', bg: 'bg-gray-100', text: 'text-gray-600', icon: AlertCircle }
  };

  const config = statusConfig[status] || statusConfig.scheduled;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

// Компонент записи
function BookingCard({ booking, onEdit, onCancel, onShowQR, showActions = true }) {
  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date === today.toISOString().split('T')[0]) return 'Сегодня';
    if (date === tomorrow.toISOString().split('T')[0]) return 'Завтра';
    
    return d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const canModify = () => {
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
    const now = new Date();
    const hoursDiff = (bookingDateTime - now) / (1000 * 60 * 60);
    return hoursDiff > 3;
  };

  const canModifyFlag = canModify();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
            <CalendarDays className="w-6 h-6 text-teal-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">{formatDate(booking.booking_date)}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-gray-500 text-sm">
                <Timer className="w-4 h-4" />
                {booking.booking_time?.substring(0, 5)}
              </span>
              <span className="flex items-center gap-1 text-gray-500 text-sm">
                <Gauge className="w-4 h-4" />
                Уровень {booking.machine_level}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <StatusBadge status={booking.status} />
          
          {showActions && booking.status === 'scheduled' && (
            <div className="flex gap-2">
              {canModifyFlag ? (
                <>
                  <button 
                    onClick={() => onEdit(booking)}
                    className="p-2 text-gray-400 hover:text-teal-500 hover:bg-teal-50 rounded-xl transition-colors"
                    title="Изменить"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onCancel(booking.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Отменить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <span className="text-xs text-gray-400 px-2 py-1 bg-gray-50 rounded-lg">
                  Изменение недоступно
                </span>
              )}
              {onShowQR && (
                <button 
                  onClick={() => onShowQR(booking)}
                  className="p-2 text-gray-400 hover:text-teal-500 hover:bg-teal-50 rounded-xl transition-colors"
                  title="Показать QR-код"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Компонент уведомления
function NotificationCard({ notification }) {
  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    if (days < 7) return `${days} дн. назад`;
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div className={`p-4 rounded-xl transition-colors ${notification.is_read ? 'bg-gray-50' : 'bg-teal-50 border-l-4 border-teal-500'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-medium text-gray-800">{notification.title}</p>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(notification.created_at)}</span>
      </div>
    </div>
  );
}

// Модальное окно
function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto max-w-lg h-fit p-6 bg-white rounded-3xl shadow-xl z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Успешное сообщение
function SuccessMessage({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3"
    >
      <CheckCircle className="w-5 h-5" />
      <span className="font-medium">{message}</span>
    </motion.div>
  );
}

// Основной компонент
export default function Dashboard() {
  const { user, logout, isAdmin } = useAuth();
  const api = useApi();
  
  // Состояния
  const [subscription, setSubscription] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  
  // UI состояния
  const [activeSection, setActiveSection] = useState('booking');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Форма записи - уровень по умолчанию из профиля пользователя
  const [bookingForm, setBookingForm] = useState({
    booking_date: '',
    booking_time: '',
    machine_level: null, // будет установлен при загрузке
    partner_machine_level: 1,
    book_for_pair: false
  });

  // Установка уровня при загрузке
  useEffect(() => {
    if (user?.machine_level && !bookingForm.machine_level) {
      setBookingForm(prev => ({ ...prev, machine_level: user.machine_level }));
    }
  }, [user]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Редактирование
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({ booking_time: '', machine_level: 1 });
  
  // Промокод
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');

  // QR-код
  const [qrModalBooking, setQrModalBooking] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  // Вычисляемые значения
  const upcomingBookings = useMemo(() => {
    const now = new Date();
    return bookings
      .filter(b => new Date(`${b.booking_date}T${b.booking_time}`) >= now && b.status === 'scheduled')
      .sort((a, b) => new Date(`${a.booking_date}T${a.booking_time}`) - new Date(`${b.booking_date}T${b.booking_time}`));
  }, [bookings]);

  const pastBookings = useMemo(() => {
    const now = new Date();
    return bookings
      .filter(b => new Date(`${b.booking_date}T${b.booking_time}`) < now || b.status !== 'scheduled')
      .sort((a, b) => new Date(`${b.booking_date}T${b.booking_time}`) - new Date(`${a.booking_date}T${a.booking_time}`));
  }, [bookings]);

  const nearestBooking = useMemo(() => upcomingBookings[0] || null, [upcomingBookings]);

  // Загрузка данных
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

  // Загрузка слотов
  const loadSlots = async (date) => {
    if (!date) return;
    setLoadingSlots(true);
    try {
      const level = bookingForm.machine_level || user?.machine_level || 1;
      const res = await api.get(`/bookings/slots?date=${date}&machine_level=${level}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(data.slots);
      }
    } catch (error) {
      console.error('Ошибка загрузки слотов:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Обработчики
  const handleDateSelect = (date) => {
    setBookingForm({ ...bookingForm, booking_date: date, booking_time: '' });
    loadSlots(date);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      const res = await api.post('/bookings', bookingForm);
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || 'Ошибка записи');
        return;
      }
      
      const message = bookingForm.book_for_pair 
        ? 'Вы успешно записались на тренировку для двоих!' 
        : 'Вы успешно записались на тренировку!';
      setSuccessMessage(message);
      setBookingForm({ 
        booking_date: '', 
        booking_time: '', 
        machine_level: user?.machine_level || 1, 
        partner_machine_level: 1,
        book_for_pair: false 
      });
      setAvailableSlots([]);
      loadData();
    } catch (error) {
      alert('Ошибка записи');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleUpdateBooking = async () => {
    try {
      const res = await api.put(`/bookings/${editingBooking.id}`, editForm);
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || 'Ошибка изменения');
        return;
      }
      
      setSuccessMessage('Запись успешно изменена!');
      setEditingBooking(null);
      loadData();
    } catch (error) {
      alert('Ошибка изменения');
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
      
      setSuccessMessage('Запись отменена');
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
        // Обработка разных ошибок
        if (data.error?.includes('уже использован')) {
          setPromoMessage('Этот промокод уже был использован');
        } else if (data.error?.includes('неверный')) {
          setPromoMessage('Неверный или неактивный код');
        } else {
          setPromoMessage(data.error || 'Ошибка активации');
        }
        return;
      }
      
      // Успешная активация - разные сообщения для разных типов
      let successMsg = '';
      if (data.promo_type === 'Премиум') {
        successMsg = 'Успешно! Активирован абонемент Премиум на 1 год';
      } else if (data.promo_type === 'Годовой 1+1') {
        successMsg = 'Успешно! Активирован абонемент Годовой 1+1 для двоих';
      } else {
        successMsg = `Успешно! Добавлено ${data.added_sessions} занятий`;
      }
      
      setPromoMessage(successMsg);
      setPromoCode('');
      loadData();
    } catch (error) {
      setPromoMessage('Ошибка активации');
    }
  };

  // Вспомогательные функции
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

  const getLastSelectedLevel = () => {
    // Приоритет: сохранённый в localStorage -> уровень пользователя -> 1
    const saved = localStorage.getItem('lastMachineLevel');
    if (saved) return parseInt(saved);
    return user?.machine_level || 1;
  };

  const handleLevelSelect = (level) => {
    setBookingForm({ ...bookingForm, machine_level: level });
    localStorage.setItem('lastMachineLevel', level);
  };

  // Загрузка QR-кода для записи
  const handleShowQR = async (booking) => {
    setQrModalBooking(booking);
    setQrLoading(true);
    try {
      const res = await api.get(`/bookings/${booking.id}/qr`);
      if (res.ok) {
        const data = await res.json();
        setQrCodeData(data);
      } else {
        alert('Ошибка загрузки QR-кода');
        setQrModalBooking(null);
      }
    } catch (error) {
      alert('Ошибка загрузки QR-кода');
      setQrModalBooking(null);
    } finally {
      setQrLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Успешное сообщение */}
      <AnimatePresence>
        {successMessage && (
          <SuccessMessage message={successMessage} onClose={() => setSuccessMessage('')} />
        )}
      </AnimatePresence>

      {/* Верхняя панель */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <a href="/" className="text-xl font-bold">
              Freedom<span className="text-teal-500">Life</span>
            </a>
            
            <div className="flex items-center gap-2">
              {/* Уведомления */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.filter(n => !n.is_read).length}
                    </span>
                  )}
                </button>
                
                {/* Выпадающий список уведомлений */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-800">Уведомления</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-gray-500">Нет уведомлений</p>
                      ) : (
                        notifications.slice(0, 10).map(notif => (
                          <NotificationCard key={notif.id} notification={notif} />
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Меню пользователя */}
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 bg-teal-500 rounded-xl flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-medium text-gray-800 truncate">{user?.name || user?.email}</p>
                      <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                        <UserIcon className="w-4 h-4" />
                        Профиль
                      </button>
                      {isAdmin && (
                        <a href="/admin" className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                          <Dumbbell className="w-4 h-4" />
                          Админ-панель
                        </a>
                      )}
                      <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogoutIcon className="w-4 h-4" />
                        Выйти
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-teal-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{subscription?.sessions_left || 0}</p>
                <p className="text-xs text-gray-500">Осталось занятий</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">
                  {nearestBooking ? new Date(nearestBooking.booking_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : '—'}
                </p>
                <p className="text-xs text-gray-500">Ближайшая запись</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">
                  {nearestBooking ? nearestBooking.booking_time?.substring(0, 5) : '—'}
                </p>
                <p className="text-xs text-gray-500">Время</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Gauge className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">
                  {user?.machine_level ? `Уровень ${user.machine_level}` : '—'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.weight ? `${user.weight} кг` : 'Без веса'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Навигация */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'booking', label: 'Запись', icon: Calendar },
            { id: 'my-bookings', label: 'Мои записи', icon: Clock },
            { id: 'history', label: 'История', icon: CalendarDays },
            { id: 'subscription', label: 'Абонемент', icon: CreditCard },
            { id: 'promo', label: 'Промокод', icon: Plus }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeSection === tab.id 
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'my-bookings' && upcomingBookings.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                  {upcomingBookings.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Запись на тренировку */}
        {activeSection === 'booking' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Выбор даты */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Выберите дату</h3>
                <CalendarPicker
                  selectedDate={bookingForm.booking_date}
                  onSelectDate={handleDateSelect}
                  minDate={getMinDate()}
                  maxDate={getMaxDate()}
                />
              </div>
              
              {/* Выбор времени и уровня */}
              <div className="space-y-6">
                {/* Выбор времени */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Выберите время</h3>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                    </div>
                  ) : bookingForm.booking_date ? (
                    availableSlots.length > 0 ? (
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                        {availableSlots.map(slot => (
                          <TimeSlot
                            key={slot}
                            time={slot}
                            selected={bookingForm.booking_time === slot}
                            onClick={() => setBookingForm({ ...bookingForm, booking_time: slot })}
                            available={true}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        <p className="text-amber-700">Нет доступных слотов на эту дату</p>
                      </div>
                    )
                  ) : (
                    <div className="bg-gray-50 rounded-2xl p-8 text-center">
                      <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Сначала выберите дату</p>
                    </div>
                  )}
                </div>
                
                {/* Выбор уровня */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Уровень тренажёра</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(level => (
                      <LevelCard
                        key={level}
                        level={level}
                        selected={bookingForm.machine_level === level}
                        onClick={() => handleLevelSelect(level)}
                        userLevel={user?.machine_level}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Переключатель 1+1 */}
                {(subscription?.is_premium_pair || subscription?.sessions_left >= 2) && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Запись для двоих</p>
                          <p className="text-xs text-gray-500">Бронируется 2 места, списывается 2 занятия</p>
                        </div>
                      </div>
                      <div 
                        className={`relative w-12 h-7 rounded-full transition-colors ${
                          bookingForm.book_for_pair ? 'bg-purple-500' : 'bg-gray-300'
                        }`}
                        onClick={() => {
                          const newValue = !bookingForm.book_for_pair;
                          setBookingForm({ ...bookingForm, book_for_pair: newValue });
                        }}
                      >
                        <div 
                          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            bookingForm.book_for_pair ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </div>
                    </label>
                  </div>
                )}
                
                {/* Кнопка записи */}
                <button
                  onClick={handleBooking}
                  disabled={
                    !bookingForm.booking_date || 
                    !bookingForm.booking_time || 
                    !subscription?.sessions_left || 
                    (bookingForm.book_for_pair && subscription.sessions_left < 2) ||
                    bookingLoading
                  }
                  className={`
                    w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300
                    flex items-center justify-center gap-3
                    ${!subscription?.sessions_left 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : bookingForm.book_for_pair && subscription.sessions_left < 2
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : bookingLoading
                          ? 'bg-teal-600 text-white cursor-wait'
                          : bookingForm.booking_date && bookingForm.booking_time
                            ? bookingForm.book_for_pair 
                              ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                              : 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/30'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {bookingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Запись...
                    </>
                  ) : !subscription?.sessions_left ? (
                    'Нет доступных занятий'
                  ) : bookingForm.book_for_pair && subscription.sessions_left < 2 ? (
                    'Нужно 2 занятия для двоих'
                  ) : (
                    <>
                      <Calendar className="w-5 h-5" />
                      {bookingForm.book_for_pair ? 'Записаться вдвоём' : 'Записаться'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Мои записи */}
        {activeSection === 'my-bookings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Предстоящие тренировки</h3>
            
            {upcomingBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <CalendarDays className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">У вас пока нет записей</p>
                <button 
                  onClick={() => setActiveSection('booking')}
                  className="text-teal-500 hover:text-teal-600 font-medium"
                >
                  Записаться на тренировку →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map(booking => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onEdit={(b) => {
                      setEditingBooking(b);
                      setEditForm({ booking_time: b.booking_time, machine_level: b.machine_level });
                    }}
                    onCancel={handleCancelBooking}
                    onShowQR={handleShowQR}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* История */}
        {activeSection === 'history' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Прошедшие тренировки</h3>
            
            {pastBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <Clock className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">История пуста</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastBookings.map(booking => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Абонемент */}
        {activeSection === 'subscription' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Ваш абонемент</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4">
                  <p className="text-sm text-teal-600 mb-1">Осталось занятий</p>
                  <p className="text-3xl font-bold text-teal-600">{subscription?.sessions_left || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4">
                  <p className="text-sm text-amber-600 mb-1">Срок действия</p>
                  <p className="text-lg font-bold text-amber-600">
                    {subscription?.end_date 
                      ? new Date(subscription.end_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
                      : 'Без срока'
                    }
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                  <p className="text-sm text-blue-600 mb-1">Тип</p>
                  <p className="text-lg font-bold text-blue-600">
                    {subscription?.is_premium_pair ? 'Премиум 1+1' : (subscription?.type || 'Нет')}
                  </p>
                </div>
              </div>
            </div>

            {/* Покупка абонемента */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Купить абонемент</h3>
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
                        setSuccessMessage('Абонемент приобретён!');
                        loadData();
                      }
                    }}
                    disabled={!subscription || subscription.sessions_left > 0}
                    className="border-2 border-gray-200 rounded-2xl p-4 hover:border-teal-500 hover:bg-teal-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                  >
                    <h4 className="font-bold text-lg text-gray-800">{tariff.name}</h4>
                    <p className="text-teal-600 font-bold text-xl mt-1">{tariff.sessions} занятий</p>
                    <p className="text-gray-500 mt-1">{tariff.price} ₸</p>
                    <p className="text-xs text-gray-400 mt-1">{tariff.months} мес.</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Промокод */}
        {activeSection === 'promo' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Активировать промокод</h3>
              
              <form onSubmit={handleActivatePromo} className="max-w-md">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Введите код"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Активировать
                  </button>
                </div>
                {promoMessage && (
                  <p className={`mt-3 ${promoMessage.includes('Успешно') ? 'text-green-600' : 'text-red-600'}`}>
                    {promoMessage}
                  </p>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </div>

      {/* Модальное окно редактирования */}
      <Modal
        isOpen={!!editingBooking}
        onClose={() => setEditingBooking(null)}
        title="Изменить запись"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Время</label>
            <select
              value={editForm.booking_time}
              onChange={(e) => setEditForm({ ...editForm, booking_time: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="">Выберите время</option>
              {availableSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Уровень</label>
            <select
              value={editForm.machine_level}
              onChange={(e) => setEditForm({ ...editForm, machine_level: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value={1}>Уровень 1</option>
              <option value={2}>Уровень 2</option>
              <option value={3}>Уровень 3</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setEditingBooking(null)}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleUpdateBooking}
              className="flex-1 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
            >
              Сохранить
            </button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно QR-кода */}
      <Modal
        isOpen={!!qrModalBooking}
        onClose={() => { setQrModalBooking(null); setQrCodeData(null); }}
        title="QR-код для чекина"
      >
        <div className="text-center">
          {qrLoading ? (
            <div className="py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Загрузка...</p>
            </div>
          ) : qrCodeData ? (
            <>
              <div className="bg-white p-4 rounded-2xl inline-block border-2 border-teal-100">
                <img 
                  src={qrCodeData.qr_code} 
                  alt="QR-код" 
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <div className="mt-4 p-4 bg-teal-50 rounded-xl">
                <p className="font-semibold text-gray-800">
                  {qrCodeData.booking?.user_name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {qrCodeData.booking?.date} в {qrCodeData.booking?.time}
                </p>
                <p className="text-sm text-gray-600">
                  Уровень {qrCodeData.booking?.level}
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Покажите этот QR-код администратору для отметки о посещении
              </p>
            </>
          ) : (
            <p className="text-gray-500">Не удалось загрузить QR-код</p>
          )}
        </div>
      </Modal>

      {/* Закрытие меню при клике вне */}
      {(showUserMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </div>
  );
}
