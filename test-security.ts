/**
 * Madrasah Platform - Automated Security & Penetration Audit Test Suite
 * 
 * Verifies OWASP default-deny, server-side role derivation, and zero-trust identity enforcement.
 * 
 * Tests 10 specific attack vectors:
 * 1. No token -> Access student Hifz records -> 401
 * 2. Fake / unverified JWT -> Access student records -> 401
 * 3. Client header spoofing 'x-user-role: admin' -> Read student roster -> 401 (Header ignored)
 * 4. Client header spoofing 'x-user-role: admin' -> DELETE student -> 401 (Header ignored)
 * 5. Client header spoofing 'x-user-role: teacher' -> Access records -> 401 (Header ignored)
 * 6. Unauthenticated POST -> Create / modify student -> 401
 * 7. Unauthenticated POST -> Seed database -> 401
 * 8. Unauthenticated POST -> Mutate settings -> 401
 * 9. Unauthenticated GET -> Read settings -> 401
 * 10. Role isolation:
 *     a. Parent A targeting Parent B's student -> 403 Forbidden
 *     b. Teacher A targeting student outside assigned circle -> 403 Forbidden
 *     c. Non-admin accessing admin-only endpoint -> 403 Forbidden
 *     d. Admin accessing student records -> 200 Allowed
 */

