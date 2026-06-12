<?php

namespace Database\Seeders;

use App\Models\DoaMaterial;
use App\Models\SermonTopic;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Guru
        $guru = User::create([
            'name' => 'Guru Pembimbing',
            'email' => 'guru@smartbook.sch.id',
            'password' => 'guru123',
            'role' => 'guru',
            'nip' => 'GT-001',
            'phone' => '0812-9000-1234',
        ]);

        // Siswa
        $siswa = [
            ['name' => 'Ahmad Fauzan', 'nisn' => '1234567890', 'class' => '9A'],
            ['name' => 'Fatimah Azzahra', 'nisn' => '0987654321', 'class' => '9B'],
            ['name' => 'Muhammad Alif', 'nisn' => '1122334455', 'class' => '9C'],
            ['name' => 'Siti Nurhaliza', 'nisn' => '5566778899', 'class' => '9A'],
            ['name' => 'Aisyah Ramadhani', 'nisn' => '9988776655', 'class' => '9A'],
            ['name' => 'Zaki Abdullah', 'nisn' => '5544332211', 'class' => '9B'],
            ['name' => 'Nabila Putri', 'nisn' => '6677889900', 'class' => '9A'],
            ['name' => 'Farhan Maulana', 'nisn' => '4433221100', 'class' => '9C'],
        ];

        foreach ($siswa as $s) {
            User::create([
                'name' => $s['name'],
                'nisn' => $s['nisn'],
                'class' => $s['class'],
                'password' => 'siswa123',
                'role' => 'siswa',
                'email' => strtolower(str_replace(' ', '.', $s['name'])) . '@student.sch.id',
            ]);
        }

        // Sample Sermon Topics
        $topics = [
            ['title' => 'Keutamaan 10 Hari Pertama Ramadhan', 'description' => 'Membahas tentang keutamaan dan keistimewaan sepuluh hari pertama bulan Ramadhan.'],
            ['title' => 'Puasa dan Pembentukan Karakter', 'description' => 'Bagaimana puasa membentuk karakter muslim yang bertakwa.'],
            ['title' => 'Malam Lailatul Qadar', 'description' => 'Keutamaan malam Lailatul Qadar dan cara meraihnya.'],
            ['title' => 'Zakat Fitrah dan Hikmahnya', 'description' => 'Penjelasan tentang zakat fitrah, ketentuan, dan hikmahnya.'],
        ];

        foreach ($topics as $t) {
            SermonTopic::create([
                'title' => $t['title'],
                'description' => $t['description'],
                'created_by' => $guru->id,
            ]);
        }

        // Sample Doa Materials
        $doaList = [
            [
                'title' => 'Niat Puasa Ramadhan',
                'category' => 'niat_puasa',
                'arabic_text' => 'نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هَذِهِ السَّنَةِ',
                'latin_text' => 'Nawaitu shauma ghadin 'an adaa'i fardhi syahri ramadhaana haadzihis sanati',
                'translation' => 'Aku berniat berpuasa esok hari untuk menunaikan kewajiban puasa bulan Ramadhan tahun ini.',
            ],
            [
                'title' => 'Doa Berbuka Puasa',
                'category' => 'berbuka',
                'arabic_text' => 'اللَّهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
                'latin_text' => 'Allahumma laka shumtu wa bika aamantu wa 'alaa rizqika afthartu',
                'translation' => 'Ya Allah, untuk-Mu aku berpuasa, kepada-Mu aku beriman, dan dengan rezeki-Mu aku berbuka.',
            ],
            [
                'title' => 'Doa Setelah Berbuka Puasa',
                'category' => 'after_berbuka',
                'arabic_text' => 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
                'latin_text' => 'Dzahabazh zhama'u wabtallatil 'uruqu wa tsabatal ajru insya Allah',
                'translation' => 'Telah hilang rasa haus, telah basah urat-urat, dan telah tetap pahala insya Allah.',
            ],
            [
                'title' => 'Doa Sahur',
                'category' => 'sahur',
                'arabic_text' => 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ',
                'latin_text' => 'Allahumma baarik lanaa fiimaa razaqtanaa wa qinaa 'adzaaban naar',
                'translation' => 'Ya Allah, berkatilah kami pada apa yang Engkau rezekikan kepada kami dan lindungilah kami dari siksa neraka.',
            ],
            [
                'title' => 'Doa Malam Lailatul Qadar',
                'category' => 'lailatul_qadar',
                'arabic_text' => 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
                'latin_text' => 'Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'annii',
                'translation' => 'Ya Allah, sesungguhnya Engkau Maha Pemaaf dan menyukai maaf, maka maafkanlah aku.',
            ],
        ];

        foreach ($doaList as $d) {
            DoaMaterial::create([
                'title' => $d['title'],
                'category' => $d['category'],
                'arabic_text' => $d['arabic_text'],
                'latin_text' => $d['latin_text'],
                'translation' => $d['translation'],
                'created_by' => $guru->id,
            ]);
        }
    }
}
