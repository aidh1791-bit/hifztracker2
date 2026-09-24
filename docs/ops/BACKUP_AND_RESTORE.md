# Operational Runbook: Database Backup Schedule & Restore Procedure

## 1. Cloud SQL Automated & Manual Backup Policy

### Automated Backup Schedule
- **Frequency:** Nightly automated backups at 02:00 UTC (during low madrasah activity).
- **Retention Period:** 30 days continuous point-in-time recovery (PITR).
- **Location:** Geographically redundant European Cloud storage (EU multi-region).
- **Transaction Logs:** Retained for 7 days enabling down-to-the-second recovery.

### Manual Pre-Deployment Snapshot
Before any production schema migration or major administrative roster re-assignment:
```bash
# Create immediate on-demand Cloud SQL snapshot
gcloud sql backups create \
  --instance=madrasah-hifz-db \
  --description="pre-migration-$(date +%Y%m%d-%H%M)"
```

---

## 2. Restore Procedure (Point-in-Time & Snapshot)

### Option A: Restore to Existing Instance from Snapshot
```bash
# 1. List available backups and capture the BACKUP_ID
gcloud sql backups list --instance=madrasah-hifz-db

# 2. Restore target backup
gcloud sql backups restore BACKUP_ID \
  --restore-instance=madrasah-hifz-db \
  --backup-instance=madrasah-hifz-db
```

### Option B: Point-in-Time Recovery (Clone to Test Target)
To inspect or salvage records without taking down the production system:
```bash
gcloud sql instances clone madrasah-hifz-db madrasah-hifz-db-recovery \
  --point-in-time="2026-09-24T02:00:00.000Z"
```

---

## 3. Data Protection Safeguarding During Restore
1. **Student Confidentiality:** Restored staging databases must never be exposed publicly.
2. **Author Attribution:** Operation idempotency IDs (`processed_operations`) ensure restored transactions cannot be re-applied out of order.
3. **Audit Log Continuity:** The `audit_log` table must be retained and merged if restoring partial records.
