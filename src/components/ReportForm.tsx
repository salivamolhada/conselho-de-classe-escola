import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileCheck,
  Lock,
  Save,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  BIMESTER_OPTIONS,
  DEFAULT_DIMENSIONS,
  RATING_LABELS,
  SCHOOL_INFO,
  SUBJECT_LIST,
} from '../data/defaultData';
import {
  Question,
  RatingValue,
  Report,
  SchoolClass,
  Section,
  Student,
  StudentRatingEntry,
  User,
} from '../types/school';
import { SchoolCrest } from './SchoolCrest';

interface ReportFormProps {
  currentUser: User;
  questions: Question[];
  sections: Section[];
  editingReport: Report | null;
  students: Student[];
  classes: SchoolClass[];
  onSaveReport: (report: Report) => void;
  onCancel: () => void;
}

const RATINGS: RatingValue[] = ['otimo', 'bom', 'regular', 'ruim'];

export const ReportForm: React.FC<ReportFormProps> = ({
  currentUser,
  questions,
  sections,
  editingReport,
  students,
  classes,
  onSaveReport,
  onCancel,
}) => {
  const [component, setComponent] = useState(
    editingReport?.component || currentUser.subject || 'Matemática'
  );
  const [classGroup, setClassGroup] = useState(
    editingReport?.classGroup || currentUser.classes?.[0] || classes[0]?.name || '6º Ano A'
  );
  const [date, setDate] = useState(
    editingReport?.date || new Date().toISOString().split('T')[0]
  );
  const [bimester, setBimester] = useState(editingReport?.bimester || '3º Trimestre');
  const [answers, setAnswers] = useState<Record<string, string>>(editingReport?.answers || {});
  const [dimensionRatings, setDimensionRatings] = useState<Record<string, RatingValue>>(
    editingReport?.dimensionRatings || {}
  );
  const [studentRatings, setStudentRatings] = useState<Record<string, StudentRatingEntry>>(
    editingReport?.studentRatings || {}
  );
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (editingReport) {
      setComponent(editingReport.component);
      setClassGroup(editingReport.classGroup);
      setDate(editingReport.date || new Date().toISOString().split('T')[0]);
      setBimester(editingReport.bimester);
      setAnswers(editingReport.answers || {});
      setDimensionRatings(editingReport.dimensionRatings || {});
      setStudentRatings(editingReport.studentRatings || {});
    }
  }, [editingReport]);

  const classStudents = useMemo(
    () =>
      students
        .filter((s) => s.classGroup === classGroup && s.status !== 'transferido')
        .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber)),
    [students, classGroup]
  );

  const totalQuestions = questions.length;
  const answeredCount = questions.filter((q) => (answers[q.id] || '').trim().length > 0).length;
  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.order - b.order),
    [sections]
  );

  const questionIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    let idx = 1;
    sortedSections.forEach((sec) => {
      questions
        .filter((q) => q.sectionId === sec.id)
        .sort((a, b) => a.order - b.order)
        .forEach((q) => map.set(q.id, idx++));
    });
    return map;
  }, [sortedSections, questions]);

  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleDimensionChange = (dimId: string, val: RatingValue) => {
    setDimensionRatings((prev) => ({ ...prev, [dimId]: val }));
  };

  const handleStudentRatingChange = (studentId: string, rating: RatingValue, notes?: string) => {
    setStudentRatings((prev) => ({
      ...prev,
      [studentId]: {
        rating,
        notes: notes !== undefined ? notes : prev[studentId]?.notes || '',
      },
    }));
  };

  const handleMarkAllBom = () => {
    const updated: Record<string, StudentRatingEntry> = {};
    classStudents.forEach((st) => {
      updated[st.id] = {
        rating: 'bom',
        notes: studentRatings[st.id]?.notes || '',
      };
    });
    setStudentRatings((prev) => ({ ...prev, ...updated }));
  };

  const handleQuickFill = () => {
    const exampleAnswers: Record<string, string> = {};
    questions.forEach((q) => {
      if (q.id === 'q-1') {
        exampleAnswers[q.id] =
          'A turma demonstra bom rendimento e assimilação dos conteúdos planejados. Aproximadamente 80% atingiram o nível esperado de aprendizagem.';
      } else if (q.id === 'q-2') {
        exampleAnswers[q.id] =
          'Participação muito ativa e respeitosa. Há bom engajamento nas dinâmicas em grupo e nas atividades individuais.';
      } else if (q.id === 'q-3') {
        exampleAnswers[q.id] =
          'Algumas dificuldades pontuais na interpretação de textos complexos e cálculos contextualizados de fixação.';
      } else if (q.id === 'q-4') {
        exampleAnswers[q.id] =
          'Dois estudantes tiveram faltas reincidentes por motivos de saúde da família; coordenação já orientada.';
      } else if (q.id === 'q-5') {
        exampleAnswers[q.id] =
          'Alunos destaque pela dedicação constante, liderança colaborativa e solidariedade acadêmica com a turma.';
      } else if (q.id === 'q-6') {
        exampleAnswers[q.id] =
          'Estudantes sinalizados necessitam de encaminhamento para acompanhamento no contraturno de reforço.';
      } else if (q.id === 'q-7') {
        exampleAnswers[q.id] =
          'Aulas práticas com jogos pedagógicos e mapas mentais. Planejamos simulado diagnóstico no início do próximo ciclo.';
      } else if (q.id === 'q-8') {
        exampleAnswers[q.id] =
          'Recomenda-se reunião de alinhamento com os pais sobre o cumprimento dos prazos de tarefas.';
      } else if (q.id === 'q-9') {
        exampleAnswers[q.id] =
          'Turma harmoniosa e com forte potencial para os próximos trimestres com o suporte da equipe pedagógica.';
      } else {
        exampleAnswers[q.id] = `Observações pedagógicas detalhadas sobre ${q.prompt.slice(0, 35)}...`;
      }
    });
    setAnswers(exampleAnswers);
    setDimensionRatings({
      aprendizagem: 'bom',
      participacao: 'otimo',
      disciplina: 'bom',
      tarefas: 'bom',
      frequencia: 'regular',
      convivencia: 'otimo',
    });

    const stMap: Record<string, StudentRatingEntry> = {};
    classStudents.forEach((st, idx) => {
      if (idx === 0) stMap[st.id] = { rating: 'otimo', notes: 'Destaque e liderança' };
      else if (idx === 4) stMap[st.id] = { rating: 'regular', notes: 'Necessita reforço' };
      else if (idx === 8) stMap[st.id] = { rating: 'ruim', notes: 'Faltas e tarefas pendentes' };
      else stMap[st.id] = { rating: 'bom' };
    });
    setStudentRatings(stMap);
    setValidationErrors([]);
    setFeedbackMsg('Perguntas e avaliação conceitual preenchidas para teste rápido!');
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const buildReportObject = (status: 'rascunho' | 'enviado'): Report => ({
    id: editingReport?.id || `rep-${Date.now()}`,
    schoolName: SCHOOL_INFO.schoolName,
    schoolSubtitle: SCHOOL_INFO.schoolSubtitle,
    title: SCHOOL_INFO.reportTitle,
    teacherId: currentUser.id,
    teacherName: currentUser.name,
    component,
    classGroup,
    date,
    bimester,
    status,
    createdAt: editingReport?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    answers,
    dimensionRatings,
    studentRatings,
    pedagogaSignature: editingReport?.pedagogaSignature || { signed: false },
    diretoraSignature: editingReport?.diretoraSignature || { signed: false },
  });

  const handleSaveDraft = () => {
    onSaveReport(buildReportObject('rascunho'));
    setFeedbackMsg('Rascunho salvo com sucesso! Você pode continuar preenchendo quando quiser.');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    questions.forEach((q) => {
      if (q.required && (!answers[q.id] || answers[q.id].trim().length === 0)) {
        errs.push(`A pergunta "${q.prompt.slice(0, 60)}..." é obrigatória.`);
      }
    });
    if (errs.length > 0) {
      setValidationErrors(errs);
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }
    setValidationErrors([]);
    onSaveReport(buildReportObject('enviado'));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Barra superior de retorno */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white/95 hover:bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para Minhas Fichas</span>
        </button>

        {editingReport && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span>
              Ficha autorizada pela Direção: {classGroup} · {bimester} · {component}
            </span>
          </div>
        )}
      </div>

      {/* Banner de orientação e preenchimento rápido */}
      <div className="bg-amber-50/95 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs">
        <div className="flex items-center gap-2.5">
          <FileCheck className="w-5 h-5 text-amber-700 shrink-0" />
          <div>
            <span className="font-bold">Formulário Digital Oficial:</span> Preencha diretamente no computador
            ou celular. Seus dados são salvos automaticamente e arquivados no painel da diretora.
          </div>
        </div>
        <button
          type="button"
          onClick={handleQuickFill}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Preenchimento Rápido (Exemplo)</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Por favor, preencha os campos obrigatórios antes de enviar:</span>
          </div>
          <ul className="list-disc pl-6 space-y-0.5">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Formulário Principal */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
      >
        {/* Cabeçalho Documento Pedagógico Oficial */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/90 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <SchoolCrest size="md" />
              <div>
                <p className="text-[11px] font-bold tracking-wider text-red-700">
                  Documento Pedagógico Oficial
                </p>
                <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                  {SCHOOL_INFO.reportTitle}
                </h1>
                <p className="text-xs text-slate-600">{SCHOOL_INFO.schoolName}</p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs">
              <p className="text-slate-500">Progresso do Questionário</p>
              <p className="font-mono font-bold text-slate-900 tabular-nums text-sm">
                {answeredCount}/{totalQuestions} ({progressPct}%)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Componente Curricular
              </label>
              <select
                value={component}
                onChange={(e) => setComponent(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
              >
                {SUBJECT_LIST.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Turma Definida
              </label>
              <select
                value={classGroup}
                onChange={(e) => setClassGroup(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Trimestre / Período
              </label>
              <select
                value={bimester}
                onChange={(e) => setBimester(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
              >
                {BIMESTER_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
              />
            </div>
          </div>
        </div>

        {/* Seções & Perguntas */}
        <div className="p-6 space-y-8">
          {sortedSections.map((section) => {
            const secQuestions = questions
              .filter((q) => q.sectionId === section.id)
              .sort((a, b) => a.order - b.order);

            return (
              <div key={section.id} className="space-y-4">
                <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 font-sans">
                  {section.title}
                </h2>

                <div className="space-y-4">
                  {secQuestions.map((q) => {
                    const num = questionIndexMap.get(q.id) || 1;
                    return (
                      <div key={q.id} className="space-y-1.5">
                        <label
                          htmlFor={`question-${q.id}`}
                          className="block text-xs sm:text-sm font-semibold text-slate-800"
                        >
                          <span className="font-mono text-red-700 mr-1.5">{num}.</span>
                          {q.prompt}
                          {q.required && <span className="text-rose-600 ml-1">*</span>}
                        </label>
                        <textarea
                          id={`question-${q.id}`}
                          rows={3}
                          value={answers[q.id] || ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          placeholder={q.placeholder || 'Digite sua resposta...'}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-700"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Avaliação Conceitual da Turma por Critérios Pedagógicos */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-sans">
                  Avaliação Conceitual da Turma por Critérios Pedagógicos
                </h2>
                <p className="text-xs text-slate-500">Critérios Oficiais</p>
              </div>
            </div>

            <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
              {DEFAULT_DIMENSIONS.map((dim) => {
                const selected = dimensionRatings[dim.id];
                return (
                  <div
                    key={dim.id}
                    className="p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="max-w-lg">
                      <p className="text-xs sm:text-sm font-semibold text-slate-900">{dim.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{dim.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {RATINGS.map((r) => {
                        const active = selected === r;
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => handleDimensionChange(dim.id, r)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                              active
                                ? RATING_LABELS[r].colorClass
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {RATING_LABELS[r].label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Avaliação Conceitual Individual dos Alunos da Turma */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-sans">
                  Avaliação Conceitual Individual dos Alunos da Turma
                </h2>
                <p className="text-xs text-slate-500">
                  Atribua o conceito individual de cada estudante da turma nesta disciplina ({classGroup}):
                </p>
              </div>

              {classStudents.length > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllBom}
                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  Marcar todos como Bom
                </button>
              )}
            </div>

            {classStudents.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                Nenhum estudante cadastrado na turma <strong>{classGroup}</strong> ainda. A Diretoria pode
                cadastrar ou importar alunos na aba Alunos e Turmas.
              </div>
            ) : (
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                {classStudents.map((st) => {
                  const entry = studentRatings[st.id];
                  return (
                    <div
                      key={st.id}
                      className="p-3.5 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-slate-500 tabular-nums">
                            #{st.rollNumber}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-slate-900">
                            {st.name}
                          </span>
                          {st.status === 'atencao' && (
                            <span className="text-[11px] font-semibold text-amber-800">
                              · Sinalizado para atenção
                            </span>
                          )}
                        </div>
                        {st.notes && <p className="text-[11px] text-slate-500 mt-0.5">{st.notes}</p>}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1">
                          {RATINGS.map((r) => {
                            const active = entry?.rating === r;
                            return (
                              <button
                                key={r}
                                type="button"
                                onClick={() => handleStudentRatingChange(st.id, r)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                                  active
                                    ? RATING_LABELS[r].colorClass
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {RATING_LABELS[r].short}
                              </button>
                            );
                          })}
                        </div>

                        <input
                          type="text"
                          value={entry?.notes || ''}
                          onChange={(e) =>
                            handleStudentRatingChange(
                              st.id,
                              entry?.rating || 'bom',
                              e.target.value
                            )
                          }
                          placeholder="Observação rápida..."
                          className="w-full sm:w-44 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-700"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Barra de Ações do Formulário */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            Voltar / Cancelar
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Rascunho</span>
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar à Direção</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
