import apiClient from './client';
import type { PrayerTracking, ShalatKey } from '../types';

interface ShowResponse {
  tracking: PrayerTracking;
  friday_prayer: unknown;
}

interface UpdateResponse {
  message: string;
  tracking: PrayerTracking;
}

const STORAGE_KEY = 'smartbook_prayer_trackings';

function getStored(): PrayerTracking[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveStored(list: PrayerTracking[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

function getCurrentUserId(): number {
  try {
    const raw = localStorage.getItem('auth_user');
    if (raw) return JSON.parse(raw).id || 0;
  } catch {}
  return 0;
}

function emptyTracking(date: string, userId: number): PrayerTracking {
  return {
    id: 0,
    user_id: userId,
    date,
    subuh_checked: false, subuh_berjamaah: false,
    dzuhur_checked: false, dzuhur_berjamaah: false,
    ashar_checked: false, ashar_berjamaah: false,
    maghrib_checked: false, maghrib_berjamaah: false,
    isya_checked: false, isya_berjamaah: false,
  };
}

let nextId = 200;

export async function getPrayerTracking(date: string): Promise<ShowResponse> {
  const userId = getCurrentUserId();
  const all = getStored();
  let tracking = all.find((p) => p.user_id === userId && p.date === date);
  if (!tracking) {
    tracking = emptyTracking(date, userId);
    all.push(tracking);
    saveStored(all);
  }
  return { tracking: { ...tracking, total_checked: 0, total_berjamaah: 0 }, friday_prayer: null };
}

export async function updatePrayer(
  date: string,
  prayer: ShalatKey,
  checked: boolean,
  berjamaah?: boolean
): Promise<UpdateResponse> {
  const userId = getCurrentUserId();
  const all = getStored();
  let idx = all.findIndex((p) => p.user_id === userId && p.date === date);
  if (idx < 0) {
    const newTracking = emptyTracking(date, userId);
    all.push(newTracking);
    idx = all.length - 1;
  }

  const checkedKey = `${prayer}_checked` as keyof PrayerTracking;
  const berjamaahKey = `${prayer}_berjamaah` as keyof PrayerTracking;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entry: any = all[idx];
  entry[checkedKey] = checked;
  if (berjamaah !== undefined) {
    entry[berjamaahKey] = berjamaah;
  }

  if (entry.id === 0) entry.id = ++nextId;

  saveStored(all);
  return { message: 'Tersimpan', tracking: { ...all[idx], total_checked: 0, total_berjamaah: 0 } };
}

export async function getPrayerSchedule(city: string, date: string): Promise<{ schedules: { name: string; time: string }[] }> {
  try {
    const { data } = await apiClient.get('/prayer-schedules', { params: { city, date } });
    return data;
  } catch {
    const schedules = [
      { name: 'subuh', time: '04:30' },
      { name: 'dzuhur', time: '12:00' },
      { name: 'ashar', time: '15:15' },
      { name: 'maghrib', time: '18:00' },
      { name: 'isya', time: '19:30' },
    ];
    return { schedules };
  }
}

export async function getPrayerHistory(from: string, to: string): Promise<{ trackings: PrayerTracking[] }> {
  const userId = getCurrentUserId();
  const all = getStored();
  const filtered = all.filter(
    (p) => p.user_id === userId && p.date >= from && p.date <= to
  );
  return { trackings: filtered };
}