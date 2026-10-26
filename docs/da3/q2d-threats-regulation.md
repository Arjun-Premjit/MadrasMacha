# Madras Macha — Threat Agent & Regulatory Compliance Analysis (DA 3 Question 2(d))

## 1. Threat Agent Analysis

Public transit information systems are critical civic infrastructure. Compromising Madras Macha could disrupt metropolitan mobility in Chennai, cause civic panic, or expose commuter travel patterns. This analysis evaluates two distinct threat agents and the technical defenses implemented in Question 2.

---

### Threat Agent 1: External Cybercriminal / Botnet Operator
* **Profile**: Opportunistic external adversary operating automated botnets and distributed credential-stuffing toolkits.
* **Motivation**: Financial gain (reselling account access, session hijacking), extortion, or utilizing accounts as proxies for secondary attacks.
* **Attack Vector — Credential Stuffing & Automated Brute Force**:
  - The attacker acquires billions of leaked username/email and password pairs from third-party data breaches.
  - Automated tools (e.g., OpenBullet, Hydra) replay these credentials against `POST /api/auth/login` to hijack accounts of commuters who reuse passwords.
* **Potential Impact on Madras Macha**:
  - Account takeover of regular commuters and operational staff.
  - Extraction of commute patterns and personal identifiable information (PII).
  - Denial of service on authentication endpoints due to high-volume request surges.
* **Implemented Technical Countermeasures**:
  1. **Salted Bcrypt (Work Factor 12)**: Makes offline dictionary attacks computationally prohibitive (~250ms per hash verification on modern hardware), neutralizing rainbow table attacks.
  2. **In-Memory IP Rate Limiting**: The `/api/auth/login` route limits requests per IP address window, throttling automated high-frequency brute-force attempts.
  3. **Mandatory RFC 6238 TOTP MFA**: Even when an attacker possesses a valid commuter or admin password, the login sequence halts at Step 1. The server only returns a temporary 5-minute `mfa_challenge` token. The attacker cannot obtain a valid session token without physical possession of the rotating 6-digit TOTP authenticator device.
  4. **Strict Token Scope Segregation**: MFA challenge tokens are cryptographically restricted to `/api/auth/mfa/verify` and rejected with `401 Unauthorized` if submitted to any transit or administrative endpoint.

---

### Threat Agent 2: Malicious Actor / Disgruntled Insider Attempting Civic Transit Disruption
* **Profile**: A disgruntled employee, competitive adversary, or politically motivated vandal seeking to cause public transit disruption in Chennai.
* **Motivation**: Sabotage, causing traffic gridlock, reputational damage to Chennai transit authorities (MTC / CMRL), or widespread public panic.
* **Attack Vector — Service Alert Tampering & Unauthorized Route Invalidation**:
  - The adversary attempts to submit fraudulent alerts (e.g., claiming "Chennai Metro Green Line completely suspended due to emergency" or "All MTC routes diverting away from Central Railway Station").
  - Alternatively, the attacker attempts to delete legitimate emergency diversion notices, leaving commuters stranded during adverse weather (e.g., monsoon flooding in Velachery).
* **Potential Impact on Madras Macha**:
  - Severe disruption to commuter travel during weekday morning/evening peak hours.
  - Loss of public trust in official transit advisories.
  - Potential physical safety risks if commuters are directed away from safe transit hubs.
* **Implemented Technical Countermeasures**:
  1. **Dual-Tier Role-Based Access Control (RBAC)**: All service-alert mutation endpoints (`POST`, `PATCH`, `DELETE` under `/api/admin/service-alerts`) strictly require the `transit_admin` role.
  2. **Self-Registration Privilege Escalation Prevention**: The `POST /api/auth/register` handler enforces `role = 'commuter'`. Any user-supplied `role` parameter in the request payload is discarded.
  3. **Database-Level Row Level Security (RLS)**: Public anonymous access to `public.transit_service_alerts` is restricted to `SELECT` (read-only). Direct modification can only occur via the server-side backend authenticated with the `service_role` key.
  4. **Cryptographic Session Integrity**: The Express middleware verifies that `req.user.mfaVerified === true` and that the session JWT has not expired (12-hour limit). Unauthorized attempts return `403 Forbidden` and are logged with user ID and client IP.

---

## 2. Regulatory Compliance Analysis

### 2.1 Digital Personal Data Protection Act, 2023 (DPDP Act, India)

