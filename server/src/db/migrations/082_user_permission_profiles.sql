-- TASK005 C1. Additive only; no users, roles, passwords or business data backfill.
-- Verified base 4c86c03 includes 078/079. 080/081 are absent; 082 is the reviewed C1 identifier.
-- Recheck upstream numbering before merge. This file is for a fresh C1 schema, not an upgrade of an already-applied 082.
-- users.id is already a PK: adding this candidate key cannot merge/change accounts.
ALTER TABLE users ADD CONSTRAINT users_company_id_id_unique UNIQUE(company_id,id);
CREATE TABLE permission_templates (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES companies(id),
 name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 120),
 draft_codes text[] NOT NULL DEFAULT '{}',
 draft_revision integer NOT NULL DEFAULT 1 CHECK (draft_revision > 0),
 published_version integer NOT NULL DEFAULT 0 CHECK (published_version >= 0),
 archived boolean NOT NULL DEFAULT false,
 created_by uuid NOT NULL REFERENCES users(id),
 updated_by uuid NOT NULL REFERENCES users(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(company_id,id)
);
CREATE TABLE permission_template_versions (
 company_id uuid NOT NULL,
 template_id uuid NOT NULL,
 version integer NOT NULL CHECK (version > 0),
 codes text[] NOT NULL,
 published_by uuid NOT NULL REFERENCES users(id),
 published_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(company_id,template_id,version),
 FOREIGN KEY(company_id,template_id) REFERENCES permission_templates(company_id,id)
);
CREATE TABLE user_permission_profiles (
 user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 company_id uuid NOT NULL REFERENCES companies(id),
 template_id uuid,
 overrides jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(overrides)='object'),
 warehouse_mode text NOT NULL DEFAULT 'LIST' CHECK (warehouse_mode IN ('ALL','LIST')),
 warehouse_ids uuid[] NOT NULL DEFAULT '{}',
 -- Independent delegation, NOT inferred from role, template name or users.manage.
 permission_admin boolean NOT NULL DEFAULT false,
 grantable_codes text[] NOT NULL DEFAULT '{}',
 CHECK (NOT permission_admin OR cardinality(grantable_codes)>0),
 revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
 updated_by uuid NOT NULL REFERENCES users(id),
 updated_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(company_id,user_id) REFERENCES users(company_id,id) ON DELETE CASCADE,
 FOREIGN KEY(company_id,template_id) REFERENCES permission_templates(company_id,id)
);
CREATE INDEX idx_permission_profiles_template ON user_permission_profiles(company_id,template_id);
CREATE TABLE company_permission_defaults (
 company_id uuid PRIMARY KEY REFERENCES companies(id),
 template_id uuid NOT NULL,
 updated_by uuid NOT NULL REFERENCES users(id),
 updated_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(company_id,template_id) REFERENCES permission_templates(company_id,id)
);
-- Existing audit_logs receives all C1 mutations in the SAME transaction.
-- No automatic grant, default, profile creation or role replacement for existing users.
