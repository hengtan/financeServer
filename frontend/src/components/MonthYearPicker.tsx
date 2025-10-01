import * as React from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface MonthYearPickerProps {
  date: Date
  onDateChange: (date: Date) => void
  className?: string
}

export function MonthYearPicker({ date, onDateChange, className }: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [viewYear, setViewYear] = React.useState(date.getFullYear())

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(viewYear, monthIndex, 1)
    onDateChange(newDate)
    setIsOpen(false)
  }

  const handlePreviousYear = () => {
    setViewYear(prev => prev - 1)
  }

  const handleNextYear = () => {
    setViewYear(prev => prev + 1)
  }

  const isCurrentMonth = (monthIndex: number) => {
    return date.getMonth() === monthIndex && date.getFullYear() === viewYear
  }

  const isToday = (monthIndex: number) => {
    const today = new Date()
    return today.getMonth() === monthIndex && today.getFullYear() === viewYear
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[220px] justify-between text-left font-medium bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm",
            !date && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="capitalize text-sm">{format(date, "MMMM 'de' yyyy", { locale: ptBR })}</span>
          </div>
          <ChevronRight className="h-3 w-3 text-gray-400 rotate-90" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl" align="start">
        <div className="p-3">
          {/* Header com Year Navigation */}
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              onClick={handlePreviousYear}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <div className="font-bold text-sm text-foreground">{viewYear}</div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              onClick={handleNextYear}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          {/* Months Grid */}
          <div className="grid grid-cols-3 gap-1">
            {months.map((month, index) => {
              const isCurrent = isCurrentMonth(index)
              const isTodayMonth = isToday(index)

              return (
                <Button
                  key={month}
                  variant="ghost"
                  className={cn(
                    "h-8 text-xs font-medium rounded-lg transition-all duration-200 p-0",
                    isCurrent
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md"
                      : isTodayMonth
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  )}
                  onClick={() => handleMonthSelect(index)}
                >
                  {month.substring(0, 3)}
                </Button>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              className="w-full justify-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-7"
              onClick={() => {
                const now = new Date()
                setViewYear(now.getFullYear())
                onDateChange(now)
                setIsOpen(false)
              }}
            >
              <CalendarIcon className="mr-1 h-3 w-3" />
              Ir para hoje
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
