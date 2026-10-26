# Madras Macha — Multi-Factor Authentication (MFA) & Role-Based Access Control (RBAC) (DA 3 Question 2(b))

## 1. Multi-Factor Authentication (TOTP) Architecture

Madras Macha enforces a two-step authentication process adhering to **RFC 6238** (Time-Based One-Time Password Algorithm). Simulated frontend authentication, fake delays, and guest bypasses have been completely removed.

```
+---------------------------------------------------------------------------------------------------+
|                                 AUTHENTICATION & MFA VERIFICATION FLOW                             |
+---------------------------------------------------------------------------------------------------+

   +-------------+                                +-------------------+
   |   Client    |                                |   Express API     |
   | (React SPA) |                                |    (server.ts)    |
   +------+------+                                +---------+---------+
          |                                                 |
          | 1. POST /api/auth/login { username, password }  |
          |------------------------------------------------>|
          |                                                 | 2. Bcrypt check (work factor 12)
          |                                                 |    Rate limit & active check
          |                                                 |
          | 3. HTTP 200 { mfaRequired: true,                |
          |               mfaChallengeToken: "ey..." }      |
          |<------------------------------------------------| (Token expires in 5 minutes,
          |                                                 |  purpose = 'mfa_challenge')
          |                                                 |
          | 4. User views TOTP 6-digit code from            |
          |    Google Authenticator / MS Authenticator      |
          |                                                 |
          | 5. POST /api/auth/mfa/verify                    |
          |    Headers: Authorization: Bearer <mfaChallenge>|
          |    Body: { code: "123456" }                     |
          |------------------------------------------------>|
          |                                                 | 6. Verify challenge JWT signature
          |                                                 | 7. Decrypt TOTP secret via AES-256-GCM
          |                                                 | 8. speakeasy.totp.verify (window = 1)
          |                                                 | 9. Sign 12-hour session JWT token
          | 10. HTTP 200 { success: true,                   |
          |                token: "ey...", user: {...} }    |
          |<------------------------------------------------|
          |                                                 |
```

### 1.1 Authenticator App Compatibility
- **Standards Compliant**: Compatible with standard mobile authenticator applications including:
  - Google Authenticator (Android / iOS)
  - Microsoft Authenticator
  - 2FAS / FreeOTP / Aegis
- **URI Schema**: `otpauth://totp/MadrasMacha:<username>?secret=<SECRET>&issuer=MadrasMacha&algorithm=SHA1&digits=6&period=30`
- **QR Code Generation**: Provided directly via server-generated data URI (`qrcode.toDataURL()`) during registration or enrolment.
- **Manual Entry Fallback**: The raw base32-encoded secret is displayed beneath the QR code for users who cannot scan camera images.

### 1.2 Cryptographic Protection of TOTP Secrets at Rest
In accordance with OWASP and GDPR Article 32 guidelines, plaintext MFA secrets are never persisted in the database.
- **Encryption Algorithm**: **AES-256-GCM** (Galois/Counter Mode).
- **IV / Nonce**: 96-bit (12-byte) cryptographically random IV generated via `crypto.randomBytes(12)` per encryption.
- **Integrity**: 128-bit authentication tag appended to prevent ciphertext tampering.
- **Storage Format**: `iv_hex:authTag_hex:ciphertext_hex` stored in `public.app_users.mfa_secret`.
- **Decryption**: In-memory decryption occurs only within `src/lib/server/security.ts` during active TOTP verification.

### 1.3 Strict Separation: MFA Challenge Token vs. Session Token

| Token Attribute | Step 1: MFA Challenge Token | Step 2: Full Session Token |
|---|---|---|
| **Purpose** | Temporary bridge for submitting 6-digit TOTP code. | Stateless authentication for application API requests. |
| **Payload Claim** | `{ sub: userId, purpose: 'mfa_challenge', mfaVerified: false }` | `{ sub: userId, username, email, role, purpose: 'session', mfaVerified: true }` |
| **Expiration** | **5 minutes** (`5m`) | **12 hours** (`12h`) |
| **Permitted Route** | **Only** `POST /api/auth/mfa/verify` | Standard and administrator routes (`/api/transit/*`, `/api/admin/*`, `/api/auth/me`). |
| **Unauthorized Action** | Attempting to access transit alerts or admin routes with this token returns **401 Unauthorized**. | Full access scoped strictly to the user's role (`commuter` or `transit_admin`). |

---

## 2. Role-Based Access Control (RBAC) Architecture

Madras Macha enforces strict dual-tier Role-Based Access Control to separate standard transit commuters from operational transit authority administrators.

### 2.1 Role Definitions

1. **`commuter` (Default Role)**:
   - Self-registered public transit riders.
   - All registrations via `POST /api/auth/register` are hardcoded to the `commuter` role. Client-supplied role values are rejected/ignored.
   - Permissions: Query transit routes, stops, schedules, fare calculator, and view active service alerts.

2. **`transit_admin` (Elevated Operational Role)**:
   - Authorized Chennai public transit operational staff (MTC / CMRL administrators).
   - Cannot be self-assigned; provisioned via the secure administrative script `scripts/promote-admin.ts` or directly within the database with service-role permissions.
   - Permissions: Create, modify, and delete live transit service alerts affecting bus and metro operations.

### 2.2 Endpoint Access Control Matrix

