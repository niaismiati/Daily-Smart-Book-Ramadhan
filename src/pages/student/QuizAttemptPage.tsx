import { useEffect, useState } from 'react';
import { Clock, Check, X, Award, ArrowLeft } from 'lucide-react';
import * as quizzesApi from '../../api/quizzes';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

interface QuizAttemptPageProps {
  quizId: number;
  onBack: () => void;
}

export function QuizAttemptPage({ quizId, onBack }: QuizAttemptPageProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await quizzesApi.getQuiz(quizId);
        setQuiz(res.quiz);
        const qs = res.quiz.questions || [];
        setQuestions(qs);
        if (res.quiz.time_limit > 0) setTimeLeft(res.quiz.time_limit * 60);
      } catch { } finally { setLoading(false); }
    };
    load();
  }, [quizId]);

  useEffect(() => {
    if (!started || submitted || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => { if (t <= 1) { clearInterval(timer); return 0; } return t - 1; }), 1000);
    return () => clearInterval(timer);
  }, [started, submitted, timeLeft]);

  useEffect(() => {
    if (started && timeLeft === 0 && !submitted && quiz) handleSubmit();
  }, [timeLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60); const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);
    try {
      const payload = { answers: questions.map((q) => ({ question_id: q.id, answer_id: answers[q.id] || null })) };
      const res = await quizzesApi.submitQuiz(quizId, payload);
      setResult(res.result || res);
    } catch { setResult({ score: 0, correct_answers: 0, total_questions: questions.length, message: t.failedToSubmit }); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!quiz) return <div className="text-center py-12 text-muted-foreground">{t.quizNotFound} <button onClick={onBack} className="text-primary hover:underline">{t.back}</button></div>;

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> {t.back}</button>
        <div className="bg-card rounded-3xl border border-border p-8 text-center shadow-lg">
          <Award className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">{quiz.title}</h2>
          <p className="text-muted-foreground mb-6">{quiz.description}</p>
          <div className="flex justify-center gap-6 mb-6">
            <div className="text-center"><p className="text-2xl font-bold text-primary">{questions.length}</p><p className="text-sm text-muted-foreground">{t.question}</p></div>
            {quiz.time_limit > 0 && <div className="text-center"><p className="text-2xl font-bold text-accent">{quiz.time_limit}</p><p className="text-sm text-muted-foreground">{t.minutesLabel}</p></div>}
            <div className="text-center"><p className="text-2xl font-bold text-foreground">{quiz.passing_score}%</p><p className="text-sm text-muted-foreground">{t.passingGrade}</p></div>
          </div>
          <button onClick={() => setStarted(true)} className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 shadow-lg shadow-primary/30">
            {t.startQuiz}
          </button>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    const passed = result.score >= (quiz.passing_score || 70);
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> {t.back}</button>
        <div className={`bg-card rounded-3xl border p-8 text-center shadow-lg ${passed ? 'border-primary/30' : 'border-destructive/30'}`}>
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${passed ? 'bg-primary/10' : 'bg-destructive/10'}`}>
            {passed ? <Check className="w-10 h-10 text-primary" /> : <X className="w-10 h-10 text-destructive" />}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{passed ? t.congratulations : t.notPassed}</h2>
          <p className="text-5xl font-bold text-foreground mb-4">{result.score}<span className="text-2xl text-muted-foreground">/{questions.reduce((s, q) => s + q.points, 0)}</span></p>
          <p className="text-muted-foreground">{t.correct}: {t.correctOf.replace('{correct}', result.correct_answers || result.right || 0).replace('{total}', result.total_questions || questions.length)}</p>
          <button onClick={onBack} className="mt-6 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90">{t.backToQuizList}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-card rounded-3xl border border-border p-4 shadow-lg flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-foreground">{quiz.title}</h2></div>
        {quiz.time_limit > 0 && (
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            <span className={`font-mono font-bold text-lg ${timeLeft < 60 ? 'text-destructive' : 'text-foreground'}`}>{formatTime(timeLeft)}</span>
          </div>
        )}
        <div className="text-sm text-muted-foreground">{answers ? Object.keys(answers).length : 0}/{questions.length} {t.answered}</div>
      </div>

      {/* Questions */}
      {questions.map((q, i) => (
        <div key={q.id} className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h3 className="font-semibold text-foreground mb-4">{t.question} {i + 1}: {q.question_text} <span className="text-sm text-muted-foreground font-normal">({q.points} {t.points})</span></h3>
          <div className="space-y-2">
            {q.answers.map((a: any) => (
              <button
                key={a.id}
                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: a.id }))}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  answers[q.id] === a.id
                    ? 'border-primary bg-primary/10 text-foreground font-semibold'
                    : 'border-border bg-background hover:bg-secondary/60 text-foreground'
                }`}
              >
                {a.answer_text}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={Object.keys(answers).length < questions.length}
        className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
      >
        {t.submitAnswers}
      </button>
    </div>
  );
}
