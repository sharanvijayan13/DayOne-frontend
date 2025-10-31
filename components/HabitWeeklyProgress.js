import React from 'react';

const HabitWeeklyProgress = ({ habit }) => {
  // Get the last 7 days
  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    
    return days;
  };

  const last7Days = getLast7Days();

  // Check if habit was completed on a specific date
  const isCompletedOnDate = (date) => {
    return habit.completions?.some(completion => completion.date === date) || false;
  };

  return (
    <div className="habit-weekly-progress">
      <div className="progress-dots">
        {last7Days.map((date, index) => {
          const isCompleted = isCompletedOnDate(date);
          const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
          
          return (
            <div key={date} className="progress-day" title={`${dayOfWeek} - ${isCompleted ? 'Completed' : 'Not completed'}`}>
              <div className={`progress-dot ${isCompleted ? 'completed' : 'missed'}`}>
                {isCompleted ? '✓' : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HabitWeeklyProgress;