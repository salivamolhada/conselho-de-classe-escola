// Dirty Dozen Security Rule Verification Spec
// Each payload below is rejected by firestore.rules:
export const DIRTY_DOZEN_PAYLOADS = [
  { name: 'Ghost field on school_reports', collection: 'school_reports', payload: { isVerified: true }, expected: 'PERMISSION_DENIED' },
  { name: 'Unverified email spoofing admin', auth: { email: 'maioneseraimundo@gmail.com', email_verified: false }, expected: 'PERMISSION_DENIED' },
  { name: 'Non-owner reading school_user_secrets', collection: 'school_user_secrets/prof-carlos', expected: 'PERMISSION_DENIED' },
  { name: 'Unfiltered list query on school_reports by non-admin', collection: 'school_reports', expected: 'PERMISSION_DENIED' },
  { name: 'Identity spoofing ownerUid on report create', collection: 'school_reports', payload: { ownerUid: 'another-uid' }, expected: 'PERMISSION_DENIED' },
  { name: 'Teacher self-signing diretoraSignature', collection: 'school_reports', payload: { status: 'visto', diretoraSignature: { signed: true } }, expected: 'PERMISSION_DENIED' },
  { name: 'Teacher updating locked report (status === visto)', collection: 'school_reports', payload: { status: 'rascunho' }, expected: 'PERMISSION_DENIED' },
  { name: 'Oversized document ID (>128 chars)', collection: `school_classes/${'a'.repeat(200)}`, expected: 'PERMISSION_DENIED' },
  { name: 'Student name string overflow (>140 chars)', collection: 'school_students', payload: { name: 'x'.repeat(300) }, expected: 'PERMISSION_DENIED' },
  { name: 'Teacher classes array overflow (>20 items)', collection: 'school_teachers', payload: { classes: Array(25).fill('6º Ano A') }, expected: 'PERMISSION_DENIED' },
  { name: 'Forged client createdAt timestamp', collection: 'school_classes', payload: { createdAt: '2020-01-01T00:00:00Z' }, expected: 'PERMISSION_DENIED' },
  { name: 'Orphan question referencing non-existent section', collection: 'school_questions', payload: { sectionId: 'sec-missing' }, expected: 'PERMISSION_DENIED' },
];
