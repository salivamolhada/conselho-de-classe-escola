# Especificação de Segurança Firestore — Pré-Conselho Escolar Digital

## 1. Invariantes de Dados
1. Nenhum documento pode ser lido ou gravado sem autenticação verificada (`request.auth != null && request.auth.token.email_verified == true`).
2. Apenas a Direção/Admin (`isAdmin()`) pode criar, editar ou remover turmas (`school_classes`), estudantes (`school_students`), seções (`school_sections`), perguntas (`school_questions`), professores (`school_teachers`) e segredos institucionais (`school_user_secrets`).
3. Dados pessoais identificáveis (PII: `email`, `accessCode`, `username`) são isolados em `school_user_secrets` e legíveis apenas pelo próprio dono ou administrador.
4. Uma ficha de Pré-Conselho (`school_reports`) pertence a um `ownerUid` imutável. Docentes não administradores só podem criar/listar/ler/atualizar fichas cujo `ownerUid == request.auth.uid`, não podem homologar (`status: 'visto'` ou `diretoraSignature.signed: true`), e não podem alterar fichas já homologadas (`existing().status == 'visto'`).
5. Todos os timestamps `createdAt` e `updatedAt` são validados via `request.time`.
6. Todos os IDs seguem `^[a-zA-Z0-9_\\-]+$` com tamanho máximo de 128 caracteres, e todas as strings e arrays possuem limites estritos de tamanho.

## 2. "Dirty Dozen" Payloads (Testes Adversariais)
1. **Ghost Field / Shadow Update em `school_reports`**: Enviar `{ ..., isVerified: true }` -> Rejeitado por `keys().hasOnly(...)` e `affectedKeys().hasOnly(...)`.
2. **Email Spoofing**: Token com `email: 'maioneseraimundo@gmail.com'` mas `email_verified: false` -> Rejeitado por `isVerifiedUser()`.
3. **PII Leak em `school_user_secrets`**: Docente comum tentando `get` em `/school_user_secrets/prof-carlos` -> Rejeitado por `isAdmin() || isOwner(userId)`.
4. **Query Scraping em `school_reports`**: Docente tentando `list` sem filtro `where('ownerUid', '==', uid)` -> Rejeitado por `allow list: if isAdmin() || (isVerifiedUser() && existing().ownerUid == request.auth.uid)`.
5. **Identity Spoofing em `school_reports`**: Docente criando ficha com `ownerUid: 'outro-uid'` -> Rejeitado por `incoming().ownerUid == request.auth.uid`.
6. **Privilege Escalation / Homologação Indevida**: Docente atualizando `diretoraSignature.signed = true` ou `status = 'visto'` -> Rejeitado por `affectedKeys().hasOnly(...)` e regra de status.
7. **Terminal State Bypass**: Docente editando ficha com `status == 'visto'` -> Rejeitado por `existing().status != 'visto'`.
8. **Resource Poisoning via ID gigante**: Documento com ID de 500 caracteres -> Rejeitado por `isValidId()`.
9. **String Overflow em `school_students`**: `name` com 5000 caracteres -> Rejeitado por `.size() <= 140`.
10. **Array Overflow em `school_teachers`**: `classes` com 100 elementos -> Rejeitado por `.size() <= 20`.
11. **Timestamp Forgery**: `createdAt` diferente de `request.time` na criação -> Rejeitado por `incoming().createdAt == request.time`.
12. **Orphan Question**: Pergunta criada apontando para `sectionId` inexistente -> Rejeitado por `exists(/databases/$(database)/documents/school_sections/$(incoming().sectionId))`.
