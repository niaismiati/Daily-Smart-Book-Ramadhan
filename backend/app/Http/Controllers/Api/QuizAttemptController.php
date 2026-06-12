<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizResult;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuizAttemptController extends Controller
{
    public function start(Quiz $quiz): JsonResponse
    {
        $existing = QuizResult::where('user_id', request()->user()->id)
            ->where('quiz_id', $quiz->id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Anda sudah mengerjakan quiz ini',
                'result' => $existing,
            ]);
        }

        $quiz->load('questions.answers');

        return response()->json([
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'time_limit' => $quiz->time_limit,
                'questions_count' => $quiz->questions->count(),
                'total_points' => $quiz->questions->sum('points'),
            ],
            'questions' => $quiz->questions->map(function ($q) {
                return [
                    'id' => $q->id,
                    'question_text' => $q->question_text,
                    'points' => $q->points,
                    'answers' => $q->answers->map(function ($a) {
                        return ['id' => $a->id, 'answer_text' => $a->answer_text];
                    }),
                ];
            }),
        ]);
    }

    public function submit(Request $request, Quiz $quiz): JsonResponse
    {
        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:questions,id',
            'answers.*.answer_id' => 'required|exists:answers,id',
            'time_taken' => 'nullable|integer',
        ]);

        $existing = QuizResult::where('user_id', $request->user()->id)
            ->where('quiz_id', $quiz->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Anda sudah mengerjakan quiz ini']);
        }

        $quiz->load('questions.answers');
        $correctAnswers = 0;
        $totalPoints = 0;
        $earnedPoints = 0;

        foreach ($validated['answers'] as $submitted) {
            $question = $quiz->questions->find($submitted['question_id']);
            if (!$question) continue;

            $totalPoints += $question->points;
            $correctAnswer = $question->answers->where('is_correct', true)->first();

            if ($correctAnswer && $correctAnswer->id === $submitted['answer_id']) {
                $correctAnswers++;
                $earnedPoints += $question->points;
            }
        }

        $score = $totalPoints > 0 ? round(($earnedPoints / $totalPoints) * 100) : 0;

        $result = QuizResult::create([
            'user_id' => $request->user()->id,
            'quiz_id' => $quiz->id,
            'score' => $score,
            'total_questions' => $quiz->questions->count(),
            'correct_answers' => $correctAnswers,
            'time_taken' => $validated['time_taken'],
            'answers_data' => $validated['answers'],
            'started_at' => now()->subSeconds($validated['time_taken'] ?? 0),
            'finished_at' => now(),
        ]);

        return response()->json([
            'message' => 'Quiz selesai!',
            'result' => $result,
            'passed' => $score >= $quiz->passing_score,
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $results = QuizResult::with('quiz:id,title,passing_score')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($results);
    }
}
