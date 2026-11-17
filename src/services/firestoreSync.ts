import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  DEFAULT_CLASSES,
  DEFAULT_QUESTIONS,
  DEFAULT_REPORTS,
  DEFAULT_SECTIONS,
  DEFAULT_STUDENTS,
  DEFAULT_USERS,
  SCHOOL_INFO,
} from '../data/defaultData';
import { OperationType, auth, db, handleFirestoreError } from '../firebase';
import {
  Question,
  Report,
  SchoolClass,
  Section,
  Student,
  User,
} from '../types/school';

function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
  return cleaned || `doc-${Date.now()}`;
}

function clampStr(val: string | undefined, max: number, fallback = ''): string {
  return (val ?? fallback).slice(0, max);
}

// Track original Firestore createdAt timestamps so updates preserve immutability
const createdAtRegistry = new Map<string, Timestamp>();

function registerCreatedAt(col: string, id: string, value: unknown) {
  if (value instanceof Timestamp) {
    createdAtRegistry.set(`${col}/${id}`, value);
  }
}

function getCreatedAtForWrite(col: string, id: string) {
  return createdAtRegistry.get(`${col}/${id}`) || serverTimestamp();
}

export function isFirebaseAdminUser(email?: string | null): boolean {
  return Boolean(email && email.toLowerCase() === 'maioneseraimundo@gmail.com');
}

