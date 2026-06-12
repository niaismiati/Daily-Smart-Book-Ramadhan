<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DoaMaterialController;
use App\Http\Controllers\Api\DoaTrackingController;
use App\Http\Controllers\Api\FridayPrayerController;
use App\Http\Controllers\Api\JournalController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PrayerScheduleController;
use App\Http\Controllers\Api\PrayerTrackingController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\QuizAttemptController;
use App\Http\Controllers\Api\QuizManagementController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SermonTopicController;
use App\Http\Controllers\Api\StudentManagementController;
use App\Http\Controllers\Api\TeacherController;
use Illuminate\Support\Facades\Route;

// ==================== PUBLIC ====================
Route::post('/auth/login', [AuthController::class, 'login']);

// ==================== AUTHENTICATED ====================
Route::middleware('auth:sanctum')->group(function () {

    // ---- AUTH ----
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // ---- PROFILE ----
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'changePassword']);
    Route::post('/profile/photo', [ProfileController::class, 'uploadPhoto']);

    // ---- DASHBOARD ----
    Route::get('/dashboard/student', [DashboardController::class, 'student']);
    Route::get('/dashboard/teacher', [DashboardController::class, 'teacher']);

    // ---- PRAYER TRACKING (Siswa) ----
    Route::get('/prayer-trackings', [PrayerTrackingController::class, 'show']);
    Route::put('/prayer-trackings', [PrayerTrackingController::class, 'update']);
    Route::get('/prayer-trackings/history', [PrayerTrackingController::class, 'history']);

    // ---- SERMON TOPICS ----
    Route::get('/sermon-topics/active', [SermonTopicController::class, 'active']);

    // ---- FRIDAY PRAYER ----
    Route::post('/friday-prayers', [FridayPrayerController::class, 'store']);
    Route::get('/friday-prayers', [FridayPrayerController::class, 'show']);

    // ---- DOA MATERIALS ----
    Route::get('/doa-materials', [DoaMaterialController::class, 'active']);

    // ---- DOA TRACKING ----
    Route::get('/doa-trackings', [DoaTrackingController::class, 'index']);
    Route::post('/doa-trackings/toggle', [DoaTrackingController::class, 'toggle']);

    // ---- JOURNALS (Siswa) ----
    Route::get('/journals', [JournalController::class, 'index']);
    Route::post('/journals', [JournalController::class, 'store']);
    Route::get('/journals/{journal}', [JournalController::class, 'show']);
    Route::put('/journals/{journal}', [JournalController::class, 'update']);
    Route::delete('/journals/{journal}', [JournalController::class, 'destroy']);

    // ---- MATERIALS (Siswa) ----
    Route::get('/materials', [MaterialController::class, 'index']);
    Route::get('/materials/{material}', [MaterialController::class, 'show']);
    Route::post('/materials/{material}/read', [MaterialController::class, 'markRead']);

    // ---- QUIZ ATTEMPT (Siswa) ----
    Route::get('/quizzes/active', [QuizAttemptController::class, 'index']);
    Route::get('/quizzes/{quiz}/start', [QuizAttemptController::class, 'start']);
    Route::post('/quizzes/{quiz}/submit', [QuizAttemptController::class, 'submit']);
    Route::get('/quiz-results/history', [QuizAttemptController::class, 'history']);

    // ---- REPORTS (Siswa) ----
    Route::get('/reports/my', [ReportController::class, 'studentReport']);
    Route::get('/reports/my/export-pdf', [ReportController::class, 'exportPdf']);

    // ---- PRAYER SCHEDULE ----
    Route::get('/prayer-schedule/today', [PrayerScheduleController::class, 'today']);

    // ---- NOTIFICATIONS ----
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    // ==================== GURU ONLY ====================
    Route::middleware('role:guru')->prefix('teacher')->group(function () {

        // Dashboard
        Route::get('/dashboard', [TeacherController::class, 'dashboard']);

        // Classes
        Route::get('/classes', [TeacherController::class, 'classes']);

        // Student Management (CRUD)
        Route::get('/students', [StudentManagementController::class, 'index']);
        Route::get('/students/{user}', [StudentManagementController::class, 'show']);
        Route::post('/students', [StudentManagementController::class, 'store']);
        Route::put('/students/{user}', [StudentManagementController::class, 'update']);
        Route::delete('/students/{user}', [StudentManagementController::class, 'destroy']);
        Route::post('/students/{user}/reset-password', [StudentManagementController::class, 'resetPassword']);
        Route::post('/students/import', [StudentManagementController::class, 'import']);
        Route::get('/students/export', [StudentManagementController::class, 'export']);

        // Prayer Recap
        Route::get('/prayer-recap', [TeacherController::class, 'prayerRecap']);

        // Friday Prayer
        Route::get('/friday-prayers', [TeacherController::class, 'fridayPrayers']);
        Route::post('/friday-prayers/{fridayPrayer}/grade', [TeacherController::class, 'gradeFridayPrayer']);

        // Doa Recap
        Route::get('/doa-recap', [TeacherController::class, 'doaRecap']);

        // Sermon Topics (CRUD)
        Route::get('/sermon-topics', [SermonTopicController::class, 'index']);
        Route::post('/sermon-topics', [SermonTopicController::class, 'store']);
        Route::put('/sermon-topics/{sermonTopic}', [SermonTopicController::class, 'update']);
        Route::delete('/sermon-topics/{sermonTopic}', [SermonTopicController::class, 'destroy']);

        // Doa Materials (CRUD)
        Route::get('/doa-materials', [DoaMaterialController::class, 'index']);
        Route::post('/doa-materials', [DoaMaterialController::class, 'store']);
        Route::put('/doa-materials/{doaMaterial}', [DoaMaterialController::class, 'update']);
        Route::delete('/doa-materials/{doaMaterial}', [DoaMaterialController::class, 'destroy']);

        // Materials (CRUD)
        Route::post('/materials', [MaterialController::class, 'store']);
        Route::put('/materials/{material}', [MaterialController::class, 'update']);
        Route::delete('/materials/{material}', [MaterialController::class, 'destroy']);
        Route::post('/materials/upload', [MaterialController::class, 'uploadFile']);

        // Material Categories
        Route::get('/material-categories', [MaterialController::class, 'categories']);
        Route::post('/material-categories', [MaterialController::class, 'storeCategory']);
        Route::delete('/material-categories/{materialCategory}', [MaterialController::class, 'deleteCategory']);

        // Quiz Management (CRUD)
        Route::get('/quizzes', [QuizManagementController::class, 'index']);
        Route::post('/quizzes', [QuizManagementController::class, 'store']);
        Route::get('/quizzes/{quiz}', [QuizManagementController::class, 'show']);
        Route::put('/quizzes/{quiz}', [QuizManagementController::class, 'update']);
        Route::delete('/quizzes/{quiz}', [QuizManagementController::class, 'destroy']);

        // Quiz Questions
        Route::post('/quizzes/{quiz}/questions', [QuizManagementController::class, 'addQuestion']);
        Route::put('/questions/{question}', [QuizManagementController::class, 'updateQuestion']);
        Route::delete('/questions/{question}', [QuizManagementController::class, 'deleteQuestion']);

        // Quiz Results
        Route::get('/quizzes/{quiz}/results', [QuizManagementController::class, 'results']);

        // Reports
        Route::get('/reports/class', [ReportController::class, 'classReport']);
        Route::get('/reports/student/{user}', [ReportController::class, 'studentDetail']);
        Route::get('/reports/export', [ReportController::class, 'export']);

        // Journal Monitoring
        Route::get('/journals', [JournalController::class, 'teacherIndex']);
        Route::post('/journals/{journal}/comment', [JournalController::class, 'teacherComment']);

        // Prayer Schedule
        Route::post('/prayer-schedule', [PrayerScheduleController::class, 'store']);
        Route::put('/prayer-schedule/{prayerSchedule}', [PrayerScheduleController::class, 'update']);

        // User Management (Create Guru & Siswa)
        Route::post('/users', [TeacherController::class, 'createUser']);
        Route::put('/users/{user}', [TeacherController::class, 'updateUser']);
        Route::delete('/users/{user}', [TeacherController::class, 'deleteUser']);

        // Notifications
        Route::post('/notifications', [NotificationController::class, 'store']);
        Route::delete('/notifications/{notification}', [NotificationController::class, 'delete']);
    });
});
