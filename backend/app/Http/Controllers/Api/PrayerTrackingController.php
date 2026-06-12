<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PrayerTracking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrayerTrackingController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $request->validate(['date' => 'required|date']);

        $tracking = PrayerTracking::firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'date' => $request->date,
            ],
            [
                'subuh_checked' => false,
                'subuh_berjamaah' => false,
                'dzuhur_checked' => false,
                'dzuhur_berjamaah' => false,
                'ashar_checked' => false,
                'ashar_berjamaah' => false,
                'maghrib_checked' => false,
                'maghrib_berjamaah' => false,
                'isya_checked' => false,
                'isya_berjamaah' => false,
            ]
        );

        // Get Friday prayer data for the same date
        $fridayPrayer = \App\Models\FridayPrayer::where('user_id', $request->user()->id)
            ->where('date', $request->date)
            ->first();

        return response()->json([
            'tracking' => $tracking,
            'friday_prayer' => $fridayPrayer,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date',
            'prayer' => 'required|in:subuh,dzuhur,ashar,maghrib,isya',
            'checked' => 'required|boolean',
            'berjamaah' => 'boolean',
        ]);

        $tracking = PrayerTracking::firstOrCreate(
            ['user_id' => $request->user()->id, 'date' => $request->date],
            [
                'subuh_checked' => false,
                'subuh_berjamaah' => false,
                'dzuhur_checked' => false,
                'dzuhur_berjamaah' => false,
                'ashar_checked' => false,
                'ashar_berjamaah' => false,
                'maghrib_checked' => false,
                'maghrib_berjamaah' => false,
                'isya_checked' => false,
                'isya_berjamaah' => false,
            ]
        );

        $prayer = $request->prayer;
        $tracking->{$prayer . '_checked'} = $request->checked;
        if ($request->has('berjamaah')) {
            $tracking->{$prayer . '_berjamaah'} = $request->berjamaah;
        }
        $tracking->save();

        return response()->json([
            'message' => 'Data shalat tersimpan',
            'tracking' => $tracking->fresh(),
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
        ]);

        $trackings = PrayerTracking::where('user_id', $request->user()->id)
            ->whereBetween('date', [$request->from, $request->to])
            ->orderBy('date')
            ->get();

        return response()->json(['trackings' => $trackings]);
    }
}
