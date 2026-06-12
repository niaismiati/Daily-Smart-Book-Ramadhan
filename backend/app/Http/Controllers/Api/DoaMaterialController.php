<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DoaMaterial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoaMaterialController extends Controller
{
    public function index(): JsonResponse
    {
        $materials = DoaMaterial::with('creator:id,name')
            ->orderBy('category')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['materials' => $materials]);
    }

    public function active(): JsonResponse
    {
        $materials = DoaMaterial::active()
            ->orderBy('category')
            ->get();

        return response()->json(['materials' => $materials]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'arabic_text' => 'required|string',
            'latin_text' => 'required|string',
            'translation' => 'required|string',
            'audio_url' => 'nullable|string',
            'category' => 'required|in:niat_puasa,berbuka,after_berbuka,sahur,lailatul_qadar',
        ]);

        $material = DoaMaterial::create([
            'title' => $request->title,
            'arabic_text' => $request->arabic_text,
            'latin_text' => $request->latin_text,
            'translation' => $request->translation,
            'audio_url' => $request->audio_url,
            'category' => $request->category,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Materi doa berhasil ditambahkan',
            'material' => $material->load('creator:id,name'),
        ], 201);
    }

    public function update(Request $request, DoaMaterial $doaMaterial): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'arabic_text' => 'required|string',
            'latin_text' => 'required|string',
            'translation' => 'required|string',
            'audio_url' => 'nullable|string',
            'category' => 'required|in:niat_puasa,berbuka,after_berbuka,sahur,lailatul_qadar',
            'is_active' => 'boolean',
        ]);

        $doaMaterial->update($request->only(
            'title', 'arabic_text', 'latin_text', 'translation',
            'audio_url', 'category', 'is_active'
        ));

        return response()->json([
            'message' => 'Materi doa berhasil diubah',
            'material' => $doaMaterial->fresh()->load('creator:id,name'),
        ]);
    }

    public function destroy(DoaMaterial $doaMaterial): JsonResponse
    {
        $doaMaterial->delete();

        return response()->json([
            'message' => 'Materi doa berhasil dihapus',
        ]);
    }
}
