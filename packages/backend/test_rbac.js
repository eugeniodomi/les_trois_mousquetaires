/**
 * test_rbac.js — RBAC Endpoint Validation Script
 *
 * ⚠️  BEFORE RUNNING: Change the credentials below to a real user in your database.
 *     To test admin access, make sure that user has role = 'admin' in the `usuarios` table:
 *     UPDATE usuarios SET role = 'admin' WHERE email = 'seu@email.com';
 *
 * Run with:
 *   node test_rbac.js
 */

const BASE_URL = 'http://localhost:5000/api';

// ─── ✏️  CHANGE THESE CREDENTIALS ────────────────────────────────────────────
const TEST_EMAIL = 'adm@itone.com.br';
const TEST_PASSWORD = 'adm123';
// ─────────────────────────────────────────────────────────────────────────────

async function runTests() {
  console.log('═══════════════════════════════════════════════');
  console.log('  RBAC Test Suite — Les Trois Mousquetaires    ');
  console.log('═══════════════════════════════════════════════\n');

  // ──────────────────────────────────────────────
  // STEP A — Login
  // ──────────────────────────────────────────────
  console.log('▶  Step A: POST /api/auth/login');
  console.log(`   Email: ${TEST_EMAIL}`);

  let token = null;
  let userRole = null;

  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    });

    const loginData = await loginRes.json();

    if (!loginRes.ok) {
      console.error(`   ❌ Login failed (HTTP ${loginRes.status}):`, loginData);
      return;
    }

    token = loginData.token;
    userRole = loginData.user?.role;

    console.log(`   ✅ Login successful (HTTP ${loginRes.status})`);

    // ──────────────────────────────────────────────
    // STEP B — Verify Role
    // ──────────────────────────────────────────────
    console.log('\n▶  Step B: Verify role in login response');
    if (userRole !== undefined) {
      console.log(`   ✅ Role received: "${userRole}"`);
    } else {
      console.warn('   ⚠️  No "role" field found in user object. Did you run the DB migration?');
    }

    console.log('   Full user object:', JSON.stringify(loginData.user, null, 2));

    // Verify JWT payload contains role
    if (token) {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
      console.log(`   JWT payload role: "${payload?.user?.role ?? 'NOT FOUND'}"`);
    }

  } catch (err) {
    console.error('   ❌ Network error during login:', err.message);
    console.error('   Make sure the backend is running on port 5000.');
    return;
  }

  // ──────────────────────────────────────────────
  // STEP C — Access Admin Route: GET /api/usuarios
  // ──────────────────────────────────────────────
  console.log('\n▶  Step C: GET /api/usuarios  (admin-only route)');

  try {
    const adminRes = await fetch(`${BASE_URL}/usuarios`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const adminData = await adminRes.json();

    // ──────────────────────────────────────────────
    // STEP D — Result
    // ──────────────────────────────────────────────
    console.log(`\n▶  Step D: Result`);
    console.log(`   HTTP Status: ${adminRes.status} ${adminRes.statusText}`);

    if (adminRes.status === 200) {
      console.log(`   ✅ PASS — Admin access granted. ${adminData.length} user(s) returned.`);
      console.log('   Users:', JSON.stringify(adminData.map(u => ({ id: u.id, nome: u.nome, role: u.role })), null, 2));
    } else if (adminRes.status === 403) {
      console.log(`   🚫 EXPECTED 403 — Role "${userRole}" is not admin. Access correctly denied.`);
      console.log('   Response:', adminData);
    } else if (adminRes.status === 401) {
      console.log(`   ❌ 401 Unauthorized — Token was not accepted. Check JWT_SECRET.`);
      console.log('   Response:', adminData);
    } else {
      console.log(`   ⚠️  Unexpected status ${adminRes.status}:`, adminData);
    }

  } catch (err) {
    console.error('   ❌ Network error during admin route test:', err.message);
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('  Test complete.');
  console.log('═══════════════════════════════════════════════\n');
}

runTests();
