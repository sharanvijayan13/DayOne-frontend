import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

const CalendarView = ({ habits, onToggleHabit, token, BACKEND }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateHabits, setSelectedDateHabits] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get calendar data for the current month
  const getCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the first day of the week containing the first day of the month
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // End at the last day of the week containing the last day of the month
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days = [];
    const currentDay = new Date(startDate);
    
    while (currentDay <= endDate) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  // Check if a date has completed habits
  const getDateCompletionStatus = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const completedCount = habits.filter(habit => 
      habit.completions?.some(c => c.date === dateStr)
    ).length;
    const totalActiveHabits = habits.filter(habit => habit.is_active).length;
    
    return {
      completed: completedCount,
      total: totalActiveHabits,
      hasCompletions: completedCount > 0,
      isFullyCompleted: completedCount === totalActiveHabits && totalActiveHabits > 0
    };
  };

  // Navigate months
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Handle date selection
  const handleDateClick = async (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(date);
    setLoading(true);

    try {
      // Get habits for the selected date
      const habitsForDate = habits.map(habit => ({
        ...habit,
        completed_on_date: habit.completions?.some(c => c.date === dateStr) || false
      }));
      
      setSelectedDateHabits(habitsForDate);
    } catch (error) {
      console.error('Error loading habits for date:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle habit completion for a specific date
  const toggleHabitForDate = async (habitId, date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      const res = await fetch(`${BACKEND}/api/habits/${habitId}/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: dateStr }),
      });

      if (!res.ok) {
        throw new Error("Failed to toggle habit");
      }

      const result = await res.json();
      
      // Update the selected date habits
      setSelectedDateHabits(prev => prev.map(habit =>
        habit.id === habitId
          ? { ...habit, completed_on_date: result.completed }
          : habit
      ));

      // Call parent callback to update main habits data
      if (onToggleHabit) {
        onToggleHabit(habitId, dateStr);
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const calendarDays = getCalendarData();
  const today = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <h3>Calendar View</h3>
        <div className="calendar-navigation">
          <button 
            onClick={() => navigateMonth(-1)}
            className="nav-button"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="current-month">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button 
            onClick={() => navigateMonth(1)}
            className="nav-button"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        
        <div className="calendar-days">
          {calendarDays.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = date.toDateString() === today.toDateString();
            const completionStatus = getDateCompletionStatus(date);
            
            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${completionStatus.hasCompletions ? 'has-completions' : ''} ${completionStatus.isFullyCompleted ? 'fully-completed' : ''}`}
              >
                <span className="day-number">{date.getDate()}</span>
                {completionStatus.hasCompletions && (
                  <div className="completion-indicator">
                    <div className="completion-dots">
                      {completionStatus.completed > 0 && (
                        <div className="completion-dot" />
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Detail Modal */}
      {selectedDate && (
        <div className="date-modal-overlay" onClick={() => setSelectedDate(null)}>
          <div className="date-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h4>
              <button 
                onClick={() => setSelectedDate(null)}
                className="close-button"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-content">
              {loading ? (
                <div className="loading-state">
                  <p>Loading habits...</p>
                </div>
              ) : (
                <div className="date-habits-list">
                  {selectedDateHabits.filter(habit => habit.is_active).map(habit => (
                    <div key={habit.id} className={`date-habit-item ${habit.completed_on_date ? 'completed' : ''}`}>
                      <button
                        onClick={() => toggleHabitForDate(habit.id, selectedDate)}
                        className="habit-toggle"
                      >
                        <div className="habit-checkbox">
                          {habit.completed_on_date && <Check size={16} />}
                        </div>
                      </button>
                      
                      <div className="habit-info">
                        <span className="habit-name">{habit.name}</span>
                        {habit.description && (
                          <span className="habit-description">{habit.description}</span>
                        )}
                      </div>
                      
                      <div
                        className="habit-color-indicator"
                        style={{ backgroundColor: habit.color }}
                      />
                    </div>
                  ))}
                  
                  {selectedDateHabits.filter(habit => habit.is_active).length === 0 && (
                    <p className="no-habits">No active habits for this date</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;