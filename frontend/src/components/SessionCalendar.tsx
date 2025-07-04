import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { apiClient } from '../services/api';
import type { CalendarData, ShishaSession } from '../types/api';
import { generateCalendarData } from '../utils/demoData';

interface SessionCalendarProps {
  currentDate?: Date;
  onDateClick?: (date: string) => void;
  isDemo?: boolean;
  demoSessions?: ShishaSession[];
}

export const SessionCalendar: React.FC<SessionCalendarProps> = ({ 
  currentDate = new Date(), 
  onDateClick,
  isDemo = false,
  demoSessions = []
}) => {
  const [calendarData, setCalendarData] = useState<CalendarData[]>([]);
  const [displayDate, setDisplayDate] = useState(currentDate);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  useEffect(() => {
    const fetchCalendarData = async () => {
    try {
      // Only show loading state on initial load
      if (isInitialLoad) {
        setLoading(true);
      }
      
      if (isDemo) {
        const data = generateCalendarData(demoSessions, year, month + 1);
        setCalendarData(data);
      } else {
        const data = await apiClient.getCalendarData(year, month + 1);
        setCalendarData(data);
      }
      
      // Mark initial load as complete
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    } finally {
      setLoading(false);
      setIsNavigating(false);
    }
  };
    fetchCalendarData();
  }, [year, month, isDemo, demoSessions.length]);

  // Save scroll position before render
  useLayoutEffect(() => {
    scrollPositionRef.current = window.scrollY;
  });

  // Restore scroll position after render
  useLayoutEffect(() => {
    window.scrollTo(0, scrollPositionRef.current);
  }, [displayDate]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getSessionCountForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = calendarData.find(d => d.date === dateStr);
    return dayData?.count || 0;
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(displayDate);
    const firstDayOfMonth = getFirstDayOfMonth(displayDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-16 sm:h-20 md:h-24 bg-gray-50"></div>
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const count = getSessionCountForDay(day);
      const isToday = 
        new Date().getFullYear() === year &&
        new Date().getMonth() === month &&
        new Date().getDate() === day;

      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      days.push(
        <div
          key={day}
          onClick={() => count > 0 && onDateClick && onDateClick(dateStr)}
          className={`h-16 sm:h-20 md:h-24 border relative ${
            isToday ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'
          } ${count > 0 ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
        >
          <div className="absolute top-0.5 left-1 sm:top-1 sm:left-2">
            <span className={`text-xs ${isToday ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
              {day}
            </span>
          </div>
          
          {count > 0 && (
            <div className="h-full flex items-center justify-center pt-3 sm:pt-4">
              <div className="text-center">
                <div className="text-lg sm:text-2xl md:text-3xl font-bold text-indigo-600">
                  {count}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600 hidden sm:block">
                  セッション
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const handlePreviousMonth = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Blur the button to prevent focus-related scrolling
    e.currentTarget.blur();
    setIsNavigating(true);
    setDisplayDate(new Date(year, month - 1));
  };

  const handleNextMonth = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Blur the button to prevent focus-related scrolling
    e.currentTarget.blur();
    setIsNavigating(true);
    setDisplayDate(new Date(year, month + 1));
  };

  const handleToday = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Blur the button to prevent focus-related scrolling
    e.currentTarget.blur();
    setIsNavigating(true);
    setDisplayDate(new Date());
  };

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  // Calculate monthly total sessions
  const monthlyTotal = calendarData.reduce((sum, day) => sum + day.count, 0);

  return (
    <div ref={calendarRef} className="bg-white shadow rounded-lg p-3 sm:p-4 md:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            {year}年 {monthNames[month]}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            月間セッション数: <span className="font-semibold text-indigo-600">{monthlyTotal}</span>
          </p>
        </div>
        <div className="flex space-x-1 sm:space-x-2">
          <button
            type="button"
            onClick={handlePreviousMonth}
            tabIndex={-1}
            className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none"
          >
            <span className="hidden sm:inline">＜ </span>前月
          </button>
          <button
            type="button"
            onClick={handleToday}
            tabIndex={-1}
            className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md transition-colors focus:outline-none"
          >
            今月
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            tabIndex={-1}
            className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none"
          >
            次月<span className="hidden sm:inline"> ＞</span>
          </button>
        </div>
      </div>

      <div className="min-h-[300px] sm:min-h-[400px] relative">
        {loading ? (
          <div className="flex items-center justify-center h-[300px] sm:h-[400px]">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        ) : (
          <>
            <div className={`transition-opacity duration-200 ${isNavigating ? 'opacity-50' : 'opacity-100'}`}>
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs sm:text-sm font-medium text-gray-700 py-1 sm:py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {renderCalendarDays()}
              </div>
            </div>
            {isNavigating && (
              <div className="absolute inset-0 bg-white bg-opacity-90"></div>
            )}
          </>
        )}
      </div>
    </div>
  );
};