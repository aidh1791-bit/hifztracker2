import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { getAllStudents, getSettings } from '../db/repository.ts';

export type UserRole = 'admin' | 'teacher' | 'parent' | 'unassigned' | 'unauthenticated' | 'anonymous';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  role: UserRole;
  allowedStudentIds: string[];
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Middleware: Resolves identity exclusively via cryptographically verified Firebase ID Tokens.
 * 
 * In strict compliance with Security Rule I3:
 * - NO client-controlled headers (x-user-role, x-circle-code, x-user-email) are trusted for authority.
 * - NO unverified JWT payload decoding fallback is permitted.
 * - If token verification fails, the request is immediately rejected with 401.
 * - Anonymous users are explicitly assigned role: 'anonymous' with allowedStudentIds: [].
 */
export const resolveAuthorisation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  // Default anonymous state (Zero-Trust, Default-Deny, explicitly empty allowedStudentIds)
  req.user = {
    uid: '',
    email: '',
    role: 'anonymous',
    allowedStudentIds: []
  };

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided; leave as anonymous with empty student list
    return next();
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return next();
  }

  try {
    // 1. Unconditionally verify signature, expiration, and issuer with Firebase Admin SDK
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;
    const email = (decoded.email || '').toLowerCase().trim();

    // Check for Firebase anonymous authentication provider
    if (!email || decoded.firebase?.sign_in_provider === 'anonymous') {
      req.user = {
        uid,
        email: email || '',
        role: 'anonymous',
        allowedStudentIds: []
      };
      return next();
    }

    // 2. Fetch server-authoritative roster from the database
    const allStudents = await getAllStudents();

    // 3. Admin Authority Check:
    // Only verified Firebase custom claim `admin: true` or verified email matching authorized administrator list
    const adminEmails = [
      (process.env.ADMIN_EMAIL || '').toLowerCase().trim(),
      'aidh1791@gmail.com',
      'admin@hifztrack.org'
    ].filter(Boolean);

    const isAdmin = Boolean(decoded.admin === true) || (email !== '' && adminEmails.includes(email));

    if (isAdmin) {
      req.user = {
        uid,
        email,
        role: 'admin',
        allowedStudentIds: allStudents.map(s => s.id)
      };
      return next();
    }

    // 4. Parent Authority Check:
    // Derive allowed students strictly from verified email matching student parent records in database
    const matchingParentStudents = email !== ''
      ? allStudents.filter(s => s.parentEmail && s.parentEmail.toLowerCase().trim() === email)
      : [];

    if (matchingParentStudents.length > 0) {
      req.user = {
        uid,
        email,
        role: 'parent',
        allowedStudentIds: matchingParentStudents.map(s => s.id)
      };
      return next();
    }

    // 5. Teacher Authority Check:
    // Look up teacher in database settings
    let teacherCircleCode: string | null = null;
    try {
      const adminSettings: any = await getSettings('admin');
      if (adminSettings && Array.isArray(adminSettings.teachers)) {
        const found = adminSettings.teachers.find(
          (t: any) => t.email && t.email.toLowerCase().trim() === email
        );
        if (found) {
          teacherCircleCode = found.circleCode;
        }
      }
    } catch {}

    const matchingTeacherStudents = teacherCircleCode
      ? allStudents.filter(s => s.circleCode.toLowerCase().trim() === teacherCircleCode!.toLowerCase().trim())
      : allStudents.filter(s => s.studentEmail && s.studentEmail.toLowerCase().trim() === email);

    if (matchingTeacherStudents.length > 0 || teacherCircleCode !== null) {
      req.user = {
        uid,
        email,
        role: 'teacher',
        allowedStudentIds: matchingTeacherStudents.map(s => s.id)
      };
      return next();
    }

    // Verified account, but no associated children or teaching circles
    req.user = {
      uid,
      email,
      role: 'unassigned',
      allowedStudentIds: []
    };

    next();
  } catch (error: any) {
    // Production Security Rule: An invalid or expired token MUST fail immediately with 401.
    // Never fall back to unverified payload decoding.
    return res.status(401).json({
      error: 'Unauthorized: Invalid or expired authentication token',
      code: 'AUTH_TOKEN_INVALID'
    });
  }
};

/**
 * Gatekeeper: Requires that the user is authenticated with a valid token.
 */
export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role === 'anonymous' || req.user.role === 'unauthenticated' || !req.user.uid) {
    return res.status(401).json({
      error: 'Unauthorized: Valid authentication token required',
      code: 'AUTH_REQUIRED'
    });
  }
  next();
};

/**
 * Gatekeeper: Enforces that the user has verified administrator privileges.
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role === 'anonymous' || req.user.role === 'unauthenticated' || !req.user.uid) {
    return res.status(401).json({
      error: 'Unauthorized: Valid authentication token required',
      code: 'AUTH_REQUIRED'
    });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden: Administrator privileges required',
      code: 'ADMIN_REQUIRED'
    });
  }
  next();
};

/**
 * Gatekeeper: Verifies that the requester has server-authorized permission to access the specified student.
 * 
 * Strict Default-Deny: Anonymous and unauthenticated users are rejected by default with 403 Forbidden
 * on all student-scoped routes.
 */
export const requireStudentAccess = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Reject anonymous or unauthenticated users with 403 Forbidden by default
  if (!req.user || req.user.role === 'anonymous' || req.user.role === 'unauthenticated' || !req.user.uid) {
    return res.status(403).json({
      error: 'Forbidden: Anonymous access to student-scoped routes is denied by default',
      code: 'STUDENT_ACCESS_DENIED'
    });
  }

  // Admins have full access to all students
  if (req.user.role === 'admin') {
    return next();
  }

  const studentId = (req.params?.id || req.query?.studentId || req.body?.studentId) as string | undefined;

  // If a specific student ID was targeted, enforce authorization boundary
  if (studentId) {
    const isAllowed = req.user.allowedStudentIds.includes(studentId);
    if (!isAllowed) {
      return res.status(403).json({
        error: 'Forbidden: You do not have permission to access records for this student',
        code: 'STUDENT_ACCESS_DENIED',
        studentId
      });
    }
  } else {
    // If accessing a student collection without specifying studentId,
    // user must have non-empty allowedStudentIds
    if (!req.user.allowedStudentIds || req.user.allowedStudentIds.length === 0) {
      return res.status(403).json({
        error: 'Forbidden: No student access permitted for this account',
        code: 'STUDENT_ACCESS_DENIED'
      });
    }
  }

  next();
};
