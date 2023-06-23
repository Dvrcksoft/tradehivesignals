import { Timestamp } from 'firebase/firestore';

function convertToDate(date: any): Date | null {
  if (date instanceof Date) return date;

  if (typeof date === 'string') return new Date(date);

  if (typeof date === 'number') return new Date(date);

  if (date instanceof Timestamp) return date.toDate();

  if (date instanceof Object && date.seconds && date.nanoseconds) return new Date(date.seconds * 1000 + date.nanoseconds / 1000000);

  return null;
}

export { convertToDate };
