# 📚 Fitur Edukasi Puasa Ramadan

## Overview

Section **Edukasi Puasa Ramadan** pada Dashboard Siswa dirancang untuk memberikan pembelajaran yang lengkap, terstruktur, dan mudah dipahami tentang kewajiban dan tata cara puasa.

---

## ✨ Fitur Utama

### 1. **Kewajiban Puasa Ramadan**

Section utama yang menampilkan dalil Al-Qur'an tentang kewajiban puasa dengan desain yang elegan dan bernuansa Islami.

#### **Dalil yang Ditampilkan:**

##### **QS. Al-Baqarah Ayat 183**

**Teks Arab:**
```
يٰٓاَيُّهَا الَّذِيْنَ اٰمَنُوْا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِيْنَ مِنْ قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُوْنَۙ
```

**Terjemahan:**
"Wahai orang-orang yang beriman, diwajibkan atas kamu berpuasa sebagaimana diwajibkan atas orang-orang sebelum kamu agar kamu bertakwa."

---

##### **QS. Al-Baqarah Ayat 185**

**Teks Arab:**
```
شَهْرُ رَمَضَانَ الَّذِيْٓ اُنْزِلَ فِيْهِ الْقُرْاٰنُ هُدًى لِّلنَّاسِ وَبَيِّنٰتٍ مِّنَ الْهُدٰى وَالْفُرْقَانِۚ فَمَنْ شَهِدَ مِنْكُمُ الشَّهْرَ فَلْيَصُمْهُۗ
```

**Terjemahan:**
"Bulan Ramadan adalah (bulan) yang di dalamnya diturunkan Al-Qur'an sebagai petunjuk bagi manusia dan penjelasan-penjelasan mengenai petunjuk itu serta pembeda antara yang benar dan yang salah. Karena itu, barang siapa di antara kamu hadir pada bulan itu, maka berpuasalah."

---

### 2. **Materi Pendukung (6 Card)**

#### **Card 1: Definisi Puasa**
- Penjelasan puasa secara bahasa dan istilah syariat
- Mencakup rukun dan esensi puasa

#### **Card 2: Rukun Puasa**
1. Niat berpuasa di malam hari
2. Menahan diri dari makan, minum, dan hal yang membatalkan
3. Dari terbit fajar hingga terbenam matahari

#### **Card 3: Syarat Puasa**
- Islam, baligh, berakal sehat
- Mampu menjalankan puasa
- Tidak sedang haid atau nifas
- Mukim (tidak dalam perjalanan jauh)

#### **Card 4: Pembatal Puasa**
- Makan dan minum dengan sengaja
- Muntah dengan sengaja
- Haid dan nifas
- Murtad
- Keluar mani dengan sengaja

#### **Card 5: Keutamaan Ramadan**
- Bulan penuh berkah
- Pintu surga dibuka
- Pintu neraka ditutup
- Syaitan dibelenggu
- Lailatul Qadar yang istimewa

#### **Card 6: Hikmah Puasa**
- Melatih kesabaran
- Mengendalikan hawa nafsu
- Meningkatkan ketakwaan
- Merasakan penderitaan orang miskin
- Meningkatkan kepedulian sosial

---

## 🎨 Desain Visual

### **Typography**

