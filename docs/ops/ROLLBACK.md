# Operational Runbook: Application & Database Rollback Procedure

## 1. Overview & Authorized Personnel
This document outlines the strict protocol for executing emergency application rollbacks and database recovery for the Madrasah Hifz Class Tracker & Tarbiyah Log platform.

### Authorized Personnel
- **Designated Madrasah Technical Lead**
- **System Administrator (Cloud Project IAM Owner)**

---

## 2. Fast Cloud Run Application Revision Rollback (< 2 minutes)
If a software defect or bad deployment impacts live students/teachers, immediately route traffic back to the prior stable container revision.

```bash
# 1. Identify previous healthy Cloud Run revision
gcloud run revisions list \
  --service=madrasah-hifz-app \
  --region=europe-west2 \
  --format="table(name,active,traffic_percent,create_time)"

# 2. Pin 100% traffic immediately to the verified previous revision
gcloud run services update-traffic madrasah-hifz-app \
  --region=europe-west2 \
  --to-revisions=madrasah-hifz-app-PREVIOUS_STABLE_REVISION=100

# 3. Verify health endpoint returns 200 OK
curl -f https://madrasah-hifz-app.a.run.app/healthz
```

---

## 3. Database Migration Rollback (Drizzle ORM)
Database migrations must follow strict forward-backward compatibility principles.

### Procedure for Rolling Back a Migration:
1. **Never drop columns containing student data in a forward step without a documented backup.**
2. If a migration fails midway:
   - Identify the failed migration timestamp from the Drizzle migrations table.
   - Run the reversal script:
     ```bash
     npm run db:rollback
     ```
3. Verify integrity constraints:
   - Check unique index `(student_id, date)` on `daily_hifz_records`.
   - Check unique index `(student_id, date)` on `daily_home_learning_records`.
   - Check unique index `(parent_uid, student_id)` on `parent_student_links`.

---

## 4. Post-Rollback Verification Checklist
- [ ] `/healthz` returns `{"status":"ok","database":"connected"}`.
- [ ] Authentication via `/api/me` correctly resolves user roles and circle scopes.
- [ ] Offline sync queue items retry cleanly without duplicate insertions (Idempotency verified).
- [ ] Audit log entry recorded with reason for rollback.
