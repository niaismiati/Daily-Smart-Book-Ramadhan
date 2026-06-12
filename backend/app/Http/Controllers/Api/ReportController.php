<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DoaTracking;
use App\Models\FridayPrayer;
use App\Models\Journal;
use App\Models\MaterialReading;
use App\Models\PrayerTracking;
use App\Models\QuizResult;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function studentReport(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = now()->toDateString();
        $monthStart = now()->startOfMonth()->toDateString();

        // Prayer tracking current month
        $prayerTrackings = PrayerTracking::where('user_id', $user->id)
            ->whereBetween('date', [$monthStart, $today])
            ->get();

        $totalDays = $prayerTrackings->count();
        $totalPrayers = $totalDays * 5;
        $donePrayers = $prayerTrackings->sum(fn($t) => $t->total_checked);
        $berjamaahCount = $prayerTrackings->sum(fn($t) => $t->total_berjamaah);
        $prayerPercentage = $totalPrayers > 0 ? round(($donePrayers / $totalPrayers) * 100) : 0;

        $sholatSubuh = $prayerTrackings->sum(fn($t) => $t->subuh_checked ? 1 : 0);
        $sholatDzuhur = $prayerTrackings->sum(fn($t) => $t->dzuhur_checked ? 1 : 0);
        $sholatAshar = $prayerTrackings->sum(fn($t) => $t->ashar_checked ? 1 : 0);
        $sholatMaghrib = $prayerTrackings->sum(fn($t) => $t->maghrib_checked ? 1 : 0);
        $sholatIsya = $prayerTrackings->sum(fn($t) => $t->isya_checked ? 1 : 0);

        $fridayPrayers = FridayPrayer::where('user_id', $user->id)
            ->whereBetween('date', [$monthStart, $today])
            ->count();

        $journals = Journal::where('user_id', $user->id)
            ->whereBetween('date', [$monthStart, $today])
            ->count();

        $quizResults = QuizResult::with('quiz:id,title,passing_score')
            ->where('user_id', $user->id)
            ->get();

        $materialsRead = MaterialReading::where('user_id', $user->id)
            ->whereBetween('created_at', [$monthStart, $today])
            ->count();

        $doaLearned = DoaTracking::where('user_id', $user->id)->count();

        // Points
        $sholatPoints = $donePrayers * 10;
        $materiPoints = $materialsRead * 15;
        $quizPoints = $quizResults->sum('score');
        $jurnalPoints = $journals * 5;
        $totalPoints = $sholatPoints + $materiPoints + $quizPoints + $jurnalPoints;

        // Weekly progress
        $weeklyProgress = [];
        for ($w = 3; $w >= 0; $w--) {
            $ws = now()->subWeeks($w)->startOfWeek()->toDateString();
            $we = now()->subWeeks($w)->endOfWeek()->toDateString();
            $wt = PrayerTracking::where('user_id', $user->id)
                ->whereBetween('date', [$ws, $we])->get();
            $totalW = $wt->count() * 5;
            $doneW = $wt->sum(fn($t) => $t->total_checked);
            $weeklyProgress[] = $totalW > 0 ? round(($doneW / $totalW) * 100) : 0;
        }

        return response()->json([
            'period' => ['from' => $monthStart, 'to' => $today],
            'total_sholat' => $donePrayers,
            'sholat_percentage' => $prayerPercentage,
            'sholat_subuh' => $sholatSubuh,
            'sholat_dzuhur' => $sholatDzuhur,
            'sholat_ashar' => $sholatAshar,
            'sholat_maghrib' => $sholatMaghrib,
            'sholat_isya' => $sholatIsya,
            'berjamaah_count' => $berjamaahCount,
            'friday_attendance' => $fridayPrayers,
            'total_quiz_taken' => $quizResults->count(),
            'avg_quiz_score' => round($quizResults->avg('score') ?? 0),
            'total_materials_read' => $materialsRead,
            'reading_points' => $materiPoints,
            'total_journals' => $journals,
            'journal_streak' => $journals,
            'total_doa_learned' => $doaLearned,
            'total_points' => $totalPoints,
            'weekly_progress' => $weeklyProgress,
            'quiz_results' => $quizResults,
        ]);
    }

    public function classReport(Request $request): JsonResponse
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to = $request->to ?? now()->toDateString();

        $query = User::siswa()->active();
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }
        $students = $query->get();

        $report = $students->map(function ($student) use ($from, $to) {
            $prayers = PrayerTracking::where('user_id', $student->id)
                ->whereBetween('date', [$from, $to])->get();
            $totalP = $prayers->count() * 5;
            $doneP = $prayers->sum(fn($t) => $t->total_checked);

            $friday = FridayPrayer::where('user_id', $student->id)
                ->whereBetween('date', [$from, $to])->count();

            $journals = Journal::where('user_id', $student->id)
                ->whereBetween('date', [$from, $to])->count();

            $quizzes = QuizResult::where('user_id', $student->id)
                ->whereBetween('created_at', [$from, $to])->get();

            return [
                'id' => $student->id,
                'name' => $student->name,
                'nisn' => $student->nisn,
                'class' => $student->class,
                'prayer_percentage' => $totalP > 0 ? round(($doneP / $totalP) * 100) : 0,
                'friday_count' => $friday,
                'journal_count' => $journals,
                'quiz_count' => $quizzes->count(),
                'quiz_avg' => round($quizzes->avg('score') ?? 0),
            ];
        });

        return response()->json(['report' => $report]);
    }

    public function studentDetail(Request $request, User $user): JsonResponse
    {
        if ($user->role !== 'siswa') {
            return response()->json(['message' => 'Bukan siswa'], 404);
        }

        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to = $request->to ?? now()->toDateString();

        $prayerTrackings = PrayerTracking::where('user_id', $user->id)
            ->whereBetween('date', [$from, $to])
            ->orderBy('date')
            ->get();

        $totalP = $prayerTrackings->count() * 5;
        $doneP = $prayerTrackings->sum(fn($t) => $t->total_checked);

        $fridayPrayers = FridayPrayer::with('sermonTopic')
            ->where('user_id', $user->id)
            ->whereBetween('date', [$from, $to])
            ->get();

        $journals = Journal::where('user_id', $user->id)
            ->whereBetween('date', [$from, $to])
            ->orderBy('date', 'desc')
            ->get();

        $quizResults = QuizResult::with('quiz:id,title,passing_score')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'student' => $user,
            'total_sholat' => $doneP,
            'sholat_percentage' => $totalP > 0 ? round(($doneP / $totalP) * 100) : 0,
            'total_quiz_taken' => $quizResults->count(),
            'avg_quiz_score' => round($quizResults->avg('score') ?? 0),
            'total_journals' => $journals->count(),
            'total_materials_read' => 0,
            'friday_attendance' => $fridayPrayers->count(),
            'prayer_trackings' => $prayerTrackings,
            'friday_prayers' => $fridayPrayers,
            'journals' => $journals,
            'quiz_results' => $quizResults,
        ]);
    }

    public function export(Request $request): JsonResponse
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to = $request->to ?? now()->toDateString();

        $students = User::siswa()->active()->get();
        $rows = [];

        foreach ($students as $student) {
            if ($request->filled('class_id') && $student->class_id != $request->class_id) continue;

            $prayers = PrayerTracking::where('user_id', $student->id)
                ->whereBetween('date', [$from, $to])->get();
            $totalP = $prayers->count() * 5;
            $doneP = $prayers->sum(fn($t) => $t->total_checked);

            $rows[] = [
                'Nama' => $student->name,
                'NISN' => $student->nisn,
                'Kelas' => $student->class,
                'Persentase Shalat' => $totalP > 0 ? round(($doneP / $totalP) * 100) . '%' : '0%',
                'Jumlah Jumat' => FridayPrayer::where('user_id', $student->id)->whereBetween('date', [$from, $to])->count(),
                'Jurnal' => Journal::where('user_id', $student->id)->whereBetween('date', [$from, $to])->count(),
            ];
        }

        return response()->json(['data' => $rows]);
    }

    public function exportPdf(Request $request)
    {
        $user = $request->user();
        $today = now()->toDateString();
        $monthStart = now()->startOfMonth()->toDateString();

        $prayerTrackings = PrayerTracking::where('user_id', $user->id)
            ->whereBetween('date', [$monthStart, $today])->get();
        $totalP = $prayerTrackings->count() * 5;
        $doneP = $prayerTrackings->sum(fn($t) => $t->total_checked);

        $quizResults = QuizResult::where('user_id', $user->id)->get();
        $journals = Journal::where('user_id', $user->id)
            ->whereBetween('date', [$monthStart, $today])->count();
        $friday = FridayPrayer::where('user_id', $user->id)
            ->whereBetween('date', [$monthStart, $today])->count();

        $data = [
            'user' => $user,
            'date' => $today,
            'sholat_percentage' => $totalP > 0 ? round(($doneP / $totalP) * 100) : 0,
            'done_prayers' => $doneP,
            'total_prayers' => $totalP,
            'quiz_taken' => $quizResults->count(),
            'avg_score' => round($quizResults->avg('score') ?? 0),
            'journals' => $journals,
            'friday' => $friday,
        ];

        $pdf = Pdf::loadView('pdfs.student-report', $data);
        return $pdf->download('laporan-ramadan-' . $user->name . '-' . $today . '.pdf');
    }
}