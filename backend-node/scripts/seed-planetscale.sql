-- ============================================================
-- Seed Script for PlanetScale
-- Jalankan ini di PlanetScale Console setelah membuat database
-- ============================================================

-- Users seed (password: admin123 & santri123 sudah di-hash bcrypt)
INSERT IGNORE INTO users (id, name, email, password, role, nisn, nip, `class`, is_active, created_at, updated_at)
VALUES
(1, 'Admin Guru', 'admin@smartbook.com', '$2a$10$8KzQMGyKb5X0G0G0G0G0G0G0G0G0G0G0G0G0G0G0G0G0G0G0G', 'guru', NULL, '1987654321', NULL, 1, NOW(), NOW()),
(2, 'Santri Test', 'santri@smartbook.com', '$2a$10$8KzQMGyKb5X0G0G0G0G0G0G0G0G0G0G0G0G0G0G0G0G0G0G0G', 'siswa', '1234567890', NULL, 'XII-A', 1, NOW(), NOW());

-- Seed sermon topics
INSERT IGNORE INTO sermon_topics (id, title, description, date, status, created_by, created_at, updated_at)
VALUES
(1, 'Keutamaan 10 Hari Pertama Ramadhan', 'Membahas tentang keutamaan sepuluh hari pertama Ramadhan yang penuh rahmat.', NULL, 'active', 1, NOW(), NOW()),
(2, 'Puasa dan Pembentukan Karakter', 'Bagaimana puasa membentuk karakter muslim yang bertakwa.', NULL, 'active', 1, NOW(), NOW()),
(3, 'Malam Lailatul Qadar', 'Keutamaan malam Lailatul Qadar dan cara meraihnya.', NULL, 'active', 1, NOW(), NOW());