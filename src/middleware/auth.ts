import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import {
  getAllStudents,
  getSettings,
  getLinkedStudentIdsForParent,
  linkParentToStudent,
  recordAuditLog,
  getAppUserByUid,
  upsertAppUser
} from '../db/repository.ts';

export type UserRole = 'admin' | 'teacher' | 'parent' | 'unassigned' | 'unauthenticated' | 'anonymous' | 'disabled';

export type MadrasahAction =
  | 'hifz.write'
  | 'attendance.write'
  | 'teacher_comment.write'
  | 'teacher_signature.write'
  | 'home_learning.write'
  | 'tarbiyah.write'
  | 'parent_signature.write'
  | 'settings.admin'
  | 'settings.teacher';

export const ROLE_PERMISSIONS: Record<UserRole, MadrasahAction[]> = {
  admin: [
    'hifz.write',
    'attendance.write',
    'teacher_comment.write',
    'teacher_signature.write',
    'home_learning.write',
    'tarbiyah.write',
    'parent_signature.write',
    'settings.admin',
    'settings.teacher',
  ],
  teacher: [
    'hifz.write',
    'attendance.write',
    'teacher_comment.write',
    'teacher_signature.write',
    'settings.teacher',
  ],
  parent: [
    'home_learning.write',
    'tarbiyah.write',
    'parent_signature.write',
  ],
  unassigned: [],
  unauthenticated: [],
  anonymous: [],
  disabled: [],
};

export const requireAction = (action: MadrasahAction) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role === 'anonymous' || req.user.role === 'unauthenticated') {
      return res.status(401).json({
        error: 'Unauthorized: Authentication required',
        code: 'UNAUTHORIZED'
      });
    }

    const permissions = ROLE_PERMISSIONS[req.user.role] || [];
    if (!permissions.includes(action)) {
      return res.status(403).json({
        error: `Forbidden: Role '${req.user.role}' lacks permission for action '${action}'`,
        code: 'ACTION_UNAUTHORIZED',
        action
      });
    }

    next();
  };
};

export interface AuthenticatedUser {
  uid: string;
  email: string;
  role: UserRole;
  allowedStudentIds: string[];
  circleCode?: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
  operationId?: string;
}

