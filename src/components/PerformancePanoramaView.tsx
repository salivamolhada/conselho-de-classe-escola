import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Eye,
  Printer,
  Users,
} from 'lucide-react';
import {
  BIMESTER_OPTIONS,
  DEFAULT_DIMENSIONS,
  RATING_LABELS,
  SCHOOL_INFO,
} from '../data/defaultData';
import {
  Question,
  RatingValue,
  Report,
  SchoolClass,
  Section,
  Student,
} from '../types/school';
import { SchoolCrest } from './SchoolCrest';

interface PanoramaViewProps {
  reports: Report[];
  students: Student[];
  classes: SchoolClass[];
  sections: Section[];
  questions: Question[];
  onOpenReport: (report: Report) => void;
}

export const PanoramaView: React.FC<PanoramaViewProps> = ({
  reports,
  students,
  classes,
  sections,
  questions,
  onOpenReport,
}) => {
  const [selectedClass, setSelectedClass] = useState(classes[0]?.name || '6º Ano A');
  const [selectedBimester, setSelectedBimester] = useState('3º Trimestre');

  const matchingReports = useMemo(
    () =>
      reports.filter(
        (r) =>
          r.classGroup === selectedClass &&
          r.bimester === selectedBimester &&
          (r.status === 'enviado' || r.status === 'visto')
      ),
    [reports, selectedClass, selectedBimester]
  );

  const classStudents = useMemo(
    () =>
      students
        .filter((s) => s.classGroup === selectedClass && s.status !== 'transferido')
        .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber)),
    [students, selectedClass]
  );

  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.order - b.order),
    [sections]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Barra de Seleção */}
      <div className="no-print bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-red-700">Visão Consolidada</p>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            Panorama Integrado da Turma
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Consolidação das avaliações, respostas e conceitos enviados pelos professores.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Selecionar turma"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Selecionar trimestre"
            value={selectedBimester}
            onChange={(e) => setSelectedBimester(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
          >
            {BIMESTER_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Panorama</span>
          </button>
        </div>
      </div>

      {/* Documento Consolidado */}
      <div className="print-only-container bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3.5">
            <SchoolCrest size="md" />
            <div>
              <p className="text-[11px] font-bold text-slate-500">{SCHOOL_INFO.schoolName}</p>
              <h2 className="font-display text-lg font-bold text-slate-900">
                PANORAMA GERAL DA TURMA / PRÉ-CONSELHO DE CLASSE
              </h2>
              <p className="text-xs text-slate-600">
                Turma: <strong>{selectedClass}</strong> · Período: <strong>{selectedBimester}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <p className="text-slate-500">Total de Alunos</p>
              <p className="font-mono font-bold text-lg text-slate-900 tabular-nums">
                {classStudents.length}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Fichas Respondidas</p>
              <p className="font-mono font-bold text-lg text-emerald-700 tabular-nums">
                {matchingReports.length}
              </p>
            </div>
          </div>
        </div>

        {matchingReports.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Nenhuma ficha enviada pelos professores para <strong>{selectedClass}</strong> no período{' '}
            <strong>{selectedBimester}</strong> ainda.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Matriz de Critérios por Disciplina */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                Avaliação Conceitual da Turma por Componente Curricular
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <th className="py-2.5 px-3 font-semibold">Critério Pedagógico</th>
                      {matchingReports.map((r) => (
                        <th key={r.id} className="py-2.5 px-3 font-semibold">
                          {r.component}
                          <div className="text-[11px] font-normal text-slate-500">{r.teacherName}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {DEFAULT_DIMENSIONS.map((dim) => (
                      <tr key={dim.id}>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{dim.name}</td>
                        {matchingReports.map((r) => {
                          const rating = r.dimensionRatings?.[dim.id];
                          return (
                            <td key={r.id} className="py-2.5 px-3">
                              {rating ? (
                                <span
                                  className={`inline-block px-2 py-0.5 rounded border text-[11px] font-semibold ${RATING_LABELS[rating].badgeClass}`}
                                >
                                  {RATING_LABELS[rating].label}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Matriz Individual dos Estudantes */}
            {classStudents.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 font-sans">
                  Mapeamento Individual dos Estudantes ({selectedClass})
                </h3>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <th className="py-2.5 px-3 font-semibold">Nº</th>
                        <th className="py-2.5 px-3 font-semibold">Estudante</th>
                        {matchingReports.map((r) => (
                          <th key={r.id} className="py-2.5 px-3 font-semibold">
                            {r.component}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {classStudents.map((st) => (
                        <tr key={st.id}>
                          <td className="py-2.5 px-3 font-mono text-slate-500 tabular-nums">
                            {st.rollNumber}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {st.name}
                            {st.status === 'atencao' && (
                              <span className="ml-2 text-[11px] font-medium text-amber-700">
                                · Atenção
                              </span>
                            )}
                          </td>
                          {matchingReports.map((r) => {
                            const entry = r.studentRatings?.[st.id];
                            return (
                              <td key={r.id} className="py-2.5 px-3">
                                {entry ? (
                                  <div>
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded border text-[11px] font-semibold ${RATING_LABELS[entry.rating].badgeClass}`}
                                    >
                                      {RATING_LABELS[entry.rating].label}
                                    </span>
                                    {entry.notes && (
                                      <p className="text-[11px] text-slate-500 mt-0.5">{entry.notes}</p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Relatos Consolidados por Seção */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 font-sans">
                  Síntese dos Relatos por Disciplina
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchingReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{rep.component}</p>
                        <p className="text-xs text-slate-600">{rep.teacherName}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenReport(rep)}
                        className="no-print inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ficha</span>
                      </button>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {sortedSections.map((sec) => {
                        const secQs = questions.filter((q) => q.sectionId === sec.id);
                        const hasAns = secQs.some((q) => rep.answers[q.id]?.trim());
                        if (!hasAns) return null;
                        return (
                          <div key={sec.id} className="space-y-1">
                            <p className="font-bold text-slate-700">{sec.title}</p>
                            {secQs.map((q) =>
                              rep.answers[q.id]?.trim() ? (
                                <p key={q.id} className="text-slate-600 leading-relaxed">
                                  {rep.answers[q.id]}
                                </p>
                              ) : null
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface PerformanceViewProps {
  reports: Report[];
  students: Student[];
  classes: SchoolClass[];
  isTeacherOnly?: boolean;
  teacherId?: string;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({
  reports,
  students,
  classes,
  isTeacherOnly = false,
  teacherId,
}) => {
  const [selectedClass, setSelectedClass] = useState('all');

  const scopedReports = useMemo(() => {
    return reports.filter((r) => {
      if (r.status !== 'enviado' && r.status !== 'visto') return false;
      if (isTeacherOnly && teacherId && r.teacherId !== teacherId) return false;
      if (selectedClass !== 'all' && r.classGroup !== selectedClass) return false;
      return true;
    });
  }, [reports, isTeacherOnly, teacherId, selectedClass]);

  const ratingCounts = useMemo(() => {
    const counts: Record<RatingValue, number> = { otimo: 0, bom: 0, regular: 0, ruim: 0 };
    scopedReports.forEach((r) => {
      if (r.dimensionRatings) {
        Object.values(r.dimensionRatings).forEach((val) => {
          counts[val] = (counts[val] || 0) + 1;
        });
      }
    });
    return counts;
  }, [scopedReports]);

  const totalRatings =
    ratingCounts.otimo + ratingCounts.bom + ratingCounts.regular + ratingCounts.ruim;

  const attentionStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedClass !== 'all' && s.classGroup !== selectedClass) return false;
      if (s.status === 'atencao') return true;
      return scopedReports.some((r) => {
        const entry = r.studentRatings?.[s.id];
        return entry && (entry.rating === 'ruim' || entry.rating === 'regular');
      });
    });
  }, [students, scopedReports, selectedClass]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-red-700">Indicadores Pedagógicos</p>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            {isTeacherOnly ? 'Desempenho da Turma' : 'Desempenho Geral da Escola'}
          </h1>
        </div>

        <select
          aria-label="Filtrar indicadores por turma"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
        >
          <option value="all">Todas as Turmas</option>
          {classes.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Fichas Analisadas</p>
            <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums mt-1">
              {scopedReports.length}
            </p>
          </div>
          <BarChart3 className="w-6 h-6 text-slate-400" />
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Conceitos Ótimo / Bom</p>
            <p className="font-mono text-2xl font-bold text-emerald-700 tabular-nums mt-1">
              {totalRatings > 0
                ? `${Math.round(((ratingCounts.otimo + ratingCounts.bom) / totalRatings) * 100)}%`
                : '0%'}
            </p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Estudantes em Atenção</p>
            <p className="font-mono text-2xl font-bold text-amber-700 tabular-nums mt-1">
              {attentionStudents.length}
            </p>
          </div>
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Conceitos */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Distribuição dos Critérios Pedagógicos
          </h2>
          {totalRatings === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">
              Ainda não há avaliações conceituais enviadas para os filtros selecionados.
            </p>
          ) : (
            <div className="space-y-4">
              {(['otimo', 'bom', 'regular', 'ruim'] as RatingValue[]).map((key) => {
                const count = ratingCounts[key];
                const pct = Math.round((count / totalRatings) * 100);
                const barColors: Record<RatingValue, string> = {
                  otimo: 'bg-emerald-600',
                  bom: 'bg-sky-600',
                  regular: 'bg-amber-500',
                  ruim: 'bg-rose-600',
                };
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{RATING_LABELS[key].label}</span>
                      <span className="font-mono text-slate-600 tabular-nums">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColors[key]} rounded-full`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Alunos Sinalizados para Atenção Pedagógica */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Estudantes que Merecem Atenção
            </h2>
            <Users className="w-5 h-5 text-slate-400" />
          </div>

          {attentionStudents.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">
              Nenhum estudante sinalizado para atenção pedagógica neste recorte.
            </p>
          ) : (
            <div className="divide-y divide-slate-200 max-h-80 overflow-y-auto">
              {attentionStudents.map((st) => (
                <div key={st.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">
                      #{st.rollNumber} · {st.name}
                    </p>
                    <p className="text-slate-600 mt-0.5">{st.notes || 'Sinalizado nas fichas docentes.'}</p>
                  </div>
                  <span className="font-semibold text-amber-800 whitespace-nowrap shrink-0">
                    {st.classGroup}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
