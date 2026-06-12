<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FridayPrayer extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'khatib_name',
        'sermon_topic_id',
        'summary',
        'lesson',
        'teacher_comment',
        'teacher_score',
        'is_graded',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'is_graded' => 'boolean',
            'teacher_score' => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sermonTopic()
    {
        return $this->belongsTo(SermonTopic::class);
    }
}
