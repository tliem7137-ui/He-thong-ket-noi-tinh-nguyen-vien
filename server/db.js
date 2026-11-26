import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initialCategories,
  initialLocations,
  initialOrganizations,
  initialVolunteers,
  initialActivities,
  initialRegistrations,
  initialReviews,
  initialVolunteerEvaluations,
  initialNotifications,
  initialFeedbacks,
  initialSystemSettings
} from './initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

const getDefaultState = () => ({
  categories: initialCategories,
  locations: initialLocations,
  organizations: initialOrganizations,
  volunteers: initialVolunteers,
  activities: initialActivities,
  registrations: initialRegistrations,
  reviews: initialReviews,
  volunteerEvaluations: initialVolunteerEvaluations,
  notifications: initialNotifications,
  feedbacks: initialFeedbacks,
  settings: initialSystemSettings
});

export const getDB = () => {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const defaultState = getDefaultState();
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultState, null, 2), 'utf8');
      return defaultState;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database file:', error);
    return getDefaultState();
  }
};

export const saveDB = (data) => {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing database file:', error);
    return false;
  }
};

export const resetDB = () => {
  const defaultState = getDefaultState();
  saveDB(defaultState);
  return defaultState;
};
