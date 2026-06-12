<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PrayerSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrayerScheduleController extends Controller
{
    public function today(): JsonResponse
    {
        $schedule = PrayerSchedule::whereDate('date', now()->toDateString())->first();

        if (!$schedule) {
            return response()->json([
                'schedule' => [
                    'date' => now()->toDateString(),
                    'imsak' => '04:20',
                    'subuh' => '04:30',
                    'dzuhur' => '11:45',
                    'ashar' => '15:05',
                    'maghrib' => '17:45',
                    'isya' => '19:00',
                ],
                'note' => 'Jadwal default, sesuaikan dengan lokasi Anda',
            ]);
        }

        return response()->json(['schedule' => $schedule]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => 'required|date|unique:prayer_schedules,date',
            'imsak' => 'required|string',
            'subuh' => 'required|string',
            'dzuhur' => 'required|string',
            'ashar' => 'required|string',
            'maghrib' => 'required|string',
            'isya' => 'required|string',
        ]);

        $schedule = PrayerSchedule::create($validated);

        return response()->json(['message' => 'Jadwal shalat disimpan', 'schedule' => $schedule], 201);
    }

    public function update(Request $request, PrayerSchedule $prayerSchedule): JsonResponse
    {
        $validated = $request->validate([
            'imsak' => 'sometimes|string',
            'subuh' => 'sometimes|string',
            'dzuhur' => 'sometimes|string',
            'ashar' => 'sometimes|string',
            'maghrib' => 'sometimes|string',
            'isya' => 'sometimes|string',
        ]);

        $prayerSchedule->update($validated);

        return response()->json(['message' => 'Jadwal shalat diubah', 'schedule' => $prayerSchedule->fresh()]);
    }
}
