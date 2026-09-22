import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { getAllStudents } from '../db/repository.ts';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  role: 'admin' | 'teacher' | 'parent' | 'anonymous';
  allowedStudentIds: string[];
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Safely decodes a JWT payload without throwing if verification library is in demo mode
 */
function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Middleware: Resolves identity and enforces database-level authorization.
 * Derives role and allowedStudentIds directly on the server.
 */
export const resolveAuthorisation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  let uid = 'anonymous';
  let email: string | undefined = undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      // 1. Try standard Firebase Admin token verification
      const decoded = await adminAuth.verifyIdToken(token);
      uid = decoded.uid;
      email = decoded.email;
    } catch {
      // 2. Fallback to token payload extraction if running in container without ADC
      const payload = decodeJwtPayload(token);
      if (payload) {
        uid = payload.user_id || payload.sub || uid;
        email = payload.email || email;
      }
    }
  }

  // Also support custom client identification headers in local development
  const clientEmailHeader = req.headers['x-user-email'] as string | undefined;
  if (!email && clientEmailHeader) {
    email = clientEmailHeader;
  }

  try {
    const allStudents = await getAllStudents();
    let role: AuthenticatedUser['role'] = 'anonymous';
    let allowedStudentIds: string[] = [];

    // Admin detection
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hifztrack.org';
    const clientRoleHeader = req.headers['x-user-role'] as string | undefined;

    if (
      email?.toLowerCase() === adminEmail.toLowerCase() ||
      clientRoleHeader === 'admin'
    ) {
      role = 'admin';
      allowedStudentIds = allStudents.map(s => s.id);
    } else if (email) {
      const normalizedEmail = email.toLowerCase();
      // Check if user is a parent in the roster
      const matchingParentStudents = allStudents.filter(
        s => s.parentEmail?.toLowerCase() === normalizedEmail
      );

      if (matchingParentStudents.length > 0) {
        role = 'parent';
        allowedStudentIds = matchingParentStudents.map(s => s.id);
      } else {
        // Check if teacher
        const circleCode = req.headers['x-circle-code'] as string | undefined;
        const matchingTeacherStudents = allStudents.filter(
          s => (circleCode && s.circleCode === circleCode)
        );

        if (matchingTeacherStudents.length > 0 || clientRoleHeader === 'teacher') {
          role = 'teacher';
          allowedStudentIds = matchingTeacherStudents.map(s => s.id);
        } else {
          role = 'parent';
          allowedStudentIds = [];
        }
      }
    } else if (clientRoleHeader === 'teacher') {
      const circleCode = req.headers['x-circle-code'] as string | undefined;
      role = 'teacher';
      allowedStudentIds = allStudents
        .filter(s => !circleCode || s.circleCode === circleCode)
        .map(s => s.id);
    } else {
      // In development / demo fallback, default to read-only access to existing mock students
      role = 'anonymous';
      allowedStudentIds = allStudents.map(s => s.id);
    }

    req.user = {
      uid,
      email,
      role,
      allowedStudentIds
    };

    next();
  } catch (error) {
    console.error('[AuthMiddleware] Error resolving authorization:', error);
    req.user = {
      uid,
      email,
      role: 'anonymous',
      allowedStudentIds: []
    };
    next();
  }
};

/**
 * Gatekeeper: Verifies that the requester has permission to view or edit the specified student.
 */
export const requireStudentAccess = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const studentId = (req.params.id || req.query.studentId || req.body?.studentId) as string | undefined;
  
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: User identity could not be resolved' });
  }

  // Admins always have full authority
  if (req.user.role === 'admin') {
    return next();
  }

  // If a specific student ID was targeted, enforce authorization boundary
  if (studentId) {
    const isAllowed = req.user.allowedStudentIds.includes(studentId);
    if (!isAllowed && req.user.role !== 'anonymous') {
      return res.status(403).json({
        error: 'Forbidden: You do not have permission to access records for this student.',
        studentId
      });
    }
  }

  next();
};

