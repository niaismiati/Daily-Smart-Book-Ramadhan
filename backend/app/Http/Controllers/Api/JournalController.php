<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JournalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $journals = Journal::where('user_id', $request->user()->id)
            ->orderBy('date', 'desc')
            ->paginate(20);

        return response()->json($journals);
    }

    public function show(Journal $journal): JsonResponse
    {
        if ($journal->user_id !== request()->user()->id && request()->user()->role !== 'guru') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return response()->json(['journal' => $journal->load('user:id,name,nisn,class')]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'content' => 'required|string|min:10',
            'mood' => 'nullable|string|max:50',
        ]);

        $validated['user_id'] = $request->user()->id;

        $journal = Journal::updateOrCreate(
            ['user_id' => $request->user()->id, 'date' => $validated['date']],
            ['content' => $validated['content'], 'mood' => $validated['mood'] ?? null]
        );

        return response()->json([
            'message' => 'Jurnal berhasil disimpan',
            'journal' => $journal,
        ], 201);
    }

    public function update(Request $request, Journal $journal): JsonResponse
    {
        if ($journal->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string|min:10',
            'mood' => 'nullable|string|max:50',
        ]);

        $journal->update($validated);

        return response()->json(['message' => 'Jurnal berhasil diubah', 'journal' => $journal]);
    }

    public function destroy(Journal $journal): JsonResponse
    {
        if ($journal->user_id !== request()->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $journal->delete();
        return response()->json(['message' => 'Jurnal berhasil dihapus']);
    }

    public function teacherIndex(Request $request): JsonResponse
    {
        $query = Journal::with('user:id,name,nisn,class');

        if ($request->filled('class_id')) {
            $query->whereHas('user', fn($q) => $q->where('class_id', $request->class_id));
        }
        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $journals = $query->orderBy('date', 'desc')->paginate(20);

        return response()->json($journals);
    }

    public function teacherComment(Request $request, Journal $journal): JsonResponse
    {
        $request->validate(['teacher_comment' => 'required|string']);

        $journal->update(['teacher_comment' => $request->teacher_comment]);

        return response()->json([
            'message' => 'Komentar berhasil ditambahkan',
            'journal' => $journal->fresh()->load('user:id,name,nisn,class'),
        ]);
    }
}
