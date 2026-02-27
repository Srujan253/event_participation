import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

const LuminaDatePicker = ({ value, onChange, placeholder = "Select Date", required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Date logic
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  
  // Ref for click outside
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const currentYear = currentMonth.getFullYear();
  const currentMonthIdx = currentMonth.getMonth();
  const totalDays = daysInMonth(currentYear, currentMonthIdx);
  const startDay = firstDayOfMonth(currentYear, currentMonthIdx);
  
  // Previous month days for padding
  const prevMonthTotalDays = daysInMonth(currentYear, currentMonthIdx - 1);
  
  const days = [];
  
  // Pad beginning of month
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(currentYear, currentMonthIdx - 1, prevMonthTotalDays - i),
      isCurrentMonth: false,
    });
  }
  
  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    days.push({
      date: new Date(currentYear, currentMonthIdx, i),
      isCurrentMonth: true,
    });
  }
  
  // Pad end of month
  const remainingSlots = 42 - days.length; // 6 rows of 7 days
  for (let i = 1; i <= remainingSlots; i++) {
    days.push({
      date: new Date(currentYear, currentMonthIdx + 1, i),
      isCurrentMonth: false,
    });
  }

  const handleSelectDate = (date) => {
    // Format to YYYY-MM-DD
    const pad = (n) => n.toString().padStart(2, '0');
    const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const isSelected = (date) => {
    if (!value) return false;
    const valueDate = new Date(value);
    return date.getFullYear() === valueDate.getFullYear() &&
           date.getMonth() === valueDate.getMonth() &&
           date.getDate() === valueDate.getDate();
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  const selectToday = () => {
    handleSelectDate(new Date());
  };

  const clearSelection = () => {
    onChange('');
    setIsOpen(false);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="relative w-full" ref={popoverRef}>
      <div 
        className={`w-full h-[42px] px-4 py-2 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
          isOpen ? 'ring-2 ring-blue-500/50 border-blue-400 bg-blue-50/20' : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <div className="flex items-center gap-2">
          <CalendarIcon size={16} className={value ? "text-blue-600" : "text-gray-400"} />
          <span className={`text-sm tracking-wide font-medium ${value ? 'text-gray-900' : 'text-gray-500'}`}>
            {value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : placeholder}
          </span>
        </div>
        {value && !required && (
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); clearSelection(); }}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute top-full left-0 mt-2 z-50 p-5 rounded-2xl border border-white/40 shadow-2xl backdrop-blur-2xl bg-white/70 w-[320px]"
            style={{ 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5) inset' 
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <button 
                type="button" 
                onClick={handlePrevMonth}
                className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-white/60 transition-colors text-gray-700 hover:text-blue-600 border border-transparent hover:border-gray-200 shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="font-extrabold text-[15px] text-gray-900 tracking-tight">
                {monthNames[currentMonth.getMonth()]} <span className="text-blue-600 ml-1">{currentMonth.getFullYear()}</span>
              </div>
              
              <button 
                type="button" 
                onClick={handleNextMonth}
                className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-white/60 transition-colors text-gray-700 hover:text-blue-600 border border-transparent hover:border-gray-200 shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {days.map((dayObj, i) => {
                const selected = isSelected(dayObj.date);
                const today = isToday(dayObj.date);
                
                return (
                  <motion.div key={i} className="flex items-center justify-center p-0.5">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSelectDate(dayObj.date)}
                      className={`
                        w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold transition-colors
                        ${selected 
                          ? 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/40 drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]' 
                          : dayObj.isCurrentMonth
                            ? 'text-gray-800 hover:bg-white hover:text-blue-600 hover:shadow-sm'
                            : 'text-gray-400 opacity-60 hover:opacity-100 hover:bg-white/50'
                        }
                        ${today && !selected ? 'ring-2 ring-blue-500/30' : ''}
                      `}
                    >
                      {dayObj.date.getDate()}
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-between border-t border-gray-200/50 pt-4 mt-2">
              <button 
                type="button" 
                className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-red-500 transition-colors py-1 px-2 rounded-lg hover:bg-red-50"
                onClick={clearSelection}
              >
                Clear
              </button>
              <button 
                type="button"
                className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors py-1 px-3 rounded-lg hover:bg-white/80 shadow-sm border border-transparent hover:border-blue-100 bg-white/50 backdrop-blur-md"
                onClick={selectToday}
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LuminaDatePicker;
