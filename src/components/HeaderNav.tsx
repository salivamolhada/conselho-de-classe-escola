import React from 'react';
import {
  Archive,
  BarChart3,
  Database,
  Eye,
  FileSpreadsheet,
  FileText,
  Layers,
  ListChecks,
  LogOut,
  PenLine,
  RotateCcw,
  Send,
  Sparkles,
  UserCog,
  Users,
} from 'lucide-react';
import { SCHOOL_INFO } from '../data/defaultData';
import { AppTab, User } from '../types/school';
import { SchoolCrest } from './SchoolCrest';
import { ChristmasLightsGarland } from './christmas/ChristmasLightsGarland';

interface HeaderNavProps {
  currentUser: User;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onLogout: () => void;
  onOpenContact: () => void;
  onOpenResetConfirm: () => void;
  onOpenProfile?: () => void;
  christmasAnimated: boolean;
  onToggleChristmas: () => void;
  firebaseEmail?: string | null;
  onGoogleSignIn: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onLogout,
  onOpenContact,
  onOpenResetConfirm,
  onOpenProfile,
  christmasAnimated,
  onToggleChristmas,
  firebaseEmail,
  onGoogleSignIn,
}) => {
  const isDirector = currentUser.role === 'diretora';

  const isManagementGroup = ['students', 'classes', 'release', 'teachers', 'questions'].includes(activeTab);

  return (
    <header className="sticky top-0 z-30 no-print bg-white/95 backdrop-blur-md border-b border-amber-200/70 shadow-sm">
      {/* Zona 1, 2 e 3 estritamente em uma linha */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zona 1: Marca em 1 linha */}
        <button
          type="button"
          onClick={() => onSelectTab(isDirector ? 'archive' : 'my-reports')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 cursor-pointer"
        >
          <SchoolCrest size="sm" />
          <span className="font-display text-base sm:text-lg font-bold text-slate-900 tracking-tight whitespace-nowrap shrink-0">
            Pré-Conselho Digital
          </span>
        </button>

        {/* Zona 2: 4–5 links de navegação concisos */}
        <nav
          aria-label="Navegação Principal"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          {isDirector ? (
            <>
              <button
                type="button"
                onClick={() => onSelectTab('archive')}
                className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'archive'
                    ? 'border-red-700 text-slate-900 font-semibold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                Fichas Arquivadas
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('performance')}
                className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'performance'
                    ? 'border-red-700 text-slate-900 font-semibold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                Desempenho Geral
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('panorama')}
                className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'panorama'
                    ? 'border-red-700 text-slate-900 font-semibold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                Panorama da Turma
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('students')}
                className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                  isManagementGroup
                    ? 'border-red-700 text-slate-900 font-semibold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                Gestão Escolar
              </button>
              <button
                type="button"
                onClick={onOpenContact}
                className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:text-slate-900 transition-colors cursor-pointer"
              >
                Fale Conosco
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onSelectTab('my-reports')}
                className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'my-reports'
                    ? 'border-red-700 text-slate-900 font-semibold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                Minhas Fichas
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('panorama')}
                className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'panorama'
                    ? 'border-red-700 text-slate-900 font-semibold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                Panorama da Turma
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('performance')}
                className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'performance'
                    ? 'border-red-700 text-slate-900 font-semibold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                Desempenho da Turma
              </button>
              <button
                type="button"
                onClick={onOpenContact}
                className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:text-slate-900 transition-colors cursor-pointer"
              >
                Fale Conosco
              </button>
            </>
          )}
        </nav>

        {/* Zona 3: 1 ação primária */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            id="btn-logout"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="Sair do sistema"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Cordão de luzes pisca-piscas natalinas abaixo do cabeçalho */}
      <div className="bg-slate-900/95 border-t border-amber-400/20 px-4">
        <div className="max-w-7xl mx-auto">
          <ChristmasLightsGarland paused={!christmasAnimated} bulbCount={28} />
        </div>
      </div>

      {/* Barra contextual de ferramentas e módulos da escola */}
      <div className="bg-slate-50/95 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            {isDirector ? (
              <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl">
                {[
                  { id: 'archive', label: 'Fichas Arquivadas', icon: Archive },
                  { id: 'performance', label: 'Desempenho Geral', icon: BarChart3 },
                  { id: 'panorama', label: 'Panorama da Turma', icon: Eye },
                  { id: 'students', label: 'Alunos e Turmas', icon: FileSpreadsheet },
                  { id: 'classes', label: 'Turmas', icon: Layers },
                  { id: 'release', label: 'Liberar Fichas', icon: Send },
                  { id: 'teachers', label: 'Professores', icon: Users },
                  { id: 'questions', label: 'Perguntas', icon: ListChecks },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectTab(item.id as AppTab)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        active
                          ? 'bg-white text-slate-900 font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl">
                {activeTab === 'new-form' && (
                  <button
                    type="button"
                    onClick={() => onSelectTab('new-form')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-amber-600 text-white font-semibold shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    <span>Preenchendo Ficha</span>
                  </button>
                )}
                {[
                  { id: 'my-reports', label: 'Minhas Fichas', icon: FileText },
                  { id: 'panorama', label: 'Panorama da Turma', icon: Eye },
                  { id: 'performance', label: 'Desempenho da Turma', icon: BarChart3 },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectTab(item.id as AppTab)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        active
                          ? 'bg-white text-slate-900 font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ações utilitárias & usuário logado */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 text-xs">
            <span className="text-slate-600 hidden sm:inline">
              <strong className="text-slate-900">{currentUser.name}</strong> ·{' '}
              {isDirector ? 'Diretoria Escolar' : currentUser.subject || 'Docente'}
            </span>

            {isDirector && onOpenProfile && (
              <button
                type="button"
                onClick={onOpenProfile}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <UserCog className="w-3.5 h-3.5" />
                <span>Perfil</span>
              </button>
            )}

            <button
              type="button"
              onClick={onGoogleSignIn}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 border rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                firebaseEmail
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title={firebaseEmail ? `Sincronizado via ${firebaseEmail}` : 'Conectar banco de dados Firebase'}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{firebaseEmail ? 'Firebase Ativo' : 'Conectar Firebase'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleChristmas}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Pausar ou retomar efeitos de Natal"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{christmasAnimated ? 'Pausar Natal' : 'Ativar Natal'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenResetConfirm}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Restaurar dados padrão do sistema"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrão</span>
            </button>
          </div>
        </div>
      </div>

      {/* Faixa institucional discreta em telas menores */}
      <div className="sr-only">{SCHOOL_INFO.schoolName}</div>
    </header>
  );
};
