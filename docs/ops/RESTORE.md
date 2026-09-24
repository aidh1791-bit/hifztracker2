# Disaster Recovery & Database Restoration Runbook

This document outlines the standard operating procedure (SOP) for restoring the HifzTrack Cloud SQL (PostgreSQL) database and audit logs from automated and on-demand backups.

## 1. Cloud SQL Automated & Point-in-Time Backups

HifzTrack is backed by Google Cloud SQL for PostgreSQL. Automated daily backups and transaction log retention (WAL archiving) are enabled.

### 1.1 List Available Backups
Using the Google Cloud CLI:
```bash
gcloud sql backups list --instance=hifztrack-db
```

### 1.2 Point-in-Time Recovery (PITR)
To restore the database to an exact timestamp before an incident (e.g., accidental truncation or corruption):
```bash
gcloud sql instances clone hifztrack-db hifztrack-db-restored \
    --point-in-time="2026-09-23T04:30:00.000Z"
```

Verify data integrity on `hifztrack-db-restored` before switching production traffic.

---

## 2. Drizzle ORM Schema & Migration Replay

The authoritative database schema resides in `/src/db/schema.ts`.

### 2.1 Rebuilding Database Schema
In case of a fresh database provisioning:
```bash
# Push current schema state directly to database
npm run db:push
```

### 2.2 Re-seeding Initial Madrasah Directory (Optional Dev/Staging)
```bash
# Triggers seedInitialMadrasahDataIfEmpty()
curl -X POST http://localhost:3000/api/database/seed \
  -H "Authorization: Bearer <ADMIN_ID_TOKEN>"
```

---

## 3. Idempotency & Offline Queue Safety During Restore

1. The `processed_operations` table retains operation IDs and client timestamps.
2. In the event of a database rollback, clients retaining unsynced mutations in `madrasah_offline_sync_queue_v1` will automatically retry on reconnect with their preserved `x-operation-id` headers.
3. The server's `requireIdempotency` middleware guarantees that no duplicate mutations are recorded.

---

## 4. Audit Log Integrity & GDPR Subject Access

The `audit_log` table tracks:
- `actor_uid`: ID of the authenticated user
- `actor_role`: Role authority used (admin, teacher, parent)
- `action`: read, write, or delete
- `resource_type` and `student_id`: Scoped entity identifier
- `ip_address` and `user_agent`: Origin metadata

During a database restore, the `audit_log` table must be restored in lockstep with the student data tables to preserve compliance records.
