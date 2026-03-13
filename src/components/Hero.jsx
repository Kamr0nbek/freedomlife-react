import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Instagram } from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500 rounded-full blur-3xl"></div>
            </div>
            
            {/* Animated Grid */}
            <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
                backgroundSize: '40px 40px'
            }}></div>

            <div className="container-custom relative z-10 text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="inline-block px-4 py-2 bg-teal-500/20 text-teal-300 rounded-full text-sm font-medium mb-6 border border-teal-500/30">
                        🏥 Клиника вертебрологии в Алматы
                    </span>
                </motion.div>

                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2"
                >
                    Освободитесь от{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-amber-400">
                        боли в спине
                    </span>
                    {' '}навсегда
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className="text-base sm:text-lg md:text-xl text-slate-300 mb-4 sm:mb-6 max-w-2xl mx-auto leading-relaxed px-4"
                >
                    Лечение грыж, протрузий и хронических болей без операций. 
                    Современные тренажёры: Freespine, Качели Юлина, Велотренажер.
                </motion.p>

                {/* Treatment Types */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="flex flex-wrap justify-center gap-3 mb-8"
                >
                    {['Грыжи', 'Протрузии', 'Хронические боли'].map((item, i) => (
                        <span key={i} className="px-4 py-2 bg-white/10 text-white rounded-full text-sm border border-white/20">
                            {item}
                        </span>
                    ))}
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4"
                >
                    <motion.a
                        href="https://wa.me/77077998898?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!+%D0%AF+%D1%85%D0%BE%D1%87%D1%83+%D0%B7%D0%B0%D0%BF%D0%B8%D1%81%D0%B0%D1%82%D1%8C%D1%81%D1%8F+%D0%BD%D0%B0+%D0%BA%D0%BE%D0%BD%D1%81%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%86%D0%B8%D1%8E.+%D0%A5%D0%BE%D1%87%D1%83+%D1%83%D0%B7%D0%BD%D0%B0%D1%82%D1%8C+%D0%BF%D0%BE%D0%B4%D1%80%D0%BE%D0%B1%D0%BD%D0%B5%D0%B5."
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className="group px-4 sm:px-6 py-3 sm:py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold text-sm sm:text-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-teal-500/25 whitespace-nowrap"
                    >
                        <span className="hidden xs:inline">Записаться на консультацию</span>
                        <span className="xs:hidden">Консультация</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                    
                    <motion.a
                        href="https://wa.me/77077998898"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 sm:px-6 py-3 sm:py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm sm:text-lg flex items-center justify-center gap-2 transition-colors"
                    >
                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        WhatsApp
                    </motion.a>
                </motion.div>

                {/* Social Links */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="mt-6 flex justify-center gap-4"
                >
                    <a 
                        href="https://www.instagram.com/freedomlife.kz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors"
                    >
                        <Instagram className="w-5 h-5" />
                        <span>@freedomlife.kz</span>
                    </a>
                </motion.div>

                {/* Stats */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                    className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-3 gap-2 sm:gap-4 md:gap-8 max-w-xl mx-auto"
                >
                    {[
                        { number: '5000+', label: 'Пациентов' },
                        { number: '3+', label: 'Лет опыта' },
                        { number: '98%', label: 'Выздоровлений' }
                    ].map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-lg sm:text-2xl md:text-3xl font-bold text-white">{stat.number}</div>
                            <div className="text-xs sm:text-sm text-slate-400">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
                >
                    <div className="w-1 h-2 bg-white/50 rounded-full"></div>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default Hero;
