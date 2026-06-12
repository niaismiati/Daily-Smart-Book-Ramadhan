<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaterialReading extends Model
{
    protected $fillable = ['user_id', 'material_id', 'read_at'];

    protected function casts(): array
    {
        return ['read_at' => 'datetime'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function material()
    {
        return $this->belongsTo(Material::class);
    }
}
