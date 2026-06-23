import { useEffect, useState, useMemo, useCallback } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Clock, MapPin, Sun, Moon, Sunrise, Sunset, Navigation, ChevronDown } from 'lucide-react';
import { getTodayStr } from '../../utils/date';

const prayerIcons: Record<string, any> = {
  imsak: Clock, subuh: Sunrise, dzuhur: Sun, ashar: Sun, maghrib: Sunset, isya: Moon,
};

const INDONESIAN_CITIES = [
  { province: 'Aceh', city: 'Banda Aceh', lat: 5.5483, lon: 95.3238 },
  { province: 'Aceh', city: 'Lhokseumawe', lat: 5.1801, lon: 97.1507 },
  { province: 'Sumatera Utara', city: 'Medan', lat: 3.5952, lon: 98.6722 },
  { province: 'Sumatera Utara', city: 'Binjai', lat: 3.6134, lon: 98.4969 },
  { province: 'Sumatera Barat', city: 'Padang', lat: -0.9471, lon: 100.4172 },
  { province: 'Sumatera Barat', city: 'Bukittinggi', lat: -0.3039, lon: 100.3707 },
  { province: 'Riau', city: 'Pekanbaru', lat: 0.5071, lon: 101.4478 },
  { province: 'Riau', city: 'Dumai', lat: 1.6656, lon: 101.4473 },
  { province: 'Kepulauan Riau', city: 'Tanjung Pinang', lat: 0.9224, lon: 104.4844 },
  { province: 'Kepulauan Riau', city: 'Batam', lat: 1.1301, lon: 104.0528 },
  { province: 'Jambi', city: 'Jambi', lat: -1.6101, lon: 103.6131 },
  { province: 'Bengkulu', city: 'Bengkulu', lat: -3.7928, lon: 102.2608 },
  { province: 'Sumatera Selatan', city: 'Palembang', lat: -2.9761, lon: 104.7754 },
  { province: 'Sumatera Selatan', city: 'Lubuklinggau', lat: -3.2967, lon: 102.8614 },
  { province: 'Bangka Belitung', city: 'Pangkal Pinang', lat: -2.1320, lon: 106.1140 },
  { province: 'Lampung', city: 'Bandar Lampung', lat: -5.4290, lon: 105.2616 },
  { province: 'Lampung', city: 'Metro', lat: -5.1133, lon: 105.3075 },
  { province: 'Banten', city: 'Serang', lat: -6.1201, lon: 106.1503 },
  { province: 'Banten', city: 'Tangerang', lat: -6.1702, lon: 106.6233 },
  { province: 'Banten', city: 'Cilegon', lat: -6.0366, lon: 106.0308 },
  { province: 'Jakarta', city: 'Jakarta', lat: -6.2088, lon: 106.8456 },
  { province: 'Jakarta', city: 'Jakarta Pusat', lat: -6.1818, lon: 106.8340 },
  { province: 'Jakarta', city: 'Jakarta Selatan', lat: -6.2615, lon: 106.8103 },
  { province: 'Jakarta', city: 'Jakarta Timur', lat: -6.2250, lon: 106.9004 },
  { province: 'Jakarta', city: 'Jakarta Barat', lat: -6.1674, lon: 106.7583 },
  { province: 'Jakarta', city: 'Jakarta Utara', lat: -6.1303, lon: 106.8877 },
  { province: 'Jawa Barat', city: 'Bandung', lat: -6.9175, lon: 107.6191 },
  { province: 'Jawa Barat', city: 'Bogor', lat: -6.5944, lon: 106.7890 },
  { province: 'Jawa Barat', city: 'Bekasi', lat: -6.2411, lon: 106.9917 },
  { province: 'Jawa Barat', city: 'Depok', lat: -6.3948, lon: 106.8226 },
  { province: 'Jawa Barat', city: 'Cimahi', lat: -6.8722, lon: 107.5421 },
  { province: 'Jawa Barat', city: 'Tasikmalaya', lat: -7.3272, lon: 108.2220 },
  { province: 'Jawa Barat', city: 'Cirebon', lat: -6.7060, lon: 108.5570 },
  { province: 'Jawa Barat', city: 'Sukabumi', lat: -6.9237, lon: 106.9308 },
  { province: 'Jawa Barat', city: 'Garut', lat: -7.2167, lon: 107.9083 },
  { province: 'Jawa Tengah', city: 'Semarang', lat: -6.9932, lon: 110.4203 },
  { province: 'Jawa Tengah', city: 'Surakarta', lat: -7.5569, lon: 110.8315 },
  { province: 'Jawa Tengah', city: 'Magelang', lat: -7.4799, lon: 110.2177 },
  { province: 'Jawa Tengah', city: 'Pekalongan', lat: -6.8886, lon: 109.6753 },
  { province: 'Jawa Tengah', city: 'Tegal', lat: -6.8686, lon: 109.1152 },
  { province: 'Jawa Tengah', city: 'Salatiga', lat: -7.3305, lon: 110.5084 },
  { province: 'Jawa Tengah', city: 'Purwokerto', lat: -7.4222, lon: 109.2392 },
  { province: 'DI Yogyakarta', city: 'Yogyakarta', lat: -7.7956, lon: 110.3695 },
  { province: 'DI Yogyakarta', city: 'Sleman', lat: -7.7149, lon: 110.3560 },
  { province: 'DI Yogyakarta', city: 'Bantul', lat: -7.8846, lon: 110.3289 },
  { province: 'Jawa Timur', city: 'Surabaya', lat: -7.2504, lon: 112.7688 },
  { province: 'Jawa Timur', city: 'Malang', lat: -7.9797, lon: 112.6304 },
  { province: 'Jawa Timur', city: 'Sidoarjo', lat: -7.4530, lon: 112.7185 },
  { province: 'Jawa Timur', city: 'Madiun', lat: -7.6310, lon: 111.5234 },
  { province: 'Jawa Timur', city: 'Kediri', lat: -7.8183, lon: 112.0159 },
  { province: 'Jawa Timur', city: 'Blitar', lat: -8.0955, lon: 112.1612 },
  { province: 'Jawa Timur', city: 'Jember', lat: -8.1727, lon: 113.6964 },
  { province: 'Jawa Timur', city: 'Banyuwangi', lat: -8.2191, lon: 114.3691 },
  { province: 'Jawa Timur', city: 'Pasuruan', lat: -7.6458, lon: 112.9086 },
  { province: 'Jawa Timur', city: 'Probolinggo', lat: -7.7505, lon: 113.2135 },
  { province: 'Jawa Timur', city: 'Gresik', lat: -7.1564, lon: 112.6562 },
  { province: 'Bali', city: 'Denpasar', lat: -8.6521, lon: 115.2167 },
  { province: 'Bali', city: 'Singaraja', lat: -8.1120, lon: 115.0882 },
  { province: 'NTB', city: 'Mataram', lat: -8.5833, lon: 116.1167 },
  { province: 'NTB', city: 'Bima', lat: -8.4601, lon: 118.7267 },
  { province: 'NTT', city: 'Kupang', lat: -10.1772, lon: 123.6070 },
  { province: 'NTT', city: 'Ende', lat: -8.8432, lon: 121.6627 },
  { province: 'NTT', city: 'Maumere', lat: -8.6186, lon: 122.2123 },
  { province: 'Kalimantan Barat', city: 'Pontianak', lat: -0.0221, lon: 109.3425 },
  { province: 'Kalimantan Barat', city: 'Singkawang', lat: 0.9145, lon: 108.9858 },
  { province: 'Kalimantan Tengah', city: 'Palangka Raya', lat: -2.2102, lon: 113.9133 },
  { province: 'Kalimantan Selatan', city: 'Banjarmasin', lat: -3.3186, lon: 114.5944 },
  { province: 'Kalimantan Selatan', city: 'Banjarbaru', lat: -3.4429, lon: 114.8324 },
  { province: 'Kalimantan Timur', city: 'Samarinda', lat: -0.4948, lon: 117.1477 },
  { province: 'Kalimantan Timur', city: 'Balikpapan', lat: -1.2379, lon: 116.8529 },
  { province: 'Kalimantan Timur', city: 'Bontang', lat: 0.1317, lon: 117.4815 },
  { province: 'Kalimantan Utara', city: 'Tarakan', lat: 3.3082, lon: 117.5889 },
  { province: 'Sulawesi Utara', city: 'Manado', lat: 1.4903, lon: 124.8404 },
  { province: 'Sulawesi Utara', city: 'Bitung', lat: 1.4425, lon: 125.1884 },
  { province: 'Sulawesi Tengah', city: 'Palu', lat: -0.8910, lon: 119.8707 },
  { province: 'Sulawesi Tengah', city: 'Poso', lat: -1.3955, lon: 120.7509 },
  { province: 'Sulawesi Selatan', city: 'Makassar', lat: -5.1477, lon: 119.4322 },
  { province: 'Sulawesi Selatan', city: 'Parepare', lat: -4.0126, lon: 119.6190 },
  { province: 'Sulawesi Selatan', city: 'Palopo', lat: -2.9928, lon: 120.1958 },
  { province: 'Sulawesi Tenggara', city: 'Kendari', lat: -3.9681, lon: 122.5963 },
  { province: 'Sulawesi Barat', city: 'Mamuju', lat: -2.6797, lon: 118.8867 },
  { province: 'Gorontalo', city: 'Gorontalo', lat: 0.5435, lon: 123.0568 },
  { province: 'Maluku', city: 'Ambon', lat: -3.6554, lon: 128.1908 },
  { province: 'Maluku Utara', city: 'Ternate', lat: 0.7900, lon: 127.3840 },
  { province: 'Papua', city: 'Jayapura', lat: -2.5337, lon: 140.7181 },
  { province: 'Papua', city: 'Merauke', lat: -8.4932, lon: 140.4013 },
  { province: 'Papua Barat', city: 'Manokwari', lat: -0.8623, lon: 134.0620 },
  { province: 'Papua Barat', city: 'Sorong', lat: -0.8686, lon: 131.2545 },
];

