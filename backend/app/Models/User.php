<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'nisn',
        'nip',
        'class',
        'phone',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function prayerTrackings()
    {
        return $this->hasMany(PrayerTracking::class);
    }

    public function fridayPrayers()
    {
        return $this->hasMany(FridayPrayer::class);
    }

    public function doaTrackings()
    {
        return $this->hasMany(DoaTracking::class);
    }

    public function createdSermonTopics()
    {
        return $this->hasMany(SermonTopic::class, 'created_by');
    }

    public function createdDoaMaterials()
    {
        return $this->hasMany(DoaMaterial::class, 'created_by');
    }

    public function scopeSiswa($query)
    {
        return $query->where('role', 'siswa');
    }

    public function scopeGuru($query)
    {
        return $query->where('role', 'guru');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
