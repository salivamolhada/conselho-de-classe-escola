import React, { useMemo, useState } from 'react';
import {
  Archive,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  PenTool,
  Printer,
  Search,
  Trash2,
} from 'lucide-react';
import { BIMESTER_OPTIONS } from '../data/defaultData';
import { Report, User } from '../types/school';

interface DirectorArchiveViewProps {
  reports: Report[];
  teachers: User[];
  onOpenReport: (report: Report, autoPrint?: boolean) => void;
  onQuickSign: (reportId: string) => void;
  onRequestDelete: (report: Report) => void;
}

export const DirectorArchiveView: React.FC<DirectorArchiveViewProps> = ({
  reports,
  teachers,
  onOpenReport,
  onQuickSign,
  onRequestDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterTeacher, setFilterTeacher] = useState('all');
  const [filterBimester, setFilterBimester] = useState('all');
  const [filterSign, setFilterSign] = useState<'all' | 'pending' | 'signed'>('all');

  const submittedReports = useMemo(
    () => reports.filter((r) => r.status === 'enviado' || r.status === 'visto'),
    [reports]
  );

  const totalCount = submittedReports.length;
  const pendingSignCount = submittedReports.filter((r) => !r.diretoraSignature?.signed).length;
  const signedCount = submittedReports.filter((r) => r.diretoraSignature?.signed).length;

  const classOptions = useMemo(
    () => Array.from(new Set(submittedReports.map((r) => r.classGroup))).sort(),
    [submittedReports]
  );

  const filteredReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return submittedReports.filter((r) => {
      if (filterClass !== 'all' && r.classGroup !== filterClass) return false;
      if (filterTeacher !== 'all' && r.teacherId !== filterTeacher) return false;
      if (filterBimester !== 'all' && r.bimester !== filterBimester) return false;
      if (filterSign === 'pending' && r.diretoraSignature?.signed) return false;
      if (filterSign === 'signed' && !r.diretoraSignature?.signed) return false;
      if (q) {
        const hay = `${r.classGroup} ${r.component} ${r.teacherName} ${r.bimester}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [submittedReports, filterClass, filterTeacher, filterBimester, filterSign, searchQuery]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterClass('all');
    setFilterTeacher('all');
    setFilterBimester('all');
    setFilterSign('all');
  };

  const handleExportCSV = () => {
    const headers = [
      'Turma',
      'Trimestre',
      'Componente Curricular',
      'Professor(a)',
      'Data de Envio',
      'Visto da Direção',
      'Coordenação Pedagógica',
    ];
    const rows = filteredReports.map((r) => [
      r.classGroup,
      r.bimester,
      r.component,
      r.teacherName,
      r.date,
      r.diretoraSignature?.signed ? 'Homologada' : 'Aguardando Visto',
      r.pedagogaSignature?.signed ? 'Assinado' : 'Pendente',
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fichas-pre-conselho-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Cabeçalho da Página */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-red-700">
            Arquivo Digital & Organização de Pré-Conselho
          </p>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Fichas Arquivadas
          </h1>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Planilha (CSV)</span>
        </button>
      </div>

      {/* KPIs em linha única */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total de Fichas Arquivadas</p>
            <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums mt-1">
              {totalCount}
            </p>
          </div>
          <Archive className="w-6 h-6 text-slate-400" />
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Aguardando Visto da Direção</p>
            <p className="font-mono text-2xl font-bold text-amber-700 tabular-nums mt-1">
              {pendingSignCount}
            </p>
            <p className="text-[11px] text-slate-500">Necessitam leitura e homologação</p>
          </div>
          <Clock className="w-6 h-6 text-amber-600" />
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Homologadas com Visto</p>
            <p className="font-mono text-2xl font-bold text-emerald-700 tabular-nums mt-1">
              {signedCount}
            </p>
            <p className="text-[11px] text-slate-500">Prontas para o Conselho de Classe</p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>
      </div>

      {/* Filtros e Tabela */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar turma, disciplina ou professor..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
            />
          </div>

          <select
            aria-label="Filtrar por turma"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700"
          >
            <option value="all">Todas as Turmas</option>
            {classOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar por professor"
            value={filterTeacher}
            onChange={(e) => setFilterTeacher(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700"
          >
            <option value="all">Todos os Professores</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar por trimestre"
            value={filterBimester}
            onChange={(e) => setFilterBimester(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700"
          >
            <option value="all">Todos os Trimestres</option>
            {BIMESTER_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <select
              aria-label="Filtrar por visto"
              value={filterSign}
              onChange={(e) => setFilterSign(e.target.value as 'all' | 'pending' | 'signed')}
              className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700"
            >
              <option value="all">Todos</option>
              <option value="pending">Sem Visto</option>
              <option value="signed">Homologados</option>
            </select>
            {(searchQuery ||
              filterClass !== 'all' ||
              filterTeacher !== 'all' ||
              filterBimester !== 'all' ||
              filterSign !== 'all') && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-2.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 rounded-xl cursor-pointer whitespace-nowrap"
                title="Limpar todos os filtros"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700">Nenhuma ficha encontrada no arquivo</p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-semibold text-red-700 hover:underline cursor-pointer"
            >
              Limpar todos os filtros
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">Turma / Período</th>
                  <th className="py-3 px-4">Componente Curricular</th>
                  <th className="py-3 px-4">Professor(a)</th>
                  <th className="py-3 px-4">Data de Envio</th>
                  <th className="py-3 px-4">Visto da Direção</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredReports.map((rep) => {
                  const isSigned = Boolean(rep.diretoraSignature?.signed);
                  return (
                    <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{rep.classGroup}</p>
                        <p className="text-slate-500">{rep.bimester}</p>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{rep.component}</td>
                      <td className="py-3.5 px-4 text-slate-700">{rep.teacherName}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 tabular-nums">{rep.date}</td>
                      <td className="py-3.5 px-4">
                        {isSigned ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Homologado</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Aguardando Visto</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenReport(rep, false)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Visualizar</span>
                          </button>

                          {!isSigned && (
                            <button
                              type="button"
                              onClick={() => onQuickSign(rep.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <PenTool className="w-3.5 h-3.5" />
                              <span>Assinar Visto</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onOpenReport(rep, true)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Imprimir / Exportar PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onRequestDelete(rep)}
                            className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir ficha"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
