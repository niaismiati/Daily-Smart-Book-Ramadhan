<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizResult extends Model
{
    protected $fillable = [
        'user_id', 'quiz_id', 'score', 'total_questions', 'correct_answers',
        'time_taken', 'answers_data', 'started_at', 'finished_at',
    ];

    protected function casts(): array
    {
        return [
            'answers_data' => 'array',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
            'score' => 'integer',
            'total_questions' => 'integer',
            'correct_answers' => 'integer',
            'time_taken' => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function isPassed(): bool
    {
        return $this->score >= ($this->quiz->passing_score ?? 70);
    }
}
