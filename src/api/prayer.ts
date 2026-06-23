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

function computeTotals(tracking: PrayerTracking): PrayerTracking {
  const prayers = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'] as const;
  const total_checked = prayers.filter((p) => tracking[`${p}_checked` as keyof PrayerTracking] as boolean).length;
  const total_berjamaah = prayers.filter((p) => tracking[`${p}_berjamaah` as keyof PrayerTracking] as boolean).length;
  return { ...tracking, total_checked, total_berjamaah };
}

export async function getPrayerTracking(userId: number, date: string): Promise<ShowResponse> {
  const { data } = await apiClient.get(`/worship/${userId}`, { params: { date } });
  const tracking = data.tracking ?? null;
  if (!tracking) throw new Error('Prayer tracking not found');
  return { tracking: computeTotals(tracking), friday_prayer: null };
}

export async function updatePrayer(
  userId: number,
  date: string,
  prayer: ShalatKey,
  checked: boolean,
  berjamaah?: boolean
): Promise<UpdateResponse> {
  const { data: existingData } = await apiClient.get(`/worship/${userId}`, { params: { date } });
  const existing = existingData.tracking;

  const payload: Record<string, unknown> = {
    user_id: userId,
    date,
    subuh_checked: existing?.subuh_checked ? 1 : 0,
    subuh_berjamaah: existing?.subuh_berjamaah ? 1 : 0,
    dzuhur_checked: existing?.dzuhur_checked ? 1 : 0,
    dzuhur_berjamaah: existing?.dzuhur_berjamaah ? 1 : 0,
    ashar_checked: existing?.ashar_checked ? 1 : 0,
    ashar_berjamaah: existing?.ashar_berjamaah ? 1 : 0,
    maghrib_checked: existing?.maghrib_checked ? 1 : 0,
    maghrib_berjamaah: existing?.maghrib_berjamaah ? 1 : 0,
    isya_checked: existing?.isya_checked ? 1 : 0,
    isya_berjamaah: existing?.isya_berjamaah ? 1 : 0,
  };

  payload[`${prayer}_checked`] = checked ? 1 : 0;
  if (berjamaah !== undefined) {
    payload[`${prayer}_berjamaah`] = berjamaah ? 1 : 0;
  }

  const { data } = await apiClient.post('/worship', payload);
  return { message: data.message || 'Tersimpan', tracking: computeTotals(data.tracking) };
}

export async function getPrayerSchedule(city: string, date: string): Promise<{ schedules: { name: string; time: string }[] }> {
  const { data } = await apiClient.get('/prayer-schedule', { params: { city, date } });
  return data;
}

export async function getPrayerHistory(userId: number, from: string, to: string): Promise<{ trackings: PrayerTracking[] }> {
  const { data } = await apiClient.get(`/worship/${userId}/history`, { params: { from, to } });
  const trackings = (data.trackings || []).map(computeTotals);
  return { trackings };
}
