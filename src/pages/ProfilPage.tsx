import { useEffect, useState, useRef } from 'react';
import { User, Camera, Save, Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { AxiosError } from 'axios';
import { useAuth } from '../contexts/AuthContext';
import * as authApi from '../api/auth';

type ProfileError = { message?: string };


function NotificationToast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all animate-slide-in ${type === 'success' ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground'}`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
      <span className="font-semibold">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">&times;</button>
    </div>
  );
}

export function ProfilPage() {
  const { user, updateUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', class: '' });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        class: user.class || '',
      });
    }
  }, [user]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    if (!profile.name.trim()) { showNotification('Nama tidak boleh kosong', 'error'); return; }
    setSaving(true);
    try {
      const res = await authApi.updateProfile(user.id, profile);
      updateUser(res.user);
      showNotification('Profil berhasil diperbarui!', 'success');
    } catch {
      showNotification('Gagal memperbarui profil. Coba lagi.', 'error');
    } finally {
      setSaving(false);
    }
  };


  const handleChangePassword = async () => {
    if (!passwords.current_password) { showNotification('Password saat ini wajib diisi', 'error'); return; }
    if (passwords.new_password.length < 6) { showNotification('Password baru minimal 6 karakter', 'error'); return; }
    if (passwords.new_password !== passwords.new_password_confirmation) { showNotification('Konfirmasi password tidak cocok', 'error'); return; }
    setSaving(true);
    try {
      await authApi.changePassword(passwords);
      setPasswords({ current_password: '', new_password: '', new_password_confirmation: '' });
      showNotification('Password berhasil diubah!', 'success');
    } catch {
      showNotification('Gagal mengubah password. Password saat ini mungkin salah.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showNotification('Ukuran foto maksimal 2MB', 'error'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { showNotification('Format foto harus JPG/PNG/WebP', 'error'); return; }

    const localUrl = URL.createObjectURL(file);
    setPhotoPreview(localUrl);

    setSaving(true);
    try {
      const res = await authApi.uploadPhoto(file);
      const updatedUser = { ...user, photo_url: res.url };
      updateUser(updatedUser);
      setPhotoPreview(res.url);
      showNotification('Foto profil berhasil diupload!', 'success');
    } catch {
      setPhotoPreview(null);
      showNotification('Gagal upload foto. Coba lagi.', 'error');
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const photoUrl = photoPreview || user?.photo_url || null;

  return (
    <>
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-3xl mx-auto space-y-6">
        <div><h2 className="text-3xl font-bold text-foreground">Profil Saya</h2><p className="text-muted-foreground mt-1">Kelola informasi akun Anda</p></div>

        {/* Photo */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg text-center">
          <div className="relative inline-block">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-4xl font-bold mx-auto overflow-hidden">
              {photoUrl ? (
                <img src={photoUrl} className="w-full h-full object-cover" alt="Foto Profil" />
              ) : (
                <User className="w-12 h-12" />
              )}
              {saving && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 shadow-lg transition-all hover:scale-110">
              <Camera className="w-4 h-4" />
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>
          <h3 className="text-xl font-bold text-foreground mt-4">{user?.name}</h3>
          <p className="text-muted-foreground">{user?.nisn || user?.nip || user?.email}</p>
          <p className="text-sm text-muted-foreground capitalize">{user?.role === 'guru' ? 'Guru' : user?.class ? `Siswa Kelas ${user.class}` : 'Siswa'}</p>
        </div>

        {/* Edit Profile */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><User className="w-5 h-5" /> Edit Profil</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2">Nama Lengkap <span className="text-destructive">*</span></label>
              <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Nama lengkap" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2">Email</label>
              <input type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2">No. Telepon</label>
              <input type="tel" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" placeholder="08xxxxxxxxxx" />
            </div>
            {user?.role === 'siswa' && (
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-2">Kelas</label>
                <input value={profile.class} onChange={(e) => setProfile((p) => ({ ...p, class: e.target.value }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Contoh: 7A" />
              </div>
            )}
          </div>
          <button onClick={handleUpdateProfile} disabled={saving} className="mt-4 flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </div>

        {/* Change Password */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Lock className="w-5 h-5" /> Ubah Password</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2">Password Saat Ini <span className="text-destructive">*</span></label>
              <input type="password" value={passwords.current_password} onChange={(e) => setPasswords((p) => ({ ...p, current_password: e.target.value }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2">Password Baru <span className="text-destructive">*</span></label>
              <input type="password" value={passwords.new_password} onChange={(e) => setPasswords((p) => ({ ...p, new_password: e.target.value }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2">Konfirmasi Password Baru <span className="text-destructive">*</span></label>
              <input type="password" value={passwords.new_password_confirmation} onChange={(e) => setPasswords((p) => ({ ...p, new_password_confirmation: e.target.value }))} className={`w-full px-4 py-3 bg-input-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring ${passwords.new_password_confirmation && passwords.new_password !== passwords.new_password_confirmation ? 'border-destructive' : 'border-border'}`} />
            </div>
          </div>
          {passwords.new_password_confirmation && passwords.new_password !== passwords.new_password_confirmation && (
            <p className="text-destructive text-xs mt-1">Password tidak cocok</p>
          )}
          <button onClick={handleChangePassword} disabled={saving} className="mt-4 flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-accent/90 disabled:opacity-50 transition-all">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {saving ? 'Menyimpan...' : 'Ganti Password'}
          </button>
        </div>
      </div>
    </>
  );
}
