<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    protected $fillable = [
        'title', 'description', 'type', 'file_url', 'video_url',
        'thumbnail', 'category_id', 'created_by', 'is_active',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function category()
    {
        return $this->belongsTo(MaterialCategory::class, 'category_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function readings()
    {
        return $this->hasMany(MaterialReading::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
