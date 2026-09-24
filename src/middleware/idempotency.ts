import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.ts';
import { getProcessedOperation, recordProcessedOperation } from '../db/repository.ts';

export async function requireIdempotency(req: AuthRequest, res: Response, next: NextFunction) {
  const opId = (req.headers['x-operation-id'] as string) || req.body?.operationId;
  
  // If operation ID is provided by the client (offline queue replay or client idempotency)
  if (opId) {
    if (!req.user?.uid) {
      return res.status(401).json({ error: 'Authentication required for idempotent operations' });
    }

    try {
      const existing = await getProcessedOperation(opId);
      if (existing) {
        // Enforce safety rule 1: Same operationId under a different UID must be rejected with 409 Conflict
        if (existing.uid !== req.user.uid) {
          return res.status(409).json({ error: 'Operation ID belongs to another user account' });
        }
        // Cached successful result
        return res.status(existing.status).json(existing.response);
      }
    } catch (err) {
      console.warn('[Idempotency] Failed to inspect processed operations:', err);
    }

    req.operationId = opId;
  }

  next();
}

export async function recordOperation(req: AuthRequest, res: Response, body: any): Promise<void> {
  if (!req.operationId || !req.user?.uid) return;
  try {
    const clientTimestamp = (req.headers['x-client-timestamp'] as string) || new Date().toISOString();
    await recordProcessedOperation(req.operationId, req.user.uid, req.path, clientTimestamp, body);
  } catch (err) {
    console.error('[Idempotency] Failed to record completed operation:', err);
  }
}