/**
 * Middleware: Resolves identity exclusively via cryptographically verified Firebase ID Tokens.
 * 
 * In strict compliance with Production Security Architecture:
 * - NO client-controlled headers (x-user-role, x-circle-code, x-user-email) are trusted for authority.
 * - NO unverified JWT payload decoding fallback is permitted.
 * - NO hardcoded administrator emails. Administrator authority derives from Firebase custom claims or server config.
 * - NO studentEmail fallback for teachers. Teacher authority derives strictly from teacher registry & circle assignment.
 * - Explicit parent UID -> student relationship binding.
 * - Anonymous or unverified users are explicitly assigned role: 'anonymous'/'unassigned' with allowedStudentIds: [].
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
    const isEmailVerified = Boolean(decoded.email_verified);

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

    // Check directory status: If account has been revoked/disabled by admin, reject immediately
    const appUser = await getAppUserByUid(uid);
    if (appUser && (appUser.disabled || appUser.role === 'disabled')) {
      return res.status(403).json({
        error: 'Forbidden: Account has been disabled or access revoked by administrator',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // 2. Fetch server-authoritative roster from the database
    const allStudents = await getAllStudents();

    // 3. Admin Authority Check:
    // Derives from Firebase Admin Custom Claim (decoded.admin === true or decoded.role === 'admin'),
    // explicit appUsers assignment (appUser.role === 'admin'),
    // or the server-configured ADMIN_EMAIL environment variable (requires verified email).
    const serverConfiguredAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    const isAdmin = Boolean(decoded.admin === true) ||
      Boolean(decoded.role === 'admin') ||
      Boolean(appUser && appUser.role === 'admin') ||
      (isEmailVerified && serverConfiguredAdminEmail !== '' && email === serverConfiguredAdminEmail);

    if (isAdmin) {
      req.user = {
        uid,
        email,
        role: 'admin',
        allowedStudentIds: allStudents.map(s => s.id)
      };
      upsertAppUser({ uid, email, role: 'admin', displayName: (decoded.name as string) || null }).catch(() => {});
      return next();
    }

    // 4. Teacher Authority Check:
    // Strictly requires teacher registration and assigned Halqa circle.
    // A studentEmail NEVER establishes teacher authority.
    // If derived from email lookup in teacher roster, email MUST be verified (isEmailVerified === true).
    let teacherCircleCode: string | null = null;
    if (decoded.role === 'teacher' && typeof decoded.circleCode === 'string') {
      teacherCircleCode = decoded.circleCode;
    } else if (appUser && appUser.role === 'teacher' && appUser.circleCode) {
      teacherCircleCode = appUser.circleCode;
    } else if (isEmailVerified) {
      try {
        const adminSettings: any = await getSettings('admin_settings') || await getSettings('admin');
        if (adminSettings && Array.isArray(adminSettings.teachers)) {
          const found = adminSettings.teachers.find(
            (t: any) => t.email && t.email.toLowerCase().trim() === email
          );
          if (found && found.circleCode) {
            teacherCircleCode = found.circleCode;
          }
        }
      } catch {}
    }

    if (teacherCircleCode !== null) {
      const matchingTeacherStudents = allStudents.filter(
        s => s.circleCode.toLowerCase().trim() === teacherCircleCode!.toLowerCase().trim()
      );
      req.user = {
        uid,
        email,
        role: 'teacher',
        allowedStudentIds: matchingTeacherStudents.map(s => s.id),
        circleCode: teacherCircleCode
      };
      upsertAppUser({ uid, email, role: 'teacher', circleCode: teacherCircleCode, displayName: (decoded.name as string) || null }).catch(() => {});
      return next();
    }

    // 5. Parent Authority Check:
    // Server-Authoritative UID -> Student relationship.
    // Query explicit parent_student_links for this UID. Fail closed if DB is unreachable.
    let linkedStudentIds: string[] = [];
    try {
      linkedStudentIds = await getLinkedStudentIdsForParent(uid);
    } catch (err: any) {
      if (err?.message === 'AUTH_DB_UNAVAILABLE') {
        return res.status(503).json({
          error: 'Service temporarily unavailable: Unable to verify parent student authorizations',
          code: 'AUTH_DB_UNAVAILABLE'
        });
      }
    }

    // If no existing links for this UID, check if verified email matches student parentEmail
    // and establish the durable server-side link.
    // STRICT REQUIREMENT: Only verified emails (isEmailVerified === true) may establish parent-student links!
    if (linkedStudentIds.length === 0 && email !== '' && isEmailVerified) {
      const matchingParentStudents = allStudents.filter(
        s => s.parentEmail && s.parentEmail.toLowerCase().trim() === email
      );
      if (matchingParentStudents.length > 0) {
        for (const st of matchingParentStudents) {
          await linkParentToStudent(uid, st.id);
        }
        linkedStudentIds = matchingParentStudents.map(s => s.id);
      }
    }

    if (linkedStudentIds.length > 0) {
      req.user = {
        uid,
        email,
        role: 'parent',
        allowedStudentIds: linkedStudentIds
      };
      upsertAppUser({ uid, email, role: 'parent', displayName: (decoded.name as string) || null }).catch(() => {});
      return next();
    }

    // Verified account, but no associated children or teaching circles
    req.user = {
      uid,
      email,
      role: 'unassigned',
      allowedStudentIds: []
    };
    upsertAppUser({ uid, email, role: 'unassigned', displayName: (decoded.name as string) || null }).catch(() => {});

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
        error: 'Forbidden: Access to student record is denied',
        code: 'STUDENT_ACCESS_DENIED'
      });
    }
  } else {
    // If accessing a student collection without specifying studentId,
    // user must have non-empty allowedStudentIds
    if (!req.user.allowedStudentIds || req.user.allowedStudentIds.length === 0) {
      return res.status(403).json({
        error: 'Forbidden: Access to student records is denied',
        code: 'STUDENT_ACCESS_DENIED'
      });
    }
  }

  // Audit log reads and writes to student data
  recordAuditLog({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    action: req.method === 'GET' ? 'read' : req.method === 'DELETE' ? 'delete' : 'write',
    resourceType: (req.baseUrl || '') + (req.path || ''),
    resourceId: studentId || 'scoped-collection',
    studentId: studentId || undefined,
    ipAddress: (req.headers?.['x-forwarded-for'] as string) || req.socket?.remoteAddress,
    userAgent: (req.headers?.['user-agent'] as string) || undefined,
  }).catch(() => {});

  next();
};
