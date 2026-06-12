<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    protected $fillable = [
        'title', 'description', 'time_limit', 'passing_score', 'is_active', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'time_limit' => 'integer',
            'passing_score' => 'integer',
        ];
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function results()
    {
        return $this->hasMany(QuizResult::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
