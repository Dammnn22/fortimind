
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocalization } from '../hooks/useLocalization';
import { getTranslatedConstants } from '../translations';
import { TranslationKey } from '../types';


interface CalendarViewProps {
  relapseDates: string[]; // Array of ISO date strings
  highlightColor?: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ relapseDates, highlightColor = 'bg-danger/70 dark:bg-danger-dark/70' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { t, currentLanguage } = useLocalization();
  const { monthNames, dayNames } = getTranslatedConstants(currentLanguage);


  const daysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number): number => new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday etc.

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11

  const numDays = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);

  const relapseDatesSet = new Set(relapseDates.map(dateStr => new Date(dateStr).toDateString()));

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="border dark:border-slate-700 p-2 h-20"></div>);
  }

  for (let day = 1; day <= numDays; day++) {
    const cellDate = new Date(year, month, day);
    const isRelapseDay = relapseDatesSet.has(cellDate.toDateString());
    const isToday = new Date().toDateString() === cellDate.toDateString();

    cells.push(
      <div
        key={day}
        className={`border dark:border-slate-700 p-2 h-20 flex flex-col items-start relative
                    ${isRelapseDay ? highlightColor + ' text-white dark:text-neutral-light' : 'bg-white dark:bg-slate-800'}
                    ${isToday ? 'ring-2 ring-primary dark:ring-primary-light' : ''}`}
      >
        <span className={`text-sm font-medium ${isRelapseDay ? '' : 'text-neutral-dark dark:text-neutral-light'}`}>{day}</span>
        {isRelapseDay && <span className="absolute bottom-1 right-1 text-xs">{t('relapseLabel' as TranslationKey)}</span>}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-neutral/20 dark:hover:bg-slate-700 transition-colors">
          <ChevronLeft size={24} className="text-neutral-dark dark:text-neutral-light" />
        </button>
        <h3 className="text-xl font-semibold text-neutral-dark dark:text-white">
          {monthNames[month]} {year}
        </h3>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-neutral/20 dark:hover:bg-slate-700 transition-colors">
          <ChevronRight size={24} className="text-neutral-dark dark:text-neutral-light" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-px bg-neutral/30 dark:bg-slate-700/50 border dark:border-slate-700">
        {dayNames.map(dayName => (
          <div key={dayName} className="p-2 text-center font-medium text-xs text-neutral-dark dark:text-neutral-light bg-neutral-light dark:bg-slate-700/80">
            {dayName}
          </div>
        ))}
        {cells}
      </div>
    </div>
  );
};

export default CalendarView;
