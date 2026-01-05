
export interface User {
  email: string;
  name?: string;
}

export interface HealthEntry {
  id: string;
  timestamp: number;
  sleep: number; // hours
  water: number; // glasses/liters
  stress: number; // 1-10
  energy: number; // 1-10
  discomfort: string;
  foodQuality: string;
}

export interface HealthAnalysis {
  summary: string;
  possibleConcern: string;
  advice: string[];
  warning: string;
}

export interface MedicineInfo {
  name: string;
  usage: string;
  howToTake: string;
  sideEffects: string[];
  precautions: string[];
  safetyWarnings: string;
}

export interface SymptomAdvice {
  symptom: string;
  homeCare: string[];
  whenToSeeDoctor: string[];
  precautions: string;
}

export interface Reminder {
  id: string;
  type: 'medicine' | 'checkup';
  label: string;
  time: string; // HH:mm
  repeat: 'daily' | 'weekdays' | 'weekends' | 'once';
  active: boolean;
  lastNotified?: string; // YYYY-MM-DD
}

export enum AppTab {
  CHECKUP = 'checkup',
  SYMPTOMS = 'symptoms',
  MEDICINE = 'medicine',
  DASHBOARD = 'dashboard',
  SCHEDULES = 'schedules'
}