const provinces = [...new Set(INDONESIAN_CITIES.map((c) => c.province))].sort();

function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-secondary/60 rounded-xl" />
      <div className="h-40 bg-secondary/40 rounded-3xl" />
      <div className="flex gap-2">
        <div className="flex-1 h-12 bg-secondary/60 rounded-xl" />
        <div className="flex-1 h-12 bg-secondary/60 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 bg-secondary/40 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function PrayerSchedulePage() {
  const { t } = useLanguage();
  const [schedules, setSchedules] = useState<{ name: string; time: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(getTodayStr());
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'granted' | 'denied' | 'unavailable'>('loading');
  const [cityName, setCityName] = useState('');

  const prayerLabels: Record<string, string> = {
    imsak: t.imsak, subuh: t.fajr, dzuhur: t.dhuhr, ashar: t.asr, maghrib: t.maghrib, isya: t.isha,
  };

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLon(position.coords.longitude);
        setLocationStatus('granted');
        const nearest = INDONESIAN_CITIES.reduce((prev, curr) => {
          const prevDist = Math.pow(prev.lat - position.coords.latitude, 2) + Math.pow(prev.lon - position.coords.longitude, 2);
          const currDist = Math.pow(curr.lat - position.coords.latitude, 2) + Math.pow(curr.lon - position.coords.longitude, 2);
          return currDist < prevDist ? curr : prev;
        });
        setSelectedProvince(nearest.province);
        setSelectedCity(nearest.city);
        setCityName(nearest.city);
      },
      () => {
        setLocationStatus('denied');
        const stored = localStorage.getItem('prayer_city');
        if (stored) {
          try {
            const c = JSON.parse(stored);
            setSelectedProvince(c.province);
            setSelectedCity(c.city);
            setCityName(c.city);
          } catch { }
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  useEffect(() => {
    if (selectedCity) {
      localStorage.setItem('prayer_city', JSON.stringify({ province: selectedProvince, city: selectedCity }));
      setCityName(selectedCity);
    }
  }, [selectedCity, selectedProvince]);

  useEffect(() => {
    if (selectedProvince && selectedCity) {
      loadSchedule();
    } else if (locationStatus === 'denied' && !selectedCity) {
      setLoading(false);
    }
  }, [selectedProvince, selectedCity, date, locationStatus]);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const cityData = INDONESIAN_CITIES.find((c) => c.city === selectedCity && c.province === selectedProvince);
      const latitude = lat || cityData?.lat || -6.2088;
      const longitude = lon || cityData?.lon || 106.8456;

      const formattedDate = date.replace(/-/g, '/');
      const res = await fetch(`https://api.aladhan.com/v1/timings/${formattedDate}?latitude=${latitude}&longitude=${longitude}&method=11&adjustment=1`);
      const json = await res.json();
      if (json.code === 200) {
        const t = json.data.timings;
        const scheduleList = [
          { name: 'imsak', time: t.Imsak },
          { name: 'subuh', time: t.Fajr },
          { name: 'dzuhur', time: t.Dhuhr },
          { name: 'ashar', time: t.Asr },
          { name: 'maghrib', time: t.Maghrib },
          { name: 'isya', time: t.Isha },
        ];
        setSchedules(scheduleList);
      } else {
        throw new Error('API error');
      }
    } catch {
      const fallback = [
        { name: 'imsak', time: '04:15' },
        { name: 'subuh', time: '04:30' },
        { name: 'dzuhur', time: '12:00' },
        { name: 'ashar', time: '15:15' },
        { name: 'maghrib', time: '18:00' },
        { name: 'isya', time: '19:30' },
      ];
      setSchedules(fallback);
    } finally {
      setLoading(false);
    }
  };

  const nextPrayer = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return schedules.find((s) => {
      const [h, m] = s.time.split(':').map(Number);
      const prayerMinutes = h * 60 + m;
      return prayerMinutes > currentMinutes;
    });
  }, [schedules]);

  const filteredCities = useMemo(() => {
    if (!selectedProvince) return [];
    return INDONESIAN_CITIES.filter((c) => c.province === selectedProvince);
  }, [selectedProvince]);

  if (loading && schedules.length === 0) return <SkeletonLoader />;

  return (
    <div className="space-y-6">
      <div><h2 className="text-3xl font-bold text-foreground">{t.prayerPageTitle}</h2><p className="text-muted-foreground mt-1">{t.prayerPageSubtitle}{cityName ? ` — ${cityName}` : ''}</p></div>

      {/* Next Prayer */}
      <div className="bg-gradient-to-br from-accent to-accent/80 rounded-3xl p-6 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">{t.nextPrayerTime}</p>
            {nextPrayer ? (
              <>
                <p className="text-3xl font-bold mt-1">{prayerLabels[nextPrayer.name] || nextPrayer.name}</p>
                <p className="text-5xl font-bold mt-2">{nextPrayer.time}</p>
                <p className="text-white/70 text-sm mt-1">WIB — {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </>
            ) : (
              <>
                <p className="text-xl font-bold mt-1">{t.allPrayersComplete}</p>
                <p className="text-white/70 text-sm mt-1">{t.tomorrow} — {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </>
            )}
          </div>
          <Clock className="w-16 h-16 text-white/30" />
        </div>
      </div>

      {/* Location Status */}
      {locationStatus === 'loading' && (
        <div className="flex items-center gap-3 p-3 bg-accent/5 border border-accent/20 rounded-xl text-sm text-accent">
          <Navigation className="w-4 h-4 animate-pulse" /> {t.detectingLocation}
        </div>
      )}
      {locationStatus === 'denied' && (
        <div className="flex items-center gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-xl text-sm text-destructive">
          <MapPin className="w-4 h-4" /> {t.locationDenied}
        </div>
      )}
      {locationStatus === 'unavailable' && (
        <div className="flex items-center gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-xl text-sm text-destructive">
          <MapPin className="w-4 h-4" /> {t.locationUnavailable}
        </div>
      )}

      {/* Location Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-2">{t.province}</label>
          <div className="relative">
            <select value={selectedProvince} onChange={(e) => { setSelectedProvince(e.target.value); setSelectedCity(''); }} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer">
              <option value="">{t.selectProvince}</option>
              {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-2">{t.city}</label>
          <div className="relative">
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedProvince} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer disabled:opacity-50">
              <option value="">{t.selectCity}</option>
              {filteredCities.map((c) => <option key={c.city} value={c.city}>{c.city}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-2">{t.date}</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex items-end">
          <button onClick={getLocation} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all">
            <Navigation className="w-4 h-4" /> {t.redetect}
          </button>
        </div>
      </div>

      {/* Schedule Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {schedules.map((s) => {
          const Icon = prayerIcons[s.name] || Clock;
          const isNext = nextPrayer?.name === s.name;
          const [h, m] = s.time.split(':').map(Number);
          const now = new Date();
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          const prayerMinutes = h * 60 + m;
          const isPast = prayerMinutes < currentMinutes;

          return (
            <div key={s.name} className={`relative bg-card rounded-2xl border p-4 shadow-sm transition-all ${isNext ? 'border-accent ring-2 ring-accent/20 scale-105' : 'border-border hover:border-primary/30'}`}>
              {isNext && <div className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{t.now}</div>}
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${isNext ? 'text-accent' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-semibold ${isPast ? 'text-muted-foreground' : 'text-foreground'}`}>{prayerLabels[s.name] || s.name}</span>
              </div>
              <p className={`text-xl font-bold ${isNext ? 'text-accent' : 'text-foreground'}`}>{s.time}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {isNext ? t.nextLabel : isPast ? t.pastLabel : t.upcomingLabel}
              </p>
            </div>
          );
        })}
        {schedules.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {locationStatus === 'denied' && !selectedCity
              ? t.selectLocationPrompt
              : t.scheduleUnavailable}
          </div>
        )}
      </div>
    </div>
  );
}
