import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  FileText,
  PenLine,
  Printer,
} from 'lucide-react';
import { BIMESTER_OPTIONS } from '../data/defaultData';
import { Report, SchoolClass, User } from '../types/school';

interface TeacherReportsViewProps {
  currentUser: User;
  reports: Report[];
  classes: SchoolClass[];
  onEditReport: (report: Report) => void;
  onPreviewReport: (report: Report, autoPrint?: boolean) => void;
}

export const TeacherReportsView: React.FC<TeacherReportsViewProps> = ({
  currentUser,
  reports,
  classes,
  onEditReport,
  onPreviewReport,
}) => {
  const [filterClass, setFilterClass] = useState('all');
  const [filterBimester, setFilterBimester] = useState('all');

  const myReports = useMemo(
    () => reports.filter((r) => r.teacherId === currentUser.id),
    [reports, currentUser.id]
  );

  const availableClasses = useMemo(() => {
    const fromReports = myReports.map((r) => r.classGroup);
    const fromTeacher = currentUser.classes || [];
    const fromSchool = classes.map((c) => c.name);
    return Array.from(new Set([...fromReports, ...fromTeacher, ...fromSchool])).sort();
  }, [myReports, currentUser.classes, classes]);

  const filtered = useMemo(
    () =>
      myReports.filter((r) => {
        if (filterClass !== 'all' && r.classGroup !== filterClass) return false;
        if (filterBimester !== 'all' && r.bimester !== filterBimester) return false;
        return true;
      }),
    [myReports, filterClass, filterBimester]
  );

  const pendingReports = filtered.filter((r) => r.status === 'pendente' || r.status === 'rascunho');
  const archivedReports = filtered.filter((r) => r.status === 'enviado' || r.status === 'visto');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Cabeçalho e Filtros */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Minhas Fichas de Pré-Conselho
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Controle centralizado pela Direção · Componente:{' '}
              <strong className="text-slate-900">{currentUser.subject || 'Docente'}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="font-semibold text-slate-500">Filtrar por:</span>
            <select
              aria-label="Filtrar por turma"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-700"
            >
              <option value="all">Todas as Turmas</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>

            <select
              aria-label="Filtrar por trimestre"
              value={filterBimester}
              onChange={(e) => setFilterBimester(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-700"
            >
              <option value="all">Todos os Trimestres</option>
              {BIMESTER_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pendentes / Aguardando Respostas */}
      <section className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="font-display text-lg font-bold text-slate-900">
              Aguardando suas respostas
            </h2>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-600 tabular-nums">
            {pendingReports.length} {pendingReports.length === 1 ? 'ficha' : 'fichas'}
          </span>
        </div>

        {pendingReports.length === 0 ? (
          <div className="py-10 text-center text-slate-500 space-y-1.5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">Nenhuma ficha pendente no momento!</p>
            <p className="text-xs text-slate-500">
              Quando a Direção liberar novas fichas de Pré-Conselho, elas aparecerão aqui para preenchimento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 sm:p-5 rounded-xl bg-slate-50/90 border border-slate-200 flex flex-col justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-amber-800">
                      {rep.status === 'rascunho' ? 'Rascunho em andamento' : 'Aguardando preenchimento'}
                    </span>
                    <span className="font-mono tabular-nums">{rep.date}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {rep.classGroup} · {rep.component}
                  </h3>
                  <p className="text-xs text-slate-600">
                    Trimestre: <strong>{rep.bimester}</strong> · Data de Liberação:{' '}
                    <span className="font-mono tabular-nums">{rep.date}</span>
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => onEditReport(rep)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    <span>{rep.status === 'rascunho' ? 'Continuar Rascunho' : 'Preencher Ficha'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Arquivadas para o Conselho de Classe */}
      <section className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <FileCheck className="w-5 h-5 text-emerald-700" />
            <h2 className="font-display text-lg font-bold text-slate-900">
              Arquivadas para o Conselho de Classe
            </h2>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-600 tabular-nums">
            {archivedReports.length} {archivedReports.length === 1 ? 'ficha' : 'fichas'}
          </span>
        </div>

        {archivedReports.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            <FileText className="w-7 h-7 text-slate-400 mx-auto mb-2" />
            Nenhuma ficha foi enviada ainda. Preencha e envie suas fichas pendentes acima.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {archivedReports.map((rep) => (
              <div
                key={rep.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-emerald-800">
                      {rep.diretoraSignature?.signed ? 'Homologada com Visto' : 'Enviada à Direção'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{rep.bimester}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">Data de Envio: {rep.date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {rep.classGroup} — {rep.component}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!rep.diretoraSignature?.signed && (
                    <button
                      type="button"
                      onClick={() => onEditReport(rep)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <PenLine className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onPreviewReport(rep, false)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visualizar Ficha</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onPreviewReport(rep, true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
