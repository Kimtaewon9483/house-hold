"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CustomCalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
}

export function CustomCalendar({ selected, onSelect, className }: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 일요일부터 시작하는 주의 첫 번째 날 찾기
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());

  // 토요일까지의 마지막 날 찾기
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleDateClick = (date: Date) => {
    if (onSelect) {
      onSelect(date);
    }
  };

  return (
    <div className={cn("p-3", className)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousMonth}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-sm font-medium">
          {format(currentMonth, "yyyy年MM月", { locale: ja })}
        </h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextMonth}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((weekday) => (
          <div
            key={weekday}
            className="h-9 w-9 flex items-center justify-center text-xs font-normal text-muted-foreground"
          >
            {weekday}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date) => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isSelected = selected && isSameDay(date, selected);
          const isTodayDate = isToday(date);

          return (
            <Button
              key={date.toISOString()}
              variant="ghost"
              size="sm"
              onClick={() => handleDateClick(date)}
              className={cn(
                "h-9 w-9 p-0 font-normal text-center flex items-center justify-center",
                !isCurrentMonth && "text-muted-foreground opacity-50",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                isTodayDate && !isSelected && "bg-accent text-accent-foreground",
                "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {format(date, "d")}
            </Button>
          );
        })}
      </div>
    </div>
  );
}