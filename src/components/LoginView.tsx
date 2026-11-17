import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  GraduationCap,
  KeyRound,
  Lock,
  LogIn,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { SCHOOL_INFO } from '../data/defaultData';
import { User } from '../types/school';
import { SchoolCrest } from './SchoolCrest';
import { ChristmasLightsGarland } from './christmas/ChristmasLightsGarland';

interface LoginViewProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  onOpenContact: () => void;
  christmasAnimated: boolean;
  onToggleChristmas: () => void;
  firebaseEmail?: string | null;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  firebaseBusy?: boolean;
}

function normalizeStr(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export const LoginView: React.FC<LoginViewProps> = ({
  users,
  onLoginSuccess,
  onOpenContact,
  christmasAnimated,
  onToggleChristmas,
  firebaseEmail,
  onGoogleSignIn,
  onGoogleSignOut,
  firebaseBusy = false,
}) => {
  const [roleTab, setRoleTab] = useState<'professor' | 'diretora'>('professor');
  const [profUsername, setProfUsername] = useState('');
  const [profPassword, setProfPassword] = useState('');
  const [dirUsername, setDirUsername] = useState('admin');
  const [dirPassword, setDirPassword] = useState('');
  const [dirTouched, setDirTouched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const diretoraUser = users.find((u) => u.role === 'diretora');
  const teachersList = users.filter((u) => u.role === 'professor');

  useEffect(() => {
    if (!dirTouched && diretoraUser?.username && diretoraUser.username.trim().toLowerCase() !== 'admin') {
      setDirUsername('');
    }
  }, [diretoraUser?.username, dirTouched]);

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const nameInput = profUsername.trim();
    const passInput = profPassword.trim();

    if (!nameInput) {
      setErrorMsg('Por favor, informe o seu nome de professor cadastrado.');
      return;
    }
    if (!passInput) {
      setErrorMsg('Por favor, digite a sua senha de acesso (padrão: 123).');
      return;
    }

    const normInput = normalizeStr(nameInput);
    const normDirUser = normalizeStr(diretoraUser?.username || 'admin');
    const normDirEmail = normalizeStr(diretoraUser?.email || 'diretoria@escola.gov.br');

    if (normInput === normDirUser || normInput === normDirEmail || normInput === 'diretoria@escola.gov.br') {
      setErrorMsg('Este usuário pertence à Direção. Por favor, acesse através da aba Acesso da Diretoria.');
      return;
    }

    let matched = teachersList.find((t) => {
      const nName = normalizeStr(t.name);
      const nUser = normalizeStr(t.username || t.name);
      const nEmail = normalizeStr(t.email);
      return nName === normInput || nUser === normInput || nEmail === normInput;
    });

    if (!matched) {
      const partials = teachersList.filter((t) => {
        const nName = normalizeStr(t.name);
        return nName.includes(normInput) || normInput.includes(nName);
      });
      if (partials.length === 1) {
        matched = partials[0];
      }
    }

    if (!matched) {
      setErrorMsg(`Professor(a) "${nameInput}" não encontrado(a). Verifique a grafia ou consulte a Direção.`);
      return;
    }

    const expectedPass = matched.password || '123';
    if (passInput !== '123' && passInput !== expectedPass) {
      setErrorMsg('Senha incorreta. A senha padrão de todos os professores é 123.');
      return;
    }

    onLoginSuccess(matched);
  };

  const handleDirectorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const userInput = dirUsername.trim().toLowerCase();
    const passInput = dirPassword.trim();

    if (!userInput) {
      setErrorMsg('Por favor, informe o usuário ou e-mail da Diretoria.');
      return;
    }
    if (!passInput) {
      setErrorMsg('Por favor, digite a senha da Diretoria.');
      return;
    }

    if (
      teachersList.some(
        (t) => normalizeStr(t.name) === normalizeStr(userInput) || normalizeStr(t.username || '') === normalizeStr(userInput)
      )
    ) {
      setErrorMsg('Este usuário pertence a um professor. Por favor, utilize a aba Acesso do Professor.');
      return;
    }

    const expectedUser = (diretoraUser?.username || 'admin').trim().toLowerCase();
    const expectedEmail = (diretoraUser?.email || 'diretoria@escola.gov.br').trim().toLowerCase();
    const expectedName = diretoraUser ? normalizeStr(diretoraUser.name) : '';

    if (
      userInput !== expectedUser &&
      userInput !== expectedEmail &&
      !(expectedName !== '' && normalizeStr(userInput) === expectedName)
    ) {
      setErrorMsg('Usuário da Diretoria inválido. Verifique o usuário ou e-mail cadastrado.');
      return;
    }

    const expectedPass = diretoraUser?.password || '123';
    if (passInput !== expectedPass) {
      setErrorMsg('Senha incorreta para a Diretoria.');
      return;
    }

    if (diretoraUser) {
      onLoginSuccess(diretoraUser);
    }
  };

  const fillTeacherDemo = (teacher: User) => {
    setRoleTab('professor');
    setProfUsername(teacher.name);
    setProfPassword('123');
    setErrorMsg(null);
  };

  const fillDirectorDemo = () => {
    setRoleTab('diretora');
    setDirUsername(diretoraUser?.username || 'admin');
    setDirPassword(diretoraUser?.password || '123');
    setErrorMsg(null);
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Barra superior discreta */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between text-xs text-slate-200/90">
        <span className="font-medium tracking-wide">
          Edição Especial de Natal · Ano Letivo {SCHOOL_INFO.year}
        </span>
        <button
          type="button"
          onClick={onToggleChristmas}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-200 border border-white/15 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{christmasAnimated ? 'Pausar Neve e Noel' : 'Ativar Neve e Noel'}</span>
        </button>
      </div>

      {/* Cartão Central de Login */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg my-6">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <SchoolCrest size="lg" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Pré-Conselho Escolar Digital
          </h1>
          <p className="text-xs font-semibold tracking-wider text-amber-300 mt-1.5">
            {SCHOOL_INFO.schoolName}
          </p>
          <p className="text-xs text-slate-300 mt-0.5">{SCHOOL_INFO.schoolSubtitle}</p>
        </div>

        <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-amber-200/60 overflow-visible">
          {/* Luzes Pisca-Piscas de Natal no topo do cartão */}
          <div className="px-3 -mt-2 pt-1 bg-gradient-to-r from-red-900 via-emerald-900 to-red-900 rounded-t-2xl border-b border-amber-300/40">
            <ChristmasLightsGarland paused={!christmasAnimated} bulbCount={16} />
          </div>

          {/* Abas Professor / Diretoria */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200">
            <button
              type="button"
              id="tab-login-professor"
              onClick={() => {
                setRoleTab('professor');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                roleTab === 'professor'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-red-700" />
              <span>Acesso do Professor</span>
            </button>

            <button
              type="button"
              id="tab-login-diretora"
              onClick={() => {
                setRoleTab('diretora');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                roleTab === 'diretora'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Acesso da Diretoria</span>
            </button>
          </div>

          <div className="p-6 sm:p-7">
            {errorMsg && (
              <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-3 rounded-xl text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {roleTab === 'professor' ? (
              <div>
                <div className="mb-5 pb-3 border-b border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-sans">Portal do Docente</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Preenchimento das fichas pedagógicas</p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-700 tabular-nums">
                    Senha: 123
                  </span>
                </div>

                <form onSubmit={handleTeacherLogin} className="space-y-4">
                  <div>
                    <label htmlFor="prof-username" className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome do Professor (Usuário)
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="prof-username"
                        type="text"
                        value={profUsername}
                        onChange={(e) => setProfUsername(e.target.value)}
                        placeholder="Ex: Carlos Eduardo Souza"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-700"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Seu usuário de acesso é o seu nome completo cadastrado pela Direção.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="prof-password" className="block text-xs font-semibold text-slate-700 mb-1">
                      Senha de Acesso
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="prof-password"
                        type="password"
                        value={profPassword}
                        onChange={(e) => setProfPassword(e.target.value)}
                        placeholder="Padrão: 123"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-700"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-700 hover:bg-red-800 text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Entrar no Sistema</span>
                  </button>
                </form>

                {/* Acesso rápido aos docentes cadastrados */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-500 mb-2">
                    Preenchimento rápido (Docentes cadastrados):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {teachersList.map((teacher) => (
                      <button
                        key={teacher.id}
                        type="button"
                        onClick={() => fillTeacherDemo(teacher)}
                        className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        {teacher.name} · {teacher.subject}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-5 pb-3 border-b border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-sans">Painel da Direção Escolar</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Liberação de fichas e homologação</p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-emerald-800">
                    Acesso Restrito
                  </span>
                </div>

                <form onSubmit={handleDirectorLogin} className="space-y-4">
                  <div>
                    <label htmlFor="dir-username" className="block text-xs font-semibold text-slate-700 mb-1">
                      Usuário ou E-mail da Diretoria
                    </label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="dir-username"
                        type="text"
                        value={dirUsername}
                        onChange={(e) => {
                          setDirTouched(true);
                          setDirUsername(e.target.value);
                        }}
                        placeholder="admin ou diretoria@escola.gov.br"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="dir-password" className="block text-xs font-semibold text-slate-700 mb-1">
                      Senha da Diretoria
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="dir-password"
                        type="password"
                        value={dirPassword}
                        onChange={(e) => setDirPassword(e.target.value)}
                        placeholder="Padrão: 123"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Entrar como Diretora</span>
                  </button>
                </form>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Acesso padrão: <strong className="font-mono text-slate-700">admin / 123</strong>
                  </span>
                  <button
                    type="button"
                    onClick={fillDirectorDemo}
                    className="px-2.5 py-1.5 font-medium bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Preencher Direção
                  </button>
                </div>
              </div>
            )}

            {/* Barra de Conexão com Banco de Dados Firebase */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              {firebaseEmail ? (
                <>
                  <span className="text-emerald-800 font-semibold truncate">
                    Firebase conectado: {firebaseEmail}
                  </span>
                  <button
                    type="button"
                    onClick={onGoogleSignOut}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Desconectar Google
                  </button>
                </>
              ) : (
                <>
                  <span className="text-slate-600">
                    Banco em nuvem (Firestore): conecte sua conta Google
                  </span>
                  <button
                    type="button"
                    disabled={firebaseBusy}
                    onClick={onGoogleSignIn}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {firebaseBusy ? 'Conectando...' : 'Conectar com Google'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé Institucional */}
      <footer className="max-w-3xl w-full mx-auto pt-4 border-t border-white/15 text-center space-y-2 pb-12">
        <p className="text-xs text-slate-200 font-medium">
          Plataforma Institucional de Avaliação Pedagógica · {SCHOOL_INFO.schoolName}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-xs text-slate-300">
          <span>
            Desenvolvido por <strong className="text-amber-300">{SCHOOL_INFO.developerName}</strong> ·{' '}
            {SCHOOL_INFO.advisorName} · {SCHOOL_INFO.courseLabel}
          </span>
          <span aria-hidden="true" className="text-slate-500">
            ·
          </span>
          <span className="text-slate-400">Versão {SCHOOL_INFO.version}</span>
          <span aria-hidden="true" className="text-slate-500">
            ·
          </span>
          <button
            type="button"
            onClick={onOpenContact}
            className="text-amber-300 hover:text-amber-200 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
          >
            Fale Conosco
          </button>
        </div>
      </footer>
    </div>
  );
};
