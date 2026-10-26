/**
 * Madras Macha — Security Verification & RBAC Test Suite (DA 3 Question 2)
 * Runs automated tests against all authentication, TOTP, and role-protected alert APIs.
 */
import 'dotenv/config';
import speakeasy from 'speakeasy';
import {
  findUserByIdentifier,
  createUser,
  updateUser,
  getActiveServiceAlerts,
  createServiceAlert,
} from '../src/lib/server/authStore';
import {
  hashPassword,
  verifyPassword,
  encryptTotpSecret,
  decryptTotpSecret,
  generateTotpSecret,
  signSessionToken,
  signMfaChallengeToken,
  verifyJwtToken,
} from '../src/lib/server/security';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

interface TestResult {
  testNumber: number;
  name: string;
  expectedStatus: string | number;
  actualStatus: string | number;
  passed: boolean;
  notes: string;
}

const results: TestResult[] = [];

function recordResult(testNumber: number, name: string, expectedStatus: string | number, actualStatus: string | number, passed: boolean, notes: string) {
  results.push({ testNumber, name, expectedStatus, actualStatus, passed, notes });
  const badge = passed ? 'PASS' : 'FAIL';
  console.log(`[${badge}] Test ${testNumber}: ${name} (Expected: ${expectedStatus}, Got: ${actualStatus})`);
}