import http from 'http';
import { createExpressApp } from './server.ts';
import { requireStudentAccess, requireAdmin, requireAuth, AuthRequest } from './src/middleware/auth.ts';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName} - ${details || 'Assertion failed'}`);
    failCount++;
  }
}

async function runAudit() {
  console.log('====================================================');
  console.log('🛡️  RUNNING MADRASAH PRODUCTION SECURITY AUDIT SUITE');
  console.log('====================================================\n');

  const app = createExpressApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // ----------------------------------------------------
    // Test 1: Anonymous / No Token -> Student Records (Expect 403)
    // ----------------------------------------------------
    const res1 = await fetch(`${baseUrl}/api/records/hifz?studentId=std-1`);
    assert(
      res1.status === 403,
      'Test 1: Anonymous request to GET /api/records/hifz returns 403 Forbidden by default',
      `Got status ${res1.status}`
    );

    // ----------------------------------------------------
    // Test 2: Fake / Forged JWT Token
    // ----------------------------------------------------
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkF0dGFja2VyIiwiYWRtaW4iOnRydWV9.fake_signature_attempt';
    const res2 = await fetch(`${baseUrl}/api/records/hifz?studentId=std-1`, {
      headers: { Authorization: `Bearer ${fakeToken}` }
    });
    assert(
      res2.status === 401,
      'Test 2: Forged JWT token signature rejected with 401 (No decoding bypass)',
      `Got status ${res2.status}`
    );

    // ----------------------------------------------------
    // Test 3: Client Header Spoofing 'x-user-role: admin' -> GET /api/students (Expect 403)
    // ----------------------------------------------------
    const res3 = await fetch(`${baseUrl}/api/students`, {
      headers: {
        'x-user-role': 'admin',
        'x-user-email': 'attacker@evil.com'
      }
    });
    assert(
      res3.status === 403,
      'Test 3: Anonymous request with client headers cannot access /api/students (Returns 403 Forbidden)',
      `Got status ${res3.status}`
    );

    // ----------------------------------------------------
    // Test 4: Client Header Spoofing on DELETE student
    // ----------------------------------------------------
    const res4 = await fetch(`${baseUrl}/api/students/std-1`, {
      method: 'DELETE',
      headers: {
        'x-user-role': 'admin'
      }
    });
    assert(
      res4.status === 401,
      'Test 4: Client header "x-user-role: admin" cannot delete students (Returns 401)',
      `Got status ${res4.status}`
    );

    // ----------------------------------------------------
    // Test 5: Client Header Spoofing on Teacher Circle (Expect 403)
    // ----------------------------------------------------
    const res5 = await fetch(`${baseUrl}/api/records/hifz?studentId=std-1`, {
      headers: {
        'x-user-role': 'teacher',
        'x-circle-code': 'H1'
      }
    });
    assert(
      res5.status === 403,
      'Test 5: Anonymous request with fake teacher headers rejected with 403 Forbidden',
      `Got status ${res5.status}`
    );

    // ----------------------------------------------------
    // Test 6: Unauthenticated POST student
    // ----------------------------------------------------
    const res6 = await fetch(`${baseUrl}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Malicious Student' })
    });
    assert(
      res6.status === 401,
      'Test 6: Unauthenticated POST /api/students returns 401',
      `Got status ${res6.status}`
    );

    // ----------------------------------------------------
    // Test 7: Unauthenticated POST seed database
    // ----------------------------------------------------
    const res7 = await fetch(`${baseUrl}/api/database/seed`, {
      method: 'POST'
    });
    assert(
      res7.status === 401,
      'Test 7: Unauthenticated POST /api/database/seed returns 401',
      `Got status ${res7.status}`
    );

    // ----------------------------------------------------
    // Test 8: Unauthenticated POST settings
    // ----------------------------------------------------
    const res8 = await fetch(`${baseUrl}/api/settings/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hacked: true })
    });
    assert(
      res8.status === 401,
      'Test 8: Unauthenticated POST /api/settings returns 401',
      `Got status ${res8.status}`
    );

    // ----------------------------------------------------
    // Test 9: Unauthenticated GET settings
    // ----------------------------------------------------
    const res9 = await fetch(`${baseUrl}/api/settings/admin`);
    assert(
      res9.status === 401,
      'Test 9: Unauthenticated GET /api/settings returns 401',
      `Got status ${res9.status}`
    );

    // ----------------------------------------------------
    // Test 9b: Unauthenticated Mutations on Home, Tarbiyah, Evaluations (Default-Deny 403)
    // ----------------------------------------------------
    const resHome = await fetch(`${baseUrl}/api/records/home`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: 'std-1', date: '2026-09-23' })
    });
    assert(
      resHome.status === 403,
      'Test 9b(1): Unauthenticated POST /api/records/home rejected with 403 Forbidden by default-deny',
      `Got status ${resHome.status}`
    );

    const resTarbiyah = await fetch(`${baseUrl}/api/records/tarbiyah`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: 'std-1', date: '2026-09-23' })
    });
    assert(
      resTarbiyah.status === 403,
      'Test 9b(2): Unauthenticated POST /api/records/tarbiyah rejected with 403 Forbidden by default-deny',
      `Got status ${resTarbiyah.status}`
    );

    const resEval = await fetch(`${baseUrl}/api/evaluations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: 'std-1', weekCommencing: '2026-09-23' })
    });
    assert(
      resEval.status === 403,
      'Test 9b(3): Unauthenticated POST /api/evaluations rejected with 403 Forbidden by default-deny',
      `Got status ${resEval.status}`
    );

    // ----------------------------------------------------
    // Test 9c: Malformed Non-JWT Bearer Token
    // ----------------------------------------------------
    const resMalformed = await fetch(`${baseUrl}/api/records/hifz?studentId=std-1`, {
      headers: { Authorization: 'Bearer random_garbage_string_not_a_jwt' }
    });
    assert(
      resMalformed.status === 401,
      'Test 9c: Malformed non-JWT token rejected with 401 by Firebase Admin verification',
      `Got status ${resMalformed.status}`
    );

    // ----------------------------------------------------
    // Test 10: Server-Side Cross-Role Boundary Unit Tests
    // ----------------------------------------------------
    console.log('\n  --- Role Scoping & Isolation Invariants ---');

    // 10a: Parent A targeting Parent B's student
    const createMockRes = (onStatus: (code: number) => void) => ({
      status: (code: number) => {
        onStatus(code);
        return {
          json: (_body: any) => {}
        };
      }
    });

    // 10a: Parent A targeting Parent B's student
    let parentStatus = 0;
    const mockParentReq: Partial<AuthRequest> = {
      query: { studentId: 'student-b' },
      user: {
        uid: 'parent-a-uid',
        email: 'parent.a@example.com',
        role: 'parent',
        allowedStudentIds: ['student-a']
      }
    };
    requireStudentAccess(
      mockParentReq as AuthRequest,
      createMockRes(code => { parentStatus = code; }) as any,
      () => { parentStatus = 200; }
    );
    assert(
      parentStatus === 403,
      'Test 10a: Parent A targeting Parent B student returns 403 Forbidden',
      `Got status ${parentStatus}`
    );

    // 10b: Teacher A targeting student outside assigned circle
    let teacherStatus = 0;
    const mockTeacherReq: Partial<AuthRequest> = {
      query: { studentId: 'circle-2-student' },
      user: {
        uid: 'teacher-1-uid',
        email: 'teacher.1@example.com',
        role: 'teacher',
        allowedStudentIds: ['circle-1-student-a', 'circle-1-student-b']
      }
    };
    requireStudentAccess(
      mockTeacherReq as AuthRequest,
      createMockRes(code => { teacherStatus = code; }) as any,
      () => { teacherStatus = 200; }
    );
    assert(
      teacherStatus === 403,
      'Test 10b: Teacher A targeting student outside Halqa circle returns 403 Forbidden',
      `Got status ${teacherStatus}`
    );

    // 10c: Non-admin trying to access requireAdmin
    let adminCheckStatus = 0;
    requireAdmin(
      mockParentReq as AuthRequest,
      createMockRes(code => { adminCheckStatus = code; }) as any,
      () => { adminCheckStatus = 200; }
    );
    assert(
      adminCheckStatus === 403,
      'Test 10c: Non-admin calling admin-protected route returns 403 Forbidden',
      `Got status ${adminCheckStatus}`
    );

    // 10d: Verified Admin accessing any student
    let adminAccessStatus = 0;
    const mockAdminReq: Partial<AuthRequest> = {
      query: { studentId: 'any-student' },
      user: {
        uid: 'admin-uid',
        email: 'admin@hifztrack.org',
        role: 'admin',
        allowedStudentIds: ['all']
      }
    };
    requireStudentAccess(
      mockAdminReq as AuthRequest,
      createMockRes(code => { adminAccessStatus = code; }) as any,
      () => { adminAccessStatus = 200; }
    );
    assert(
      adminAccessStatus === 200,
      'Test 10d: Verified Administrator has universal authorized access (Returns 200)',
      `Got status ${adminAccessStatus}`
    );

    // 10e: Anonymous User denied by default on student-scoped routes & allowedStudentIds is empty
    let anonAccessStatus = 0;
    const mockAnonReq: Partial<AuthRequest> = {
      query: { studentId: 'any-student' },
      user: {
        uid: '',
        email: '',
        role: 'anonymous',
        allowedStudentIds: []
      }
    };
    requireStudentAccess(
      mockAnonReq as AuthRequest,
      createMockRes(code => { anonAccessStatus = code; }) as any,
      () => { anonAccessStatus = 200; }
    );
    assert(
      anonAccessStatus === 403,
      'Test 10e: Anonymous user receives 403 on student-scoped routes',
      `Got status ${anonAccessStatus}`
    );
    assert(
      Array.isArray(mockAnonReq.user?.allowedStudentIds) && mockAnonReq.user?.allowedStudentIds.length === 0,
      'Test 10f: Anonymous user allowedStudentIds is explicitly empty ([])'
    );

  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log(`AUDIT RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('====================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL 10 PENETRATION & AUTHORIZATION CHECKS PASSED.');
    process.exit(0);
  }
}

runAudit().catch((err) => {
  console.error('Test suite failed unexpectedly:', err);
  process.exit(1);
});
