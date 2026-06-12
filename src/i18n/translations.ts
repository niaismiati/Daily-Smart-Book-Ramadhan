export type Language = 'id' | 'en' | 'ar';

export interface Translations {
  // Common
  appName: string;
  appSubtitle: string;
  logout: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  search: string;
  filter: string;
  download: string;
  view: string;
  add: string;
  back: string;

  // Auth
  login: string;
  email: string;
  username: string;
  password: string;
  rememberMe: string;
  forgotPassword: string;
  loginButton: string;
  student: string;
  teacher: string;
  welcomeBack: string;
  loginCredentials: string;

  // Dashboard
  dashboard: string;
  welcome: string;
  welcomeMessage: string;
  welcomeSubtitle: string;
  dayCounter: string;
  remainingDays: string;
  todayWorship: string;

  // Menu
  journalMenu: string;
  trackerMenu: string;
  prayerMenu: string;
  materialMenu: string;
  quizMenu: string;
  reportMenu: string;
  profileMenu: string;
  studentsMenu: string;
  journalMonitorMenu: string;
  trackerMonitorMenu: string;
  materialManageMenu: string;
  quizManageMenu: string;

  // Education Section
  educationTitle: string;
  educationSubtitle: string;
  obligationTitle: string;
  obligationSubtitle: string;
  verse: string;
  translation: string;
  fastingObligation: string;
  evidenceFromQuran: string;
  translationLabel: string;
  verse183: string;
  verse183Label: string;
  verse185: string;
  verse185Label: string;

  // Education Cards
  definitionTitle: string;
  definitionDesc: string;
  pillarTitle: string;
  pillarDesc: string;
  conditionTitle: string;
  conditionDesc: string;
  invalidatorTitle: string;
  invalidatorDesc: string;
  virtueTitle: string;
  virtueDesc: string;
  wisdomTitle: string;
  wisdomDesc: string;

  // Prayer Times
  prayerSchedule: string;
  prayerScheduleTitle: string;
  nextPrayer: string;
  timeRemaining: string;
  imsak: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;

  // Hadith
  hadithDaily: string;
  hadithOfTheDay: string;
  hadithText: string;
  hadithSource: string;
  todayMotivation: string;
  motivationText: string;
  motivationDaily: string;

  // Stats
  journalWritten: string;
  worshipRecorded: string;
  quizCompleted: string;
  achievements: string;
  totalStudents: string;
  journalSubmitted: string;
  averageWorship: string;
  totalQuizzes: string;

  // Journal
  journalTitle: string;
  journalSubtitle: string;
  writeNewJournal: string;
  journalTitleField: string;
  dailyActivity: string;
  reflection: string;

  // Tracker
  trackerTitle: string;
  trackerSubtitle: string;
  todayProgress: string;
  completed: string;
  remaining: string;
  worshipStreak: string;
  days: string;

  // Worship Items
  fajrPrayer: string;
  dhuhrPrayer: string;
  asrPrayer: string;
  maghribPrayer: string;
  ishaPrayer: string;
  tarawih: string;
  quranRecitation: string;
  dhikr: string;
  dailyPrayer: string;
  charity: string;

  // Quiz
  quizTitle: string;
  quizSubtitle: string;
  questions: string;
  duration: string;
  minutes: string;
  yourScore: string;
  averageScore: string;
  startQuiz: string;
  viewResults: string;

  // Profile
  profileTitle: string;
  profileSubtitle: string;
  personalInfo: string;
  fullName: string;
  class: string;
  accountSettings: string;
  changePassword: string;
  notifications: string;
  privacySecurity: string;

  // Date Format
  dateFormat: string;

  // Stats Labels
  from: string;
  of: string;
  highConsistency: string;
  average: string;
  badgesEarned: string;
  activeThisMonth: string;
  totalEntries: string;
  studentConsistency: string;
  totalCompletions: string;

  // Education - Quranic Verses (Only translations)
  verse183Translation: string;
  verse185Translation: string;
  verse183Reference: string;
  verse185Reference: string;

  // Prayer Times Extended
  todaySchedule: string;
  upcomingPrayer: string;
  prayerTips: string;
  prayerInCongregation: string;
  comeEarly: string;
  dhikrAfterPrayer: string;
  breakFastWithDates: string;

  // Hadith & Motivation
  hadithQuote: string;
  motivationQuote: string;

  // Weekly Stats
  weeklyStats: string;
  weeklyProgress: string;
  consistency: string;
  excellent: string;
  good: string;
  needsAttention: string;

  // Journal Extended
  newJournal: string;
  journalHistory: string;
  activityPlaceholder: string;
  reflectionPlaceholder: string;
  titlePlaceholder: string;

  // Tracker Extended
  checklist: string;
  achievement: string;
  unlocked: string;
  locked: string;
  consistent7Days: string;
  consistent15Days: string;
  consistent30Days: string;

  // Quiz Extended
  completedStatus: string;
  availableStatus: string;
  readMore: string;
  startNow: string;
  seeResults: string;

  // Teacher Dashboard
  studentActivity: string;
  quizDistribution: string;
  recentJournals: string;
  topPerformers: string;
  students: string;
  minutesAgo: string;
  hourAgo: string;
  hoursAgo: string;
  avgScore: string;

  // Table Headers
  nisn: string;
  studentName: string;
  email: string;
  status: string;
  actions: string;
  active: string;
  inactive: string;
  date: string;
  title: string;
  score: string;
  percentage: string;

  // Forms & Actions
  addNew: string;
  editItem: string;
  deleteItem: string;
  viewDetail: string;
  submit: string;
  close: string;
  confirm: string;
  selectAll: string;
  deselectAll: string;

  // Monitoring
  monitoringTitle: string;
  viewJournal: string;
  giveComment: string;
  viewProgress: string;
  perDay: string;
  perWeek: string;
  perMonth: string;
  perStudent: string;
  perClass: string;

  // Reports
  journalReport: string;
  worshipReport: string;
  quizReport: string;
  progressReport: string;
  exportPDF: string;
  exportExcel: string;
  printReport: string;
  selectPeriod: string;
  selectClass: string;

