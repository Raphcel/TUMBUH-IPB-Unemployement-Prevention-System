/**
 * useCalendarGrid
 *
 * Computes the week-row / day-column data structure needed to render
 * a month-view calendar grid.  Pure data — zero rendering decisions.
 *
 * @param {Date} currentMonth  — any Date within the month to display
 * @returns {{ weeks: Date[][], monthStart: Date }}
 *   weeks      — array of 7-element arrays, each element is a Date
 *   monthStart — first day of the displayed month (use for isSameMonth checks)
 */

import { useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
} from 'date-fns';

export function useCalendarGrid(currentMonth) {
  return useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd   = endOfMonth(monthStart);
    const gridStart  = startOfWeek(monthStart);
    const gridEnd    = endOfWeek(monthEnd);

    const weeks = [];
    let day = gridStart;

    while (day <= gridEnd) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      weeks.push(week);
    }

    return { weeks, monthStart };
  }, [currentMonth]);
}
