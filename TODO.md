# TODO - Monitoring Guru & Siswa (Smart Book Ramadan)

## Plan
- A. Buat storage data monitoring shalat harian + shalat Jumat (in-memory + localStorage).
- B. Implement UI siswa:
  - Tambah input shalat 5 waktu: Berjamaah / Tidak Berjamaah per tanggal.
  - Tambah menu Shalat Jumat: checkbox Sudah Shalat Jumat + form ringkasan khotbah.
- C. Implement UI guru:
  - Monitoring berdasarkan kelas, nama siswa, tanggal.
  - Tampilkan status shalat harian, berjamaah, status Jumat, ringkasan khotbah.
  - Guru bisa menambahkan komentar/catatan.
- D. Dashboard guru:
  - Total siswa aktif, persentase ibadah kelas, jumlah shalat berjamaah, jumlah pengisi khotbah, ranking siswa berdasarkan poin.
- E. Export:
  - Unduh laporan PDF dan Excel dari data monitoring.

## Steps to do
1. [ ] Tambah model & helper untuk data shalat/Jumat + persistence (localStorage).
2. [ ] Update UI `TrackerPage` (siswa) agar sesuai form shalat 5 waktu + Jumat.
3. [ ] Buat/upgrade halaman monitoring guru (kemungkinan `MonitoringTrackerPage`) untuk filter + tabel detail.
4. [ ] Tambahkan komentar guru pada ringkasan khotbah.
5. [ ] Upgrade `TeacherDashboard` sesuai metrik yang diminta.
6. [ ] Implement export PDF & Excel.

(Phase 0) Catatan teknis: export PDF/Excel saat ini akan memakai `window.print()` untuk PDF dan export Excel sederhana via CSV (tanpa library eksternal), karena dependency xlsx/jspdf belum ada.

7. [ ] Jalankan build/dev dan cek tidak ada error TypeScript/React.

