import { useState, useEffect } from 'react';
import { getChennaiDateTime } from '../lib/supabase/transitService';

export interface ChennaiTimeState {
  dayOfWeek: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  formattedDateStr: string; // YYYY-MM-DD
  currentTimeStr: string; // HH:MM:SS
  formattedTime12: string; // e.g. 9:37 PM
}

/**
 * Custom React hook for live, dynamic Chennai time (Asia/Kolkata / UTC+05:30)
 * Updates automatically every second and cleans up interval on unmount.
 */
export function useChennaiTime(): ChennaiTimeState {
  const [chennaiTime, setChennaiTime] = useState<ChennaiTimeState>(() =>
    getChennaiDateTime(new Date())
  );

  useEffect(() => {
    // Initial sync
    setChennaiTime(getChennaiDateTime(new Date()));

    // Interval to update live time every second
    const timer = setInterval(() => {
      setChennaiTime(getChennaiDateTime(new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return chennaiTime;
}
