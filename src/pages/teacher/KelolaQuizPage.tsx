import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Check, Eye, HelpCircle } from 'lucide-react';
import * as quizzesApi from '../../api/quizzes';
import { useLanguage } from '../../i18n/LanguageContext';

interface QuizItem {
  id: number; title: string; description?: string; time_limit: number;
  passing_score: number; is_active: boolean; questions_count?: number;
  creator?: { id: number; name: string }; created_at: string;
}

interface QuestionItem {
  id: number; quiz_id: number; question_text: string; points: number;
  answers: { id: number; answer_text: string; is_correct: boolean }[];
}

interface QuizResultItem {
  id: number; user_id: number; quiz_id: number; score: number;
  total_questions: number; correct_answers: number; passed?: boolean;
  user?: { id: number; name: string; class?: string };
  quiz?: { id: number; title: string; passing_score: number };
}

export function KelolaQuizPage() {
  const { t } = useLanguage();
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', description: '', time_limit: 10, passing_score: 70 });
  const [selectedQuiz, setSelectedQuiz] = useState<QuizItem | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [qForm, setQForm] = useState({ question_text: '', points: 1, answers: [{ answer_text: '', is_correct: false }, { answer_text: '', is_correct: false }] });
  const [results, setResults] = useState<QuizResultItem[]>([]);
  const [showResults, setShowResults] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadQuizzes(); }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const res = await quizzesApi.getQuizzes();
      setQuizzes(res.data || []);
    } catch { setError(t.errorLoadQuiz); } finally { setLoading(false); }
  };

  const loadQuizDetail = async (id: number) => {
    try {
      const res = await quizzesApi.getQuiz(id);
      setSelectedQuiz(res.quiz);
      setQuestions(res.quiz.questions || []);
    } catch { setError(t.errorLoadDetail); }
  };

  const loadResults = async (quizId: number) => {
    try {
      const res = await quizzesApi.getQuizResults(quizId);
      setResults(res.results);
      setShowResults(quizId);
    } catch { setError(t.errorLoadResults); }
  };

  const resetForm = () => { setShowForm(false); setEditingId(null); setForm({ title: '', description: '', time_limit: 10, passing_score: 70 }); setError(''); };
  const handleEdit = (q: QuizItem) => { setEditingId(q.id); setForm({ title: q.title, description: q.description || '', time_limit: q.time_limit, passing_score: q.passing_score }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.title) { setError(t.titleRequired); return; }
    setError('');
    try {
      if (editingId) { await quizzesApi.updateQuiz(editingId, form); setSuccess(t.successQuizUpdated); }
      else { await quizzesApi.createQuiz(form); setSuccess(t.successQuizCreated); }
      resetForm(); await loadQuizzes(); setTimeout(() => setSuccess(''), 3000);
    } catch { setError(t.errorSaveQuiz); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;
    try { await quizzesApi.deleteQuiz(id); setSuccess(t.successQuizDeleted); await loadQuizzes(); setTimeout(() => setSuccess(''), 3000); }
    catch { setError(t.errorDeleteQuiz); }
  };

  const handleAddQuestion = async () => {
    if (!qForm.question_text || qForm.answers.filter((a) => a.answer_text).length < 2) { setError(t.questionRequired); return; }
    if (!qForm.answers.some((a) => a.is_correct)) { setError(t.selectCorrectAnswer); return; }
    setError('');
    try {
      if (!selectedQuiz) return;
      await quizzesApi.addQuestion(selectedQuiz.id, qForm);
      setQForm({ question_text: '', points: 1, answers: [{ answer_text: '', is_correct: false }, { answer_text: '', is_correct: false }] });
      setShowQuestionForm(false);
      await loadQuizDetail(selectedQuiz.id);
      setSuccess(t.successQuestionAdded); setTimeout(() => setSuccess(''), 3000);
    } catch { setError(t.errorAddQuestion); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold text-foreground">{t.manageQuizTitle}</h2><p className="text-muted-foreground mt-1">{t.manageQuizSubtitle}</p></div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-semibold hover:bg-primary/90 shadow-lg shadow-primary/30">
          <Plus className="w-5 h-5" /> {t.createQuiz}
        </button>
      </div>

      {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">{error}</div>}
      {success && <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-xl text-sm flex items-center gap-2"><Check className="w-4 h-4" /> {success}</div>}

      {showForm && (
        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4">{editingId ? t.editQuizLabel : t.newQuiz}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3"><label className="block text-sm font-semibold text-muted-foreground mb-2">{t.quizTitleField}</label><input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" placeholder={t.quizTitleField} /></div>
            <div className="md:col-span-3"><label className="block text-sm font-semibold text-muted-foreground mb-2">{t.description}</label><input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" placeholder={t.description} /></div>
            <div><label className="block text-sm font-semibold text-muted-foreground mb-2">{t.timeLimit}</label><input type="number" value={form.time_limit} onChange={(e) => setForm((f) => ({ ...f, time_limit: Number(e.target.value) }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            <div><label className="block text-sm font-semibold text-muted-foreground mb-2">{t.passingScore}</label><input type="number" value={form.passing_score} onChange={(e) => setForm((f) => ({ ...f, passing_score: Number(e.target.value) }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" /></div>
          </div>
          <div className="flex gap-2 mt-4"><button onClick={handleSave} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold">{editingId ? t.save : t.createQuiz}</button><button onClick={resetForm} className="bg-secondary text-secondary-foreground px-6 py-2.5 rounded-xl font-semibold">{t.cancel}</button></div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-card rounded-3xl border border-border shadow-lg overflow-hidden">
            <div className="p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">{quiz.title}</h3>
                <p className="text-muted-foreground text-sm">{quiz.description} — {quiz.questions_count || 0} {t.questions}, {quiz.time_limit > 0 ? `${quiz.time_limit} ${t.minutesLabel}` : t.noTimeLimit}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setShowResults(null); loadQuizDetail(quiz.id); setSelectedQuiz(selectedQuiz?.id === quiz.id ? null : quiz); }} className="flex items-center gap-1 px-3 py-2 text-sm font-semibold bg-primary/10 text-primary rounded-xl hover:bg-primary/20">
                  {selectedQuiz?.id === quiz.id ? t.close : t.manageQuestions} <HelpCircle className="w-4 h-4" />
                </button>
                <button onClick={() => loadResults(quiz.id)} className="flex items-center gap-1 px-3 py-2 text-sm font-semibold bg-accent/10 text-accent rounded-xl hover:bg-accent/20">
                  <Eye className="w-4 h-4" /> {t.quizResults}
                </button>
                <button onClick={() => handleEdit(quiz)} className="p-2 bg-accent/10 text-accent rounded-lg"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(quiz.id)} className="p-2 bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            {selectedQuiz?.id === quiz.id && (
              <div className="border-t border-border p-6 bg-secondary/20">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-foreground">{t.questionList.replace('{count}', String(questions.length))}</h4>
                  <button onClick={() => setShowQuestionForm(!showQuestionForm)} className="flex items-center gap-1 px-3 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl">
                    <Plus className="w-4 h-4" /> {t.addQuestion}
                  </button>
                </div>

                {showQuestionForm && (
                  <div className="bg-card rounded-xl border border-border p-4 mb-4 space-y-3">
                    <h5 className="font-semibold text-foreground">{t.newQuestion}</h5>
                    <textarea value={qForm.question_text} onChange={(e) => setQForm((f) => ({ ...f, question_text: e.target.value }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl h-20 resize-none" placeholder={t.questionText} />
                    <div><label className="text-sm text-muted-foreground">{t.pointsLabel} </label><input type="number" value={qForm.points} onChange={(e) => setQForm((f) => ({ ...f, points: Number(e.target.value) }))} className="w-20 px-3 py-2 bg-input-background border border-border rounded-xl" /></div>
                    {qForm.answers.map((answer, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input value={answer.answer_text} onChange={(e) => { const a = [...qForm.answers]; a[i].answer_text = e.target.value; setQForm((f) => ({ ...f, answers: a })); }} className="flex-1 px-4 py-2 bg-input-background border border-border rounded-xl" placeholder={t.answerPlaceholder.replace('{number}', String(i + 1))} />
                        <label className="flex items-center gap-1 text-sm cursor-pointer">
                          <input type="radio" name="correct" checked={answer.is_correct} onChange={() => { const a = qForm.answers.map((ans, j) => ({ ...ans, is_correct: j === i })); setQForm((f) => ({ ...f, answers: a })); }} className="w-4 h-4 text-primary" /> {t.correct}
                        </label>
                        {i >= 2 && (
                          <button onClick={() => setQForm((f) => ({ ...f, answers: f.answers.filter((_, j) => j !== i) }))} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => setQForm((f) => ({ ...f, answers: [...f.answers, { answer_text: '', is_correct: false }] }))} className="text-sm text-primary hover:underline">{t.addAnswer}</button>
                    <div className="flex gap-2"><button onClick={handleAddQuestion} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold">{t.saveQuestion}</button><button onClick={() => setShowQuestionForm(false)} className="text-sm text-muted-foreground">{t.cancel}</button></div>
                  </div>
                )}

                {questions.map((q, i) => (
                  <div key={q.id} className="bg-card border border-border rounded-xl p-4 mb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{t.question} {i + 1}: {q.question_text}</p>
                        <p className="text-xs text-muted-foreground">{t.pointsLabel} {q.points}</p>
                      </div>
                      <button onClick={async () => { if (!confirm(t.confirmDelete)) return; await quizzesApi.deleteQuestion(q.id); await loadQuizDetail(quiz.id); }} className="p-1 text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="mt-2 space-y-1">
                      {q.answers.map((a: { id: number; answer_text: string; is_correct: boolean }) => (
                        <p key={a.id} className={`text-sm px-3 py-1 rounded-lg ${a.is_correct ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground'}`}>
                          {a.is_correct ? '\u2713 ' : ''}{a.answer_text}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
                {questions.length === 0 && <p className="text-center text-muted-foreground py-4">{t.noQuestions} Klik "{t.addQuestion}".</p>}
              </div>
            )}

            {showResults === quiz.id && (
              <div className="border-t border-border p-6 bg-secondary/20">
                <h4 className="font-semibold text-foreground mb-4">{t.quizResults}</h4>
                <table className="w-full">
                  <thead><tr className="text-left text-sm text-muted-foreground"><th className="p-2">{t.name}</th><th className="p-2">{t.class}</th><th className="p-2">{t.score}</th><th className="p-2">{t.correct}</th><th className="p-2">{t.status}</th></tr></thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.id} className="border-t border-border">
                        <td className="p-2 font-semibold text-foreground">{r.user?.name}</td>
                        <td className="p-2 text-muted-foreground">{r.user?.class}</td>
                        <td className="p-2"><span className={`font-bold ${r.score >= (r.quiz?.passing_score || 70) ? 'text-primary' : 'text-destructive'}`}>{r.score}</span></td>
                        <td className="p-2 text-muted-foreground">{r.correct_answers}/{r.total_questions}</td>
                        <td className="p-2"><span className={`px-2 py-1 rounded-lg text-xs font-semibold ${r.score >= (r.quiz?.passing_score || 70) ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>{r.score >= (r.quiz?.passing_score || 70) ? t.passedStatus : t.notPassedStatus}</span></td>
                      </tr>
                    ))}
                    {results.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">{t.noResults}</td></tr>}
                  </tbody>
                </table>
                <button onClick={() => setShowResults(null)} className="mt-4 text-sm text-muted-foreground hover:underline">{t.close}</button>
              </div>
            )}
          </div>
        ))}
        {quizzes.length === 0 && <div className="text-center py-12 text-muted-foreground">{t.noQuizzesAvailable}</div>}
      </div>
    </div>
  );
}
