<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DoaMaterial;
use App\Models\DoaTracking;
use App\Models\FridayPrayer;
use App\Models\Journal;
use App\Models\Material;
use App\Models\MaterialReading;
use App\Models\PrayerTracking;
use App\Models\Quiz;
use App\Models\QuizResult;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $today = now()->toDateString();
        $monthStart = now()->startOfMonth()->toDateString();

        $from = $request->from ?? $monthStart;
        $to = $request->to ?? $today;

        $activeStudents = User::siswa()->active();

        // --- STUDENT COUNTS ---
        $totalStudents = (clone $activeStudents)->count();
        $studentsByClass = (clone $activeStudents)
            ->selectRaw('class, COUNT(*) as count')
            ->groupBy('class')
            ->pluck('count', 'class');

        // --- DAILY ACTIVE STUDENTS ---
        $todayPrayers = PrayerTracking::whereDate('date', $today)->count();
        $weeklyActive = [];
        for ($d = 6; $d >= 0; $d--) {
            $weeklyActive[] = PrayerTracking::whereDate('date', now()->subDays($d)->toDateString())->count();
        }

        // --- PRAYER STATS (month) ---
        $monthPrayerTrackings = PrayerTracking::whereBetween('date', [$from, $to])->get();
        $totalPrayerSlots = $monthPrayerTrackings->count() * 5;
        $donePrayers = $monthPrayerTrackings->sum(fn($t) => $t->total_checked);
        $totalBerjamaah = $monthPrayerTrackings->sum(fn($t) => $t->total_berjamaah);
        $avgPrayerPercentage = $totalPrayerSlots > 0 ? round(($donePrayers / $totalPrayerSlots) * 100) : 0;
        $berjamaahPercentage = $totalPrayerSlots > 0 ? round(($totalBerjamaah / $totalPrayerSlots) * 100) : 0;

        // Per-sholat breakdown
        $sholatSubuh = $monthPrayerTrackings->sum(fn($t) => $t->subuh_checked ? 1 : 0);
        $sholatDzuhur = $monthPrayerTrackings->sum(fn($t) => $t->dzuhur_checked ? 1 : 0);
        $sholatAshar = $monthPrayerTrackings->sum(fn($t) => $t->ashar_checked ? 1 : 0);
        $sholatMaghrib = $monthPrayerTrackings->sum(fn($t) => $t->maghrib_checked ? 1 : 0);
        $sholatIsya = $monthPrayerTrackings->sum(fn($t) => $t->isya_checked ? 1 : 0);

        // Per-sholat berjamaah breakdown
        $berjamaahSubuh = $monthPrayerTrackings->sum(fn($t) => $t->subuh_berjamaah ? 1 : 0);
        $berjamaahDzuhur = $monthPrayerTrackings->sum(fn($t) => $t->dzuhur_berjamaah ? 1 : 0);
        $berjamaahAshar = $monthPrayerTrackings->sum(fn($t) => $t->ashar_berjamaah ? 1 : 0);
        $berjamaahMaghrib = $monthPrayerTrackings->sum(fn($t) => $t->maghrib_berjamaah ? 1 : 0);
        $berjamaahIsya = $monthPrayerTrackings->sum(fn($t) => $t->isya_berjamaah ? 1 : 0);

        // --- PUASA & TADARUS ---
        $totalPuasa = 0;
        $totalTadarus = 0;

        // --- FRIDAY PRAYER ---
        $todayFriday = FridayPrayer::whereDate('date', $today)->count();
        $totalFriday = FridayPrayer::whereBetween('date', [$from, $to])->count();

        // --- QUIZ STATS ---
        $totalQuizzes = Quiz::count();
        $totalQuizTaken = QuizResult::count();
        $avgQuizScore = $totalQuizTaken > 0 ? round(QuizResult::avg('score')) : 0;

        $quizResults = QuizResult::with(['user:id,name', 'quiz:id,title'])
            ->whereBetween('created_at', [$from, $to])
            ->latest()
            ->take(20)
            ->get();

        $quizDistribution = [];
        if ($totalQuizTaken > 0) {
            $ranges = ['0-20','21-40','41-60','61-80','81-100'];
            foreach ($ranges as $r) {
                [$min, $max] = explode('-', $r);
                $quizDistribution[$r] = QuizResult::whereBetween('score', [(int)$min, (int)$max])->count();
            }
        }

        // --- DOA STATS ---
        $doaTracked = DoaTracking::count();
        $doaMaterials = DoaMaterial::active()->count();

        // --- JOURNAL STATS ---
        $totalJournals = Journal::whereBetween('date', [$from, $to])->count();
        $studentsNotFilled = (clone $activeStudents)
            ->whereDoesntHave('prayerTrackings', fn($q) => $q->whereDate('date', $today))
            ->count();

        // --- MATERIALS ---
        $totalMaterials = Material::active()->count();
        $totalMaterialReadings = MaterialReading::whereBetween('created_at', [$from, $to])->count();
        $recentMaterials = Material::active()->with('category:id,name')->latest()->take(5)->get();

        // --- RECENT ACTIVITIES ---
        $journalActivities = Journal::with('user:id,name,class')
            ->latest()->take(5)->get()
            ->map(fn($j) => [
                'id' => $j->id,
                'user_name' => $j->user->name ?? 'Unknown',
                'class' => $j->user->class ?? '',
                'activity' => 'Mengisi jurnal',
                'created_at' => $j->created_at,
            ]);

        $quizActivities = QuizResult::with('user:id,name')
            ->latest()->take(5)->get()
            ->map(fn($q) => [
                'id' => $q->id,
                'user_name' => $q->user->name ?? 'Unknown',
                'class' => '',
                'activity' => 'Mengerjakan quiz' . ($q->quiz ? ': ' . $q->quiz->title : ''),
                'created_at' => $q->created_at,
            ]);

        $prayerActivities = PrayerTracking::with('user:id,name,class')
            ->whereDate('date', $today)->latest()->take(5)->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'user_name' => $p->user->name ?? 'Unknown',
                'class' => $p->user->class ?? '',
                'activity' => 'Mengisi ibadah',
                'created_at' => $p->created_at,
            ]);

        $recentActivities = $journalActivities
            ->merge($quizActivities)
            ->merge($prayerActivities)
            ->sortByDesc('created_at')->take(10)->values();

        // --- CLASS STATS ---
        $classStats = (clone $activeStudents)
            ->select('class')->distinct()->whereNotNull('class')
            ->get()
            ->map(function ($item) use ($from, $to) {
                $students = User::siswa()->active()->where('class', $item->class)->count();
                $trackings = PrayerTracking::whereBetween('date', [$from, $to])
                    ->whereHas('user', fn($q) => $q->where('class', $item->class))
                    ->get();
                $totalP = $trackings->count() * 5;
                $doneP = $trackings->sum(fn($t) => $t->total_checked);
                $berjamaah = $trackings->sum(fn($t) => $t->total_berjamaah);
                $journals = Journal::whereBetween('date', [$from, $to])
                    ->whereHas('user', fn($q) => $q->where('class', $item->class))
                    ->count();
                $quizzes = QuizResult::whereBetween('created_at', [$from, $to])
                    ->whereHas('user', fn($q) => $q->where('class', $item->class))
                    ->get();
                $fridayCount = FridayPrayer::whereBetween('date', [$from, $to])
                    ->whereHas('user', fn($q) => $q->where('class', $item->class))
                    ->count();
                return [
                    'class' => $item->class,
                    'students' => $students,
                    'total_sholat' => $doneP,
                    'berjamaah' => $berjamaah,
                    'avg_score' => $totalP > 0 ? round(($doneP / $totalP) * 100) : 0,
                    'journals' => $journals,
                    'friday_count' => $fridayCount,
                    'quiz_count' => $quizzes->count(),
                    'quiz_avg' => round($quizzes->avg('score') ?? 0),
                ];
            });

        // --- CHART: weekly progress per class (last 4 weeks) ---
        $weeklyClassProgress = [];
        $classNames = (clone $activeStudents)->whereNotNull('class')->distinct()->pluck('class');
        for ($w = 3; $w >= 0; $w--) {
            $ws = now()->subWeeks($w)->startOfWeek()->toDateString();
            $we = now()->subWeeks($w)->endOfWeek()->toDateString();
            $weekData = ['week' => 'Minggu ' . (4 - $w)];
            foreach ($classNames as $cn) {
                $wt = PrayerTracking::whereBetween('date', [$ws, $we])
                    ->whereHas('user', fn($q) => $q->where('class', $cn))
                    ->get();
                $totalW = $wt->count() * 5;
                $doneW = $wt->sum(fn($t) => $t->total_checked);
                $weekData[$cn] = $totalW > 0 ? round(($doneW / $totalW) * 100) : 0;
            }
            $weeklyClassProgress[] = $weekData;
        }

        return response()->json([
            'stats' => [
                // Ringkasan Siswa
                'total_students' => $totalStudents,
                'active_students' => $todayPrayers > 0 ? $totalStudents : 0,
                'students_by_class' => $studentsByClass,

                // Monitoring Ibadah
                'today_prayers' => $todayPrayers,
                'total_sholat' => $donePrayers,
                'total_slots' => $totalPrayerSlots,
                'avg_prayer_percentage' => $avgPrayerPercentage,
                'total_berjamaah' => $totalBerjamaah,
                'berjamaah_percentage' => $berjamaahPercentage,
                'sholat_subuh' => $sholatSubuh,
                'sholat_dzuhur' => $sholatDzuhur,
                'sholat_ashar' => $sholatAshar,
                'sholat_maghrib' => $sholatMaghrib,
                'sholat_isya' => $sholatIsya,
                'berjamaah_subuh' => $berjamaahSubuh,
                'berjamaah_dzuhur' => $berjamaahDzuhur,
                'berjamaah_ashar' => $berjamaahAshar,
                'berjamaah_maghrib' => $berjamaahMaghrib,
                'berjamaah_isya' => $berjamaahIsya,
                'total_puasa' => $totalPuasa,
                'total_tadarus' => $totalTadarus,

                // Shalat Jumat
                'today_friday' => $todayFriday,
                'total_friday' => $totalFriday,

                // Doa
                'doa_tracked' => $doaTracked,
                'doa_materials' => $doaMaterials,

                // Quiz
                'total_quizzes' => $totalQuizzes,
                'total_quiz_taken' => $totalQuizTaken,
                'avg_quiz_score' => $avgQuizScore,
                'quiz_results' => $quizResults,
                'quiz_distribution' => $quizDistribution,

                // Journal
                'total_journals' => $totalJournals,
                'students_not_filled' => $studentsNotFilled,

                // Materi
                'total_materials' => $totalMaterials,
                'total_material_readings' => $totalMaterialReadings,
                'recent_materials' => $recentMaterials,

                // Aktivitas
                'recent_activities' => $recentActivities,

                // Grafik
                'weekly_active' => $weeklyActive,
                'class_stats' => $classStats,
                'weekly_class_progress' => $weeklyClassProgress,
            ],
        ]);
    }

    public function students(Request $request): JsonResponse
    {
        $query = User::siswa()->active();

        if ($request->filled('class')) {
            $query->where('class', $request->class);
        }

        $today = now()->toDateString();
        $students = $query->orderBy('name')->get(['id', 'name', 'nisn', 'class', 'email']);

        // Add last_active_today field matching LaporanGuruPage
        $students = $students->map(function ($s) use ($today) {
            $s->last_active_today = PrayerTracking::where('user_id', $s->id)
                ->whereDate('date', $today)->exists();
            return $s;
        });

        return response()->json(['students' => $students]);
    }

    public function prayerRecap(Request $request): JsonResponse
    {
        $request->validate([
            'class' => 'nullable|string',
            'from' => 'nullable|date',
            'to' => 'nullable|date',
        ]);

        $studentsQuery = User::siswa()->active();
        if ($request->filled('class')) {
            $studentsQuery->where('class', $request->class);
        }
        $students = $studentsQuery->limit(200)->get();

        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to = $request->to ?? now()->toDateString();

        $recap = $students->map(function ($student) use ($from, $to) {
            $trackings = PrayerTracking::where('user_id', $student->id)
                ->whereBetween('date', [$from, $to])
                ->get();

            $totalDays = $trackings->count();
            $totalPrayers = $totalDays * 5;
            $donePrayers = $trackings->sum(fn($t) => $t->total_checked);
            $berjamaahCount = $trackings->sum(fn($t) => $t->total_berjamaah);

            $subuh = $trackings->sum(fn($t) => $t->subuh_checked ? 1 : 0);
            $dzuhur = $trackings->sum(fn($t) => $t->dzuhur_checked ? 1 : 0);
            $ashar = $trackings->sum(fn($t) => $t->ashar_checked ? 1 : 0);
            $maghrib = $trackings->sum(fn($t) => $t->maghrib_checked ? 1 : 0);
            $isya = $trackings->sum(fn($t) => $t->isya_checked ? 1 : 0);

            $fridayCount = FridayPrayer::where('user_id', $student->id)
                ->whereBetween('date', [$from, $to])
                ->count();

            $journalCount = Journal::where('user_id', $student->id)
                ->whereBetween('date', [$from, $to])
                ->count();

            $quizResults = QuizResult::where('user_id', $student->id)
                ->whereBetween('created_at', [$from, $to])
                ->get();

            $quizCount = $quizResults->count();
            $quizAvg = $quizCount > 0 ? round($quizResults->avg('score')) : 0;

            return [
                'id' => $student->id,
                'name' => $student->name,
                'nisn' => $student->nisn,
                'class' => $student->class,
                'total_days' => $totalDays,
                'prayer_percentage' => $totalPrayers > 0 ? round(($donePrayers / $totalPrayers) * 100) : 0,
                'berjamaah_count' => $berjamaahCount,
                'subuh' => $subuh,
                'dzuhur' => $dzuhur,
                'ashar' => $ashar,
                'maghrib' => $maghrib,
                'isya' => $isya,
                'friday_count' => $fridayCount,
                'journal_count' => $journalCount,
                'quiz_count' => $quizCount,
                'quiz_avg' => $quizAvg,
            ];
        });

        return response()->json(['recap' => $recap]);
    }

    public function fridayPrayers(Request $request): JsonResponse
    {
        $request->validate([
            'class' => 'nullable|string',
            'from' => 'nullable|date',
            'to' => 'nullable|date',
        ]);

        $query = FridayPrayer::with(['user:id,name,nisn,class', 'sermonTopic:id,title']);

        if ($request->filled('class')) {
            $query->whereHas('user', fn($q) => $q->where('class', $request->class));
        }
        if ($request->filled('from')) {
            $query->whereDate('date', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('date', '<=', $request->to);
        }

        $prayers = $query->orderBy('date', 'desc')->get();

        return response()->json(['friday_prayers' => $prayers]);
    }

    public function gradeFridayPrayer(Request $request, FridayPrayer $fridayPrayer): JsonResponse
    {
        $request->validate([
            'teacher_comment' => 'nullable|string',
            'teacher_score' => 'nullable|integer|min:0|max:100',
        ]);

        $fridayPrayer->update([
            'teacher_comment' => $request->teacher_comment,
            'teacher_score' => $request->teacher_score,
            'is_graded' => true,
        ]);

        return response()->json([
            'message' => 'Penilaian berhasil disimpan',
            'friday_prayer' => $fridayPrayer->fresh()->load(['user:id,name,nisn,class', 'sermonTopic:id,title']),
        ]);
    }

    public function doaRecap(Request $request): JsonResponse
    {
        $request->validate(['class' => 'nullable|string']);

        $studentsQuery = User::siswa()->active();
        if ($request->filled('class')) {
            $studentsQuery->where('class', $request->class);
        }
        $students = $studentsQuery->limit(200)->get();
        $totalDoa = DoaMaterial::active()->count();

        $recap = $students->map(function ($student) use ($totalDoa) {
            $tracked = DoaTracking::where('user_id', $student->id)->count();
            $memorized = DoaTracking::where('user_id', $student->id)
                ->where('memorized', true)->count();

            return [
                'id' => $student->id,
                'name' => $student->name,
                'class' => $student->class,
                'total_doa' => $totalDoa,
                'tracked' => $tracked,
                'memorized' => $memorized,
                'progress_percentage' => $totalDoa > 0
                    ? round(($tracked / $totalDoa) * 100)
                    : 0,
            ];
        });

        return response()->json(['recap' => $recap]);
    }

    public function createUser(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|in:siswa,guru',
            'nisn' => 'required_if:role,siswa|unique:users,nisn|nullable',
            'nip' => 'required_if:role,guru|unique:users,nip|nullable',
            'class' => 'required_if:role,siswa|nullable',
            'email' => 'nullable|email|unique:users,email',
            'phone' => 'nullable|string',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'role' => $request->role,
            'nisn' => $request->role === 'siswa' ? $request->nisn : null,
            'nip' => $request->role === 'guru' ? $request->nip : null,
            'class' => $request->role === 'siswa' ? $request->class : null,
            'phone' => $request->phone,
        ]);

        return response()->json([
            'message' => 'User berhasil dibuat',
            'user' => $user->only(['id', 'name', 'role', 'nisn', 'nip', 'class', 'email']),
        ], 201);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'class' => 'sometimes|string',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
            'password' => 'sometimes|string|min:6',
        ]);

        $data = $request->only('name', 'class', 'email', 'phone', 'is_active');
        if ($request->filled('password')) {
            $data['password'] = $request->password;
        }

        $user->update($data);

        return response()->json([
            'message' => 'User berhasil diubah',
            'user' => $user->fresh()->only(['id', 'name', 'role', 'nisn', 'nip', 'class', 'email', 'is_active']),
        ]);
    }

    public function deleteUser(User $user): JsonResponse
    {
        $user->delete();
        return response()->json(['message' => 'User berhasil dihapus']);
    }

    public function classes(): JsonResponse
    {
        $classes = User::siswa()->select('class')
            ->distinct()
            ->whereNotNull('class')
            ->orderBy('class')
            ->pluck('class');

        return response()->json(['classes' => $classes]);
    }
}
