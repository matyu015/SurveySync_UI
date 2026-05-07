import { ChevronLeft, ChevronRight } from 'lucide-react';

type DayState = {
  status?: 'available' | 'unavailable' | 'booked' | 'mixed' | 'scheduled';
  label?: string;
};

interface MonthCalendarProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  selectedDate?: string;
  getDayState?: (dateKey: string) => DayState | undefined;
  onSelectDate?: (dateKey: string) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildMonthDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function statusClass(status?: DayState['status']) {
  switch (status) {
    case 'available':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
    case 'unavailable':
      return 'border-destructive/30 bg-destructive/10 text-destructive';
    case 'booked':
    case 'scheduled':
      return 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300';
    case 'mixed':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300';
    default:
      return 'border-border bg-background hover:bg-accent';
  }
}

export default function MonthCalendar({ month, onMonthChange, selectedDate, getDayState, onSelectDate }: MonthCalendarProps) {
  const days = buildMonthDays(month);
  const monthLabel = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goToMonth = (offset: number) => {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + offset, 1));
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <button type="button" onClick={() => goToMonth(-1)} className="p-2 rounded-lg hover:bg-accent">
          <ChevronLeft className="size-5" />
        </button>
        <h3 className="font-semibold">{monthLabel}</h3>
        <button type="button" onClick={() => goToMonth(1)} className="p-2 rounded-lg hover:bg-accent">
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-border bg-muted/40">
        {WEEKDAYS.map(day => (
          <div key={day} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map(day => {
          const dateKey = formatDateKey(day);
          const dayState = getDayState?.(dateKey);
          const isCurrentMonth = day.getMonth() === month.getMonth();
          const isSelected = selectedDate === dateKey;

          return (
            <button
              type="button"
              key={dateKey}
              onClick={() => onSelectDate?.(dateKey)}
              className={`min-h-[86px] border-r border-b border-border p-2 text-left transition-colors ${statusClass(dayState?.status)} ${
                isCurrentMonth ? '' : 'opacity-40'
              } ${isSelected ? 'ring-2 ring-primary ring-inset' : ''}`}
            >
              <div className="flex h-full flex-col justify-between gap-2">
                <span className="text-sm font-semibold">{day.getDate()}</span>
                {dayState?.label && (
                  <span className="max-h-8 overflow-hidden text-[11px] leading-tight">
                    {dayState.label}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