| Endpoint | HTTP Method | Minimum Required Role | MFA Status Required | Expected Response Codes | Description |
|---|---|---|---|---|---|
| `/api/transit/routes` | `GET` | Public (Anonymous) | None | `200 OK` | Public transit route query (MTC / Metro). |
| `/api/transit/service-alerts` | `GET` | Public (Anonymous) | None | `200 OK` | View active Chennai transit disruption alerts. |
| `/api/auth/register` | `POST` | Public (Anonymous) | None | `201 Created` / `400 Bad Request` | Register new commuter account & generate TOTP QR code. |
| `/api/auth/login` | `POST` | Public (Anonymous) | None | `200 OK` (MFA challenge) / `401 Unauthorized` | Verify credentials; issue 5-minute MFA challenge. |
| `/api/auth/mfa/verify` | `POST` | Valid MFA Challenge Token | N/A | `200 OK` (Session JWT) / `401 Unauthorized` | Validate TOTP 6-digit code; issue 12-hour session JWT. |
| `/api/auth/me` | `GET` | `commuter` or `transit_admin` | Verified Session | `200 OK` / `401 Unauthorized` | Return sanitized user profile (zero secret leakage). |
| `/api/auth/logout` | `POST` | Any | None | `200 OK` | Revoke client-side session state. |
| `/api/admin/service-alerts` | `POST` | **`transit_admin`** | **Verified MFA** | `201 Created` / `401 Unauthorized` / `403 Forbidden` | Post a new Chennai transit disruption alert. |
| `/api/admin/service-alerts/:id` | `PATCH` | **`transit_admin`** | **Verified MFA** | `200 OK` / `401 Unauthorized` / `403 Forbidden` / `404 Not Found` | Update status, title, or severity of existing alert. |
| `/api/admin/service-alerts/:id` | `DELETE` | **`transit_admin`** | **Verified MFA** | `200 OK` / `401 Unauthorized` / `403 Forbidden` / `404 Not Found` | Decommission or remove a resolved alert. |

---

## 3. Enforcement Middleware Implementation Details

Access control is enforced in `server.ts` through composable Express middlewares:

1. **`requireAuth`**:
   - Inspects `Authorization: Bearer <token>`.
   - Verifies cryptographic signature using `JWT_SECRET`.
   - Enforces `purpose === 'session'` (immediately rejects MFA challenge tokens with `401 Unauthorized: Session token required. Please complete MFA verification.`).
   - Verifies account existence and active status in the persistent store.

2. **`requireRole('transit_admin')`**:
   - Executes after `requireAuth`.
   - Evaluates `req.user.role`.
   - If role is not `transit_admin`, denies request immediately with `403 Forbidden: Access denied. Role 'transit_admin' required.`.

---

## 4. Instructions for Capturing Demonstration Screenshots

### Screenshot 1: MFA Registration & QR Code Enrolment
* **Action**: Open `http://localhost:3000` in browser. Click **Create New Account**. Enter username `test_commuter`, email `test@chennai.test`, and a secure password. Click **Create Account**.
* **Target to Capture**: The enrolment modal displaying the generated QR code, the manual base32 secret string, and the 6-digit verification input box.
* **Filename**: `docs/da3/screenshots/q2b-01-mfa-enrollment-qr.png`

### Screenshot 2: Google / Microsoft Authenticator App Display
* **Action**: Open the Authenticator application on your mobile device (or desktop OTP app) showing the current 6-digit rotating code for `MadrasMacha:test_commuter`.
* **Target to Capture**: Mobile screen showing the `MadrasMacha` entry with the active countdown timer.
* **Filename**: `docs/da3/screenshots/q2b-02-authenticator-code.png`

### Screenshot 3: Completed Login & Verified User Badge
* **Action**: Enter the 6-digit code and submit. The application redirects to the main transit interface. Look at the top navigation bar.
* **Target to Capture**: Header displaying the logged-in badge (e.g., `test_commuter (commuter)`) with the **Logout** button.
* **Filename**: `docs/da3/screenshots/q2b-03-authenticated-session.png`

### Screenshot 4: RBAC Denial (403 Forbidden) for Commuter
* **Action**: Run terminal command attempting to post an alert using a commuter token:
  ```bash
  curl -X POST http://localhost:3000/api/admin/service-alerts \
    -H "Authorization: Bearer <COMMUTER_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"title":"Illegal Disruption","agency":"MTC","severity":"critical","message":"Unauthorized"}'
  ```
* **Target to Capture**: Terminal output showing HTTP status `403 Forbidden` and error body `{"error":"Access denied. Role 'transit_admin' required."}`.
* **Filename**: `docs/da3/screenshots/q2b-04-rbac-forbidden-403.png`

### Screenshot 5: RBAC Success (201 Created) for Transit Admin
* **Action**: Run terminal command using the promoted `transit_admin` session token:
  ```bash
  curl -X POST http://localhost:3000/api/admin/service-alerts \
    -H "Authorization: Bearer <ADMIN_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"title":"MTC Route 21G Diversion at Anna Salai","agency":"MTC","severity":"warning","message":"Pavement repairs near Guindy; expect 15 min delays."}'
  ```
* **Target to Capture**: Terminal output showing HTTP status `201 Created` with the JSON record of the newly published alert.
* **Filename**: `docs/da3/screenshots/q2b-05-rbac-admin-created-201.png`