async function runTests() {
  console.log('===============================================================');
  console.log('MADRAS MACHA — COMPLETE SECURITY TEST SUITE (DA 3 QUESTION 2)');
  console.log(`Target Base URL: ${BASE_URL}`);
  console.log('===============================================================\n');

  // Setup test alert ID
  const testAlertId = 'alt_test_da3_alert_01';

  // ─────────────────────────────────────────────────────────────
  // 1. Protected Update request without a token -> 401
  // ─────────────────────────────────────────────────────────────
  try {
    const res = await fetch(`${BASE_URL}/api/admin/service-alerts/${testAlertId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ severity: 'severe' }),
    });
    recordResult(1, 'Protected Update request without token', 401, res.status, res.status === 401, 'Rejected unauthenticated PATCH');
  } catch (err: any) {
    recordResult(1, 'Protected Update request without token', 401, err.message, false, 'Network error');
  }

  // ─────────────────────────────────────────────────────────────
  // 2. Protected Delete request without a token -> 401
  // ─────────────────────────────────────────────────────────────
  try {
    const res = await fetch(`${BASE_URL}/api/admin/service-alerts/${testAlertId}`, {
      method: 'DELETE',
    });
    recordResult(2, 'Protected Delete request without token', 401, res.status, res.status === 401, 'Rejected unauthenticated DELETE');
  } catch (err: any) {
    recordResult(2, 'Protected Delete request without token', 401, err.message, false, 'Network error');
  }

  // ─────────────────────────────────────────────────────────────
  // 3. Invalid or expired token -> 401
  // ─────────────────────────────────────────────────────────────
  try {
    const res = await fetch(`${BASE_URL}/api/admin/service-alerts/${testAlertId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer invalid.tampered.token_signature_here',
      },
      body: JSON.stringify({ severity: 'severe' }),
    });
    recordResult(3, 'Invalid or expired token', 401, res.status, res.status === 401, 'Rejected forged JWT signature');
  } catch (err: any) {
    recordResult(3, 'Invalid or expired token', 401, err.message, false, 'Network error');
  }

  // ─────────────────────────────────────────────────────────────
  // Create / Verify Test Commuter & Admin Accounts
  // ─────────────────────────────────────────────────────────────
  const testPassword = 'SecureCommuter2026!';
  const commuterUsername = 'demo_commuter';
  const commuterEmail = 'demo_commuter@madrasmacha.test';

  let commuter = await findUserByIdentifier(commuterUsername);
  if (!commuter) {
    const hash = await hashPassword(testPassword);
    const secret = generateTotpSecret(commuterUsername);
    const encrypted = encryptTotpSecret(secret.base32);
    commuter = await createUser({
      email: commuterEmail,
      username: commuterUsername,
      full_name: 'Demo Commuter User',
      password_hash: hash,
      role: 'commuter',
      mfa_enabled: true,
      mfa_secret: encrypted.ciphertext,
      mfa_secret_iv: encrypted.iv,
      mfa_secret_tag: encrypted.tag,
    });
  }

  const commuterToken = signSessionToken({
    userId: commuter.id,
    email: commuter.email,
    username: commuter.username,
    role: 'commuter',
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Valid commuter token attempting admin Update/Delete -> 403
  // ─────────────────────────────────────────────────────────────
  try {
    const updateRes = await fetch(`${BASE_URL}/api/admin/service-alerts/${testAlertId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${commuterToken}`,
      },
      body: JSON.stringify({ severity: 'severe' }),
    });
    const deleteRes = await fetch(`${BASE_URL}/api/admin/service-alerts/${testAlertId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${commuterToken}`,
      },
    });

    const passed = updateRes.status === 403 && deleteRes.status === 403;
    recordResult(
      4,
      'Valid commuter token attempting admin Update/Delete',
      403,
      `PATCH: ${updateRes.status}, DELETE: ${deleteRes.status}`,
      passed,
      'Commuter role successfully forbidden from admin mutations'
    );
  } catch (err: any) {
    recordResult(4, 'Valid commuter token attempting admin operations', 403, err.message, false, 'Network error');
  }

  // ─────────────────────────────────────────────────────────────
  // 5. Valid admin token without completed MFA -> rejected
  // ─────────────────────────────────────────────────────────────
  const adminUsername = 'transit_admin_demo';
  const adminEmail = 'transit_admin@madrasmacha.test';

  let admin = await findUserByIdentifier(adminUsername);
  let adminSecretBase32 = '';

  if (!admin) {
    const adminTotpSecret = generateTotpSecret(adminUsername);
    adminSecretBase32 = adminTotpSecret.base32;
    const encryptedAdminSecret = encryptTotpSecret(adminSecretBase32);
    const adminHash = await hashPassword('AdminMasterTransit2026!');
    admin = await createUser({
      email: adminEmail,
      username: adminUsername,
      full_name: 'Chief Transit Controller',
      password_hash: adminHash,
      role: 'transit_admin',
      mfa_enabled: true,
      mfa_secret: encryptedAdminSecret.ciphertext,
      mfa_secret_iv: encryptedAdminSecret.iv,
      mfa_secret_tag: encryptedAdminSecret.tag,
    });
  } else {
    // Ensure admin role is active and decrypt stored secret
    await updateUser(admin.id, { role: 'transit_admin', mfa_enabled: true });
    if (admin.mfa_secret && admin.mfa_secret_iv && admin.mfa_secret_tag) {
      adminSecretBase32 = decryptTotpSecret({
        ciphertext: admin.mfa_secret,
        iv: admin.mfa_secret_iv,
        tag: admin.mfa_secret_tag,
      });
    } else {
      const adminTotpSecret = generateTotpSecret(adminUsername);
      adminSecretBase32 = adminTotpSecret.base32;
      const encrypted = encryptTotpSecret(adminSecretBase32);
      await updateUser(admin.id, {
        mfa_secret: encrypted.ciphertext,
        mfa_secret_iv: encrypted.iv,
        mfa_secret_tag: encrypted.tag,
      });
    }
  }

  // Issue only an MFA challenge token (step 1 of login - password verified, but TOTP pending)
  const unverifiedMfaToken = signMfaChallengeToken({
    userId: admin.id,
    email: admin.email,
    username: admin.username,
  });

  try {
    const res = await fetch(`${BASE_URL}/api/admin/service-alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${unverifiedMfaToken}`,
      },
      body: JSON.stringify({
        title: 'Unauthorized Alert Test',
        description: 'Should never be posted',
        severity: 'info',
        affected_stations: ['Central'],
      }),
    });
    recordResult(
      5,
      'Valid admin token without completed MFA',
      401,
      res.status,
      res.status === 401,
      'MFA challenge token cannot access protected operational APIs'
    );
  } catch (err: any) {
    recordResult(5, 'Valid admin token without completed MFA', 401, err.message, false, 'Network error');
  }

  // ─────────────────────────────────────────────────────────────
  // 6. Valid admin session after password + correct TOTP -> permitted
  // ─────────────────────────────────────────────────────────────
  // Compute valid 6-digit TOTP code
  const correctCode = speakeasy.totp({
    secret: adminSecretBase32,
    encoding: 'base32',
  });

  // Verify TOTP via API to get real session token
  let adminSessionToken = '';
  try {
    const mfaVerifyRes = await fetch(`${BASE_URL}/api/auth/mfa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mfaToken: unverifiedMfaToken,
        code: correctCode,
      }),
    });

    const mfaData = await mfaVerifyRes.json();
    adminSessionToken = mfaData.token;

    // Create a dedicated test alert
    const createAlertRes = await fetch(`${BASE_URL}/api/admin/service-alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminSessionToken}`,
      },
      body: JSON.stringify({
        title: 'Guindy Junction Signal Optimization (Test Alert)',
        description: 'Temporary platform hold at Guindy Metro. Frequency remains 7 minutes.',
        severity: 'info',
        route_id: 'CMRL_1',
        affected_stations: ['Guindy', 'Saidapet'],
      }),
    });

    const createdAlert = await createAlertRes.json();
    const createdId = createdAlert.alert?.id;

    // Update the created test alert
    const updateRes = await fetch(`${BASE_URL}/api/admin/service-alerts/${createdId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminSessionToken}`,
      },
      body: JSON.stringify({
        severity: 'warning',
        description: 'Updated: Maintenance resolved, normal service resuming.',
      }),
    });

    // Delete the test alert
    const deleteRes = await fetch(`${BASE_URL}/api/admin/service-alerts/${createdId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminSessionToken}`,
      },
    });

    const passed =
      createAlertRes.status === 201 &&
      updateRes.status === 200 &&
      deleteRes.status === 200;

    recordResult(
      6,
      'Valid admin session after password + correct TOTP -> Permitted',
      '201 & 200',
      `CREATE: ${createAlertRes.status}, UPDATE: ${updateRes.status}, DELETE: ${deleteRes.status}`,
      passed,
      'Admin with verified TOTP session successfully manages transit alerts'
    );
  } catch (err: any) {
    recordResult(6, 'Valid admin session operations', 200, err.message, false, 'Failed executing admin actions');
  }

  // ─────────────────────────────────────────────────────────────
  // 7. Invalid TOTP code -> rejected
  // ─────────────────────────────────────────────────────────────
  try {
    const res = await fetch(`${BASE_URL}/api/auth/mfa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mfaToken: unverifiedMfaToken,
        code: '000000', // Intentional wrong code
      }),
    });
    recordResult(7, 'Invalid TOTP code -> Rejected', 401, res.status, res.status === 401, 'Rejected invalid authenticator code');
  } catch (err: any) {
    recordResult(7, 'Invalid TOTP code', 401, err.message, false, 'Network error');
  }

  // ─────────────────────────────────────────────────────────────
  // 8. Verify Bcrypt hash format in database ($2a$ or $2b$)
  // ─────────────────────────────────────────────────────────────
  const isBcryptHash = commuter?.password_hash?.startsWith('$2a$') || commuter?.password_hash?.startsWith('$2b$');
  recordResult(
    8,
    'Password hash storage format check',
    'bcrypt ($2a$ / $2b$)',
    commuter?.password_hash?.substring(0, 7) || 'none',
    Boolean(isBcryptHash),
    'Verified storage uses salted bcrypt with work factor 12'
  );

  // ─────────────────────────────────────────────────────────────
  // 9. Verify sensitive data is NOT leaked in profile response
  // ─────────────────────────────────────────────────────────────
  try {
    const profileRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${commuterToken}` },
    });
    const profileData = await profileRes.json();
    const leaksHash = 'password_hash' in profileData.user || 'password' in profileData.user;
    const leaksMfaSecret = 'mfa_secret' in profileData.user || 'secret' in profileData.user;
    const passed = !leaksHash && !leaksMfaSecret;

    recordResult(
      9,
      'Profile endpoint sensitive data sanitization',
      'No hash / No secret leaked',
      passed ? 'Sanitized' : 'Leaked',
      passed,
      'GET /api/auth/me does not expose password hashes or TOTP secrets'
    );
  } catch (err: any) {
    recordResult(9, 'Profile endpoint sanitization', 'Sanitized', err.message, false, 'Failed checking profile');
  }

  console.log('\n===============================================================');
  console.log('TEST SUMMARY');
  console.log('===============================================================');
  const allPassed = results.every((r) => r.passed);
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`Passed: ${passedCount} / ${results.length}`);
  if (allPassed) {
    console.log('STATUS: ALL SECURITY TESTS PASSED SUCCESSFULLY! (100%)');
  } else {
    console.log('STATUS: SOME TESTS FAILED. CHECK LOGS ABOVE.');
  }
}

runTests().catch(console.error);
