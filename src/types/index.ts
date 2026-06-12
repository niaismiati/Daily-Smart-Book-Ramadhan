export interface User {
  id: number;
  name: string;
  email: string | null;
  role: 'siswa' | 'guru';
  nisn: string | null;
  nip: string | null;
  class: string | null;
  phone: string | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface PrayerTracking {
  id: number;
  user_id: number;
  date: string;
  subuh_checked: boolean;
  subuh_berjamaah: boolean;
  dzuhur_checked: boolean;
  dzuhur_berjamaah: boolean;
  ashar_checked: boolean;
  ashar_berjamaah: boolean;
  maghrib_checked: boolean;
  maghrib_berjamaah: boolean;
  isya_checked: boolean;
  isya_berjamaah: boolean;
  total_checked?: number;
  total_berjamaah?: number;
}

export type ShalatKey = 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya';

export interface SermonTopic {
  id: number;
  title: string;
  description: string;
  is_active: boolean;
  created_by: number;
  creator?: { id: number; name: string };
  created_at: string;
}

export interface FridayPrayer {
  id: number;
  user_id: number;
  date: string;
  khatib_name: string;
  sermon_topic_id: number | null;
  sermon_topic?: SermonTopic;
  summary: string;
  lesson: string;
  teacher_comment: string | null;
  teacher_score: number | null;
  is_graded: boolean;
  user?: User;
}

export interface DoaMaterial {
  id: number;
  title: string;
  arabic_text: string;
  latin_text: string;
  translation: string;
  audio_url: string | null;
  category: 'niat_puasa' | 'berbuka' | 'after_berbuka' | 'sahur' | 'lailatul_qadar';
  is_active: boolean;
  created_by: number;
  creator?: { id: number; name: string };
  created_at: string;
}

export interface DoaTracking {
  id: number;
  user_id: number;
  doa_material_id: number;
  memorized: boolean;
  read_at: string | null;
  doa_material?: DoaMaterial;
}

export interface TeacherDashboardStats {
  total_students: number;
  active_students: number;
  students_by_class: Record<string, number>;

  today_prayers: number;
  total_sholat: number;
  total_slots: number;
  avg_prayer_percentage: number;
  total_berjamaah: number;
  berjamaah_percentage: number;
  sholat_subuh: number;
  sholat_dzuhur: number;
  sholat_ashar: number;
  sholat_maghrib: number;
  sholat_isya: number;
  berjamaah_subuh: number;
  berjamaah_dzuhur: number;
  berjamaah_ashar: number;
  berjamaah_maghrib: number;
  berjamaah_isya: number;
  total_puasa: number;
  total_tadarus: number;

  today_friday: number;
  total_friday: number;

  doa_tracked: number;
  doa_materials: number;

  total_quizzes: number;
  total_quiz_taken: number;
  avg_quiz_score: number;
  quiz_results: any[];
  quiz_distribution: Record<string, number>;

  total_journals: number;
  students_not_filled: number;

  total_materials: number;
  total_material_readings: number;
  recent_materials: any[];

  recent_activities: any[];

  weekly_active: number[];
  class_stats: ClassStat[];
  weekly_class_progress: any[];
}

export interface ClassStat {
  class: string;
  students: number;
  total_sholat: number;
  berjamaah: number;
  avg_score: number;
  journals: number;
  friday_count: number;
  quiz_count: number;
  quiz_avg: number;
}

export interface StudentRecap {
  id: number;
  name: string;
  nisn: string;
  class: string;
  total_days: number;
  prayer_percentage: number;
  berjamaah_count: number;
  subuh: number;
  dzuhur: number;
  ashar: number;
  maghrib: number;
  isya: number;
  friday_count: number;
  journal_count: number;
  quiz_count: number;
  quiz_avg: number;
}

export interface DoaRecap {
  id: number;
  name: string;
  class: string;
  total_doa: number;
  tracked: number;
  memorized: number;
  progress_percentage: number;
}

export interface StudentDashboardData {
  today_prayer: number;
  week_percentage: number;
  streak: number;
  total_points: number;
  sholat_points: number;
  materi_points: number;
  quiz_points: number;
  jurnal_points: number;
  total_journals: number;
  total_materials_read: number;
  total_quiz_taken: number;
  avg_quiz_score: number;
  last_quiz_score: number | null;
  quiz_available: number;
  sholat_subuh: number;
  sholat_dzuhur: number;
  sholat_ashar: number;
  sholat_maghrib: number;
  sholat_isya: number;
  friday_attendance: number;
  total_doa_learned: number;
  total_doa_materials: number;
  weekly_progress: number[];
  reading_points: number;
  recent_materials: any[];
  prayer_schedule: any;
  notifications: any[];
}
