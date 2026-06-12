<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Journal extends Model
{
    protected $fillable = [
        'user_id', 'date', 'content', 'mood', 'teacher_comment',
    ];

    protected function casts(): array
    {
        return ['date' => 'date:Y-m-d'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
