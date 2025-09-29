import * as React from "react"
import { format } from "date-fns"
import { bs } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

/**
 * Production-safe DatePicker that handles timezone issues
 * Always returns date in YYYY-MM-DD format string
 */
export function DatePickerFixed({ 
  value,  // expects YYYY-MM-DD string
  onChange, // receives YYYY-MM-DD string
  placeholder = "Izaberite datum",
  disabled = false,
  className,
  minDate = null,
  isEditing = false,
  ...otherProps
}) {
  const [internalDate, setInternalDate] = React.useState(null)
  const [isOpen, setIsOpen] = React.useState(false)

  // Parse incoming value
  React.useEffect(() => {
    if (value) {
      // Parse YYYY-MM-DD string
      const parts = value.split('-')
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10)
        const month = parseInt(parts[1], 10) - 1
        const day = parseInt(parts[2], 10)
        
        // Create date at noon to avoid timezone issues
        const date = new Date(year, month, day, 12, 0, 0, 0)
        setInternalDate(date)
        
        console.log('📅 [DatePickerFixed] Initialized:', {
          input: value,
          parsed: date.toString(),
          components: { year, month: month + 1, day }
        })
      }
    } else if (!isEditing && typeof window !== 'undefined') {
      // Set today as default for new items
      const today = new Date()
      today.setHours(12, 0, 0, 0)
      setInternalDate(today)
      
      // Format and send to parent - check if onChange exists
      if (onChange) {
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        onChange(`${year}-${month}-${day}`)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isEditing]) // Remove onChange from dependencies

  const handleDateSelect = (selectedDate) => {
    console.log('🎯 [DatePickerFixed] handleDateSelect called with:', selectedDate)
    
    if (!selectedDate) {
      setInternalDate(null)
      if (onChange) onChange('')
      setIsOpen(false)
      return
    }

    console.log('🔍 [DatePickerFixed] Raw selection:', {
      date: selectedDate.toString(),
      hours: selectedDate.getHours(),
      day: selectedDate.getDate()
    })

    // Extract date components directly
    let targetDay = selectedDate.getDate()
    let targetMonth = selectedDate.getMonth()
    let targetYear = selectedDate.getFullYear()
    
    // Check if we need to compensate for timezone shift
    const hours = selectedDate.getHours()
    
    // PRODUCTION FIX: If hours indicate timezone shift, compensate
    if (hours === 22 || hours === 23) {
      console.log('⚠️ [PRODUCTION FIX] Detected timezone shift (hours:', hours, '), adding 1 day')
      // Add one day to compensate
      const compensated = new Date(targetYear, targetMonth, targetDay + 1, 12, 0, 0, 0)
      targetDay = compensated.getDate()
      targetMonth = compensated.getMonth()
      targetYear = compensated.getFullYear()
    } else if (hours === 0 || hours === 1 || hours === 2) {
      console.log('ℹ️ [PRODUCTION FIX] Early morning hours (', hours, '), using date as-is')
      // Early morning hours - date is likely correct
    }
    
    // Create clean date at noon
    const cleanDate = new Date(targetYear, targetMonth, targetDay, 12, 0, 0, 0)
    setInternalDate(cleanDate)
    
    // Format for output (YYYY-MM-DD)
    const formattedMonth = String(targetMonth + 1).padStart(2, '0')
    const formattedDay = String(targetDay).padStart(2, '0')
    const formatted = `${targetYear}-${formattedMonth}-${formattedDay}`
    
    console.log('✅ [DatePickerFixed] Final output:', {
      selected: selectedDate.toString(),
      corrected: cleanDate.toString(),
      formatted: formatted
    })
    
    if (onChange) {
      onChange(formatted)
    }
    
    // Close popover after selection
    setTimeout(() => {
      setIsOpen(false)
    }, 100)
  }

  // Calculate minimum date for calendar
  const calendarMinDate = React.useMemo(() => {
    if (minDate) return minDate
    if (!isEditing) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return today
    }
    return undefined
  }, [minDate, isEditing])

  console.log('🔧 [DatePickerFixed] Render state:', {
    isOpen,
    internalDate: internalDate?.toString(),
    value,
    isEditing
  })

  return (
    <div className="w-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !internalDate && "text-muted-foreground",
              className
            )}
            disabled={disabled}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('📅 [DatePickerFixed] Button clicked, toggling open state')
              setIsOpen(!isOpen)
            }}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {internalDate ? (
              <>
                {format(internalDate, "dd.MM.yyyy")}
                {" "}
                {format(internalDate, "EEEE", { locale: bs })}
              </>
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[9999]" align="start">
          <Calendar
            mode="single"
            selected={internalDate}
            onSelect={(date) => {
              console.log('📆 [DatePickerFixed] Calendar onSelect:', date)
              handleDateSelect(date)
            }}
            disabled={(date) => {
              if (calendarMinDate) {
                return date < calendarMinDate
              }
              return false
            }}
            initialFocus
            {...otherProps}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}