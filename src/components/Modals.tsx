import React, { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Mail,
  MessageSquare,
  Printer,
  ShieldCheck,
  X,
} from 'lucide-react';
import { DEFAULT_DIMENSIONS, RATING_LABELS, SCHOOL_INFO } from '../data/defaultData';
import { Question, Report, Section, Student, User } from '../types/school';
import { SchoolCrest } from './SchoolCrest';

/* ======================== 1. VISUALIZAR / IMPRIMIR FICHA ======================== */
interface ReportPreviewModalProps {
  report: Report | null;
  questions: Question[];
  sections: Section[];
  students: Student[];
  currentUser: User;
  autoPrint?: boolean;
  onAutoPrintDone?: () => void;
  onClose: () => void;
  onSignReport: (
    reportId: string,
    role: 'pedagoga' | 'diretora',
    notes: string
  ) => void;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  report,
  questions,
  sections,
  students,
  currentUser,
  autoPrint = false,
  onAutoPrintDone,
  onClose,
  onSignReport,
}) => {
  const [pedagogaNotes, setPedagogaNotes] = useState('');
  const [diretoraNotes, setDiretoraNotes] = useState('');

  useEffect(() => {
    if (report) {
      setPedagogaNotes(report.pedagogaSignature?.notes || '');
      setDiretoraNotes(report.diretoraSignature?.notes || '');
    }
  }, [report]);

  useEffect(() => {
    if (!report || !autoPrint) return;
    const t = setTimeout(() => {
      window.print();
      onAutoPrintDone?.();
    }, 200);
    return () => clearTimeout(t);
  }, [report, autoPrint, onAutoPrintDone]);

  if (!report) return null;

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);
  const classStudents = students.filter((s) => s.classGroup === report.classGroup);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
      <div className="print-only-container bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-4">
        {/* Barra superior de controle */}
        <div className="no-print px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-3">
          <span className="text-xs font-semibold">
            Visualização Oficial da Ficha · {report.classGroup} · {report.component}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Cabeçalho Oficial */}
          <div className="flex items-center gap-4 border-b-2 border-slate-900 pb-4">
            <SchoolCrest size="md" />
            <div>
              <p className="text-xs font-bold text-slate-700">{report.schoolName}</p>
              <p className="text-[11px] text-slate-500">{report.schoolSubtitle}</p>
              <h2 className="font-display text-lg font-bold text-slate-900 mt-0.5">
                {report.title}
              </h2>
            </div>
          </div>

          {/* Metadados */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block">Professor(a):</span>
              <strong className="text-slate-900">{report.teacherName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Componente:</span>
              <strong className="text-slate-900">{report.component}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Turma Definida:</span>
              <strong className="text-slate-900">{report.classGroup}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Data & Trimestre:</span>
              <strong className="text-slate-900 font-mono">
                {report.date} · {report.bimester}
              </strong>
            </div>
          </div>

          {/* Respostas */}
          <div className="space-y-5">
            {sortedSections.map((sec) => {
              const secQs = questions
                .filter((q) => q.sectionId === sec.id)
                .sort((a, b) => a.order - b.order);
              return (
                <div key={sec.id} className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1 font-sans">
                    {sec.title}
                  </h3>
                  {secQs.map((q) => (
                    <div key={q.id} className="text-xs space-y-1">
                      <p className="font-semibold text-slate-800">{q.prompt}</p>
                      <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 whitespace-pre-wrap">
                        {report.answers[q.id] || 'Sem observações registradas.'}
                      </p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Avaliação Conceitual */}
          {report.dimensionRatings && Object.keys(report.dimensionRatings).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1 font-sans">
                Avaliação Conceitual da Turma
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {DEFAULT_DIMENSIONS.map((dim) => {
                  const val = report.dimensionRatings?.[dim.id];
                  return (
                    <div
                      key={dim.id}
                      className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <span className="text-slate-700">{dim.name}</span>
                      {val ? (
                        <span
                          className={`px-2 py-0.5 rounded border text-[11px] font-semibold shrink-0 ${RATING_LABELS[val].badgeClass}`}
                        >
                          {RATING_LABELS[val].label}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Avaliação Individual de Alunos (se houver) */}
          {report.studentRatings && Object.keys(report.studentRatings).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1 font-sans">
                Avaliação Individual dos Estudantes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {classStudents.map((st) => {
                  const entry = report.studentRatings?.[st.id];
                  if (!entry) return null;
                  return (
                    <div
                      key={st.id}
                      className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          #{st.rollNumber} {st.name}
                        </p>
                        {entry.notes && (
                          <p className="text-[11px] text-slate-500 truncate">{entry.notes}</p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded border text-[11px] font-semibold shrink-0 ${RATING_LABELS[entry.rating].badgeClass}`}
                      >
                        {RATING_LABELS[entry.rating].label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Assinaturas e Homologação */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-slate-900">Coordenação Pedagógica</strong>
                {report.pedagogaSignature?.signed && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              {report.pedagogaSignature?.signed ? (
                <div className="text-slate-600 space-y-1">
                  <p>Assinado por: {report.pedagogaSignature.signedBy}</p>
                  {report.pedagogaSignature.notes && <p>Parecer: {report.pedagogaSignature.notes}</p>}
                </div>
              ) : (
                <p className="text-slate-500">Assinatura do(a) Pedagogo(a) pendente</p>
              )}

              {currentUser.role === 'diretora' && !report.pedagogaSignature?.signed && (
                <div className="no-print space-y-2 pt-2">
                  <input
                    type="text"
                    value={pedagogaNotes}
                    onChange={(e) => setPedagogaNotes(e.target.value)}
                    placeholder="Parecer da coordenação..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => onSignReport(report.id, 'pedagoga', pedagogaNotes)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold cursor-pointer"
                  >
                    Registrar Ciente Pedagógico
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-slate-900">Diretora Escolar</strong>
                {report.diretoraSignature?.signed && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              {report.diretoraSignature?.signed ? (
                <div className="text-slate-600 space-y-1">
                  <p>Homologado por: {report.diretoraSignature.signedBy}</p>
                  {report.diretoraSignature.notes && <p>Parecer: {report.diretoraSignature.notes}</p>}
                </div>
              ) : (
                <p className="text-slate-500">Assinatura da Direção pendente</p>
              )}

              {currentUser.role === 'diretora' && !report.diretoraSignature?.signed && (
                <div className="no-print space-y-2 pt-2">
                  <input
                    type="text"
                    value={diretoraNotes}
                    onChange={(e) => setDiretoraNotes(e.target.value)}
                    placeholder="Parecer da Direção..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => onSignReport(report.id, 'diretora', diretoraNotes)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold cursor-pointer"
                  >
                    Assinar Visto da Direção
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ======================== 2. FALE CONOSCO MODAL ======================== */
interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [senderName, setSenderName] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [subject, setSubject] = useState('Dúvida Pedagógica');
  const [message, setMessage] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const whatsappText = encodeURIComponent(
    `Olá Andrey! Gostaria de falar sobre o sistema Pré-Conselho Escolar Digital.\n[${subject}] ${
      senderName ? `Nome: ${senderName}. ` : ''
    }${message}`
  );
  const mailtoHref = `mailto:${SCHOOL_INFO.email}?subject=${encodeURIComponent(
    `[Pré-Conselho Escolar Digital] ${subject}`
  )}&body=${encodeURIComponent(
    `Nome/Cargo: ${senderName}\nRetorno: ${senderContact}\n\n${message}`
  )}`;

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setSentNotice(
      'Solicitação registrada! Você também pode usar os botões diretos de WhatsApp ou E-mail abaixo.'
    );
    setTimeout(() => setSentNotice(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold">Fale Conosco</h2>
            <p className="text-xs text-slate-300">
              Desenvolvedor do Sistema · {SCHOOL_INFO.developerName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Autoria e Diretrizes */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <p className="font-bold text-slate-900">Desenvolvimento & Autoria</p>
            <p className="text-slate-600">
              Desenvolvido por <strong>{SCHOOL_INFO.developerName}</strong> ·{' '}
              {SCHOOL_INFO.advisorName} · {SCHOOL_INFO.courseLabel}
            </p>
            <p className="text-slate-500">
              Sigilo Pedagógico e LGPD Escolar aplicados — Sistema Homologado para Uso Escolar Real.
            </p>
          </div>

          {/* Canais Diretos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 space-y-2">
              <p className="font-bold text-emerald-900">WhatsApp Direto (Recomendado)</p>
              <p className="font-mono text-emerald-800">{SCHOOL_INFO.whatsappDisplay}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyText(SCHOOL_INFO.whatsappDisplay, 'whats')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-emerald-200 rounded-lg text-emerald-800 font-semibold cursor-pointer"
                >
                  {copiedKey === 'whats' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'whats' ? 'Copiado!' : 'Copiar Número'}</span>
                </button>
                <a
                  href={`https://wa.me/${SCHOOL_INFO.whatsappRaw}?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-700 text-white rounded-lg font-semibold"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Conversar</span>
                </a>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <p className="font-bold text-slate-900">Canal Alternativo: E-mail</p>
              <p className="font-mono text-slate-700 truncate">{SCHOOL_INFO.email}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyText(SCHOOL_INFO.email, 'email')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold cursor-pointer"
                >
                  {copiedKey === 'email' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'email' ? 'Copiado!' : 'Copiar E-mail'}</span>
                </button>
                <a
                  href={mailtoHref}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-white rounded-lg font-semibold"
                >
                  <Mail className="w-3 h-3" />
                  <span>Enviar E-mail</span>
                </a>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmitEmail} className="space-y-3 pt-2 border-t border-slate-200">
            <p className="font-bold text-slate-900">Enviar Mensagem ou Solicitação Direta</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Seu Nome / Cargo"
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
              <input
                type="text"
                value={senderContact}
                onChange={(e) => setSenderContact(e.target.value)}
                placeholder="Seu E-mail ou Telefone (para retorno)"
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            >
              <option value="Dúvida Pedagógica">Dúvida sobre preenchimento das fichas</option>
              <option value="Cadastro de Turma / Professor">
                Cadastro ou alteração de turma / professor
              </option>
              <option value="Sugestão de Melhoria">Sugestão de melhoria para o sistema</option>
              <option value="Problema Técnico">Relato de instabilidade ou problema técnico</option>
            </select>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descreva aqui sua dúvida, sugestão ou informação para o desenvolvedor..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl resize-none"
            />

            {sentNotice && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                {sentNotice}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
              >
                Fechar Janela
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
              >
                Registrar Mensagem
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ======================== 3. PERFIL DA DIRETORIA ======================== */
interface AdminProfileModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSaveProfile: (updated: User) => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  user,
  onClose,
  onSaveProfile,
}) => {
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState(user?.password || '');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setUsername(user.username);
      setEmail(user.email);
      setPassword(user.password);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...user,
      name: name.trim() || user.name,
      username: username.trim() || user.username,
      email: email.trim() || user.email,
      password: password.trim() || user.password,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <h2 className="font-display text-base font-bold">Editar Perfil da Direção</h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-300 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nome de Exibição</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Usuário de Acesso</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Senha</label>
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl cursor-pointer"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ======================== 4. MODAL DE CONFIRMAÇÃO ======================== */
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-xl cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
