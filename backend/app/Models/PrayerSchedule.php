<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrayerSchedule extends Model
{
    protected $fillable = [
        'date', 'imsak', 'subuh', 'dzuhur', 'ashar', 'maghrib', 'isya',
    ];

    protected function casts(): array
    {
        return ['date' => 'date:Y-m-d'];
    }
}
