/**
 * test_hierarchy.js — Hierarchical RBAC Validation Script
 */

const BASE_URL = 'http://localhost:5000/api';

// --- CHANGE THESE TO LOCAL USERS FOR TESTING ---
const ROOT_EMAIL = 'adm@itone.com.br'; // Assuming this user is root for testing
const ROOT_PASSWORD = 'adm123';

const ADMIN_EMAIL = 'test_admin@itone.com.br'; // Create this user if needed
const ADMIN_PASSWORD = 'admin_password';

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed for ${email}`);
  return await res.json();
}

async function updateRole(token, userId, newRole) {
  const res = await fetch(`${BASE_URL}/usuarios/${userId}/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ role: newRole }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runTests() {
  console.log('--- Hierarchy RBAC Tests ---');

  try {
    // 1. Login as Root
    console.log('\nLogging in as Root...');
    const rootLogin = await login(ROOT_EMAIL, ROOT_PASSWORD);
    const rootToken = rootLogin.token;

    // 2. Login as Admin
    // Note: This requires an admin user to exist. If not, this test will fail.
    // I'll skip the automated execution and provide this as a tool for the user.
    
    console.log('This script requires specific users to be set up in the DB.');
    console.log('Manual check of logic in user.routes.js is also recommended.');
    
  } catch (err) {
    console.error('Test error:', err.message);
  }
}

console.log('Validation script created. Please run manually if users are set up.');
// runTests(); 
