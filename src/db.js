import Dexie from 'dexie';

export const db = new Dexie('AlgorithmTrackerDB');

db.version(1).stores({
  problems: 'id, status, nextReviewDate, slug' // Primary key and indexed props
});
