import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Plus, MoreVertical, Clock, User, UserCog, Settings2,
  Filter, Search, CheckCircle2, AlertCircle, XCircle,
  MoreHorizontal, MapPin
} from 'lucide-react';

const MACHINE_TYPES = {
  1: 'Тренажер до 65 кг',
  2: 'Тренажер от 65 до 85 кг',
  3: 'Тренажер от 85 до 100 кг',
  4: 'Тренажер от 100 кг',
};

const STATUS_CONFIG = {
  scheduled: { 
    bg: 'bg-indigo-50', 
    text: 'text-indigo-700', 
    border: 'border-indigo-100',
    icon: Clock,
    label: 'Записан' 
  },
  attended: { 
    bg: 'bg-emerald-50', 
    text: 'text-emerald-700', 
    border: 'border-emerald-100',
    icon: CheckCircle2,
    label: 'Пришел' 
  },
  completed: { 
    bg: 'bg-slate-50', 
    text: 'text-slate-600', 
    border: 'border-slate-100',
    icon: CheckCircle2,
    label: 'Завершено' 
  },
  cancelled: { 
    bg: 'bg-rose-50', 
    text: 'text-rose-700', 
    border: 'border-rose-100',
    icon: XCircle,
    label: 'Отмена' 
  },
};

const WORKING_HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export default function AdminSchedule({ 
  sessions = [], 
  onStatusChange = () => {}, 
  onDelete = () => {},
  onAdd = () => {} 
}) {
  const [viewMode, setViewMode] = useState('day'); // 'day' | 'week'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filters, setFilters] = useState({ trainer: '', room: '', machineType: '', status: '' });
  const [editingId, setEditingId] = useState(null);

  // Helper functions
  const formatDateFull = (date) => {
    return date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const getWeekDays = (date) => {
    const curr = new Date(date);
    const first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr);
      d.setDate(first + i);
      days.push(d);
    }
    return days;
  };

  const changeDay = (offset) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + offset);
    } else {
      newDate.setDate(newDate.getDate() + (offset * 7));
    }
    setCurrentDate(newDate);
  };

  const setToday = () => {
    setCurrentDate(new Date());
    setViewMode('day');
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setCurrentDate(tomorrow);
    setViewMode('day');
  };

  // Filtered logic
  // If sessions is coming from AdminPanel, normalize fields if needed
  const normalizedBookings = useMemo(() => {
    return sessions.map(s => ({
      id: s.id,
      time: s.booking_time ? s.booking_time.substring(0, 5) : (s.time || '09:00'),
      date: s.booking_date || s.date,
      clientName: s.user_name || s.clientName || 'Неизвестно',
      machineType: s.machine_level || s.machineType || 1,
      trainer: s.trainer || 'Мухаммед', // Default if missing
      room: s.room || 'Зал 1',
      status: s.status || 'scheduled'
    }));
  }, [sessions]);

  const filteredBookings = useMemo(() => {
    const dateStr = currentDate.toISOString().split('T')[0];
    return normalizedBookings.filter(b => {
      if (viewMode === 'day' && b.date !== dateStr) return false;
      if (filters.trainer && b.trainer !== filters.trainer) return false;
      if (filters.machineType && b.machineType.toString() !== filters.machineType) return false;
      if (filters.status && b.status !== filters.status) return false;
      return true;
    });
  }, [normalizedBookings, currentDate, filters, viewMode]);

  const trainers = [...new Set(normalizedBookings.map(b => b.trainer))];

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      {/* 1. Header Area */}
      <div className="bg-white border-b border-slate-100 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-teal-500 p-2.5 rounded-2xl shadow-lg shadow-teal-200">
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">График занятий</h1>
            <p className="text-xs text-teal-600 font-medium uppercase tracking-wider">Панель управления</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button 
              onClick={() => setViewMode('day')}
              className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${viewMode === 'day' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Дни
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${viewMode === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Неделя
            </button>
          </div>
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-slate-200 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Добавить</span>
          </button>
        </div>
      </div>

      {/* 2. Toolbar & Filters */}
      <div className="p-6 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <button onClick={() => changeDay(-1)} className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-500 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 text-center">
              <span className="text-sm font-bold text-slate-800 capitalize">
                {viewMode === 'day' ? formatDateFull(currentDate) : `Неделя ${currentDate.getDate()} - ${getWeekDays(currentDate)[6].getDate()} ${currentDate.toLocaleDateString('ru-RU', {month: 'short'})}`}
              </span>
            </div>
            <button onClick={() => changeDay(1)} className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-500 transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={setToday} className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-teal-500 hover:text-teal-600 transition-all">СЕГОДНЯ</button>
            <button onClick={setTomorrow} className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-teal-500 hover:text-teal-600 transition-all">ЗАВТРА</button>
          </div>

          <div className="flex gap-2 ml-auto">
            <div className="relative group">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                value={filters.trainer} 
                onChange={e => setFilters({...filters, trainer: e.target.value})}
                className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Все тренеры</option>
                {trainers.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            
            <div className="relative group hidden sm:block">
              <Settings2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                value={filters.machineType} 
                onChange={e => setFilters({...filters, machineType: e.target.value})}
                className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Все тренажеры</option>
                {Object.entries(MACHINE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 pt-0">
        <AnimatePresence mode="wait">
          {viewMode === 'day' ? (
            <motion.div 
              key="day" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* DESKTOP TIMELINE */}
              <div className="hidden md:block">
                {WORKING_HOURS.map(hour => {
                  const hourBookings = filteredBookings.filter(b => b.time === hour);
                  return (
                    <div key={hour} className="flex group min-h-[100px]">
                      <div className="w-20 pr-6 pt-1 text-right">
                        <span className="text-sm font-black text-slate-300 group-hover:text-teal-500 transition-colors uppercase">{hour}</span>
                      </div>
                      <div className="flex-1 pb-8 border-l-2 border-slate-100 pl-8 relative">
                        <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-slate-200 group-hover:bg-teal-500 transition-colors" />
                        
                        {hourBookings.length === 0 ? (
                          <div className="h-full flex items-center text-slate-300 text-sm font-medium italic opacity-50">
                            Свободно
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {hourBookings.map(booking => (
                              <BookingCard 
                                key={booking.id} 
                                booking={booking} 
                                onStatusChange={onStatusChange}
                                onDelete={onDelete}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* MOBILE SIMPLE LIST */}
              <div className="md:hidden space-y-8">
                {WORKING_HOURS.map(hour => {
                  const hourBookings = filteredBookings.filter(b => b.time === hour);
                  if (hourBookings.length === 0) return null;
                  return (
                    <div key={hour} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-slate-800">{hour}</span>
                        <div className="h-px flex-1 bg-slate-100" />
                      </div>
                      <div className="space-y-3">
                        {hourBookings.map(booking => (
                          <BookingCard 
                            key={booking.id} 
                            booking={booking} 
                            mobile 
                            onStatusChange={onStatusChange}
                            onDelete={onDelete}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
                {filteredBookings.length === 0 && (
                  <div className="py-20 text-center">
                    <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">Нет записей на этот день</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* WEEK VIEW */
            <motion.div 
              key="week" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4"
            >
              {getWeekDays(currentDate).map((day, idx) => {
                const dateStr = day.toISOString().split('T')[0];
                const dayBookings = normalizedBookings.filter(b => b.date === dateStr);
                const isToday = day.toDateString() === new Date().toDateString();
                const isPast = day < new Date(new Date().setHours(0,0,0,0));
                
                return (
                  <div 
                    key={idx} 
                    onClick={() => { setCurrentDate(day); setViewMode('day'); }}
                    className={`group p-5 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 ${
                      isToday ? 'bg-teal-500 border-teal-500 shadow-xl shadow-teal-200 ring-4 ring-teal-50' : 
                      isPast ? 'bg-slate-50 border-slate-50 opacity-60' : 'bg-white border-slate-100 hover:border-teal-500 hover:shadow-xl hover:shadow-slate-100'
                    }`}
                  >
                    <div className="mb-6">
                      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isToday ? 'text-teal-100' : 'text-slate-400'}`}>
                        {day.toLocaleDateString('ru-RU', { weekday: 'short' })}
                      </p>
                      <h4 className={`text-3xl font-black mt-1 ${isToday ? 'text-white' : 'text-slate-800 group-hover:text-teal-600'}`}>
                        {day.getDate()}
                      </h4>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isToday ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600'}`}>
                        <User className="w-4 h-4" />
                      </div>
                      <span className={`text-sm font-bold ${isToday ? 'text-white' : 'text-slate-600'}`}>
                        {dayBookings.length}
                      </span>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BookingCard({ booking, mobile = false, onStatusChange, onDelete }) {
  const [showActions, setShowActions] = useState(false);
  const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.scheduled;
  const StatusIcon = config.icon;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      className={`relative group bg-white border border-slate-100 rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-teal-100 ${mobile ? 'p-5' : 'p-6'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${config.bg} ${config.text}`}>
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-base leading-tight">{booking.clientName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <UserCog className="w-3 h-3" /> {booking.trainer}
              </span>
              <span className="text-slate-200">•</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {booking.room}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${config.bg} ${config.text} ${config.border}`}>
            {config.label}
          </span>
          <div className="relative">
            <button 
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            
            <AnimatePresence>
              {showActions && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-slate-50 mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Статус</span>
                    </div>
                    {Object.entries(STATUS_CONFIG).map(([key, item]) => (
                      <button 
                        key={key}
                        onClick={() => { onStatusChange(booking.id, key); setShowActions(false); }}
                        className={`w-full px-4 py-2 text-left text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors ${booking.status === key ? 'text-teal-600' : 'text-slate-600'}`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                    <div className="h-px bg-slate-50 my-1" />
                    <button 
                      onClick={() => { onDelete(booking.id); setShowActions(false); }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Удалить
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="bg-slate-50/80 rounded-2xl p-4 flex items-center justify-between group-hover:bg-teal-50/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm text-teal-600 font-bold text-xs ring-1 ring-slate-100">
            {booking.machineType}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Тип тренажера</p>
            <p className="text-xs font-bold text-slate-700">{MACHINE_TYPES[booking.machineType]}</p>
          </div>
        </div>
        <Settings2 className="w-4 h-4 text-slate-300 group-hover:text-teal-400 transition-colors" />
      </div>
    </motion.div>
  );
}
