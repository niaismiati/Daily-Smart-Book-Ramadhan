<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DoaMaterial;
use App\Models\DoaTracking;
use App\Models\FridayPrayer;
use App\Models\Journal;
use App\Models\Material;
use App\Models\MaterialReading;
use App\Models\Notification;
use App\Models\PrayerSchedule;
use App\Models\PrayerTracking;
use App\Models\Quiz;
use App\Models\QuizResult;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function student(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = now()->toDateString();

        // --- PRAYER TRACKING ---
        $todayTracking = PrayerTracking::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        $monthPrayers = PrayerTracking::where('user_id', $user->id)
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->get();

        $totalMonthPrayers = $monthPrayers->count() * 5;
        $doneMonthPrayers = $monthPrayers->sum(fn($t) => $t->total_checked);
        $weekPercentage = $totalMonthPrayers > 0
            ? round(($doneMonthPrayers / $totalMonthPrayers) * 100) : 0;

        $todayPrayerCount = $todayTracking ? $todayTracking->total_checked : 0;

        // Per-waktu sholat stats for current month
        $sholatSubuh = $monthPrayers->sum(fn($t) => $t->subuh_checked ? 1 : 0);
        $sholatDzuhur = $monthPrayers->sum(fn($t) => $t->dzuhur_checked ? 1 : 0);
        $sholatAshar = $monthPrayers->sum(fn($t) => $t->ashar_checked ? 1 : 0);
        $sholatMaghrib = $monthPrayers->sum(fn($t) => $t->maghrib_checked ? 1 : 0);
        $sholatIsya = $monthPrayers->sum(fn($t) => $t->isya_checked ? 1 : 0);

        // --- FRIDAY PRAYER ---
        $fridayAttendance = FridayPrayer::where('user_id', $user->id)
            ->whereMonth('date', now()->month)
            ->count();

        // --- QUIZ ---
        $quizAvailable = Quiz::active()->count();
        $quizResults = QuizResult::where('user_id', $user->id)->get();
        $quizDone = $quizResults->count();
        $avgQuizScore = $quizDone > 0 ? round($quizResults->avg('score')) : 0;
        $lastQuizResult = $quizResults->sortByDesc('created_at')->first();

        // --- JOURNALS ---
        $journalCount = Journal::where('user_id', $user->id)
            ->whereMonth('date', now()->month)
            ->count();

        // --- MATERIALS ---
        $materialsRead = MaterialReading::where('user_id', $user->id)->count();
        $recentMaterials = Material::active()->with('category')->latest()->take(3)->get();

        // --- DOA ---
        $doaLearned = DoaTracking::where('user_id', $user->id)->count();
        $doaMaterials = DoaMaterial::active()->count();

        // --- STREAK ---
        $streak = $this->calculateStreak($user->id);

        // --- POINTS ---
        $sholatPoints = $doneMonthPrayers * 10;
        $materiPoints = $materialsRead * 15;
        $quizPoints = $quizResults->sum('score');
        $jurnalPoints = $journalCount * 5;
        $totalPoints = $sholatPoints + $materiPoints + $quizPoints + $jurnalPoints;

        // --- WEEKLY PROGRESS (last 4 weeks) ---
        $weeklyProgress = [];
        for ($w = 0; $w < 4; $w++) {
            $weekStart = now()->subWeeks($w)->startOfWeek()->toDateString();
            $weekEnd = now()->subWeeks($w)->endOfWeek()->toDateString();
            $weekTrackings = PrayerTracking::where('user_id', $user->id)
                ->whereBetween('date', [$weekStart, $weekEnd])
                ->get();
            $weekTotal = $weekTrackings->count() * 5;
            $weekDone = $weekTrackings->sum(fn($t) => $t->total_checked);
            $weeklyProgress[] = $weekTotal > 0 ? round(($weekDone / $weekTotal) * 100) : 0;
        }
        $weeklyProgress = array_reverse($weeklyProgress);

        // --- PRAYER SCHEDULE TODAY ---
        $prayerSchedule = PrayerSchedule::whereDate('date', $today)->first();

        // --- NOTIFICATIONS ---
        $notifications = Notification::where(function ($q) use ($user) {
            $q->where('user_id', $user->id)->orWhereNull('user_id');
        })->latest()->take(5)->get();

        return response()->json([
            'today_prayer' => $todayPrayerCount,
            'week_percentage' => $weekPercentage,
            'streak' => $streak,
            'total_points' => $totalPoints,
            'sholat_points' => $sholatPoints,
            'materi_points' => $materiPoints,
            'quiz_points' => $quizPoints,
            'jurnal_points' => $jurnalPoints,
            'total_journals' => $journalCount,
            'total_materials_read' => $materialsRead,
            'total_quiz_taken' => $quizDone,
            'avg_quiz_score' => $avgQuizScore,
            'last_quiz_score' => $lastQuizResult?->score,
            'quiz_available' => $quizAvailable,
            'sholat_subuh' => $sholatSubuh,
            'sholat_dzuhur' => $sholatDzuhur,
            'sholat_ashar' => $sholatAshar,
            'sholat_maghrib' => $sholatMaghrib,
            'sholat_isya' => $sholatIsya,
            'friday_attendance' => $fridayAttendance,
            'total_doa_learned' => $doaLearned,
            'total_doa_materials' => $doaMaterials,
            'weekly_progress' => $weeklyProgress,
            'reading_points' => ($materialsRead * 15),
            'recent_materials' => $recentMaterials,
            'prayer_schedule' => $prayerSchedule,
            'notifications' => $notifications,
        ]);
    }

    public function teacher(Request $request): JsonResponse
    {
        $today = now()->toDateString();
        $monthStart = now()->startOfMonth()->toDateString();

        // --- STUDENT COUNTS ---
        $totalStudents = User::siswa()->active()->count();
        $studentsByClass = User::siswa()->active()
            ->selectRaw('class, COUNT(*) as count')
            ->groupBy('class')
            ->pluck('count', 'class');

        // --- PRAYER STATS ---
        $todayPrayers = PrayerTracking::whereDate('date', $today)->count();
        $monthPrayerTrackings = PrayerTracking::whereBetween('date', [$monthStart, $today])->get();
        $totalPrayerSlots = $monthPrayerTrackings->count() * 5;
        $donePrayers = $monthPrayerTrackings->sum(fn($t) => $t->total_checked);
        $avgPrayerPercentage = $totalPrayerSlots > 0
            ? round(($donePrayers / $totalPrayerSlots) * 100) : 0;

        // --- FRIDAY PRAYER ---
        $todayFriday = FridayPrayer::whereDate('date', $today)->count();
        $totalFriday = FridayPrayer::whereBetween('date', [$monthStart, $today])->count();

        // --- QUIZ STATS ---
        $totalQuizzes = Quiz::count();
        $totalQuizTaken = QuizResult::count();
        $avgQuizScore = $totalQuizTaken > 0
            ? round(QuizResult::avg('score')) : 0;

        // --- DOA STATS ---
        $doaTracked = DoaTracking::count();
        $doaMaterials = DoaMaterial::active()->count();

        // --- JOURNAL STATS ---
        $totalJournals = Journal::whereBetween('date', [$monthStart, $today])->count();
        $studentsNotFilled = User::siswa()->active()
            ->whereDoesntHave('prayerTrackings', fn($q) => $q->whereDate('date', $today))
            ->count();

        // --- MATERIALS ---
        $totalMaterials = Material::active()->count();
        $recentMaterials = Material::active()->with('category')->latest()->take(3)->get();

        // --- RECENT ACTIVITIES ---
        $recentActivities = Journal::with('user:id,name,class')
            ->latest()->take(5)->get();

        // --- WEEKLY ACTIVE STUDENTS (last 7 days) ---
        $weeklyActive = [];
        for ($d = 6; $d >= 0; $d--) {
            $date = now()->subDays($d)->toDateString();
            $count = PrayerTracking::whereDate('date', $date)->count();
            $weeklyActive[] = $count;
        }

        // --- CLASS STATS ---
        $classStats = User::siswa()->active()
            ->select('class')
            ->distinct()
            ->whereNotNull('class')
            ->get()
            ->map(function ($item) use ($monthStart, $today) {
                $students = User::siswa()->active()->where('class', $item->class)->count();
                $trackings = PrayerTracking::whereBetween('date', [$monthStart, $today])
                    ->whereHas('user', fn($q) => $q->where('class', $item->class))
                    ->get();
                $totalP = $trackings->count() * 5;
                $doneP = $trackings->sum(fn($t) => $t->total_checked);
                $journals = Journal::whereBetween('date', [$monthStart, $today])
                    ->whereHas('user', fn($q) => $q->where('class', $item->class))
                    ->count();
                return [
                    'class' => $item->class,
                    'students' => $students,
                    'avg_score' => $totalP > 0 ? round(($doneP / $totalP) * 100) : 0,
                    'journals' => $journals,
                ];
            });

        return response()->json([
            'total_students' => $totalStudents,
            'today_prayers' => $todayPrayers,
            'avg_prayer_percentage' => $avgPrayerPercentage,
            'today_friday' => $todayFriday,
            'total_friday' => $totalFriday,
            'total_quizzes' => $totalQuizzes,
            'total_quiz_taken' => $totalQuizTaken,
            'avg_quiz_score' => $avgQuizScore,
            'doa_tracked' => $doaTracked,
            'doa_materials' => $doaMaterials,
            'total_journals' => $totalJournals,
            'students_not_filled' => $studentsNotFilled,
            'total_materials' => $totalMaterials,
            'recent_materials' => $recentMaterials,
            'recent_activities' => $recentActivities,
            'weekly_active' => $weeklyActive,
            'class_stats' => $classStats,
            'students_by_class' => $studentsByClass,
        ]);
    }

    private function calculateStreak(int $userId): int
    {
        $streak = 0;
        for ($i = 0; $i < 30; $i++) {
            $checkDate = now()->subDays($i)->toDateString();
            $tracking = PrayerTracking::where('user_id', $userId)
                ->whereDate('date', $checkDate)
                ->first();

            if ($tracking && $tracking->total_checked > 0) {
                $streak++;
            } else {
                break;
            }
        }

        return $streak;
    }
}
