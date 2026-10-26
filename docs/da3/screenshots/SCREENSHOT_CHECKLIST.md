# DA 3 Question 2 — Evidence Screenshot Capture Checklist

Place your captured screenshot image files directly in this folder (`docs/da3/screenshots/`).

| # | Filename | Topic | Instructions to Capture | What to Highlight in Submission |
|---|---|---|---|---|
| **1** | `q2a-01-scrypt-storage-before.png` | **Q2(a): Baseline Scrypt Storage** | Open `/data/users.json` in VS Code or code editor. | Show `"salt"` and 128-char hexadecimal `"passwordHash"` from the baseline scrypt implementation. |
| **2** | `q2a-02-bcrypt-storage-after.png` | **Q2(a): Hardened Bcrypt Storage** | Open Supabase Dashboard &rarr; Table Editor &rarr; `public.app_users` table (or `/data/app_users.json`). | Show the `password_hash` column with the standard `$2b$12$...` Modular Crypt Format string (60 chars). Redact any token values. |
| **3** | `q2b-01-mfa-enrollment-qr.png` | **Q2(b): MFA QR Enrolment** | In browser (`http://localhost:3000`), click "Create New Account", enter registration details, click "Create Account". | Capture the modal displaying the generated QR code, the manual base32 secret string, and the 6-digit code input box. |
| **4** | `q2b-02-authenticator-code.png` | **Q2(b): Authenticator App** | Open Google Authenticator or Microsoft Authenticator on mobile/desktop. | Capture the entry named `MadrasMacha:<username>` with the rotating 6-digit verification code. |
| **5** | `q2b-03-authenticated-session.png` | **Q2(b): Authenticated Header Badge** | Complete MFA verification and land on the main transit page. | Highlight the top navigation bar showing your user handle, role badge (`commuter` or `transit_admin`), and the **Logout** button. |
| **6** | `q2b-04-rbac-forbidden-403.png` | **Q2(b): RBAC 403 Forbidden** | Run: `curl -i -X POST http://localhost:3000/api/admin/service-alerts -H "Authorization: Bearer <COMMUTER_TOKEN>" -H "Content-Type: application/json" -d '{"title":"Test","agency":"MTC","severity":"warning","message":"Disruption"}'` | Capture the terminal showing HTTP response `403 Forbidden` and message `Access denied. Role 'transit_admin' required.`. |
| **7** | `q2b-05-rbac-admin-created-201.png` | **Q2(b): RBAC 201 Created** | Run the same curl command using a valid `transit_admin` session token. | Capture the terminal showing HTTP response `201 Created` with the JSON payload of the newly created transit alert. |
| **8** | `q2c-01-trivy-baseline-scan.png` | **Q2(c): Trivy Baseline Vulnerabilities** | Run `trivy image --severity HIGH,CRITICAL madras-macha-backend:baseline` on your local Docker machine. | Capture the terminal displaying High/Critical CVEs in the unhardened single-stage image. |
| **9** | `q2c-02-trivy-hardened-scan.png` | **Q2(c): Trivy Hardened Clean Scan** | Run `trivy image --severity HIGH,CRITICAL madras-macha-backend:hardened` on your local Docker machine. | Capture the terminal output displaying `Total: 0 (HIGH: 0, CRITICAL: 0)`. |
| **10** | `q2c-03-container-nonroot-id.png` | **Q2(c): Non-Root User Verification** | Run `docker run --rm madras-macha-backend:hardened id`. | Capture terminal showing `uid=1000(node) gid=1000(node)`. |
| **11** | `q2-automated-test-suite.png` | **All: 100% Test Pass Evidence** | Run `npx tsx scripts/test-security.ts`. | Capture terminal showing all 9 tests passing (`Passed: 9 / 9 (100%)`). |