export async function ensureAdminAndSeed(uid: string, email: string): Promise<void> {
  if (!isFirebaseAdminUser(email)) return;

  try {
    const adminRef = doc(db, 'admins', uid);
    await setDoc(
      adminRef,
      {
        uid: sanitizeId(uid),
        email: clampStr(email, 200),
        displayName: clampStr(auth.currentUser?.displayName || 'Diretoria Escolar', 120),
        createdAt: getCreatedAtForWrite('admins', uid),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `admins/${uid}`);
  }

  // Check if school_classes is empty; if empty, seed initial school data
  const classesPath = 'school_classes';
  try {
    const existingClasses = await getDocs(collection(db, classesPath));
    if (existingClasses.empty) {
      await seedAllDefaults(uid);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, classesPath);
  }
}

export async function seedAllDefaults(adminUid: string): Promise<void> {
  // Batch 1: Sections, Classes, Teachers, UserSecrets, Students
  try {
    const batch1 = writeBatch(db);

    DEFAULT_SECTIONS.forEach((sec) => {
      const id = sanitizeId(sec.id);
      batch1.set(doc(db, 'school_sections', id), {
        id,
        title: clampStr(sec.title, 160),
        order: sec.order,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    DEFAULT_CLASSES.forEach((cls) => {
      const id = sanitizeId(cls.id);
      batch1.set(doc(db, 'school_classes', id), {
        id,
        name: clampStr(cls.name, 60),
        shift: clampStr(cls.shift, 50),
        year: clampStr(cls.year, 10),
        ...(cls.description ? { description: clampStr(cls.description, 240) } : {}),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    DEFAULT_USERS.forEach((u) => {
      const id = sanitizeId(u.id);
      batch1.set(doc(db, 'school_teachers', id), {
        id,
        name: clampStr(u.name, 120),
        role: u.role,
        ...(u.subject ? { subject: clampStr(u.subject, 100) } : {}),
        ...(u.classes ? { classes: u.classes.slice(0, 20).map((c) => clampStr(c, 60)) } : {}),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      batch1.set(doc(db, 'school_user_secrets', id), {
        id,
        ownerUid: sanitizeId(adminUid),
        email: clampStr(u.email, 200),
        username: clampStr(u.username, 120),
        accessCode: clampStr(u.password, 64, '123'),
        updatedAt: serverTimestamp(),
      });
    });

    DEFAULT_STUDENTS.forEach((st) => {
      const id = sanitizeId(st.id);
      batch1.set(doc(db, 'school_students', id), {
        id,
        name: clampStr(st.name, 140),
        rollNumber: clampStr(st.rollNumber, 20),
        classGroup: clampStr(st.classGroup, 60),
        status: st.status,
        ...(st.notes ? { notes: clampStr(st.notes, 400) } : {}),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    await batch1.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'school_sections');
  }

  // Batch 2: Questions (requires school_sections to exist) & Sample Reports
  try {
    const batch2 = writeBatch(db);

    DEFAULT_QUESTIONS.forEach((q) => {
      const id = sanitizeId(q.id);
      batch2.set(doc(db, 'school_questions', id), {
        id,
        sectionId: sanitizeId(q.sectionId),
        prompt: clampStr(q.prompt, 400),
        ...(q.placeholder ? { placeholder: clampStr(q.placeholder, 400) } : {}),
        required: Boolean(q.required),
        order: q.order,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    DEFAULT_REPORTS.forEach((rep) => {
      const id = sanitizeId(rep.id);
      batch2.set(doc(db, 'school_reports', id), {
        id,
        ownerUid: sanitizeId(adminUid),
        schoolName: clampStr(rep.schoolName || SCHOOL_INFO.schoolName, 160),
        schoolSubtitle: clampStr(rep.schoolSubtitle || SCHOOL_INFO.schoolSubtitle, 160),
        title: clampStr(rep.title || SCHOOL_INFO.reportTitle, 160),
        teacherId: sanitizeId(rep.teacherId),
        teacherName: clampStr(rep.teacherName, 120),
        component: clampStr(rep.component, 100),
        classGroup: clampStr(rep.classGroup, 60),
        date: clampStr(rep.date, 30),
        bimester: clampStr(rep.bimester, 40),
        status: rep.status,
        answers: rep.answers || {},
        ...(rep.dimensionRatings ? { dimensionRatings: rep.dimensionRatings } : {}),
        ...(rep.studentRatings ? { studentRatings: rep.studentRatings } : {}),
        pedagogaSignature: rep.pedagogaSignature || { signed: false },
        diretoraSignature: rep.diretoraSignature || { signed: false },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    await batch2.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'school_questions');
  }
}

export interface FirestoreSubscriptionsCallbacks {
  onClasses: (items: SchoolClass[]) => void;
  onSections: (items: Section[]) => void;
  onQuestions: (items: Question[]) => void;
  onUsers: (items: User[]) => void;
  onStudents: (items: Student[]) => void;
  onReports: (items: Report[]) => void;
}

export function subscribeSchoolData(
  uid: string,
  isAdmin: boolean,
  callbacks: FirestoreSubscriptionsCallbacks
): () => void {
  const unsubs: Array<() => void> = [];
  let latestTeachers: Array<Partial<User> & { id: string }> = [];
  let latestSecrets: Record<string, { email: string; username: string; accessCode: string }> = {};

  const mergeAndEmitUsers = () => {
    if (latestTeachers.length === 0) return;
    const merged: User[] = latestTeachers.map((t) => {
      const sec = latestSecrets[t.id];
      return {
        id: t.id,
        name: t.name || 'Usuário',
        role: t.role || 'professor',
        subject: t.subject,
        classes: t.classes,
        email: sec?.email || '',
        username: sec?.username || t.name || '',
        password: sec?.accessCode || '123',
        createdAt: t.createdAt || new Date().toISOString().split('T')[0],
      };
    });
    callbacks.onUsers(merged);
  };

  unsubs.push(
    onSnapshot(
      collection(db, 'school_classes'),
      (snap) => {
        const list: SchoolClass[] = snap.docs.map((d) => {
          const data = d.data();
          registerCreatedAt('school_classes', d.id, data.createdAt);
          return {
            id: d.id,
            name: String(data.name || ''),
            shift: String(data.shift || ''),
            year: String(data.year || ''),
            description: data.description ? String(data.description) : undefined,
          };
        });
        if (list.length > 0) callbacks.onClasses(list);
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'school_classes')
    )
  );

  unsubs.push(
    onSnapshot(
      collection(db, 'school_sections'),
      (snap) => {
        const list: Section[] = snap.docs
          .map((d) => {
            const data = d.data();
            registerCreatedAt('school_sections', d.id, data.createdAt);
            return {
              id: d.id,
              title: String(data.title || ''),
              order: Number(data.order || 0),
            };
          })
          .sort((a, b) => a.order - b.order);
        if (list.length > 0) callbacks.onSections(list);
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'school_sections')
    )
  );

  unsubs.push(
    onSnapshot(
      collection(db, 'school_questions'),
      (snap) => {
        const list: Question[] = snap.docs
          .map((d) => {
            const data = d.data();
            registerCreatedAt('school_questions', d.id, data.createdAt);
            return {
              id: d.id,
              sectionId: String(data.sectionId || ''),
              prompt: String(data.prompt || ''),
              placeholder: data.placeholder ? String(data.placeholder) : undefined,
              required: Boolean(data.required),
              order: Number(data.order || 0),
            };
          })
          .sort((a, b) => a.order - b.order);
        if (list.length > 0) callbacks.onQuestions(list);
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'school_questions')
    )
  );

  unsubs.push(
    onSnapshot(
      collection(db, 'school_teachers'),
      (snap) => {
        latestTeachers = snap.docs.map((d) => {
          const data = d.data();
          registerCreatedAt('school_teachers', d.id, data.createdAt);
          return {
            id: d.id,
            name: String(data.name || ''),
            role: data.role === 'diretora' ? 'diretora' : 'professor',
            subject: data.subject ? String(data.subject) : undefined,
            classes: Array.isArray(data.classes) ? data.classes.map(String) : undefined,
          };
        });
        mergeAndEmitUsers();
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'school_teachers')
    )
  );

  const secretsQuery = isAdmin
    ? collection(db, 'school_user_secrets')
    : query(collection(db, 'school_user_secrets'), where('ownerUid', '==', uid));

  unsubs.push(
    onSnapshot(
      secretsQuery,
      (snap) => {
        const next: Record<string, { email: string; username: string; accessCode: string }> = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          next[d.id] = {
            email: String(data.email || ''),
            username: String(data.username || ''),
            accessCode: String(data.accessCode || '123'),
          };
        });
        latestSecrets = next;
        mergeAndEmitUsers();
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'school_user_secrets')
    )
  );

  if (isAdmin) {
    unsubs.push(
      onSnapshot(
        collection(db, 'school_students'),
        (snap) => {
          const list: Student[] = snap.docs.map((d) => {
            const data = d.data();
            registerCreatedAt('school_students', d.id, data.createdAt);
            return {
              id: d.id,
              name: String(data.name || ''),
              rollNumber: String(data.rollNumber || ''),
              classGroup: String(data.classGroup || ''),
              status:
                data.status === 'atencao' || data.status === 'transferido'
                  ? data.status
                  : 'ativo',
              notes: data.notes ? String(data.notes) : undefined,
            };
          });
          if (list.length > 0) callbacks.onStudents(list);
        },
        (error) => handleFirestoreError(error, OperationType.GET, 'school_students')
      )
    );
  }

  const reportsQuery = isAdmin
    ? collection(db, 'school_reports')
    : query(collection(db, 'school_reports'), where('ownerUid', '==', uid));

  unsubs.push(
    onSnapshot(
      reportsQuery,
      (snap) => {
        const list: Report[] = snap.docs.map((d) => {
          const data = d.data();
          registerCreatedAt('school_reports', d.id, data.createdAt);
          return {
            id: d.id,
            schoolName: String(data.schoolName || SCHOOL_INFO.schoolName),
            schoolSubtitle: String(data.schoolSubtitle || SCHOOL_INFO.schoolSubtitle),
            title: String(data.title || SCHOOL_INFO.reportTitle),
            teacherId: String(data.teacherId || ''),
            teacherName: String(data.teacherName || ''),
            component: String(data.component || ''),
            classGroup: String(data.classGroup || ''),
            date: String(data.date || ''),
            bimester: String(data.bimester || ''),
            status: data.status || 'pendente',
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : String(data.createdAt || ''),
            updatedAt:
              data.updatedAt instanceof Timestamp
                ? data.updatedAt.toDate().toISOString()
                : String(data.updatedAt || ''),
            answers: (data.answers as Record<string, string>) || {},
            dimensionRatings: data.dimensionRatings,
            studentRatings: data.studentRatings,
            pedagogaSignature: data.pedagogaSignature || { signed: false },
            diretoraSignature: data.diretoraSignature || { signed: false },
          };
        });
        if (list.length > 0 || !isAdmin) callbacks.onReports(list);
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'school_reports')
    )
  );

  return () => {
    unsubs.forEach((u) => u());
  };
}

export async function syncClassChange(
  prev: SchoolClass[],
  next: SchoolClass[]
): Promise<void> {
  const prevMap = new Map(prev.map((i) => [i.id, i]));
  const nextMap = new Map(next.map((i) => [i.id, i]));

  for (const item of next) {
    const id = sanitizeId(item.id);
    if (!prevMap.has(item.id) || JSON.stringify(prevMap.get(item.id)) !== JSON.stringify(item)) {
      try {
        await setDoc(doc(db, 'school_classes', id), {
          id,
          name: clampStr(item.name, 60),
          shift: clampStr(item.shift, 50),
          year: clampStr(item.year, 10),
          ...(item.description ? { description: clampStr(item.description, 240) } : {}),
          createdAt: getCreatedAtForWrite('school_classes', id),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `school_classes/${id}`);
      }
    }
  }

  for (const item of prev) {
    if (!nextMap.has(item.id)) {
      const id = sanitizeId(item.id);
      try {
        await deleteDoc(doc(db, 'school_classes', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `school_classes/${id}`);
      }
    }
  }
}

export async function syncStudentsChange(
  prev: Student[],
  next: Student[]
): Promise<void> {
  const prevMap = new Map(prev.map((i) => [i.id, i]));
  const nextMap = new Map(next.map((i) => [i.id, i]));

  for (const item of next) {
    const id = sanitizeId(item.id);
    if (!prevMap.has(item.id) || JSON.stringify(prevMap.get(item.id)) !== JSON.stringify(item)) {
      try {
        await setDoc(doc(db, 'school_students', id), {
          id,
          name: clampStr(item.name, 140),
          rollNumber: clampStr(item.rollNumber, 20),
          classGroup: clampStr(item.classGroup, 60),
          status: item.status,
          ...(item.notes ? { notes: clampStr(item.notes, 400) } : {}),
          createdAt: getCreatedAtForWrite('school_students', id),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `school_students/${id}`);
      }
    }
  }

  for (const item of prev) {
    if (!nextMap.has(item.id)) {
      const id = sanitizeId(item.id);
      try {
        await deleteDoc(doc(db, 'school_students', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `school_students/${id}`);
      }
    }
  }
}

export async function syncSectionsChange(
  prev: Section[],
  next: Section[]
): Promise<void> {
  const prevMap = new Map(prev.map((i) => [i.id, i]));
  for (const item of next) {
    const id = sanitizeId(item.id);
    if (!prevMap.has(item.id) || JSON.stringify(prevMap.get(item.id)) !== JSON.stringify(item)) {
      try {
        await setDoc(doc(db, 'school_sections', id), {
          id,
          title: clampStr(item.title, 160),
          order: item.order,
          createdAt: getCreatedAtForWrite('school_sections', id),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `school_sections/${id}`);
      }
    }
  }
}

export async function syncQuestionsChange(
  prev: Question[],
  next: Question[]
): Promise<void> {
  const prevMap = new Map(prev.map((i) => [i.id, i]));
  const nextMap = new Map(next.map((i) => [i.id, i]));

  for (const item of next) {
    const id = sanitizeId(item.id);
    if (!prevMap.has(item.id) || JSON.stringify(prevMap.get(item.id)) !== JSON.stringify(item)) {
      try {
        await setDoc(doc(db, 'school_questions', id), {
          id,
          sectionId: sanitizeId(item.sectionId),
          prompt: clampStr(item.prompt, 400),
          ...(item.placeholder ? { placeholder: clampStr(item.placeholder, 400) } : {}),
          required: Boolean(item.required),
          order: item.order,
          createdAt: getCreatedAtForWrite('school_questions', id),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `school_questions/${id}`);
      }
    }
  }

  for (const item of prev) {
    if (!nextMap.has(item.id)) {
      const id = sanitizeId(item.id);
      try {
        await deleteDoc(doc(db, 'school_questions', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `school_questions/${id}`);
      }
    }
  }
}

export async function syncUsersChange(
  prev: User[],
  next: User[],
  adminUid: string
): Promise<void> {
  const prevMap = new Map(prev.map((i) => [i.id, i]));
  const nextMap = new Map(next.map((i) => [i.id, i]));

  for (const u of next) {
    const id = sanitizeId(u.id);
    if (!prevMap.has(u.id) || JSON.stringify(prevMap.get(u.id)) !== JSON.stringify(u)) {
      try {
        await setDoc(doc(db, 'school_teachers', id), {
          id,
          name: clampStr(u.name, 120),
          role: u.role,
          ...(u.subject ? { subject: clampStr(u.subject, 100) } : {}),
          ...(u.classes ? { classes: u.classes.slice(0, 20).map((c) => clampStr(c, 60)) } : {}),
          createdAt: getCreatedAtForWrite('school_teachers', id),
          updatedAt: serverTimestamp(),
        });

        await setDoc(doc(db, 'school_user_secrets', id), {
          id,
          ownerUid: sanitizeId(adminUid),
          email: clampStr(u.email, 200),
          username: clampStr(u.username, 120),
          accessCode: clampStr(u.password, 64, '123'),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `school_teachers/${id}`);
      }
    }
  }

  for (const u of prev) {
    if (!nextMap.has(u.id)) {
      const id = sanitizeId(u.id);
      try {
        await deleteDoc(doc(db, 'school_teachers', id));
        await deleteDoc(doc(db, 'school_user_secrets', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `school_teachers/${id}`);
      }
    }
  }
}

export async function saveReportToFirestore(rep: Report, uid: string): Promise<void> {
  const id = sanitizeId(rep.id);
  try {
    await setDoc(doc(db, 'school_reports', id), {
      id,
      ownerUid: sanitizeId(uid),
      schoolName: clampStr(rep.schoolName || SCHOOL_INFO.schoolName, 160),
      schoolSubtitle: clampStr(rep.schoolSubtitle || SCHOOL_INFO.schoolSubtitle, 160),
      title: clampStr(rep.title || SCHOOL_INFO.reportTitle, 160),
      teacherId: sanitizeId(rep.teacherId),
      teacherName: clampStr(rep.teacherName, 120),
      component: clampStr(rep.component, 100),
      classGroup: clampStr(rep.classGroup, 60),
      date: clampStr(rep.date, 30),
      bimester: clampStr(rep.bimester, 40),
      status: rep.status,
      answers: rep.answers || {},
      ...(rep.dimensionRatings ? { dimensionRatings: rep.dimensionRatings } : {}),
      ...(rep.studentRatings ? { studentRatings: rep.studentRatings } : {}),
      pedagogaSignature: rep.pedagogaSignature || { signed: false },
      diretoraSignature: rep.diretoraSignature || { signed: false },
      createdAt: getCreatedAtForWrite('school_reports', id),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `school_reports/${id}`);
  }
}

export async function deleteReportFromFirestore(reportId: string): Promise<void> {
  const id = sanitizeId(reportId);
  try {
    await deleteDoc(doc(db, 'school_reports', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `school_reports/${id}`);
  }
}
