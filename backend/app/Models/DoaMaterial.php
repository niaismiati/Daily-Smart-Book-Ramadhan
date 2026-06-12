<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoaMaterial extends Model
{
    protected $fillable = [
        'title',
        'arabic_text',
        'latin_text',
        'translation',
        'audio_url',
        'category',
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

    public function trackings()
    {
        return $this->hasMany(DoaTracking::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
