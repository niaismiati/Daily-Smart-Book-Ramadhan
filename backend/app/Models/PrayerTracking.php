<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrayerTracking extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'subuh_checked',
        'subuh_berjamaah',
        'dzuhur_checked',
        'dzuhur_berjamaah',
        'ashar_checked',
        'ashar_berjamaah',
        'maghrib_checked',
        'maghrib_berjamaah',
        'isya_checked',
        'isya_berjamaah',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'subuh_checked' => 'boolean',
            'subuh_berjamaah' => 'boolean',
            'dzuhur_checked' => 'boolean',
            'dzuhur_berjamaah' => 'boolean',
            'ashar_checked' => 'boolean',
            'ashar_berjamaah' => 'boolean',
            'maghrib_checked' => 'boolean',
            'maghrib_berjamaah' => 'boolean',
            'isya_checked' => 'boolean',
            'isya_berjamaah' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getTotalCheckedAttribute(): int
    {
        $count = 0;
        foreach (['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'] as $prayer) {
            if ($this->{$prayer . '_checked'}) $count++;
        }
        return $count;
    }

    public function getTotalBerjamaahAttribute(): int
    {
        $count = 0;
        foreach (['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'] as $prayer) {
            if ($this->{$prayer . '_berjamaah'}) $count++;
        }
        return $count;
    }
}
