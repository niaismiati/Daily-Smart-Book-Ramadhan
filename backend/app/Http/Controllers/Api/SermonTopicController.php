<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SermonTopic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SermonTopicController extends Controller
{
    public function index(): JsonResponse
    {
        $topics = SermonTopic::with('creator:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['topics' => $topics]);
    }

    public function active(): JsonResponse
    {
        $topics = SermonTopic::active()
            ->orderBy('created_at', 'desc')
            ->get(['id', 'title', 'description']);

        return response()->json(['topics' => $topics]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $topic = SermonTopic::create([
            'title' => $request->title,
            'description' => $request->description ?? '',
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Materi khotbah berhasil ditambahkan',
            'topic' => $topic->load('creator:id,name'),
        ], 201);
    }

    public function update(Request $request, SermonTopic $sermonTopic): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $sermonTopic->update($request->only('title', 'description', 'is_active'));

        return response()->json([
            'message' => 'Materi khotbah berhasil diubah',
            'topic' => $sermonTopic->fresh()->load('creator:id,name'),
        ]);
    }

    public function destroy(SermonTopic $sermonTopic): JsonResponse
    {
        $sermonTopic->delete();

        return response()->json([
            'message' => 'Materi khotbah berhasil dihapus',
        ]);
    }
}
