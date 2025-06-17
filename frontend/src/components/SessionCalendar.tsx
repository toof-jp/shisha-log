import React, { useState, useEffect } from 'react';
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

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  useEffect(() => {
    fetchCalendarData();
  }, [year, month, isDemo]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      if (isDemo) {
        const data = generateCalendarData(demoSessions, year, month + 1);
        setCalendarData(data);
      } else {
        const data = await apiClient.getCalendarData(year, month + 1);
        setCalendarData(data);
      }
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div key={`empty-${i}`} className="h-24 bg-gray-50"></div>
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
          className={`h-24 border relative ${
            isToday ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'
          } ${count > 0 ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
        >
          <div className="absolute top-1 left-2">
            <span className={`text-xs ${isToday ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
              {day}
            </span>
          </div>
          
          {count > 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">
                  {count}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {count === 1 ? 'セッション' : 'セッション'}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const handlePreviousMonth = () => {
    setDisplayDate(new Date(year, month - 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(new Date(year, month + 1));
  };

  const handleToday = () => {
    setDisplayDate(new Date());
  };

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {year}年 {monthNames[month]}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handlePreviousMonth}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            ＜ 前月
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1 text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md transition-colors"
          >
            今日
          </button>
          <button
            onClick={handleNextMonth}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            次月 ＞
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">読み込み中...</div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-700 py-2"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>
        </>
      )}
    </div>
  );
};