#### **Teks Arab**
- **Font**: Amiri (elegant Islamic serif font)
- **Size**: 4xl (2.25rem / 36px) pada desktop
- **Size Mobile**: 1.75rem (28px)
- **Line Height**: 2.2 (extra loose untuk keterbacaan)
- **Direction**: RTL (right-to-left)
- **Color**: Dark Green (#1a4d2e)

#### **Teks Terjemahan**
- **Font**: Cairo (modern sans-serif)
- **Size**: lg (1.125rem / 18px)
- **Line Height**: Relaxed
- **Color**: Dark Green (#1a4d2e)

### **Color Scheme**

#### **Dalil QS. Al-Baqarah 183 (Primary Theme)**
- Header Background: Gradient gold/accent (#d4af37)
- Border: 2px gold/accent
- Card Background: White
- Accent Border Left: Primary green

#### **Dalil QS. Al-Baqarah 185 (Secondary Theme)**
- Header Background: Gradient primary green (#059669)
- Border: 2px primary green
- Card Background: White
- Accent Border Left: Gold

### **Components**

#### **1. Section Header**
```
┌─────────────────────────────────────┐
│ 📖 Kewajiban Puasa Ramadan          │
│    Dalil dari Al-Qur'an             │
│                            ⭐🌙⭐   │
└─────────────────────────────────────┘
```

#### **2. Dalil Card Structure**
```
┌────────────────────────────────────┐
│ 📖 Surah Al-Baqarah Ayat 183       │ ← Header (Gradient)
├────────────────────────────────────┤
│                                    │
│     [Teks Arab - RTL - 36px]      │ ← Main Content
│              ﴿ ١٨٣ ﴾              │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ ID Terjemahan                │  │ ← Translation Card
│ │ "Wahai orang-orang..."       │  │
│ │ — QS. Al-Baqarah: 183        │  │
│ └──────────────────────────────┘  │
│                                    │
└────────────────────────────────────┘
```

#### **3. Decorative Elements**
- Islamic geometric patterns (background overlay 5% opacity)
- Crescent moon & stars icons
- Horizontal divider with centered moon icon
- Animated stars with pulse effect

---

## 📱 Responsive Design

### **Desktop (≥1024px)**
- Full 2-column layout for terjemahan
- Large Arabic text (36px)
- Decorative stars visible
- Full geometric patterns

### **Tablet (768px - 1023px)**
- Single column layout
- Medium Arabic text (32px)
- Simplified decorations

### **Mobile (<768px)**
- Single column, full width
- Smaller Arabic text (28px)
- Reduced padding
- Essential decorations only

---

## 🎯 User Experience

### **Visual Hierarchy**
1. **Section Title** → Menarik perhatian
2. **Dalil Cards** → Focus area utama
3. **Arabic Text** → Prominent, mudah dibaca
4. **Translation** → Secondary but clear
5. **Supporting Cards** → Tambahan informasi

### **Reading Flow**
1. User melihat header "Kewajiban Puasa Ramadan"
2. Mata tertuju ke teks Arab yang besar
3. Membaca terjemahan di bawahnya
4. Melanjutkan ke dalil berikutnya
5. Mengeksplorasi materi pendukung

### **Accessibility**
- ✅ High contrast text (WCAG AA compliant)
- ✅ Clear visual separation between sections
- ✅ RTL support for Arabic text
- ✅ Responsive font sizes
- ✅ Icon labels for better understanding

---

## 💡 Best Practices

### **Typography**
- Always use `font-['Amiri']` for Arabic text
- Use `dir="rtl"` and `lang="ar"` attributes
- Maintain line-height 2.0+ for Arabic
- Use contrasting colors for better readability

### **Layout**
- Keep Arabic text in separate cards
- Use generous white space
- Provide clear visual hierarchy
- Separate content with borders/dividers

### **Islamic Design**
- Use geometric patterns subtly (low opacity)
- Incorporate crescent moon and stars
- Use emerald green and gold colors
- Respect cultural sensitivity

---

## 🔄 Future Enhancements

- [ ] Audio recitation for each ayat
- [ ] Tafsir (explanation) on click
- [ ] More Quranic verses related to fasting
- [ ] Hadith collection
- [ ] Quiz on the material
- [ ] Bookmark favorite verses
- [ ] Share to social media
- [ ] Print-friendly version
- [ ] Multi-language support

---

## 📖 References

### **Quranic Verses**
- Surah Al-Baqarah (2:183)
- Surah Al-Baqarah (2:185)

### **Fonts Used**
- **Arabic**: Amiri, Amiri Quran (Google Fonts)
- **Latin**: Cairo, Inter (Google Fonts)

### **Design Inspiration**
- Islamic calligraphy traditions
- Modern Islamic education platforms
- Traditional Mushaf design principles

---

## 🎓 Educational Value

### **Learning Objectives**
1. ✅ Memahami kewajiban puasa dalam Islam
2. ✅ Menghafal dalil Al-Qur'an tentang puasa
3. ✅ Memahami terjemahan ayat-ayat puasa
4. ✅ Mengenal rukun dan syarat puasa
5. ✅ Memahami hal-hal yang membatalkan puasa
6. ✅ Menghayati hikmah dan keutamaan Ramadan

### **Target Audience**
- Siswa SMP/SMA (13-18 tahun)
- Muslim yang ingin memperdalam ilmu puasa
- Guru agama sebagai referensi mengajar

---

**Semoga bermanfaat untuk pendidikan Islam! 🤲✨**
