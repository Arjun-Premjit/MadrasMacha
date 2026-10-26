# Madras Macha — Sensitive Data Inventory & Secure Password Storage (DA 3 Question 2(a))

## 1. Sensitive Data Handled by Madras Macha

Madras Macha processes public transit schedules alongside personal commuter and administrator credentials. In compliance with data minimization principles, only data strictly necessary for user authentication, access control, and operational transit alerts is collected.

| Sensitive Data Field | Storage Location | System Purpose | Implemented Protection & Controls |
|---|---|---|---|
| **Email Address** | Supabase `app_users.email` | Primary user identity, account notifications, and unique login identifier. | Validated format; protected by PostgreSQL Row Level Security (RLS) denying public `anon` access; accessible only by trusted backend via `service_role`. |
| **Username** | Supabase `app_users.username` | Commuter display handle and unique login handle. | Stored in lowercase, indexed, sanitized against XSS, protected by RLS. |
| **Full Name** | Supabase `app_users.full_name` | Personalized greeting in navigation interface (optional). | Sanitized input, protected by RLS; never shared across accounts. |
| **Password Verifier / Hash** | Supabase `app_users.password_hash` | Cryptographic credential verification during initial login step. | **Salted bcrypt hash (work factor 12)** via `bcryptjs`. Plaintext passwords are never logged, stored, or returned in any API response. |
| **TOTP Authenticator Secret** | Supabase `app_users.mfa_secret` | Seeds RFC 6238 time-based one-time password verification. | **Encrypted at rest using AES-256-GCM** with 96-bit random IV and authentication tag; decrypted in-memory only during TOTP verification; never exposed to API callers. |
| **MFA Challenge Token** | Client memory (temporary) | Bridges password verification (Step 1) to TOTP verification (Step 2). | HMAC-SHA256 JWT, **restricted 5-minute expiry**, strictly restricted to the `/api/auth/mfa/verify` endpoint. |
| **Session JWT Token** | Client `localStorage` / Authorization header | Authorizes stateless API requests on subsequent operations. | Signed HMAC-SHA256 JWT, **12-hour expiry**, containing verified user ID and role; validated server-side on every request. |
| **Role Metadata** | Supabase `app_users.role` | Determines authorization tier (`commuter` vs `transit_admin`). | Validated by database CHECK constraint; immutable via public registration (always defaults to `commuter`); checked by Express `requireRole` middleware. |

---

## 2. Password Hashing Architecture: Scrypt (Before) vs. Bcrypt (After)

### Baseline (Before) State
* **Algorithm**: Node.js `crypto.scryptSync(password, salt, 64)`.
* **Storage Location**: Local flat file `/data/users.json`.
* **Format**: 128-character hexadecimal string with separate 32-character hexadecimal salt.
* **Limitations**: While scrypt is memory-hard, the local flat file was not shared across multiple Docker containers, did not integrate with centralized RLS, and did not meet the assignment's explicit bcrypt/Argon2 requirement.

### Hardened (After) State
* **Algorithm**: **bcrypt** with work factor **12** (`$2b$12$...`).
* **Storage Location**: Supabase PostgreSQL `public.app_users` table.
* **Format**: Standard Modular Crypt Format (60 characters, beginning with `$2b$12$`).
* **Multi-Container Consistency**: Stored centrally in Supabase PostgreSQL; all containerized backend instances (`app1`, `app2`, `app3`) access the identical authoritative account store.
* **Database Security**: Strict PostgreSQL Row Level Security (RLS) is enabled. Public anonymous access is completely revoked (`REVOKE ALL ON public.app_users FROM anon;`). Only the server-side backend with `service_role` privileges can query or insert user records.

---

## 3. Graceful Migration & Compatibility Process

Existing user records in `data/users.json` are preserved. When a legacy user logs in:
1. The server detects that the user is not yet present in the PostgreSQL `app_users` store.
2. It looks up the user in `data/users.json` and verifies the submitted password against the legacy scrypt hash using `crypto.timingSafeEqual()`.
3. Upon verified match, it generates a fresh **bcrypt hash (work factor 12)** and inserts the account into `app_users` with `legacy_source = 'scrypt_migrated'`.
4. The user is required to enroll their authenticator app (Google Authenticator / Microsoft Authenticator) in the mandatory TOTP MFA step before a session token is issued.
5. Legacy authentication cannot bypass MFA under any circumstances.

---

## 4. Test Accounts for Demonstration

1. **Standard Commuter Account**:
   * Username: `demo_commuter`
   * Email: `demo_commuter@madrasmacha.test`
   * Password: `SecureCommuter2026!`
   * Role: `commuter`
   * Hash Format in Database: `$2b$12$...`
2. **Transit Administrator Account**:
   * Username: `transit_admin_demo`
   * Email: `transit_admin@madrasmacha.test`
   * Password: `AdminMasterTransit2026!`
   * Role: `transit_admin`
   * Hash Format in Database: `$2b$12$...`

---

## 5. Instructions for Capturing Storage Evidence Screenshots

### Screenshot 1: Legacy Scrypt Storage (Before)
* **File to Open**: `/data/users.json`
* **Target to Capture**:
  ```json
  {
    "id": "usr_seed_001",
    "username": "chennaimacha",
    "salt": "a1b2c3...",
    "passwordHash": "e4f5..."
  }
  ```
* **Label**: `q2a-01-scrypt-storage-before.png`
* **Note**: Confirms legacy scrypt storage was used prior to migration.

### Screenshot 2: Bcrypt Hash in Database (After)
* **View**: Supabase Table Editor &rarr; `public.app_users` table (or querying `data/app_users.json`).
* **Target to Capture**: The `password_hash` column displaying the bcrypt format:
  ```
  $2b$12$e8x... [60 characters]
  ```
* **Label**: `q2a-02-bcrypt-storage-after.png`
* **Redaction**: Ensure any access tokens or TOTP secrets in surrounding columns are redacted.
