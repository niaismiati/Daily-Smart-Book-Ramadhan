# 🌙 Daily Smart Book Ramadan

Platform pendidikan Islam modern untuk monitoring ibadah, jurnal harian, dan pembelajaran Ramadan siswa.

![Islamic Education Platform](https://img.shields.io/badge/Platform-Education-059669?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## ✨ **Fitur Utama**

### 👨‍🎓 **Portal Siswa**
- 📊 Dashboard dengan statistik ibadah personal
- 📝 Jurnal Ramadan harian dengan refleksi
- ✅ Tracker ibadah (Shalat 5 waktu, Tarawih, Tadarus, Dzikir, Sedekah)
- 🕌 Jadwal shalat & imsak otomatis dengan countdown
- 📚 Materi edukasi puasa (artikel, video kajian, hadis)
- 🏆 Quiz Ramadan dengan sistem penilaian
- 📈 Laporan perkembangan dengan grafik
- 🎖️ Badge & achievement system

### 👨‍🏫 **Portal Guru/Admin**
- 📊 Dashboard monitoring dengan statistik lengkap
- 👥 Manajemen data siswa (CRUD)
- 📖 Monitoring jurnal siswa dengan sistem komentar
- 📊 Monitoring tracker ibadah per siswa/kelas
- 📚 Kelola materi edukasi (artikel, video, hadis)
- 🎯 Kelola quiz dan bank soal
- 📄 Laporan komprehensif dengan export PDF

---

## 🎨 **Design System**

### **Color Palette**
- **Primary**: Emerald Green (#059669) - Brand color
- **Accent**: Gold (#d4af37) - Highlights & achievements
- **Background**: Warm Cream (#fdfbf7)
- **Text**: Dark Green (#1a4d2e)

### **Typography**
- **Display/Arabic**: Amiri (serif)
- **Body/UI**: Cairo (sans-serif)
- **Fallback**: Inter

### **Islamic Design Elements**
- Geometric Islamic patterns
- Mosque silhouettes
- Crescent moon & stars
- Ramadan lanterns
- Arabic calligraphy considerations

---

## 🚀 **Cara Menjalankan**

### **Prerequisites**
- Node.js 18+ 
- npm atau yarn

### **Installation**

```bash
# Clone repository
git clone <repository-url>

# Masuk ke directory
cd code

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

---

## 🔐 **Kredensial Login**

### **Akun Siswa**
```
Username: ahmad.fauzan
Password: siswa123
```

### **Akun Guru**
```
Username: guru.agama
Password: guru123
```

📄 **Lihat kredensial lengkap di**: [KREDENSIAL_LOGIN.md](./KREDENSIAL_LOGIN.md)

---

## 📁 **Struktur Project**

```
code/
├── src/
│   ├── app/
│   │   └── App.tsx          # Main application component
│   ├── styles/
│   │   ├── fonts.css        # Google Fonts imports
│   │   ├── theme.css        # Design tokens & CSS variables
│   │   └── index.css        # Tailwind & base styles
│   └── main.tsx             # Entry point
├── guidelines/
│   └── Guidelines.md        # Design system documentation
├── KREDENSIAL_LOGIN.md      # Login credentials
└── README.md                # This file
```

---

## 🛠️ **Tech Stack**

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Fonts**: Google Fonts (Amiri, Cairo, Inter)
- **Build Tool**: Vite
- **State Management**: React Hooks

---

## 📱 **Responsive Design**

- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (< 768px)

---

## 🎯 **Halaman & Fitur Detail**

### **Siswa Dashboard**
- Hero section dengan greeting Islami
- Statistik: Jurnal tertulis, Ibadah tercatat, Quiz selesai, Pencapaian
- 6 Card edukasi puasa (Definisi, Dalil, Rukun, Syarat, Pembatal, Keutamaan)
- Widget jadwal shalat real-time
- Hadis & motivasi harian
- Grafik statistik ibadah mingguan

### **Tracker Ibadah**
- Progress circular dengan persentase
- Checklist 10 ibadah dengan emoji icons
- Badge pencapaian (7 hari, 15 hari, 30 hari)
- Grafik progress mingguan
- Streak counter

### **Jurnal Ramadan**
- Form input dengan title, kegiatan, dan refleksi
- Riwayat jurnal dengan card design
- Filter berdasarkan tanggal
- Edit & delete functionality

### **Quiz System**
- Card layout dengan info jumlah soal & durasi
- Status (completed/available)
- Skor dan persentase
- Ranking leaderboard

### **Monitoring Guru**
- Tabel data siswa dengan search & filter
- Grafik perkembangan kelas
- Top performers ranking
- Statistik distribusi nilai
- Export to PDF

---

## 🌟 **Keunggulan**

1. **Modern Islamic Design** - Kombinasi estetika Islam tradisional dengan UI modern
2. **Comprehensive Tracking** - Monitor semua aspek ibadah Ramadan
3. **Educational Content** - Materi lengkap tentang puasa dan Ramadan
4. **Gamification** - Badge, achievement, dan leaderboard untuk motivasi
5. **Teacher Dashboard** - Tool lengkap untuk monitoring dan evaluasi
6. **Responsive & Accessible** - Works on all devices dengan standar accessibility
7. **Real-time Data** - Statistik dan grafik yang update real-time
8. **Cultural Sensitivity** - Respects Islamic values dan terminology

---

## 📊 **Data Visualization**

- **Bar Charts**: Progress harian dan mingguan
- **Circular Progress**: Persentase ibadah
- **Line Charts**: Trend perkembangan
- **Tables**: Data siswa dan ranking

---

## 🔮 **Future Enhancements**

- [ ] Backend integration (Firebase/Supabase)
- [ ] Real authentication & authorization
- [ ] Push notifications untuk waktu shalat
- [ ] Export laporan PDF yang sesungguhnya
- [ ] Multi-language support (Arabic, English)
- [ ] Dark mode implementation
- [ ] Mobile app (React Native)
- [ ] Real-time chat dengan guru
- [ ] Integration dengan API jadwal shalat
- [ ] Qibla direction finder
- [ ] Audio tadarus Al-Quran
- [ ] Leaderboard antar kelas

---

## 🤝 **Contributing**

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 **License**

This project is licensed under the MIT License.

---

## 👥 **Credits**

- **Design System**: Custom Islamic modern design
- **Icons**: [Lucide React](https://lucide.dev)
- **Fonts**: [Google Fonts](https://fonts.google.com)
- **Images**: [Unsplash](https://unsplash.com)

---

## 📞 **Support**

Jika ada pertanyaan atau masalah:

- 📧 Email: support@dailysmartbook.com
- 💬 Issues: [GitHub Issues](https://github.com/yourrepo/issues)
- 📖 Documentation: [Guidelines.md](./guidelines/Guidelines.md)

---

## 🌙 **Ramadan Mubarak!**

> "Barangsiapa berpuasa Ramadan karena iman dan mengharap pahala dari Allah, maka dosa-dosanya yang telah lalu akan diampuni." - HR. Bukhari & Muslim

---

**Made with ❤️ for Islamic Education**

Semoga bermanfaat untuk pendidikan Islam dan membantu siswa dalam menjalankan ibadah Ramadan dengan lebih baik. 🤲✨
