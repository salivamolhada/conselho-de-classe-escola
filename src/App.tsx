import React, { useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  DEFAULT_CLASSES,
  DEFAULT_QUESTIONS,
  DEFAULT_REPORTS,
  DEFAULT_SECTIONS,
  DEFAULT_STUDENTS,
  DEFAULT_USERS,
  SCHOOL_INFO,
  STORAGE_KEYS,
} from './data/defaultData';
import {
  AppTab,
  Question,
  Report,
  SchoolClass,
  Section,
  Student,
  User,
} from './types/school';
import { auth, googleProvider } from './firebase';
import {
  deleteReportFromFirestore,
  ensureAdminAndSeed,
  isFirebaseAdminUser,
  saveReportToFirestore,
  seedAllDefaults,
  subscribeSchoolData,
  syncClassChange,
  syncQuestionsChange,
  syncSectionsChange,
  syncStudentsChange,
  syncUsersChange,
} from './services/firestoreSync';
import { ChristmasSkyScene } from './components/christmas/ChristmasSkyScene';
import { LoginView } from './components/LoginView';
import { HeaderNav } from './components/HeaderNav';
import { TeacherReportsView } from './components/TeacherReportsView';
import { ReportForm } from './components/ReportForm';
import { DirectorArchiveView } from './components/DirectorArchiveView';
import { PanoramaView, PerformanceView } from './components/PerformancePanoramaView';
import {
  ClassesManagementView,
  QuestionsManagementView,
  ReleaseManagementView,
  StudentsManagementView,
  TeachersManagementView,
} from './components/ManagementViews';
import {
  AdminProfileModal,
  ConfirmModal,
  ContactModal,
  ReportPreviewModal,
} from './components/Modals';

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [users, setUsers] = useState<User[]>(() => loadStored(STORAGE_KEYS.users, DEFAULT_USERS));
  const [classes, setClasses] = useState<SchoolClass[]>(() =>
    loadStored(STORAGE_KEYS.classes, DEFAULT_CLASSES)
  );
  const [students, setStudents] = useState<Student[]>(() =>
    loadStored(STORAGE_KEYS.students, DEFAULT_STUDENTS)
  );
  const [sections, setSections] = useState<Section[]>(() =>
    loadStored(STORAGE_KEYS.sections, DEFAULT_SECTIONS)
  );
  const [questions, setQuestions] = useState<Question[]>(() =>
    loadStored(STORAGE_KEYS.questions, DEFAULT_QUESTIONS)
  );
  const [reports, setReports] = useState<Report[]>(() =>
    loadStored(STORAGE_KEYS.reports, DEFAULT_REPORTS)
  );
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.currentUser);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [firebaseBusy, setFirebaseBusy] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AppTab>(() =>
    currentUser?.role === 'diretora' ? 'archive' : 'my-reports'
  );
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [previewReport, setPreviewReport] = useState<Report | null>(null);
  const [autoPrintPreview, setAutoPrintPreview] = useState(false);

  const [contactOpen, setContactOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [deleteTargetReport, setDeleteTargetReport] = useState<Report | null>(null);
  const [christmasAnimated, setChristmasAnimated] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady || !firebaseUser || !firebaseUser.emailVerified) return;

    const isAdmin = isFirebaseAdminUser(firebaseUser.email);
    let active = true;
    let unsubData: (() => void) | undefined;

    (async () => {
      try {
        if (isAdmin) {
          await ensureAdminAndSeed(firebaseUser.uid, firebaseUser.email || '');
        }
        if (!active) return;
        unsubData = subscribeSchoolData(firebaseUser.uid, isAdmin, {
          onClasses: setClasses,
          onSections: setSections,
          onQuestions: setQuestions,
          onUsers: setUsers,
          onStudents: setStudents,
          onReports: setReports,
        });
      } catch (err) {
        if (active) {
          setSyncError(err instanceof Error ? err.message : 'Erro ao conectar ao Firebase.');
        }
      }
    })();

    return () => {
      active = false;
      unsubData?.();
    };
  }, [authReady, firebaseUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.classes, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.sections, JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.questions, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.reports, JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
    }
  }, [currentUser]);

  const handleGoogleSignIn = async () => {
    setSyncError(null);
    setFirebaseBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setSyncError(
        err instanceof Error
          ? `Falha ao autenticar no Google/Firebase: ${err.message}`
          : 'Não foi possível conectar com o Google.'
      );
    } finally {
      setFirebaseBusy(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await signOut(auth);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveTab(user.role === 'diretora' ? 'archive' : 'my-reports');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEditingReport(null);
  };

  const isCloudAdmin = Boolean(firebaseUser?.emailVerified && isFirebaseAdminUser(firebaseUser.email));

  const updateClasses = (next: SchoolClass[]) => {
    const prev = classes;
    setClasses(next);
    if (isCloudAdmin) {
      syncClassChange(prev, next).catch((e) => setSyncError(String(e)));
    }
  };

  const updateStudents = (next: Student[]) => {
    const prev = students;
    setStudents(next);
    if (isCloudAdmin) {
      syncStudentsChange(prev, next).catch((e) => setSyncError(String(e)));
    }
  };

  const updateSections = (next: Section[]) => {
    const prev = sections;
    setSections(next);
    if (isCloudAdmin) {
      syncSectionsChange(prev, next).catch((e) => setSyncError(String(e)));
    }
  };

  const updateQuestions = (next: Question[]) => {
    const prev = questions;
    setQuestions(next);
    if (isCloudAdmin) {
      syncQuestionsChange(prev, next).catch((e) => setSyncError(String(e)));
    }
  };

  const updateUsers = (next: User[]) => {
    const prev = users;
    setUsers(next);
    if (isCloudAdmin && firebaseUser) {
      syncUsersChange(prev, next, firebaseUser.uid).catch((e) => setSyncError(String(e)));
    }
  };

  const updateReportsBulk = (next: Report[]) => {
    const prevMap = new Map(reports.map((r) => [r.id, r]));
    const nextMap = new Map(next.map((r) => [r.id, r]));
    setReports(next);

    if (firebaseUser?.emailVerified) {
      next.forEach((rep) => {
        const old = prevMap.get(rep.id);
        if (!old || JSON.stringify(old) !== JSON.stringify(rep)) {
          saveReportToFirestore(rep, firebaseUser.uid).catch((e) => setSyncError(String(e)));
        }
      });
      if (isCloudAdmin) {
        reports.forEach((rep) => {
          if (!nextMap.has(rep.id)) {
            deleteReportFromFirestore(rep.id).catch((e) => setSyncError(String(e)));
          }
        });
      }
    }
  };

  const handleSaveReport = (saved: Report) => {
    setReports((prev) => {
      const exists = prev.some((r) => r.id === saved.id);
      if (exists) {
        return prev.map((r) => (r.id === saved.id ? saved : r));
      }
      return [saved, ...prev];
    });
    if (firebaseUser?.emailVerified) {
      saveReportToFirestore(saved, firebaseUser.uid).catch((e) => setSyncError(String(e)));
    }
    if (saved.status === 'enviado') {
      setEditingReport(null);
      setActiveTab('my-reports');
    } else {
      setEditingReport(saved);
    }
  };

  const handleSignReport = (
    reportId: string,
    role: 'pedagoga' | 'diretora',
    notes: string
  ) => {
    const nowIso = new Date().toISOString();
    let updatedTarget: Report | null = null;
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        const updated: Report = {
          ...r,
          updatedAt: nowIso,
        };
        if (role === 'pedagoga') {
          updated.pedagogaSignature = {
            signed: true,
            signedBy: 'Coordenação Pedagógica',
            signedAt: nowIso,
            notes,
          };
        } else {
          updated.status = 'visto';
          updated.diretoraSignature = {
            signed: true,
            signedBy: currentUser?.name || 'Diretora Escolar',
            signedAt: nowIso,
            notes,
          };
        }
        updatedTarget = updated;
        if (previewReport?.id === reportId) {
          setPreviewReport(updated);
        }
        return updated;
      })
    );
    if (updatedTarget && firebaseUser?.emailVerified && isCloudAdmin) {
      saveReportToFirestore(updatedTarget, firebaseUser.uid).catch((e) =>
        setSyncError(String(e))
      );
    }
  };

  const handleQuickSign = (reportId: string) => {
    handleSignReport(reportId, 'diretora', 'Homologado para o Conselho de Classe.');
  };

  const handleResetDefaults = async () => {
    setUsers(DEFAULT_USERS);
    setClasses(DEFAULT_CLASSES);
    setStudents(DEFAULT_STUDENTS);
    setSections(DEFAULT_SECTIONS);
    setQuestions(DEFAULT_QUESTIONS);
    setReports(DEFAULT_REPORTS);
    if (currentUser) {
      const refreshed = DEFAULT_USERS.find((u) => u.id === currentUser.id);
      if (refreshed) setCurrentUser(refreshed);
    }
    if (isCloudAdmin && firebaseUser) {
      try {
        await seedAllDefaults(firebaseUser.uid);
      } catch (e) {
        setSyncError(String(e));
      }
    }
    setResetConfirmOpen(false);
  };

  const handleSaveAdminProfile = (updated: User) => {
    const next = users.map((u) => (u.id === updated.id ? updated : u));
    updateUsers(next);
    setCurrentUser(updated);
  };

  const teachersList = users.filter((u) => u.role === 'professor');

  return (
    <div className="min-h-screen relative flex flex-col">
      <ChristmasSkyScene enabled={christmasAnimated} />

      {syncError && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-rose-950 text-rose-100 border border-rose-700 rounded-xl px-4 py-3 text-xs shadow-xl flex items-start justify-between gap-3">
          <span className="break-words">{syncError}</span>
          <button
            type="button"
            onClick={() => setSyncError(null)}
            className="text-rose-300 hover:text-white font-bold cursor-pointer shrink-0"
          >
            Fechar
          </button>
        </div>
      )}

      {!currentUser ? (
        <LoginView
          users={users}
          onLoginSuccess={handleLoginSuccess}
          onOpenContact={() => setContactOpen(true)}
          christmasAnimated={christmasAnimated}
          onToggleChristmas={() => setChristmasAnimated((v) => !v)}
          firebaseEmail={firebaseUser?.email}
          onGoogleSignIn={handleGoogleSignIn}
          onGoogleSignOut={handleGoogleSignOut}
          firebaseBusy={firebaseBusy}
        />
      ) : (
        <div className="relative z-10 flex-1 flex flex-col">
          <HeaderNav
            currentUser={currentUser}
            activeTab={activeTab}
            onSelectTab={(tab) => {
              if (tab !== 'new-form') setEditingReport(null);
              setActiveTab(tab);
            }}
            onLogout={handleLogout}
            onOpenContact={() => setContactOpen(true)}
            onOpenResetConfirm={() => setResetConfirmOpen(true)}
            onOpenProfile={
              currentUser.role === 'diretora' ? () => setProfileOpen(true) : undefined
            }
            christmasAnimated={christmasAnimated}
            onToggleChristmas={() => setChristmasAnimated((v) => !v)}
            firebaseEmail={firebaseUser?.email}
            onGoogleSignIn={handleGoogleSignIn}
          />

          <main className="flex-1 pb-24">
            {currentUser.role === 'professor' && activeTab === 'my-reports' && (
              <TeacherReportsView
                currentUser={currentUser}
                reports={reports}
                classes={classes}
                onEditReport={(rep) => {
                  setEditingReport(rep);
                  setActiveTab('new-form');
                }}
                onPreviewReport={(rep, autoPrint) => {
                  setPreviewReport(rep);
                  setAutoPrintPreview(Boolean(autoPrint));
                }}
              />
            )}

            {currentUser.role === 'professor' && activeTab === 'new-form' && (
              <ReportForm
                currentUser={currentUser}
                questions={questions}
                sections={sections}
                editingReport={editingReport}
                students={students}
                classes={classes}
                onSaveReport={handleSaveReport}
                onCancel={() => {
                  setEditingReport(null);
                  setActiveTab('my-reports');
                }}
              />
            )}

            {activeTab === 'panorama' && (
              <PanoramaView
                reports={reports}
                students={students}
                classes={classes}
                sections={sections}
                questions={questions}
                onOpenReport={(rep) => {
                  setPreviewReport(rep);
                  setAutoPrintPreview(false);
                }}
              />
            )}

            {activeTab === 'performance' && (
              <PerformanceView
                reports={reports}
                students={students}
                classes={classes}
                isTeacherOnly={currentUser.role === 'professor'}
                teacherId={currentUser.id}
              />
            )}

            {currentUser.role === 'diretora' && activeTab === 'archive' && (
              <DirectorArchiveView
                reports={reports}
                teachers={teachersList}
                onOpenReport={(rep, autoPrint) => {
                  setPreviewReport(rep);
                  setAutoPrintPreview(Boolean(autoPrint));
                }}
                onQuickSign={handleQuickSign}
                onRequestDelete={(rep) => setDeleteTargetReport(rep)}
              />
            )}

            {currentUser.role === 'diretora' && activeTab === 'students' && (
              <StudentsManagementView
                students={students}
                classes={classes}
                onSaveStudents={updateStudents}
              />
            )}

            {currentUser.role === 'diretora' && activeTab === 'classes' && (
              <ClassesManagementView classes={classes} onSaveClasses={updateClasses} />
            )}

            {currentUser.role === 'diretora' && activeTab === 'release' && (
              <ReleaseManagementView
                reports={reports}
                teachers={teachersList}
                classes={classes}
                onSaveReports={updateReportsBulk}
                onOpenReport={(rep) => {
                  setPreviewReport(rep);
                  setAutoPrintPreview(false);
                }}
              />
            )}

            {currentUser.role === 'diretora' && activeTab === 'teachers' && (
              <TeachersManagementView
                users={users}
                classes={classes}
                onSaveUsers={updateUsers}
              />
            )}

            {currentUser.role === 'diretora' && activeTab === 'questions' && (
              <QuestionsManagementView
                sections={sections}
                questions={questions}
                onSaveSections={updateSections}
                onSaveQuestions={updateQuestions}
              />
            )}
          </main>

          <footer className="no-print relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 pb-20 pt-4 text-center text-xs text-slate-200/90">
            <div className="bg-slate-950/65 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>
                {SCHOOL_INFO.schoolName} · {SCHOOL_INFO.schoolSubtitle}
              </span>
              <span>
                Desenvolvido por <strong className="text-amber-300">{SCHOOL_INFO.developerName}</strong> ·{' '}
                {SCHOOL_INFO.advisorName} · Versão {SCHOOL_INFO.version}
              </span>
            </div>
          </footer>
        </div>
      )}

      <ReportPreviewModal
        report={previewReport}
        questions={questions}
        sections={sections}
        students={students}
        currentUser={
          currentUser || {
            id: '',
            name: '',
            email: '',
            username: '',
            password: '',
            role: 'professor',
            createdAt: '',
          }
        }
        autoPrint={autoPrintPreview}
        onAutoPrintDone={() => setAutoPrintPreview(false)}
        onClose={() => {
          setPreviewReport(null);
          setAutoPrintPreview(false);
        }}
        onSignReport={handleSignReport}
      />

      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />

      <AdminProfileModal
        isOpen={profileOpen}
        user={currentUser}
        onClose={() => setProfileOpen(false)}
        onSaveProfile={handleSaveAdminProfile}
      />

      <ConfirmModal
        isOpen={resetConfirmOpen}
        title="Restaurar Dados Padrão"
        message="Deseja restaurar as perguntas, turmas, estudantes, fichas e professores para os dados iniciais padrão do sistema escolar? Alterações locais e na nuvem serão redefinidas."
        confirmLabel="Restaurar Padrão"
        onConfirm={handleResetDefaults}
        onCancel={() => setResetConfirmOpen(false)}
      />

      <ConfirmModal
        isOpen={Boolean(deleteTargetReport)}
        title="Excluir Ficha Arquivada"
        message={
          deleteTargetReport
            ? `Tem certeza que deseja excluir a ficha de ${deleteTargetReport.component} (${deleteTargetReport.classGroup} · ${deleteTargetReport.teacherName})?`
            : ''
        }
        confirmLabel="Excluir Ficha"
        onConfirm={() => {
          if (deleteTargetReport) {
            setReports((prev) => prev.filter((r) => r.id !== deleteTargetReport.id));
            if (isCloudAdmin) {
              deleteReportFromFirestore(deleteTargetReport.id).catch((e) =>
                setSyncError(String(e))
              );
            }
            setDeleteTargetReport(null);
          }
        }}
        onCancel={() => setDeleteTargetReport(null)}
      />
    </div>
  );
}
