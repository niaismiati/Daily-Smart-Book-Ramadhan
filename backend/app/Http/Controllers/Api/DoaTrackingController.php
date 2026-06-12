<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DoaTracking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoaTrackingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $trackings = DoaTracking::with('doaMaterial')
            ->where('user_id', $request->user()->id)
            ->get()
            ->keyBy('doa_material_id');

        return response()->json(['trackings' => $trackings]);
    }

    public function toggle(Request $request): JsonResponse
    {
        $request->validate([
            'doa_material_id' => 'required|exists:doa_materials,id',
            'memorized' => 'required|boolean',
        ]);

        $tracking = DoaTracking::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'doa_material_id' => $request->doa_material_id,
            ],
            [
                'memorized' => $request->memorized,
                'read_at' => $request->memorized ? now() : null,
            ]
        );

        return response()->json([
            'message' => $request->memorized
                ? 'Doa ditandai sudah dihafal'
                : 'Doa ditandai belum dihafal',
            'tracking' => $tracking->load('doaMaterial'),
        ]);
    }
}
