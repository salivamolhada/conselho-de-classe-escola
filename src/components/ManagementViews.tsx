import React, { useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Eye,
  FileSpreadsheet,
  Layers,
  ListChecks,
  Plus,
  Send,
  Trash2,
  Upload,
  Users,
  XCircle,
} from 'lucide-react';
import { BIMESTER_OPTIONS, SCHOOL_INFO, SUBJECT_LIST } from '../data/defaultData';
import {
  Question,
  Report,
  SchoolClass,
  Section,
  Student,
  User,
} from '../types/school';

/* ======================== 1. ALUNOS E TURMAS ======================== */
interface StudentsViewProps {
  students: Student[];
  classes: SchoolClass[];
  onSaveStudents: (students: Student[]) => void;
}

export const StudentsManagementView: React.FC<StudentsViewProps> = ({
  students,
  classes,
  onSaveStudents,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [classGroup, setClassGroup] = useState(classes[0]?.name || '6º Ano A');
  const [status, setStatus] = useState<'ativo' | 'atencao' | 'transferido'>('ativo');
  const [notes, setNotes] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(
    () =>
      students.filter((s) => (filterClass === 'all' ? true : s.classGroup === filterClass)),
    [students, filterClass]
  );

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      name: name.trim(),
      rollNumber: rollNumber.trim() || String(students.length + 1).padStart(2, '0'),
      classGroup,
      status,
      notes: notes.trim() || undefined,
    };
    onSaveStudents([...students, newStudent]);
    setName('');
    setRollNumber('');
    setNotes('');
    setShowForm(false);
  };

  const handleDeleteStudent = (id: string) => {
    onSaveStudents(students.filter((s) => s.id !== id));
  };

  const handleDownloadTemplate = () => {
    const csv =
      '\ufeffNumero;Nome Completo;Turma;Situacao;Observacoes\n01;Exemplo Silva;6º Ano A;ativo;Participativo\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo-importacao-alunos.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportList = () => {
    const headers = 'Numero;Nome Completo;Turma;Situacao;Observacoes';
    const rows = filtered.map(
      (s) => `${s.rollNumber};"${s.name}";"${s.classGroup}";${s.status};"${s.notes || ''}"`
    );
    const blob = new Blob(['\ufeff' + [headers, ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lista-alunos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || '');
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      const imported: Student[] = [];
      lines.forEach((line, idx) => {
        if (idx === 0 && line.toLowerCase().includes('nome')) return;
        const parts = line.split(/[;,]/).map((p) => p.replace(/^"|"$/g, '').trim());
        if (parts.length >= 2 && parts[1]) {
          imported.push({
            id: `std-imp-${Date.now()}-${idx}`,
            rollNumber: parts[0] || String(idx + 1).padStart(2, '0'),
            name: parts[1],
            classGroup: parts[2] || classGroup,
            status:
              parts[3] === 'atencao' || parts[3] === 'transferido' ? parts[3] : 'ativo',
            notes: parts[4] || undefined,
          });
        }
      });
      if (imported.length > 0) {
        onSaveStudents([...students, ...imported]);
        setImportFeedback(`${imported.length} estudante(s) importado(s) com sucesso!`);
      } else {
        setImportFeedback('Nenhum registro válido encontrado no arquivo CSV.');
      }
      setTimeout(() => setImportFeedback(null), 4000);
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-red-700">Diretoria Escolar</p>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            Cadastro de Alunos & Importação Excel
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Baixar Modelo Excel</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar Arquivo Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportList}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Lista (.csv)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showForm ? 'Cancelar' : 'Cadastrar Aluno'}</span>
          </button>
        </div>
      </div>

      {importFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{importFeedback}</span>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleAddStudent}
          className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome Completo do Estudante *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Maria Clara Oliveira"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nº Chamada / Matrícula
            </label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="Ex: 11"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Turma *</label>
            <select
              value={classGroup}
              onChange={(e) => setClassGroup(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Situação Escolar</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ativo' | 'atencao' | 'transferido')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
            >
              <option value="ativo">Regular / Ativo</option>
              <option value="atencao">Atenção Pedagógica</option>
              <option value="transferido">Transferido</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações Iniciais / Histórico (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Necessita acompanhamento de leitura..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div className="flex items-end justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Salvar Estudante
            </button>
          </div>
        </form>
      )}

      {/* Lista de Alunos */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-700">
            Total exibido: <strong className="font-mono tabular-nums">{filtered.length}</strong>{' '}
            estudantes
          </span>
          <select
            aria-label="Filtrar alunos por turma"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
          >
            <option value="all">Todas as Turmas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500">Nenhum estudante encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">Nº</th>
                  <th className="py-3 px-4">Nome do Estudante</th>
                  <th className="py-3 px-4">Turma</th>
                  <th className="py-3 px-4">Situação</th>
                  <th className="py-3 px-4">Observações</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-slate-500 tabular-nums">{st.rollNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{st.name}</td>
                    <td className="py-3 px-4 text-slate-700">{st.classGroup}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          st.status === 'atencao'
                            ? 'text-amber-700'
                            : st.status === 'transferido'
                              ? 'text-slate-500'
                              : 'text-emerald-700'
                        }`}
                      >
                        {st.status === 'atencao'
                          ? 'Atenção Pedagógica'
                          : st.status === 'transferido'
                            ? 'Transferido'
                            : 'Regular'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{st.notes || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteStudent(st.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Remover estudante"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* ======================== 2. TURMAS ======================== */
interface ClassesViewProps {
  classes: SchoolClass[];
  onSaveClasses: (classes: SchoolClass[]) => void;
}

export const ClassesManagementView: React.FC<ClassesViewProps> = ({ classes, onSaveClasses }) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [shift, setShift] = useState('Tempo Integral');
  const [year, setYear] = useState(SCHOOL_INFO.year);
  const [description, setDescription] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSaveClasses([
      ...classes,
      {
        id: `cls-${Date.now()}`,
        name: name.trim(),
        shift,
        year,
        description: description.trim() || undefined,
      },
    ]);
    setName('');
    setDescription('');
    setShowForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-red-700">Estrutura Escolar</p>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            Cadastro e Gestão de Turmas
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Cancelar' : 'Cadastrar Nova Turma'}</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome / Identificação da Turma *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: 9º Ano C"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Turno de Funcionamento
            </label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            >
              <option value="Tempo Integral">Tempo Integral</option>
              <option value="Matutino">Matutino (Manhã)</option>
              <option value="Vespertino (Tarde)">Vespertino (Tarde)</option>
              <option value="Noturno">Noturno</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ano Letivo</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição Pedagógica
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ensino Fundamental II..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Salvar Turma
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-5 shadow-sm flex items-start justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Layers className="w-3.5 h-3.5 text-red-700" />
                <span>{cls.shift}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{cls.year}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">{cls.name}</h3>
              {cls.description && <p className="text-xs text-slate-600 mt-1">{cls.description}</p>}
            </div>

            <button
              type="button"
              onClick={() => onSaveClasses(classes.filter((c) => c.id !== cls.id))}
              className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
              title="Excluir turma"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ======================== 3. LIBERAR FICHAS ======================== */
interface ReleaseViewProps {
  reports: Report[];
  teachers: User[];
  classes: SchoolClass[];
  onSaveReports: (reports: Report[]) => void;
  onOpenReport: (report: Report) => void;
}

export const ReleaseManagementView: React.FC<ReleaseViewProps> = ({
  reports,
  teachers,
  classes,
  onSaveReports,
  onOpenReport,
}) => {
  const [bimester, setBimester] = useState('3º Trimestre');
  const [mode, setMode] = useState<'all' | 'single'>('all');
  const [selectedTeacherId, setSelectedTeacherId] = useState(teachers[0]?.id || '');
  const [selectedClass, setSelectedClass] = useState(classes[0]?.name || '6º Ano A');
  const [statusFilter, setStatusFilter] = useState('all');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRelease = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();
    const created: Report[] = [];

    const targetTeachers =
      mode === 'all' ? teachers : teachers.filter((t) => t.id === selectedTeacherId);

    targetTeachers.forEach((teacher) => {
      const targetClasses =
        mode === 'all'
          ? teacher.classes && teacher.classes.length > 0
            ? teacher.classes
            : [classes[0]?.name || '6º Ano A']
          : [selectedClass];

      targetClasses.forEach((clsName) => {
        const alreadyExists = reports.some(
          (r) =>
            r.teacherId === teacher.id &&
            r.classGroup === clsName &&
            r.bimester === bimester
        );
        if (!alreadyExists) {
          created.push({
            id: `rep-${Date.now()}-${teacher.id}-${clsName.replace(/\s+/g, '')}`,
            schoolName: SCHOOL_INFO.schoolName,
            schoolSubtitle: SCHOOL_INFO.schoolSubtitle,
            title: SCHOOL_INFO.reportTitle,
            teacherId: teacher.id,
            teacherName: teacher.name,
            component: teacher.subject || 'Componente Curricular',
            classGroup: clsName,
            date: today,
            bimester,
            status: 'pendente',
            createdAt: nowIso,
            updatedAt: nowIso,
            answers: {},
            pedagogaSignature: { signed: false },
            diretoraSignature: { signed: false },
          });
        }
      });
    });

    if (created.length > 0) {
      onSaveReports([...created, ...reports]);
      setFeedback(`${created.length} ficha(s) disponibilizada(s) para preenchimento!`);
    } else {
      setFeedback('Todas as fichas selecionadas já estão liberadas para este período.');
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const counts = useMemo(
    () => ({
      total: reports.length,
      pendente: reports.filter((r) => r.status === 'pendente').length,
      rascunho: reports.filter((r) => r.status === 'rascunho').length,
      enviado: reports.filter((r) => r.status === 'enviado').length,
      visto: reports.filter((r) => r.status === 'visto').length,
    }),
    [reports]
  );

  const filtered = reports.filter((r) => (statusFilter === 'all' ? true : r.status === statusFilter));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div>
          <p className="text-xs font-semibold text-red-700">
            Evita preenchimentos acidentais e fichas duplicadas
          </p>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            Liberação e Gestão de Fichas de Pré-Conselho
          </h1>
        </div>

        <form onSubmit={handleRelease} className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Trimestre de Referência
            </label>
            <select
              value={bimester}
              onChange={(e) => setBimester(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            >
              {BIMESTER_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Modo de Envio</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'all' | 'single')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            >
              <option value="all">Para TODOS os Professores (Lote Geral)</option>
              <option value="single">Apenas para um Professor / Turma Específico</option>
            </select>
          </div>

          {mode === 'single' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selecionar Professor
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selecionar Turma
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="md:col-span-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Disponibilizar Fichas para os Professores</span>
            </button>
          </div>
        </form>

        {feedback && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs">
            {feedback}
          </div>
        )}
      </div>

      {/* Resumo de Status */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Fichas', value: counts.total },
          { label: 'Aguardando Início', value: counts.pendente },
          { label: 'Em Rascunho', value: counts.rascunho },
          { label: 'Enviadas', value: counts.enviado },
          { label: 'Com Visto', value: counts.visto },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 p-4 shadow-sm"
          >
            <p className="text-[11px] font-semibold text-slate-500">{item.label}</p>
            <p className="font-mono text-xl font-bold text-slate-900 tabular-nums mt-1">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900 font-sans">
            Fichas Disponibilizadas no Sistema
          </h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
          >
            <option value="all">Todos os Status</option>
            <option value="pendente">Pendente (Não iniciada)</option>
            <option value="rascunho">Em Rascunho</option>
            <option value="enviado">Enviada pelo Professor</option>
            <option value="visto">Homologada com Visto</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Professor(a)</th>
                <th className="py-3 px-4">Turma / Período</th>
                <th className="py-3 px-4">Disciplina</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{rep.teacherName}</td>
                  <td className="py-3 px-4 text-slate-700">
                    {rep.classGroup} · {rep.bimester}
                  </td>
                  <td className="py-3 px-4 text-slate-700">{rep.component}</td>
                  <td className="py-3 px-4 font-semibold">
                    {rep.status === 'visto' ? (
                      <span className="text-emerald-700">Homologada com Visto</span>
                    ) : rep.status === 'enviado' ? (
                      <span className="text-sky-700">Enviada</span>
                    ) : rep.status === 'rascunho' ? (
                      <span className="text-amber-700">Rascunho</span>
                    ) : (
                      <span className="text-slate-500">Pendente</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(rep.status === 'enviado' || rep.status === 'visto') && (
                        <button
                          type="button"
                          onClick={() => onOpenReport(rep)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Respostas</span>
                        </button>
                      )}
                      {rep.status === 'pendente' && (
                        <button
                          type="button"
                          onClick={() => onSaveReports(reports.filter((r) => r.id !== rep.id))}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-medium cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancelar Liberação</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ======================== 4. PROFESSORES ======================== */
interface TeachersViewProps {
  users: User[];
  classes: SchoolClass[];
  onSaveUsers: (users: User[]) => void;
}

export const TeachersManagementView: React.FC<TeachersViewProps> = ({
  users,
  classes,
  onSaveUsers,
}) => {
  const teachers = users.filter((u) => u.role === 'professor');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123');
  const [subject, setSubject] = useState(SUBJECT_LIST[0]);
  const [assignedClasses, setAssignedClasses] = useState<string[]>(['6º Ano A']);

  const toggleClass = (clsName: string) => {
    setAssignedClasses((prev) =>
      prev.includes(clsName) ? prev.filter((c) => c !== clsName) : [...prev, clsName]
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newTeacher: User = {
      id: `prof-${Date.now()}`,
      name: name.trim(),
      username: name.trim(),
      email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@escola.gov.br`,
      password: password.trim() || '123',
      role: 'professor',
      subject,
      classes: assignedClasses,
      createdAt: new Date().toISOString().split('T')[0],
    };
    onSaveUsers([...users, newTeacher]);
    setName('');
    setEmail('');
    setPassword('123');
    setShowForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-red-700">Corpo Docente</p>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            Cadastro e Gestão de Professores
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Cancelar' : 'Cadastrar Novo Professor'}</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do(a) Professor(a) (Usuário de Acesso) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="O professor utilizará este nome para entrar no sistema"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail Institucional (Opcional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@escola.gov.br"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Senha de Acesso (Padrão: 123) *
              </label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Componente Curricular Principal
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              >
                {SUBJECT_LIST.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">
              Turmas em que o docente leciona:
            </p>
            <div className="flex flex-wrap gap-2">
              {classes.map((c) => {
                const selected = assignedClasses.includes(c.name);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleClass(c.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                      selected
                        ? 'bg-emerald-700 text-white border-emerald-800'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Salvar Professor
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-red-700 font-semibold">
                  <Users className="w-3.5 h-3.5" />
                  <span>{teacher.subject || 'Docente'}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">{teacher.name}</h3>
                <p className="text-xs text-slate-500">{teacher.email}</p>
              </div>
              <button
                type="button"
                onClick={() => onSaveUsers(users.filter((u) => u.id !== teacher.id))}
                className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                title="Excluir professor"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-600">
              <strong>Turmas:</strong>{' '}
              {teacher.classes && teacher.classes.length > 0
                ? teacher.classes.join(' · ')
                : 'Nenhuma turma atribuída'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ======================== 5. PERGUNTAS ======================== */
interface QuestionsViewProps {
  sections: Section[];
  questions: Question[];
  onSaveSections: (sections: Section[]) => void;
  onSaveQuestions: (questions: Question[]) => void;
}

export const QuestionsManagementView: React.FC<QuestionsViewProps> = ({
  sections,
  questions,
  onSaveSections,
  onSaveQuestions,
}) => {
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState(sections[0]?.id || 'sec-1');
  const [prompt, setPrompt] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [required, setRequired] = useState(true);

  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.order - b.order),
    [sections]
  );

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    onSaveSections([
      ...sections,
      {
        id: `sec-${Date.now()}`,
        title: newSectionTitle.trim().toUpperCase(),
        order: sections.length + 1,
      },
    ]);
    setNewSectionTitle('');
    setShowSectionForm(false);
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const inSec = questions.filter((q) => q.sectionId === selectedSectionId);
    onSaveQuestions([
      ...questions,
      {
        id: `q-${Date.now()}`,
        sectionId: selectedSectionId,
        prompt: prompt.trim(),
        placeholder: placeholder.trim() || undefined,
        required,
        order: inSec.length + 1,
      },
    ]);
    setPrompt('');
    setPlaceholder('');
    setShowQuestionForm(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-red-700">Editor do Questionário Oficial</p>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            Gerenciar Perguntas da Ficha de Pré-Conselho
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSectionForm((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Seção</span>
          </button>
          <button
            type="button"
            onClick={() => setShowQuestionForm((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>Cadastrar Pergunta</span>
          </button>
        </div>
      </div>

      {showSectionForm && (
        <form
          onSubmit={handleCreateSection}
          className="bg-white/95 rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            required
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            placeholder="Título da Nova Seção do Questionário (Ex: 6. PROJETOS INTERDISCIPLINARES)"
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Criar Seção
          </button>
        </form>
      )}

      {showQuestionForm && (
        <form
          onSubmit={handleCreateQuestion}
          className="bg-white/95 rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Seção onde a pergunta será exibida:
              </label>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              >
                {sortedSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={required}
                  onChange={(e) => setRequired(e.target.checked)}
                  className="rounded border-slate-300 text-red-700"
                />
                <span>Resposta obrigatória para envio da ficha</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Enunciado da Pergunta (Texto que o professor lerá) *
            </label>
            <input
              type="text"
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Texto de exemplo/orientação para o professor (Placeholder opcional)
            </label>
            <input
              type="text"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Adicionar pergunta
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {sortedSections.map((sec) => {
          const secQs = questions
            .filter((q) => q.sectionId === sec.id)
            .sort((a, b) => a.order - b.order);

          return (
            <div
              key={sec.id}
              className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
            >
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 font-sans">
                {sec.title}
              </h2>

              {secQs.length === 0 ? (
                <p className="text-xs text-slate-500">Nenhuma pergunta cadastrada nesta seção ainda.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {secQs.map((q) => (
                    <div key={q.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {q.prompt}{' '}
                          {q.required && <span className="text-rose-600 font-normal">(Obrigatória)</span>}
                        </p>
                        {q.placeholder && (
                          <p className="text-slate-500 mt-0.5">{q.placeholder}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onSaveQuestions(questions.filter((item) => item.id !== q.id))}
                        className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer shrink-0"
                        title="Remover pergunta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
