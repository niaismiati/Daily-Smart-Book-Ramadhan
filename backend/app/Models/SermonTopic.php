<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SermonTopic extends Model
{
    protected $fillable = [
        'title',
        'description',
        'created_by',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function fridayPrayers()
    {
        return $this->hasMany(FridayPrayer::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
