CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"role" text DEFAULT 'parent' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "students" (
	"id" text PRIMARY KEY NOT NULL,
	"roll_number" text NOT NULL,
	"name" text NOT NULL,
	"dob" text,
	"gender" text,
	"class_group" text NOT NULL,
	"circle_code" text NOT NULL,
	"teacher_name" text NOT NULL,
	"enrollment_date" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"current_juz" integer DEFAULT 1 NOT NULL,
	"current_surah" text DEFAULT 'Al-Fatihah' NOT NULL,
	"current_ayah" integer DEFAULT 1 NOT NULL,
	"parent_name" text NOT NULL,
	"parent_email" text NOT NULL,
	"parent_phone" text NOT NULL,
	"student_email" text,
	"home_address" text,
	"notes" text,
	"enrollment_code" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "students_roll_number_unique" UNIQUE("roll_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "daily_hifz_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"date" text NOT NULL,
	"day" text NOT NULL,
	"attendance" text DEFAULT 'present' NOT NULL,
	"sabaq_amount" text DEFAULT '' NOT NULL,
	"sabaq_mistakes" integer DEFAULT 0 NOT NULL,
	"sabaq_passed" boolean,
	"sabaq_para_amount" text DEFAULT '' NOT NULL,
	"sabaq_para_mistakes" integer DEFAULT 0 NOT NULL,
	"sabaq_para_passed" boolean,
	"dawr1_amount" text DEFAULT '' NOT NULL,
	"dawr1_mistakes" integer DEFAULT 0 NOT NULL,
	"dawr1_passed" boolean,
	"dawr2_amount" text DEFAULT '' NOT NULL,
	"dawr2_mistakes" integer DEFAULT 0 NOT NULL,
	"dawr2_passed" boolean,
	"comments" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "daily_hifz_records_student_id_date_unique" UNIQUE("student_id","date")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "daily_home_learning_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"date" text NOT NULL,
	"day" text NOT NULL,
	"sabaq_mins" integer DEFAULT 0 NOT NULL,
	"sabaq_para_mins" integer DEFAULT 0 NOT NULL,
	"dawr1_mins" integer DEFAULT 0 NOT NULL,
	"dawr2_mins" integer DEFAULT 0 NOT NULL,
	"parent_signed" boolean DEFAULT false NOT NULL,
	"parent_comments" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "daily_home_learning_records_student_id_date_unique" UNIQUE("student_id","date")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "daily_tarbiyah_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"date" text NOT NULL,
	"day" text NOT NULL,
	"fajr" text DEFAULT 'none' NOT NULL,
	"dahuhr" text DEFAULT 'none',
	"dhuhr" text DEFAULT 'none' NOT NULL,
	"asr" text DEFAULT 'none' NOT NULL,
	"maghrib" text DEFAULT 'none' NOT NULL,
	"ishaa" text DEFAULT 'none' NOT NULL,
	"daily_sadaqah" boolean DEFAULT false NOT NULL,
	"eesaal_thawaab" boolean DEFAULT false NOT NULL,
	"daily_duas_dhikr" boolean DEFAULT false NOT NULL,
	"daily_quran_wird" boolean DEFAULT false NOT NULL,
	"parent_signature" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "daily_tarbiyah_records_student_id_date_unique" UNIQUE("student_id","date")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "weekly_evaluations" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"week_commencing" text NOT NULL,
	"overall_grade" text DEFAULT 'Not yet assessed' NOT NULL,
	"performance_score" integer DEFAULT 0 NOT NULL,
	"teacher_signed" boolean DEFAULT false NOT NULL,
	"parent_signed" boolean DEFAULT false NOT NULL,
	"signed_date" text,
	"hadith_id" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "weekly_evaluations_student_id_week_commencing_unique" UNIQUE("student_id","week_commencing")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "processed_operations" (
	"id" serial PRIMARY KEY NOT NULL,
	"operation_id" text NOT NULL,
	"uid" text NOT NULL,
	"endpoint" text NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"response_data" text,
	"client_timestamp" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "processed_operations_operation_id_unique" UNIQUE("operation_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_uid" text NOT NULL,
	"actor_role" text NOT NULL,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text NOT NULL,
	"student_id" text,
	"ip_address" text,
	"user_agent" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "parent_student_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_uid" text NOT NULL,
	"student_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "parent_student_links_parent_student_unique" UNIQUE("parent_uid","student_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'unassigned' NOT NULL,
	"circle_code" text,
	"display_name" text,
	"disabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "app_users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "parent_notice_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"notice_version" text NOT NULL,
	"parent_uid" text NOT NULL,
	"student_id" text NOT NULL,
	"decision" text NOT NULL,
	"accepted_at" timestamp DEFAULT now(),
	"withdrawn_at" timestamp,
	"ip_address" text,
	"user_agent" text,
	CONSTRAINT "parent_notice_parent_student_version_unique" UNIQUE("parent_uid","student_id","notice_version")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "madrasah_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "madrasah_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "daily_hifz_records" ADD CONSTRAINT "daily_hifz_records_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "daily_home_learning_records" ADD CONSTRAINT "daily_home_learning_records_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "daily_tarbiyah_records" ADD CONSTRAINT "daily_tarbiyah_records_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "parent_notice_records" ADD CONSTRAINT "parent_notice_records_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "parent_student_links" ADD CONSTRAINT "parent_student_links_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "weekly_evaluations" ADD CONSTRAINT "weekly_evaluations_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
