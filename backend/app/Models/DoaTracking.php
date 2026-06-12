<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoaTracking extends Model
{
    protected $fillable = [
        'user_id',
        'doa_material_id',
        'memorized',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'memorized' => 'boolean',
            'read_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function doaMaterial()
    {
        return $this->belongsTo(DoaMaterial::class);
    }
}
