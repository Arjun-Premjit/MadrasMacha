# Madras Macha — DA 3 Question 2: Complete Security Implementation Master Report

**Course**: Scalable & Secure Web Architectures  
**Application**: Madras Macha — Chennai Metropolitan Transit Guide (MTC & CMRL)  
**Repository Branch**: `assignment-3-security`  
**Evaluation Scope**: DA 3, Question 2 (Total: 5 Marks)  

---

## 1. Quick Navigation to Documentation

All detailed reports and evidence templates for DA 3 Question 2 are organized in this directory:

1. [**Question 2(a): Sensitive Data Inventory & Bcrypt Storage**](./q2a-sensitive-data.md)
   - Identification of all sensitive data fields (credentials, MFA secrets, session tokens, audit attributes).
   - Migration from legacy scrypt flat file to **salted bcrypt (work factor 12)**.
   - Supabase PostgreSQL schema with strict Row Level Security (RLS).
   - Zero plaintext or salt leakage; backward compatibility for legacy accounts.

2. [**Question 2(b): Multi-Factor Authentication & Role-Based Access Control**](./q2b-mfa-rbac.md)
   - RFC 6238 Time-Based One-Time Password (TOTP) compatible with Google / Microsoft Authenticator.
   - AES-256-GCM encryption of authenticator secrets at rest.
   - Strict token segregation: 5-minute `mfa_challenge` tokens vs 12-hour full `session` tokens.
   - Dual-tier RBAC (`commuter` vs `transit_admin`) guarding Transit Service Alerts endpoints (`POST`, `PATCH`, `DELETE`).
   - Detailed status code mappings (`401 Unauthorized` vs `403 Forbidden` vs `201 Created`).

3. [**Question 2(c): Container Hardening & Trivy Assessment**](./q2c-trivy-results.md)
   - Re-architected multi-stage Dockerfile (`node:22-alpine` builder & runner).
   - Attack surface reduction: 87% smaller image, stripped development dependencies.
   - Non-root user execution (`USER node`, UID 1000).
   - Built-in container health check querying `/api/backend-status`.
   - Comprehensive Trivy before-and-after vulnerability comparison tables and local reproduction commands.

4. [**Question 2(d): Threat Agent & Regulatory Compliance Analysis**](./q2d-threats-regulation.md)
   - **Threat Agent 1**: External cybercriminals executing automated credential stuffing and account takeover.
   - **Threat Agent 2**: Malicious actors or disgruntled insiders attempting public transit disruption and alert falsification.
   - **Indian DPDP Act, 2023**: Statutory analysis of Sections 4, 6, 8(4), 8(5), and 8(7).
   - **EU GDPR (2016/679)**: Extraterritorial applicability under Article 3(2), compliance with Article 5(1)(f) and Article 32 security controls.

5. [**Automated Security Verification Test Suite Results**](./security-test-results.md)
   - Step-by-step audit of the 9 automated test scenarios.
   - 100% pass verification against the running server (`npx tsx scripts/test-security.ts`).

6. [**Evidence Screenshot Checklist**](./screenshots/SCREENSHOT_CHECKLIST.md)
   - Exact filenames, commands, and target screenshots required for the final submission.

---

## 2. Key Artifacts in the Repository

| Component | File Path | Description |
|---|---|---|
| **Express Backend** | `/server.ts` | Hardened API endpoints, authentication middlewares (`requireAuth`, `requireRole`), rate limiting, service alerts. |
| **Security Utilities** | `/src/lib/server/security.ts` | Bcrypt hashing (cost 12), AES-256-GCM secret encryption, Speakeasy TOTP verification, JWT token signing/verification. |
| **Data Store Service** | `/src/lib/server/authStore.ts` | Unified Supabase PostgreSQL store with transparent local fallback and legacy scrypt migration. |
| **Database Migration** | `/supabase/migrations/20261026_da3_security.sql` | Production PostgreSQL DDL for `app_users` and `transit_service_alerts` with RLS policies. |
| **Frontend Login & MFA** | `/src/components/pages/LoginPage.tsx` | Real multi-step authentication: Login &rarr; Registration &rarr; MFA Enrolment with QR Code &rarr; TOTP verification. |
| **Automated Test Suite**| `/scripts/test-security.ts` | Complete automated security testing script validating 9 distinct assertions. |
| **Admin Promotion Tool**| `/scripts/promote-admin.ts` | Safe administrative CLI to promote a commuter account to `transit_admin`. |
| **Hardened Dockerfile** | `/Dockerfile` | Multi-stage, minimal Alpine, non-root `USER node`, healthcheck-enabled container. |

---

## 3. Demonstration & Verification Commands

### Run the Application in Development Mode
```bash
npm run dev
# Server listening on http://localhost:3000
```

### Run the Automated Security Test Suite
```bash
npx tsx scripts/test-security.ts
```
Expected output:
```
[PASS] Test 1: Protected Update request without token (Expected: 401, Got: 401)
[PASS] Test 2: Protected Delete request without token (Expected: 401, Got: 401)
[PASS] Test 3: Invalid or expired token (Expected: 401, Got: 401)
[PASS] Test 4: Valid commuter token attempting admin Update/Delete (Expected: 403, Got: PATCH: 403, DELETE: 403)
[PASS] Test 5: Valid admin token without completed MFA (Expected: 401, Got: 401)
[PASS] Test 6: Valid admin session after password + correct TOTP -> Permitted (Expected: 201 & 200, Got: CREATE: 201, UPDATE: 200, DELETE: 200)
[PASS] Test 7: Invalid TOTP code -> Rejected (Expected: 401, Got: 401)
[PASS] Test 8: Password hash storage format check (Expected: bcrypt ($2a$ / $2b$), Got: $2b$12$)
[PASS] Test 9: Profile endpoint sensitive data sanitization (Expected: No hash / No secret leaked, Got: Sanitized)
STATUS: ALL SECURITY TESTS PASSED SUCCESSFULLY! (100%)
```

### Promote an Account to Transit Administrator
```bash
npx tsx scripts/promote-admin.ts <username>
```

### Typecheck & Frontend Build
```bash
npm run lint    # Executes tsc --noEmit (0 errors)
npm run build   # Compiles Vite production bundle
```
