import { useEffect, useState } from 'react';
import { Search, TrendingUp, Award, Activity, Users, MessageSquare, Star } from 'lucide-react';
import * as teacherApi from '../../api/teacher';
import type { FridayPrayer } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

export function MonitoringTrackerPage() {
  const { t } = useLanguage();
  const [fridayPrayers, setFridayPrayers] = useState<FridayPrayer[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [filterClass, setFilterClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [scoreValue, setScoreValue] = useState<number>(0);
  const [editingGrade, setEditingGrade] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [filterClass]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fridayRes, classesRes] = await Promise.all([
        teacherApi.getFridayPrayers(filterClass || undefined),
        teacherApi.getClasses(),
      ]);
      setFridayPrayers(fridayRes.friday_prayers);
      setClasses(classesRes.classes);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (id: number) => {
    try {
      await teacherApi.gradeFridayPrayer(id, commentText, scoreValue > 0 ? scoreValue : undefined);
      setEditingGrade(null);
      setCommentText('');
      setScoreValue(0);
      await loadData();
    } catch {
      // silent fail
    }
  };

  const startGrading = (prayer: FridayPrayer) => {
    setEditingGrade(prayer.id);
    setCommentText(prayer.teacher_comment ?? '');
    setScoreValue(prayer.teacher_score ?? 0);
    setExpandedId(prayer.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">{t.monitorTrackerTitle}</h2>
          <p className="text-muted-foreground mt-1">{t.monitorTrackerSubtitle}</p>
        </div>

        <div className="flex gap-3">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t.allClasses}</option>
            {classes.map((c) => (
              <option key={c} value={c}>{t.classNameLabel.replace('{name}', c)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Friday Prayer Submissions */}
      <div className="bg-card rounded-3xl border border-border shadow-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Star className="w-6 h-6 text-accent" />
            {t.fridayPrayerData}
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            {t.studentCount.replace('{count}', String(fridayPrayers.length))}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold text-foreground">{t.studentName}</th>
                <th className="text-left p-4 font-semibold text-foreground">{t.class}</th>
                <th className="text-left p-4 font-semibold text-foreground">{t.date}</th>
                <th className="text-left p-4 font-semibold text-foreground">{t.khatib}</th>
                <th className="text-left p-4 font-semibold text-foreground">{t.sermonMaterial}</th>
                <th className="text-left p-4 font-semibold text-foreground">{t.score}</th>
                <th className="text-left p-4 font-semibold text-foreground">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {fridayPrayers.map((prayer) => (
                <>
                  <tr
                    key={prayer.id}
                    className="hover:bg-secondary/50 transition-all cursor-pointer"
                    onClick={() => setExpandedId(expandedId === prayer.id ? null : prayer.id)}
                  >
                    <td className="p-4 font-semibold text-foreground">{prayer.user?.name}</td>
                    <td className="p-4 text-foreground">{prayer.user?.class}</td>
                    <td className="p-4 text-muted-foreground">{prayer.date}</td>
                    <td className="p-4 text-foreground">{prayer.khatib_name}</td>
                    <td className="p-4 text-muted-foreground">{prayer.sermon_topic?.title || '-'}</td>
                    <td className="p-4">
                      {prayer.is_graded ? (
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary">
                          {prayer.teacher_score ?? t.gradeValue}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-muted text-muted-foreground">
                          {t.notGraded}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); startGrading(prayer); }}
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <MessageSquare className="w-4 h-4" /> {prayer.is_graded ? t.editGrade : t.gradeValue}
                      </button>
                    </td>
                  </tr>
                  {expandedId === prayer.id && (
                    <tr key={`detail-${prayer.id}`}>
                      <td colSpan={7} className="p-6 bg-secondary/20">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-semibold text-muted-foreground mb-1">{t.sermonSummary}</h4>
                              <p className="text-foreground bg-card rounded-xl p-4 border border-border">{prayer.summary}</p>
                            </div>
                            {prayer.lesson && (
                              <div>
                                <h4 className="text-sm font-semibold text-muted-foreground mb-1">{t.lesson}</h4>
                                <p className="text-foreground bg-card rounded-xl p-4 border border-border">{prayer.lesson}</p>
                              </div>
                            )}
                          </div>

                          {editingGrade === prayer.id && (
                            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                              <h4 className="font-semibold text-foreground">{t.giveComment}</h4>
                              <div>
                                <label className="block text-sm text-muted-foreground mb-1">{t.commentLabel}</label>
                                <textarea
                                  value={commentText}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring h-20 resize-none"
                                  placeholder={t.commentPlaceholder}
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <label className="text-sm text-muted-foreground">{t.scoreLabel}</label>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={scoreValue}
                                  onChange={(e) => setScoreValue(Number(e.target.value))}
                                  className="w-24 px-3 py-2 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleGrade(prayer.id)}
                                  className="bg-primary text-primary-foreground px-5 py-2 rounded-xl font-semibold hover:bg-primary/90 transition-all"
                                >
                                  {t.saveGrade}
                                </button>
                                <button
                                  onClick={() => setEditingGrade(null)}
                                  className="bg-secondary text-secondary-foreground px-5 py-2 rounded-xl font-semibold hover:bg-secondary/80 transition-all"
                                >
                                  {t.cancelGrade}
                                </button>
                              </div>
                            </div>
                          )}

                          {prayer.teacher_comment && editingGrade !== prayer.id && (
                            <div className="bg-accent/5 rounded-xl border border-accent/20 p-4">
                              <h4 className="text-sm font-semibold text-accent mb-1">{t.teacherComment}</h4>
                              <p className="text-foreground">{prayer.teacher_comment}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {fridayPrayers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    {t.noFridayPrayerData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
