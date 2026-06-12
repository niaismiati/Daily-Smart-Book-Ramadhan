<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Answer;
use App\Models\Question;
use App\Models\Quiz;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuizManagementController extends Controller
{
    public function index(): JsonResponse
    {
        $quizzes = Quiz::withCount('questions')
            ->with('creator:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($quizzes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'time_limit' => 'nullable|integer|min:0',
            'passing_score' => 'nullable|integer|min:0|max:100',
        ]);

        $validated['created_by'] = $request->user()->id;
        $quiz = Quiz::create($validated);

        return response()->json(['message' => 'Quiz berhasil dibuat', 'quiz' => $quiz], 201);
    }

    public function show(Quiz $quiz): JsonResponse
    {
        $quiz->load(['questions.answers', 'creator:id,name']);
        return response()->json(['quiz' => $quiz]);
    }

    public function update(Request $request, Quiz $quiz): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'time_limit' => 'nullable|integer|min:0',
            'passing_score' => 'nullable|integer|min:0|max:100',
            'is_active' => 'sometimes|boolean',
        ]);

        $quiz->update($validated);

        return response()->json(['message' => 'Quiz berhasil diubah', 'quiz' => $quiz->fresh()]);
    }

    public function destroy(Quiz $quiz): JsonResponse
    {
        $quiz->questions()->delete();
        $quiz->delete();
        return response()->json(['message' => 'Quiz berhasil dihapus']);
    }

    public function addQuestion(Request $request, Quiz $quiz): JsonResponse
    {
        $validated = $request->validate([
            'question_text' => 'required|string',
            'points' => 'nullable|integer|min:1',
            'answers' => 'required|array|min:2',
            'answers.*.answer_text' => 'required|string',
            'answers.*.is_correct' => 'required|boolean',
        ]);

        $question = $quiz->questions()->create([
            'question_text' => $validated['question_text'],
            'points' => $validated['points'] ?? 1,
        ]);

        foreach ($validated['answers'] as $answerData) {
            $question->answers()->create($answerData);
        }

        return response()->json([
            'message' => 'Soal berhasil ditambahkan',
            'question' => $question->load('answers'),
        ], 201);
    }

    public function updateQuestion(Request $request, Question $question): JsonResponse
    {
        $validated = $request->validate([
            'question_text' => 'required|string',
            'points' => 'nullable|integer|min:1',
            'answers' => 'required|array|min:2',
            'answers.*.id' => 'nullable|exists:answers,id',
            'answers.*.answer_text' => 'required|string',
            'answers.*.is_correct' => 'required|boolean',
        ]);

        $question->update([
            'question_text' => $validated['question_text'],
            'points' => $validated['points'] ?? 1,
        ]);

        $existingIds = [];
        foreach ($validated['answers'] as $answerData) {
            if (isset($answerData['id'])) {
                Answer::where('id', $answerData['id'])->update($answerData);
                $existingIds[] = $answerData['id'];
            } else {
                $answer = $question->answers()->create($answerData);
                $existingIds[] = $answer->id;
            }
        }
        $question->answers()->whereNotIn('id', $existingIds)->delete();

        return response()->json([
            'message' => 'Soal berhasil diubah',
            'question' => $question->fresh()->load('answers'),
        ]);
    }

    public function deleteQuestion(Question $question): JsonResponse
    {
        $question->answers()->delete();
        $question->delete();
        return response()->json(['message' => 'Soal berhasil dihapus']);
    }

    public function results(Quiz $quiz): JsonResponse
    {
        $results = $quiz->results()->with('user:id,name,nisn,class')->orderBy('score', 'desc')->get();
        return response()->json(['results' => $results]);
    }
}
