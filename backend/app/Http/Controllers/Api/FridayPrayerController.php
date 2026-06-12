<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FridayPrayer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FridayPrayerController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date',
            'khatib_name' => 'required|string|max:255',
            'sermon_topic_id' => 'nullable|exists:sermon_topics,id',
            'summary' => 'required|string|min:10',
            'lesson' => 'nullable|string',
        ]);

        $fridayPrayer = FridayPrayer::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'date' => $request->date,
            ],
            [
                'khatib_name' => $request->khatib_name,
                'sermon_topic_id' => $request->sermon_topic_id,
                'summary' => $request->summary,
                'lesson' => $request->lesson ?? '',
            ]
        );

        return response()->json([
            'message' => 'Data Shalat Jumat tersimpan',
            'friday_prayer' => $fridayPrayer->load('sermonTopic'),
        ]);
    }

    public function show(Request $request): JsonResponse
    {
        $request->validate(['date' => 'required|date']);

        $fridayPrayer = FridayPrayer::with('sermonTopic')
            ->where('user_id', $request->user()->id)
            ->where('date', $request->date)
            ->first();

        return response()->json([
            'friday_prayer' => $fridayPrayer,
        ]);
    }
}
