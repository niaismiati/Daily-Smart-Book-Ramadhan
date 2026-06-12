import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { BookOpen, Moon, Star, Sparkles } from 'lucide-react';

export function LoginPage() {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'siswa' | 'guru'>('siswa');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credential, password, selectedRole);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Login gagal. Periksa kembali kredensial Anda.');
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-sans">
      {/* Left Side - Illustration */}
      <div className="relative bg-gradient-to-br from-primary via-emerald-700 to-emerald-900 p-12 flex flex-col justify-center items-center text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="mosque-pattern-login" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M100 20 L120 100 L100 180 L80 100 Z" fill="currentColor" />
                <circle cx="100" cy="30" r="15" fill="currentColor" />
                <path d="M90 30 Q100 10 110 30" stroke="currentColor" strokeWidth="2" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mosque-pattern-login)" />
          </svg>
        </div>

        <div className="relative z-10 text-center mb-12">
          <div className="flex justify-center items-center mb-6 relative">
            <div className="absolute -top-8 -right-8">
              <Star className="w-12 h-12 text-accent fill-accent animate-pulse" />
            </div>
            <Moon className="w-24 h-24 text-accent" />
            <div className="absolute -bottom-4 -left-8">
              <Sparkles className="w-10 h-10 text-accent animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 font-serif">{t.appName}</h1>
          <p className="text-xl text-emerald-100 max-w-md mx-auto leading-relaxed">{t.appSubtitle}</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-end">
            <LanguageSelector variant="compact" />
          </div>

          <div className="bg-card rounded-3xl shadow-2xl border border-border p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">{t.welcomeBack}</h2>
              <p className="text-muted-foreground">{t.login}</p>
            </div>

            {/* Role Selection */}
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => setSelectedRole('siswa')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  selectedRole === 'siswa'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {t.student}
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('guru')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  selectedRole === 'guru'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {t.teacher}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {selectedRole === 'siswa' ? t.nisField : t.nipField}
                </label>
                <input
                  type="text"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder={selectedRole === 'siswa' ? t.nisPlaceholder : t.nipPlaceholder}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t.password}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder={t.password}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50"
              >
                {loading ? t.processing : t.loginButton}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