As a digital public transit service operating in Chennai, Tamil Nadu, Madras Macha acts as a **Data Fiduciary** under the Indian DPDP Act, 2023.

| DPDP Act Provision | Statutory Mandate | Madras Macha Technical Compliance Implementation |
|---|---|---|
| **Section 4 (Grounds for Processing)** | Personal data may only be processed for lawful purposes with explicit user consent or for legitimate uses specified by law. | Madras Macha processes user emails and usernames strictly to deliver authenticated transit services and emergency alerts. Consent is obtained during account creation. |
| **Section 6 (Notice & Consent)** | Clear notice must be given specifying the categories of personal data collected, processing purpose, and rights of grievance redressal. | The registration interface clearly displays the purpose of account registration. English and Tamil bilingual copy ensures transparency for all Chennai residents. |
| **Section 8(4) (Data Minimization)** | A Data Fiduciary must only collect data strictly necessary to fulfill the stated processing purpose. | Madras Macha does not collect phone numbers, government IDs (Aadhaar), GPS location history, or payment card details. Transit journey planning runs client-side or statelessly. |
| **Section 8(5) (Reasonable Security Safeguards)** | The Data Fiduciary must implement reasonable security safeguards to prevent personal data breaches under penalty of up to ₹250 crore. | 1. Passwords stored using **bcrypt with work factor 12**.<br>2. TOTP MFA secrets encrypted at rest via **AES-256-GCM** with unique 96-bit initialization vectors.<br>3. Supabase PostgreSQL **Row Level Security (RLS)** revoking public access.<br>4. Docker container hardened with non-root user execution (`USER node`) and zero critical vulnerabilities. |
| **Section 8(7) (Data Erasure)** | Personal data must be erased upon withdrawal of consent or when the purpose is no longer served. | Madras Macha supports user account deletion; test suites verify complete removal from both primary database and fallback stores. |

---

### 2.2 General Data Protection Regulation (GDPR, Regulation (EU) 2016/679)

#### Applicability & Extraterritorial Scope under Article 3(2)
While Madras Macha's primary operating territory is Chennai, India, **GDPR Article 3(2)(b)** applies because Madras Macha monitors the behavior and serves personal data to:
- **European Tourists & Business Travelers**: Visitors from EU member states attending conferences (e.g., Chennai Trade Centre, IIT Madras Research Park) or touring historical sites (Fort St. George, San Thome, Mahabalipuram) who use Madras Macha to navigate Chennai public transit.
- **European Expatriates & Exchange Students**: European nationals residing in Chennai for academic programs or automotive/IT sector assignments.

#### Compliance with Core GDPR Principles

| GDPR Article | Statutory Requirement | Madras Macha Engineering Implementation |
|---|---|---|
| **Article 5(1)(c) — Data Minimisation** | Personal data must be adequate, relevant, and limited to what is necessary in relation to the purposes for which they are processed. | The application collects only username, email, and password hash. Commuter route queries do not require account login, allowing completely anonymous transit navigation. |
| **Article 5(1)(f) — Integrity & Confidentiality** | Personal data must be processed in a manner that ensures appropriate security against unauthorized processing, accidental loss, or destruction. | End-to-end cryptographic safeguards: TLS in transit, AES-256-GCM for MFA secrets at rest, bcrypt for credentials, and strict JWT signature verification. |
| **Article 32(1)(a) — Pseudonymisation & Encryption** | Implementation of technical measures including pseudonymisation and the encryption of personal data. | 1. TOTP secrets are encrypted with **AES-256-GCM** with authenticated checksums.<br>2. Passwords undergo non-reversible, salted **bcrypt (12 rounds)** hashing.<br>3. Database primary keys use randomly generated UUIDs (`usr_...`) rather than identifiable user attributes. |
| **Article 32(1)(b) — Confidentiality, Integrity & Availability** | Ensure the ongoing confidentiality, integrity, availability, and resilience of processing systems. | Containerized multi-instance deployment (`app1`, `app2`, `app3`) behind Nginx load balancing ensures fault tolerance; automated healthchecks detect degraded nodes. |
| **Article 32(1)(d) — Regular Testing & Evaluation** | A process for regularly testing, assessing, and evaluating the effectiveness of technical measures. | Automated security verification suite (`scripts/test-security.ts`) systematically executes regression tests against authentication, token validation, MFA enforcement, and RBAC boundaries with 100% pass criteria. |
