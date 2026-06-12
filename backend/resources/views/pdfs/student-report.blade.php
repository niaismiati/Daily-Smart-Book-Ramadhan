<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Ramadan</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #1e293b; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { color: #16a34a; font-size: 20px; margin-bottom: 5px; }
        .header p { color: #94a3b8; font-size: 10px; }
        .info { margin-bottom: 20px; }
        .info p { margin: 3px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th { background-color: #16a34a; color: white; padding: 8px; text-align: left; font-size: 11px; }
        td { padding: 6px 8px; border: 1px solid #e2e8f0; }
        tr:nth-child(even) { background-color: #f0fdf4; }
        .conclusion { margin-top: 20px; padding: 10px; background: #f0fdf4; border-radius: 5px; }
        .conclusion h3 { color: #16a34a; margin: 0 0 5px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Daily Smart Book Ramadan</h1>
        <p>Laporan Aktivitas Ramadan Siswa</p>
        <hr style="border: 1px solid #16a34a;">
    </div>

    <div class="info">
        <p><strong>Nama:</strong> {{ $user->name }}</p>
        <p><strong>Kelas:</strong> {{ $user->class ?? '-' }}</p>
        <p><strong>Tanggal Laporan:</strong> {{ $date }}</p>
    </div>

    <h3>Ringkasan Ibadah</h3>
    <table>
        <thead>
            <tr>
                <th>Item</th>
                <th>Detail</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>Sholat Wajib</td><td>{{ $done_prayers }} / {{ $total_prayers }} ({{ $sholat_percentage }}%)</td></tr>
            <tr><td>Quiz Dikerjakan</td><td>{{ $quiz_taken }} (Rata-rata: {{ $avg_score }})</td></tr>
            <tr><td>Jurnal Terisi</td><td>{{ $journals }}</td></tr>
            <tr><td>Sholat Jumat</td><td>{{ $friday }}</td></tr>
        </tbody>
    </table>

    <div class="conclusion">
        <h3>Kesimpulan</h3>
        <p>Konsistensi ibadah shalat: <strong>{{ $sholat_percentage }}%</strong></p>
        <p>Total quiz dikerjakan: <strong>{{ $quiz_taken }}</strong></p>
        <p>Jurnal harian: <strong>{{ $journals }}</strong></p>
        <p>Semoga terus istiqamah dalam beribadah. Barakallah!</p>
    </div>
</body>
</html>