  // Notifications
  successSaved: string;
  successDeleted: string;
  successUpdated: string;
  errorOccurred: string;
  confirmDelete: string;
  cannotUndo: string;

  // Empty States
  noData: string;
  noJournals: string;
  noStudents: string;
  noQuizzes: string;
  noReports: string;
  startWriting: string;

  // Loading States
  loading: string;
  saving: string;
  deleting: string;
  processing: string;

  // Pagination
  previous: string;
  next: string;
  page: string;
  showing: string;
  entries: string;

  // Doa CRUD
  doaTitle: string;
  doaSubtitle: string;
  doaMenu: string;

  // Select All
  selectAll: string;
  allClasses: string;

  // Misc
  or: string;
  and: string;
  total: string;
  summary: string;
  details: string;
  description: string;
  category: string;
  type: string;
  time: string;
  location: string;
  ramadanGreeting: string;
  todayDate: string;
}

export const translations: Record<Language, Translations> = {
  id: {
    // Common
    appName: 'Daily Smart Book Ramadan',
    appSubtitle: 'Media Pembelajaran, Monitoring Ibadah, dan Jurnal Ramadan Siswa',
    logout: 'Keluar',
    save: 'Simpan',
    cancel: 'Batal',
    edit: 'Edit',
    delete: 'Hapus',
    search: 'Cari',
    filter: 'Filter',
    download: 'Unduh',
    view: 'Lihat',
    add: 'Tambah',
    back: 'Kembali',

    // Auth
    login: 'Masuk',
    username: 'Username',
    password: 'Kata Sandi',
    rememberMe: 'Ingat saya',
    forgotPassword: 'Lupa kata sandi?',
    loginButton: 'Masuk',
    student: 'Siswa',
    teacher: 'Guru',
    welcomeBack: 'Selamat Datang',
    loginCredentials: 'Kredensial Demo',

    // Dashboard
    dashboard: 'Dashboard',
    welcome: 'Selamat Datang',
    welcomeMessage: 'Selamat Datang, Ahmad!',
    welcomeSubtitle: 'Semoga puasa hari ini penuh berkah dan diterima oleh Allah SWT',
    dayCounter: 'Hari ke',
    remainingDays: 'Sisa Hari',
    todayWorship: 'Ibadah Hari Ini',

    // Menu
    journalMenu: 'Jurnal Ramadan',
    trackerMenu: 'Tracker Ibadah',
    prayerMenu: 'Jadwal Shalat',
    materialMenu: 'Materi & Kajian',
    quizMenu: 'Quiz Ramadan',
    reportMenu: 'Laporan Saya',
    profileMenu: 'Profil',
    studentsMenu: 'Kelola Siswa',
    journalMonitorMenu: 'Monitoring Jurnal',
    trackerMonitorMenu: 'Monitoring Tracker',
    materialManageMenu: 'Kelola Materi',
    quizManageMenu: 'Kelola Quiz',

    // Education Section
    educationTitle: 'Edukasi Puasa Ramadan',
    educationSubtitle: 'Pelajari kewajiban dan tata cara puasa yang benar',
    obligationTitle: 'Kewajiban Puasa Ramadan',
    obligationSubtitle: 'Dalil dari Al-Qur\'an',
    verse: 'Ayat',
    translation: 'Terjemahan',
    fastingObligation: 'Kewajiban Puasa Ramadan',
    evidenceFromQuran: 'Dalil dari Al-Qur\'an',
    translationLabel: 'Terjemahan',
    verse183: 'Surah Al-Baqarah Ayat 183',
    verse183Label: 'Dalil Kewajiban Puasa',
    verse185: 'Surah Al-Baqarah Ayat 185',
    verse185Label: 'Keutamaan Bulan Ramadan',

    // Education Cards
    definitionTitle: 'Definisi Puasa',
    definitionDesc: 'Puasa secara bahasa berarti menahan diri. Secara istilah syariat, puasa adalah menahan diri dari makan, minum, dan hal-hal yang membatalkan puasa dari terbit fajar hingga terbenam matahari dengan niat ibadah kepada Allah SWT.',
    pillarTitle: 'Rukun Puasa',
    pillarDesc: '1. Niat berpuasa di malam hari\n2. Menahan diri dari makan, minum, dan hal yang membatalkan\n3. Dari terbit fajar hingga terbenam matahari',
    conditionTitle: 'Syarat Puasa',
    conditionDesc: 'Islam, baligh, berakal sehat, mampu menjalankan puasa, tidak sedang haid atau nifas, dan mukim (tidak dalam perjalanan jauh).',
    invalidatorTitle: 'Pembatal Puasa',
    invalidatorDesc: 'Makan dan minum dengan sengaja, muntah dengan sengaja, haid dan nifas, murtad, dan keluar mani dengan sengaja.',
    virtueTitle: 'Keutamaan Ramadan',
    virtueDesc: 'Ramadan adalah bulan penuh berkah, pintu surga dibuka, pintu neraka ditutup, syaitan dibelenggu, dan terdapat malam Lailatul Qadar yang lebih baik dari seribu bulan.',
    wisdomTitle: 'Hikmah Puasa',
    wisdomDesc: 'Melatih kesabaran, mengendalikan hawa nafsu, meningkatkan ketakwaan, merasakan penderitaan orang miskin, dan meningkatkan kepedulian sosial.',

    // Prayer Times
    prayerSchedule: 'Jadwal Shalat Hari Ini',
    prayerScheduleTitle: 'Jadwal Shalat Hari Ini',
    nextPrayer: 'Shalat Berikutnya',
    timeRemaining: 'Waktu tersisa',
    imsak: 'Imsak',
    fajr: 'Subuh',
    dhuhr: 'Dzuhur',
    asr: 'Ashar',
    maghrib: 'Maghrib',
    isha: 'Isya',

    // Hadith
    hadithDaily: 'Hadis Hari Ini',
    hadithOfTheDay: 'Hadis Hari Ini',
    hadithText: '"Barangsiapa berpuasa Ramadan karena iman dan mengharap pahala dari Allah, maka dosa-dosanya yang telah lalu akan diampuni."',
    hadithSource: '— HR. Bukhari & Muslim',
    todayMotivation: 'Motivasi Hari Ini',
    motivationText: 'Setiap detik di bulan Ramadan adalah kesempatan emas untuk meraih keberkahan. Manfaatkan dengan sebaik-baiknya!',
    motivationDaily: 'Motivasi Hari Ini',

    // Stats
    journalWritten: 'Jurnal Tertulis',
    worshipRecorded: 'Ibadah Tercatat',
    quizCompleted: 'Quiz Diselesaikan',
    achievements: 'Pencapaian',
    totalStudents: 'Total Siswa',
    journalSubmitted: 'Jurnal Masuk',
    averageWorship: 'Rata-rata Ibadah',
    totalQuizzes: 'Quiz Selesai',

    // Journal
    journalTitle: 'Jurnal Harian Ramadan',
    journalSubtitle: 'Catat kegiatan dan refleksi ibadahmu setiap hari',
    writeNewJournal: 'Tulis Jurnal Baru',
    journalTitleField: 'Judul Jurnal',
    dailyActivity: 'Kegiatan Hari Ini',
    reflection: 'Refleksi & Pengalaman',

    // Tracker
    trackerTitle: 'Tracker Ibadah Harian',
    trackerSubtitle: 'Pantau dan catat ibadahmu setiap hari',
    todayProgress: 'Progress Hari Ini',
    completed: 'Selesai',
    remaining: 'Tersisa',
    worshipStreak: 'Streak Ibadah',
    days: 'Hari',

    // Worship Items
    fajrPrayer: 'Shalat Subuh',
    dhuhrPrayer: 'Shalat Dzuhur',
    asrPrayer: 'Shalat Ashar',
    maghribPrayer: 'Shalat Maghrib',
    ishaPrayer: 'Shalat Isya',
    tarawih: 'Shalat Tarawih',
    quranRecitation: 'Tadarus Al-Qur\'an',
    dhikr: 'Dzikir',
    dailyPrayer: 'Doa Harian',
    charity: 'Sedekah',

    // Quiz
    quizTitle: 'Quiz Ramadan',
    quizSubtitle: 'Uji pemahamanmu tentang Ramadan dan Islam',
    questions: 'soal',
    duration: 'Durasi',
    minutes: 'menit',
    yourScore: 'Nilai Anda',
    averageScore: 'Rata-rata Nilai',
    startQuiz: 'Mulai Quiz',
    viewResults: 'Lihat Hasil',

    // Profile
    profileTitle: 'Profil Saya',
    profileSubtitle: 'Kelola informasi akun Anda',
    personalInfo: 'Informasi Pribadi',
    fullName: 'Nama Lengkap',
    class: 'Kelas',
    accountSettings: 'Pengaturan Akun',
    changePassword: 'Ubah Password',
    notifications: 'Notifikasi',
    privacySecurity: 'Privasi & Keamanan',

    // Date Format
    dateFormat: 'id-ID',

    // Stats Labels
    from: 'dari',
    of: 'dari',
    highConsistency: 'konsistensi tinggi',
    average: 'rata-rata',
    badgesEarned: 'badges earned',
    activeThisMonth: 'aktif bulan ini',
    totalEntries: 'total entri',
    studentConsistency: 'konsistensi siswa',
    totalCompletions: 'total pengerjaan',

    // Education - Quranic Verses (Only translations)
    verse183Translation: '"Wahai orang-orang yang beriman, diwajibkan atas kamu berpuasa sebagaimana diwajibkan atas orang-orang sebelum kamu agar kamu bertakwa."',
    verse185Translation: '"Bulan Ramadan adalah (bulan) yang di dalamnya diturunkan Al-Qur\'an sebagai petunjuk bagi manusia dan penjelasan-penjelasan mengenai petunjuk itu serta pembeda antara yang benar dan yang salah. Karena itu, barang siapa di antara kamu hadir pada bulan itu, maka berpuasalah."',
    verse183Reference: 'QS. Al-Baqarah: 183',
    verse185Reference: 'QS. Al-Baqarah: 185',

    // Prayer Times Extended
    todaySchedule: 'Jadwal Hari Ini',
    upcomingPrayer: 'Shalat Berikutnya',
    prayerTips: 'Tips Ibadah Ramadan',
    prayerInCongregation: 'Usahakan shalat berjamaah di masjid atau bersama keluarga untuk mendapat pahala 27 derajat lebih besar.',
    comeEarly: 'Datang 10-15 menit sebelum waktu shalat untuk persiapan dan mendapat shaf terdepan.',
    dhikrAfterPrayer: 'Jangan lupa berdzikir dan membaca doa setelah shalat untuk kesempurnaan ibadah.',
    breakFastWithDates: 'Sunnahkan berbuka dengan kurma dan air putih sebelum melaksanakan shalat Maghrib.',

    // Hadith & Motivation
    hadithQuote: '"Barangsiapa berpuasa Ramadan karena iman dan mengharap pahala dari Allah, maka dosa-dosanya yang telah lalu akan diampuni."',
    motivationQuote: 'Setiap detik di bulan Ramadan adalah kesempatan emas untuk meraih keberkahan. Manfaatkan dengan sebaik-baiknya!',

    // Weekly Stats
    weeklyStats: 'Statistik Mingguan',
    weeklyProgress: 'Progress Mingguan',
    consistency: 'Konsistensi',
    excellent: 'Sangat Baik',
    good: 'Baik',
    needsAttention: 'Perlu Perhatian',

    // Journal Extended
    newJournal: 'Jurnal Baru',
    journalHistory: 'Riwayat Jurnal',
    activityPlaceholder: 'Ceritakan kegiatan ibadah yang kamu lakukan hari ini...',
    reflectionPlaceholder: 'Bagaimana perasaanmu? Apa yang bisa diperbaiki?',
    titlePlaceholder: 'Contoh: Hari ke-16 Ramadan',

    // Tracker Extended
    checklist: 'Checklist Ibadah',
    achievement: 'Pencapaian',
    unlocked: 'Unlocked',
    locked: 'Locked',
    consistent7Days: 'Konsisten 7 Hari',
    consistent15Days: 'Konsisten 15 Hari',
    consistent30Days: 'Konsisten 30 Hari',

    // Quiz Extended
    completedStatus: 'Selesai',
    availableStatus: 'Tersedia',
    readMore: 'Baca Selengkapnya',
    startNow: 'Mulai Sekarang',
    seeResults: 'Lihat Hasil',

    // Teacher Dashboard
    studentActivity: 'Aktivitas Siswa',
    quizDistribution: 'Distribusi Nilai Quiz',
    recentJournals: 'Jurnal Terbaru',
    topPerformers: 'Top Performers',
    students: 'siswa',
    minutesAgo: 'menit lalu',
    hourAgo: 'jam lalu',
    hoursAgo: 'jam lalu',
    avgScore: 'Avg Score',

    // Table Headers
    nisn: 'NISN',
    studentName: 'Nama Siswa',
    email: 'Email',
    status: 'Status',
    actions: 'Aksi',
    active: 'Aktif',
    inactive: 'Nonaktif',
    date: 'Tanggal',
    title: 'Judul',
    score: 'Nilai',
    percentage: 'Persentase',

    // Forms & Actions
    addNew: 'Tambah Baru',
    editItem: 'Edit',
    deleteItem: 'Hapus',
    viewDetail: 'Lihat Detail',
    submit: 'Kirim',
    close: 'Tutup',
    confirm: 'Konfirmasi',
    selectAll: 'Pilih Semua',
    deselectAll: 'Batalkan Semua',

    // Monitoring
    monitoringTitle: 'Monitoring',
    viewJournal: 'Lihat Detail',
    giveComment: 'Beri Komentar',
    viewProgress: 'Lihat Progress',
    perDay: 'per Hari',
    perWeek: 'per Minggu',
    perMonth: 'per Bulan',
    perStudent: 'per Siswa',
    perClass: 'per Kelas',

    // Reports
    journalReport: 'Rekap Jurnal',
    worshipReport: 'Rekap Ibadah',
    quizReport: 'Rekap Quiz',
    progressReport: 'Laporan Perkembangan',
    exportPDF: 'Export PDF',
    exportExcel: 'Export Excel',
    printReport: 'Cetak Laporan',
    selectPeriod: 'Pilih Periode',
    selectClass: 'Pilih Kelas',

    // Notifications
    successSaved: 'Data berhasil disimpan',
    successDeleted: 'Data berhasil dihapus',
    successUpdated: 'Data berhasil diupdate',
    errorOccurred: 'Terjadi kesalahan',
    confirmDelete: 'Apakah Anda yakin ingin menghapus?',
    cannotUndo: 'Tindakan ini tidak dapat dibatalkan',

    // Empty States
    noData: 'Tidak ada data',
    noJournals: 'Belum ada jurnal',
    noStudents: 'Belum ada siswa',
    noQuizzes: 'Belum ada quiz',
    noReports: 'Belum ada laporan',
    startWriting: 'Mulai Menulis',

    // Loading States
    loading: 'Memuat...',
    saving: 'Menyimpan...',
    deleting: 'Menghapus...',
    processing: 'Memproses...',

    // Pagination
    previous: 'Sebelumnya',
    next: 'Selanjutnya',
    page: 'Halaman',
    showing: 'Menampilkan',
    entries: 'entri',

    // Doa CRUD
    doaTitle: 'Materi Doa-Doa Puasa',
    doaSubtitle: 'Kelola doa-doa harian Ramadhan',
    doaMenu: 'Doa Puasa',
    allClasses: 'Semua Kelas',

    // Misc
    or: 'atau',
    and: 'dan',
    total: 'Total',
    summary: 'Ringkasan',
    details: 'Detail',
    description: 'Deskripsi',
    category: 'Kategori',
    type: 'Tipe',
    time: 'Waktu',
    location: 'Lokasi',
    ramadanGreeting: 'Selamat menunaikan ibadah puasa Ramadan',
    todayDate: 'Hari ini',
  },

  en: {
    // Common
    appName: 'Daily Smart Book Ramadan',
    appSubtitle: 'Learning Media, Worship Monitoring, and Student Ramadan Journal',
    logout: 'Logout',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search',
    filter: 'Filter',
    download: 'Download',
    view: 'View',
    add: 'Add',
    back: 'Back',

    // Auth
    login: 'Login',
    username: 'Username',
    password: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    loginButton: 'Sign In',
    student: 'Student',
    teacher: 'Teacher',
    welcomeBack: 'Welcome Back',
    loginCredentials: 'Demo Credentials',

    // Dashboard
    dashboard: 'Dashboard',
    welcome: 'Welcome',
    welcomeMessage: 'Welcome, Ahmad!',
    welcomeSubtitle: 'May your fasting today be full of blessings and accepted by Allah SWT',
    dayCounter: 'Day',
    remainingDays: 'Remaining',
    todayWorship: 'Today\'s Worship',

    // Menu
    journalMenu: 'Ramadan Journal',
    trackerMenu: 'Worship Tracker',
    prayerMenu: 'Prayer Schedule',
    materialMenu: 'Materials & Study',
    quizMenu: 'Ramadan Quiz',
    reportMenu: 'My Reports',
    profileMenu: 'Profile',
    studentsMenu: 'Manage Students',
    journalMonitorMenu: 'Journal Monitoring',
    trackerMonitorMenu: 'Tracker Monitoring',
    materialManageMenu: 'Manage Materials',
    quizManageMenu: 'Manage Quizzes',

    // Education Section
    educationTitle: 'Ramadan Fasting Education',
    educationSubtitle: 'Learn the obligations and proper fasting procedures',
    obligationTitle: 'Obligation of Ramadan Fasting',
    obligationSubtitle: 'Evidence from the Qur\'an',
    verse: 'Verse',
    translation: 'Translation',
    fastingObligation: 'Obligation of Ramadan Fasting',
    evidenceFromQuran: 'Evidence from the Qur\'an',
    translationLabel: 'Translation',
    verse183: 'Surah Al-Baqarah Verse 183',
    verse183Label: 'Evidence of Fasting Obligation',
    verse185: 'Surah Al-Baqarah Verse 185',
    verse185Label: 'Virtues of Ramadan',

    // Education Cards
    definitionTitle: 'Definition of Fasting',
    definitionDesc: 'Fasting linguistically means abstaining. In Islamic terms, fasting is abstaining from food, drink, and things that invalidate fasting from dawn until sunset with the intention of worship to Allah SWT.',
    pillarTitle: 'Pillars of Fasting',
    pillarDesc: '1. Intention to fast at night\n2. Abstaining from food, drink, and invalidators\n3. From dawn until sunset',
    conditionTitle: 'Conditions of Fasting',
    conditionDesc: 'Muslim, puberty, sound mind, able to fast, not menstruating or in postpartum, and resident (not on a long journey).',
    invalidatorTitle: 'Invalidators of Fasting',
    invalidatorDesc: 'Eating and drinking intentionally, intentional vomiting, menstruation and postpartum, apostasy, and intentional ejaculation.',
    virtueTitle: 'Virtues of Ramadan',
    virtueDesc: 'Ramadan is a month full of blessings, the gates of paradise are opened, the gates of hell are closed, devils are chained, and there is Lailatul Qadar which is better than a thousand months.',
    wisdomTitle: 'Wisdom of Fasting',
    wisdomDesc: 'Training patience, controlling desires, increasing piety, experiencing the suffering of the poor, and increasing social awareness.',

    // Prayer Times
    prayerSchedule: 'Today\'s Prayer Schedule',
    prayerScheduleTitle: 'Today\'s Prayer Schedule',
    nextPrayer: 'Next Prayer',
    timeRemaining: 'Time remaining',
    imsak: 'Imsak',
    fajr: 'Fajr',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',

    // Hadith
    hadithDaily: 'Daily Hadith',
    hadithOfTheDay: 'Hadith of the Day',
    hadithText: '"Whoever fasts Ramadan with faith and seeking reward from Allah, his past sins will be forgiven."',
    hadithSource: '— Narrated by Bukhari & Muslim',
    todayMotivation: 'Today\'s Motivation',
    motivationText: 'Every second in the month of Ramadan is a golden opportunity to gain blessings. Make the best use of it!',
    motivationDaily: 'Daily Motivation',

    // Stats
    journalWritten: 'Journals Written',
    worshipRecorded: 'Worship Recorded',
    quizCompleted: 'Quizzes Completed',
    achievements: 'Achievements',
    totalStudents: 'Total Students',
    journalSubmitted: 'Journals Submitted',
    averageWorship: 'Average Worship',
    totalQuizzes: 'Quizzes Completed',

    // Journal
    journalTitle: 'Daily Ramadan Journal',
    journalSubtitle: 'Record your daily worship activities and reflections',
    writeNewJournal: 'Write New Journal',
    journalTitleField: 'Journal Title',
    dailyActivity: 'Today\'s Activity',
    reflection: 'Reflection & Experience',

    // Tracker
    trackerTitle: 'Daily Worship Tracker',
    trackerSubtitle: 'Monitor and record your daily worship',
    todayProgress: 'Today\'s Progress',
    completed: 'Completed',
    remaining: 'Remaining',
    worshipStreak: 'Worship Streak',
    days: 'Days',

    // Worship Items
    fajrPrayer: 'Fajr Prayer',
    dhuhrPrayer: 'Dhuhr Prayer',
    asrPrayer: 'Asr Prayer',
    maghribPrayer: 'Maghrib Prayer',
    ishaPrayer: 'Isha Prayer',
    tarawih: 'Tarawih Prayer',
    quranRecitation: 'Qur\'an Recitation',
    dhikr: 'Dhikr',
    dailyPrayer: 'Daily Prayer',
    charity: 'Charity',

    // Quiz
    quizTitle: 'Ramadan Quiz',
    quizSubtitle: 'Test your understanding of Ramadan and Islam',
    questions: 'questions',
    duration: 'Duration',
    minutes: 'minutes',
    yourScore: 'Your Score',
    averageScore: 'Average Score',
    startQuiz: 'Start Quiz',
    viewResults: 'View Results',

    // Profile
    profileTitle: 'My Profile',
    profileSubtitle: 'Manage your account information',
    personalInfo: 'Personal Information',
    fullName: 'Full Name',
    class: 'Class',
    accountSettings: 'Account Settings',
    changePassword: 'Change Password',
    notifications: 'Notifications',
    privacySecurity: 'Privacy & Security',

    // Date Format
    dateFormat: 'en-US',

    // Stats Labels
    from: 'from',
    of: 'of',
    highConsistency: 'high consistency',
    average: 'average',
    badgesEarned: 'badges earned',
    activeThisMonth: 'active this month',
    totalEntries: 'total entries',
    studentConsistency: 'student consistency',
    totalCompletions: 'total completions',

    // Education - Quranic Verses (Only translations)
    verse183Translation: '"O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may become righteous."',
    verse185Translation: '"The month of Ramadan in which was revealed the Quran, a guidance for the people and clear proofs of guidance and criterion. So whoever among you witnesses the month, let him fast it."',
    verse183Reference: 'QS. Al-Baqarah: 183',
    verse185Reference: 'QS. Al-Baqarah: 185',

    // Prayer Times Extended
    todaySchedule: 'Today\'s Schedule',
    upcomingPrayer: 'Upcoming Prayer',
    prayerTips: 'Ramadan Worship Tips',
    prayerInCongregation: 'Try to pray in congregation at the mosque or with family to get 27 times more reward.',
    comeEarly: 'Come 10-15 minutes before prayer time for preparation and to get the front row.',
    dhikrAfterPrayer: 'Don\'t forget to do dhikr and read dua after prayer for the perfection of worship.',
    breakFastWithDates: 'It is sunnah to break fast with dates and water before performing Maghrib prayer.',

    // Hadith & Motivation
    hadithQuote: '"Whoever fasts Ramadan out of faith and seeking reward, his previous sins will be forgiven."',
    motivationQuote: 'Every second in the month of Ramadan is a golden opportunity to gain blessings. Make the best use of it!',

    // Weekly Stats
    weeklyStats: 'Weekly Statistics',
    weeklyProgress: 'Weekly Progress',
    consistency: 'Consistency',
    excellent: 'Excellent',
    good: 'Good',
    needsAttention: 'Needs Attention',

    // Journal Extended
    newJournal: 'New Journal',
    journalHistory: 'Journal History',
    activityPlaceholder: 'Tell about the worship activities you did today...',
    reflectionPlaceholder: 'How do you feel? What can be improved?',
    titlePlaceholder: 'Example: Day 16 of Ramadan',

    // Tracker Extended
    checklist: 'Worship Checklist',
    achievement: 'Achievement',
    unlocked: 'Unlocked',
    locked: 'Locked',
    consistent7Days: '7 Days Streak',
    consistent15Days: '15 Days Streak',
    consistent30Days: '30 Days Streak',

    // Quiz Extended
    completedStatus: 'Completed',
    availableStatus: 'Available',
    readMore: 'Read More',
    startNow: 'Start Now',
    seeResults: 'See Results',

    // Teacher Dashboard
    studentActivity: 'Student Activity',
    quizDistribution: 'Quiz Score Distribution',
    recentJournals: 'Recent Journals',
    topPerformers: 'Top Performers',
    students: 'students',
    minutesAgo: 'minutes ago',
    hourAgo: 'hour ago',
    hoursAgo: 'hours ago',
    avgScore: 'Avg Score',

    // Table Headers
    nisn: 'Student ID',
    studentName: 'Student Name',
    email: 'Email',
    status: 'Status',
    actions: 'Actions',
    active: 'Active',
    inactive: 'Inactive',
    date: 'Date',
    title: 'Title',
    score: 'Score',
    percentage: 'Percentage',

    // Forms & Actions
    addNew: 'Add New',
    editItem: 'Edit',
    deleteItem: 'Delete',
    viewDetail: 'View Details',
    submit: 'Submit',
    close: 'Close',
    confirm: 'Confirm',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',

    // Monitoring
    monitoringTitle: 'Monitoring',
    viewJournal: 'View Details',
    giveComment: 'Give Comment',
    viewProgress: 'View Progress',
    perDay: 'per Day',
    perWeek: 'per Week',
    perMonth: 'per Month',
    perStudent: 'per Student',
    perClass: 'per Class',

    // Reports
    journalReport: 'Journal Report',
    worshipReport: 'Worship Report',
    quizReport: 'Quiz Report',
    progressReport: 'Progress Report',
    exportPDF: 'Export PDF',
    exportExcel: 'Export Excel',
    printReport: 'Print Report',
    selectPeriod: 'Select Period',
    selectClass: 'Select Class',

    // Notifications
    successSaved: 'Data saved successfully',
    successDeleted: 'Data deleted successfully',
    successUpdated: 'Data updated successfully',
    errorOccurred: 'An error occurred',
    confirmDelete: 'Are you sure you want to delete?',
    cannotUndo: 'This action cannot be undone',

    // Empty States
    noData: 'No data available',
    noJournals: 'No journals yet',
    noStudents: 'No students yet',
    noQuizzes: 'No quizzes yet',
    noReports: 'No reports yet',
    startWriting: 'Start Writing',

    // Loading States
    loading: 'Loading...',
    saving: 'Saving...',
    deleting: 'Deleting...',
    processing: 'Processing...',

    // Pagination
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    showing: 'Showing',
    entries: 'entries',

    // Doa CRUD
    doaTitle: 'Prayer Materials',
    doaSubtitle: 'Manage daily Ramadan prayers',
    doaMenu: 'Prayers',
    allClasses: 'All Classes',

    // Misc
    or: 'or',
    and: 'and',
    total: 'Total',
    summary: 'Summary',
    details: 'Details',
    description: 'Description',
    category: 'Category',
    type: 'Type',
    time: 'Time',
    location: 'Location',
    ramadanGreeting: 'Blessed Ramadan fasting to you',
    todayDate: 'Today',
  },

  ar: {
    // Common
    appName: 'كتاب رمضان الذكي اليومي',
    appSubtitle: 'وسائط التعلم ومراقبة العبادة ويوميات رمضان للطلاب',
    logout: 'تسجيل الخروج',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    delete: 'حذف',
    search: 'بحث',
    filter: 'تصفية',
    download: 'تحميل',
    view: 'عرض',
    add: 'إضافة',
    back: 'رجوع',

    // Auth
    login: 'تسجيل الدخول',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    rememberMe: 'تذكرني',
    forgotPassword: 'نسيت كلمة المرور؟',
    loginButton: 'دخول',
    student: 'طالب',
    teacher: 'معلم',
    welcomeBack: 'مرحباً بعودتك',
    loginCredentials: 'بيانات الاختبار',

    // Dashboard
    dashboard: 'لوحة التحكم',
    welcome: 'مرحباً',
    welcomeMessage: 'مرحباً، أحمد!',
    welcomeSubtitle: 'نسأل الله أن يتقبل صيامكم ويجعله في ميزان حسناتكم',
    dayCounter: 'اليوم',
    remainingDays: 'الأيام المتبقية',
    todayWorship: 'عبادة اليوم',

    // Menu
    journalMenu: 'يوميات رمضان',
    trackerMenu: 'متتبع العبادة',
    prayerMenu: 'أوقات الصلاة',
    materialMenu: 'المواد والدراسات',
    quizMenu: 'اختبار رمضان',
    reportMenu: 'تقاريري',
    profileMenu: 'الملف الشخصي',
    studentsMenu: 'إدارة الطلاب',
    journalMonitorMenu: 'مراقبة اليوميات',
    trackerMonitorMenu: 'مراقبة المتتبع',
    materialManageMenu: 'إدارة المواد',
    quizManageMenu: 'إدارة الاختبارات',

    // Education Section
    educationTitle: 'تعليم الصيام في رمضان',
    educationSubtitle: 'تعلم واجبات الصيام وإجراءاته الصحيحة',
    obligationTitle: 'واجب صيام رمضان',
    obligationSubtitle: 'الدليل من القرآن الكريم',
    verse: 'آية',
    translation: 'الترجمة',
    fastingObligation: 'واجب صيام رمضان',
    evidenceFromQuran: 'الدليل من القرآن الكريم',
    translationLabel: 'الترجمة',
    verse183: 'سورة البقرة الآية ١٨٣',
    verse183Label: 'دليل وجوب الصيام',
    verse185: 'سورة البقرة الآية ١٨٥',
    verse185Label: 'فضائل شهر رمضان',

    // Education Cards
    definitionTitle: 'تعريف الصيام',
    definitionDesc: 'الصيام لغة هو الإمساك. وفي الشريعة الإسلامية، الصيام هو الإمساك عن الطعام والشراب وما يفطر من طلوع الفجر إلى غروب الشمس بنية العبادة لله سبحانه وتعالى.',
    pillarTitle: 'أركان الصيام',
    pillarDesc: '١. النية في الليل\n٢. الإمساك عن الطعام والشراب والمفطرات\n٣. من الفجر حتى غروب الشمس',
    conditionTitle: 'شروط الصيام',
    conditionDesc: 'الإسلام، البلوغ، العقل، القدرة على الصيام، عدم الحيض أو النفاس، والإقامة (عدم السفر الطويل).',
    invalidatorTitle: 'مبطلات الصيام',
    invalidatorDesc: 'الأكل والشرب عمداً، التقيؤ عمداً، الحيض والنفاس، الردة، والإنزال عمداً.',
    virtueTitle: 'فضائل رمضان',
    virtueDesc: 'رمضان شهر مبارك، تفتح فيه أبواب الجنة، وتغلق أبواب النار، وتصفد فيه الشياطين، وفيه ليلة القدر التي هي خير من ألف شهر.',
    wisdomTitle: 'حكمة الصيام',
    wisdomDesc: 'تدريب الصبر، والسيطرة على الرغبات، وزيادة التقوى، والشعور بمعاناة الفقراء، وزيادة الوعي الاجتماعي.',

    // Prayer Times
    prayerSchedule: 'جدول الصلاة اليوم',
    prayerScheduleTitle: 'جدول الصلاة اليوم',
    nextPrayer: 'الصلاة القادمة',
    timeRemaining: 'الوقت المتبقي',
    imsak: 'الإمساك',
    fajr: 'الفجر',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء',

    // Hadith
    hadithDaily: 'حديث اليوم',
    hadithOfTheDay: 'حديث اليوم',
    hadithText: '"من صام رمضان إيماناً واحتساباً غُفر له ما تقدم من ذنبه"',
    hadithSource: '— رواه البخاري ومسلم',
    todayMotivation: 'تحفيز اليوم',
    motivationText: 'كل ثانية في شهر رمضان هي فرصة ذهبية لكسب البركات. استغلها بأفضل طريقة!',
    motivationDaily: 'تحفيز اليوم',

    // Stats
    journalWritten: 'اليوميات المكتوبة',
    worshipRecorded: 'العبادة المسجلة',
    quizCompleted: 'الاختبارات المنجزة',
    achievements: 'الإنجازات',
    totalStudents: 'إجمالي الطلاب',
    journalSubmitted: 'اليوميات المقدمة',
    averageWorship: 'متوسط العبادة',
    totalQuizzes: 'الاختبارات المنجزة',

    // Journal
    journalTitle: 'اليوميات الرمضانية',
    journalSubtitle: 'سجل أنشطتك وتأملاتك العبادية يومياً',
    writeNewJournal: 'كتابة يومية جديدة',
    journalTitleField: 'عنوان اليومية',
    dailyActivity: 'نشاط اليوم',
    reflection: 'التأمل والخبرة',

    // Tracker
    trackerTitle: 'متتبع العبادة اليومي',
    trackerSubtitle: 'راقب وسجل عبادتك اليومية',
    todayProgress: 'تقدم اليوم',
    completed: 'مكتمل',
    remaining: 'متبقي',
    worshipStreak: 'سلسلة العبادة',
    days: 'أيام',

    // Worship Items
    fajrPrayer: 'صلاة الفجر',
    dhuhrPrayer: 'صلاة الظهر',
    asrPrayer: 'صلاة العصر',
    maghribPrayer: 'صلاة المغرب',
    ishaPrayer: 'صلاة العشاء',
    tarawih: 'صلاة التراويح',
    quranRecitation: 'تلاوة القرآن',
    dhikr: 'الذكر',
    dailyPrayer: 'الدعاء اليومي',
    charity: 'الصدقة',

    // Quiz
    quizTitle: 'اختبار رمضان',
    quizSubtitle: 'اختبر فهمك لرمضان والإسلام',
    questions: 'أسئلة',
    duration: 'المدة',
    minutes: 'دقائق',
    yourScore: 'درجتك',
    averageScore: 'متوسط الدرجات',
    startQuiz: 'بدء الاختبار',
    viewResults: 'عرض النتائج',

    // Profile
    profileTitle: 'ملفي الشخصي',
    profileSubtitle: 'إدارة معلومات حسابك',
    personalInfo: 'المعلومات الشخصية',
    fullName: 'الاسم الكامل',
    class: 'الصف',
    accountSettings: 'إعدادات الحساب',
    changePassword: 'تغيير كلمة المرور',
    notifications: 'الإشعارات',
    privacySecurity: 'الخصوصية والأمان',

    // Date Format
    dateFormat: 'ar-SA',

    // Stats Labels
    from: 'من',
    of: 'من',
    highConsistency: 'اتساق عالي',
    average: 'متوسط',
    badgesEarned: 'الشارات المكتسبة',
    activeThisMonth: 'نشط هذا الشهر',
    totalEntries: 'إجمالي الإدخالات',
    studentConsistency: 'اتساق الطلاب',
    totalCompletions: 'إجمالي الإنجازات',

    // Education - Quranic Verses (Only translations)
    verse183Translation: '"يا أيها الذين آمنوا كتب عليكم الصيام كما كتب على الذين من قبلكم لعلكم تتقون"',
    verse185Translation: '"شهر رمضان الذي أنزل فيه القرآن هدى للناس وبينات من الهدى والفرقان فمن شهد منكم الشهر فليصمه"',
    verse183Reference: 'سورة البقرة: 183',
    verse185Reference: 'سورة البقرة: 185',

    // Prayer Times Extended
    todaySchedule: 'جدول اليوم',
    upcomingPrayer: 'الصلاة القادمة',
    prayerTips: 'نصائح عبادة رمضان',
    prayerInCongregation: 'احرص على صلاة الجماعة في المسجد أو مع العائلة للحصول على أجر 27 درجة أكثر.',
    comeEarly: 'احضر قبل 10-15 دقيقة من وقت الصلاة للتحضير والحصول على الصف الأول.',
    dhikrAfterPrayer: 'لا تنس الذكر وقراءة الدعاء بعد الصلاة لكمال العبادة.',
    breakFastWithDates: 'من السنة الإفطار بالتمر والماء قبل أداء صلاة المغرب.',

    // Hadith & Motivation
    hadithQuote: '"من صام رمضان إيماناً واحتساباً غفر له ما تقدم من ذنبه"',
    motivationQuote: 'كل ثانية في شهر رمضان فرصة ذهبية لكسب البركات. استفد منها بأفضل طريقة!',

    // Weekly Stats
    weeklyStats: 'الإحصائيات الأسبوعية',
    weeklyProgress: 'التقدم الأسبوعي',
    consistency: 'الاتساق',
    excellent: 'ممتاز',
    good: 'جيد',
    needsAttention: 'يحتاج إلى اهتمام',

    // Journal Extended
    newJournal: 'يومية جديدة',
    journalHistory: 'سجل اليوميات',
    activityPlaceholder: 'أخبرنا عن أنشطة العبادة التي قمت بها اليوم...',
    reflectionPlaceholder: 'كيف تشعر؟ ما الذي يمكن تحسينه؟',
    titlePlaceholder: 'مثال: اليوم 16 من رمضان',

    // Tracker Extended
    checklist: 'قائمة العبادة',
    achievement: 'الإنجاز',
    unlocked: 'مفتوح',
    locked: 'مقفل',
    consistent7Days: 'سلسلة 7 أيام',
    consistent15Days: 'سلسلة 15 يوماً',
    consistent30Days: 'سلسلة 30 يوماً',

    // Quiz Extended
    completedStatus: 'مكتمل',
    availableStatus: 'متاح',
    readMore: 'اقرأ المزيد',
    startNow: 'ابدأ الآن',
    seeResults: 'انظر النتائج',

    // Teacher Dashboard
    studentActivity: 'نشاط الطلاب',
    quizDistribution: 'توزيع درجات الاختبار',
    recentJournals: 'اليوميات الأخيرة',
    topPerformers: 'أفضل الأداء',
    students: 'طلاب',
    minutesAgo: 'دقائق مضت',
    hourAgo: 'ساعة مضت',
    hoursAgo: 'ساعات مضت',
    avgScore: 'متوسط الدرجات',

    // Table Headers
    nisn: 'رقم الطالب',
    studentName: 'اسم الطالب',
    email: 'البريد الإلكتروني',
    status: 'الحالة',
    actions: 'الإجراءات',
    active: 'نشط',
    inactive: 'غير نشط',
    date: 'التاريخ',
    title: 'العنوان',
    score: 'الدرجة',
    percentage: 'النسبة المئوية',

    // Forms & Actions
    addNew: 'إضافة جديد',
    editItem: 'تعديل',
    deleteItem: 'حذف',
    viewDetail: 'عرض التفاصيل',
    submit: 'إرسال',
    close: 'إغلاق',
    confirm: 'تأكيد',
    selectAll: 'اختر الكل',
    deselectAll: 'إلغاء تحديد الكل',

    // Monitoring
    monitoringTitle: 'المراقبة',
    viewJournal: 'عرض التفاصيل',
    giveComment: 'إعطاء تعليق',
    viewProgress: 'عرض التقدم',
    perDay: 'في اليوم',
    perWeek: 'في الأسبوع',
    perMonth: 'في الشهر',
    perStudent: 'لكل طالب',
    perClass: 'لكل فصل',

    // Reports
    journalReport: 'تقرير اليوميات',
    worshipReport: 'تقرير العبادة',
    quizReport: 'تقرير الاختبار',
    progressReport: 'تقرير التقدم',
    exportPDF: 'تصدير PDF',
    exportExcel: 'تصدير Excel',
    printReport: 'طباعة التقرير',
    selectPeriod: 'اختر الفترة',
    selectClass: 'اختر الفصل',

    // Notifications
    successSaved: 'تم حفظ البيانات بنجاح',
    successDeleted: 'تم حذف البيانات بنجاح',
    successUpdated: 'تم تحديث البيانات بنجاح',
    errorOccurred: 'حدث خطأ',
    confirmDelete: 'هل أنت متأكد أنك تريد الحذف؟',
    cannotUndo: 'لا يمكن التراجع عن هذا الإجراء',

    // Empty States
    noData: 'لا توجد بيانات',
    noJournals: 'لا توجد يوميات بعد',
    noStudents: 'لا يوجد طلاب بعد',
    noQuizzes: 'لا توجد اختبارات بعد',
    noReports: 'لا توجد تقارير بعد',
    startWriting: 'ابدأ الكتابة',

    // Loading States
    loading: 'جارٍ التحميل...',
    saving: 'جارٍ الحفظ...',
    deleting: 'جارٍ الحذف...',
    processing: 'جارٍ المعالجة...',

    // Pagination
    previous: 'السابق',
    next: 'التالي',
    page: 'صفحة',
    showing: 'عرض',
    entries: 'إدخالات',

    // Doa CRUD
    doaTitle: 'مواد الأدعية',
    doaSubtitle: 'إدارة أدعية رمضان اليومية',
    doaMenu: 'الأدعية',
    allClasses: 'جميع الفصول',

    // Misc
    or: 'أو',
    and: 'و',
    total: 'المجموع',
    summary: 'ملخص',
    details: 'تفاصيل',
    description: 'الوصف',
    category: 'الفئة',
    type: 'النوع',
    time: 'الوقت',
    location: 'الموقع',
    ramadanGreeting: 'رمضان مبارك صياماً مباركاً',
    todayDate: 'اليوم',
  },
};
