import { useEffect, useState } from 'react';

export function StudentQuizList({ onStartQuiz }: { onStartQuiz: (id: number) => void }) {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../api/quizzes').then((m) => m.getQuizzes().then((res) => { setQuizzes(res.data || []); setLoading(false); }));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div><h2 className="text-3xl font-bold text-foreground">Quiz Ramadan</h2><p className="text-muted-foreground mt-1">Uji pemahaman Anda tentang materi Ramadan</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((q) => (
          <div key={q.id} className="bg-card rounded-3xl border border-border p-6 shadow-lg hover:shadow-xl transition-all hover:border-primary/30">
            <h3 className="text-lg font-bold text-foreground mb-2">{q.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{q.description}</p>
            <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
              <span>{q.questions_count || 0} soal</span>
              <span>Min {q.passing_score || 70}%</span>
              {q.time_limit > 0 && <span>{q.time_limit} menit</span>}
            </div>
            <button onClick={() => onStartQuiz(q.id)} className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold hover:bg-primary/90">Mulai Quiz</button>
          </div>
        ))}
        {quizzes.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">Belum ada quiz tersedia.</div>}
      </div>
    </div>
  );
}
