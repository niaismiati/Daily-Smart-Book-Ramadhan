import { lazy, Suspense, useState, useEffect } from 'react';
import { LanguageProvider } from '../i18n/LanguageContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { AppLayout } from '../layouts/AppLayout';
import type { Page } from '../layouts/Sidebar';
import { StudentQuizList } from './StudentQuizList';

const LoginPage = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard').then((m) => ({ default: m.StudentDashboard })));
const TrackerPage = lazy(() => import('../pages/student/TrackerPage').then((m) => ({ default: m.TrackerPage })));
const DoaPage = lazy(() => import('../pages/student/DoaPage').then((m) => ({ default: m.DoaPage })));
const JournalPage = lazy(() => import('../pages/student/JournalPage').then((m) => ({ default: m.JournalPage })));
const PrayerSchedulePage = lazy(() => import('../pages/student/PrayerSchedulePage').then((m) => ({ default: m.PrayerSchedulePage })));
const MateriKajianPage = lazy(() => import('../pages/student/MateriKajianPage').then((m) => ({ default: m.MateriKajianPage })));
const QuizAttemptPage = lazy(() => import('../pages/student/QuizAttemptPage').then((m) => ({ default: m.QuizAttemptPage })));
const LaporanSiswaPage = lazy(() => import('../pages/student/LaporanSiswaPage').then((m) => ({ default: m.LaporanSiswaPage })));
const TeacherDashboardPage = lazy(() => import('../pages/teacher/TeacherDashboardPage').then((m) => ({ default: m.TeacherDashboardPage })));
const MonitoringTrackerPage = lazy(() => import('../pages/teacher/MonitoringTrackerPage').then((m) => ({ default: m.MonitoringTrackerPage })));
const KelolaKhotbahPage = lazy(() => import('../pages/teacher/KelolaKhotbahPage').then((m) => ({ default: m.KelolaKhotbahPage })));
const KelolaDoaPage = lazy(() => import('../pages/teacher/KelolaDoaPage').then((m) => ({ default: m.KelolaDoaPage })));
const KelolaSiswaPage = lazy(() => import('../pages/teacher/KelolaSiswaPage').then((m) => ({ default: m.KelolaSiswaPage })));
const KelolaMateriPage = lazy(() => import('../pages/teacher/KelolaMateriPage').then((m) => ({ default: m.KelolaMateriPage })));
const KelolaQuizPage = lazy(() => import('../pages/teacher/KelolaQuizPage').then((m) => ({ default: m.KelolaQuizPage })));
const LaporanGuruPage = lazy(() => import('../pages/teacher/LaporanGuruPage').then((m) => ({ default: m.LaporanGuruPage })));
const MonitoringJurnalPage = lazy(() => import('../pages/teacher/MonitoringJurnalPage').then((m) => ({ default: m.MonitoringJurnalPage })));
const ProfilPage = lazy(() => import('../pages/ProfilPage').then((m) => ({ default: m.ProfilPage })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isSiswa, isGuru, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [pageBeforeQuiz, setPageBeforeQuiz] = useState<Page | null>(null);

  useEffect(() => {
    if (currentPage !== 'quiz') setSelectedQuizId(null);
  }, [currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    );
  }

  const handleStartQuiz = (quizId: number) => {
    setPageBeforeQuiz(currentPage);
    setSelectedQuizId(quizId);
  };
  const handleBackFromQuiz = () => { setSelectedQuizId(null); setCurrentPage(pageBeforeQuiz || 'dashboard'); };

  return (
    <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      <Suspense fallback={<PageLoader />}>
        {currentPage === 'dashboard' && isSiswa && <StudentDashboard />}
        {currentPage === 'tracker' && <TrackerPage />}
        {currentPage === 'doa' && <DoaPage />}
        {currentPage === 'journal' && <JournalPage />}
        {currentPage === 'prayer' && <PrayerSchedulePage />}
        {currentPage === 'materi' && <MateriKajianPage />}
        {currentPage === 'laporan' && isSiswa && <LaporanSiswaPage />}
        {currentPage === 'profil' && <ProfilPage />}

        {currentPage === 'quiz' && !selectedQuizId && isSiswa && (
          <StudentQuizList onStartQuiz={handleStartQuiz} />
        )}
        {currentPage === 'quiz' && selectedQuizId && (
          <QuizAttemptPage quizId={selectedQuizId} onBack={handleBackFromQuiz} />
        )}

        {currentPage === 'dashboard' && isGuru && <TeacherDashboardPage />}
        {currentPage === 'monitoring-tracker' && <MonitoringTrackerPage />}
        {currentPage === 'kelola-khotbah' && <KelolaKhotbahPage />}
        {currentPage === 'kelola-doa' && <KelolaDoaPage />}
        {currentPage === 'kelola-siswa' && <KelolaSiswaPage />}
        {currentPage === 'kelola-materi' && <KelolaMateriPage />}
        {currentPage === 'kelola-quiz' && <KelolaQuizPage />}
        {currentPage === 'laporan-guru' && <LaporanGuruPage />}
        {currentPage === 'monitoring-jurnal' && <MonitoringJurnalPage />}
      </Suspense>
    </AppLayout>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
