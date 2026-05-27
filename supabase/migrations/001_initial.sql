-- ============================================================
-- AISpendLens Database Schema
-- Supabase (PostgreSQL)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Audits table
-- ============================================================
CREATE TABLE audits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stack JSONB NOT NULL,
  results JSONB NOT NULL,
  summary TEXT,
  share_id VARCHAR(16) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for share_id lookups (public report pages)
CREATE INDEX idx_audits_share_id ON audits(share_id) WHERE share_id IS NOT NULL;

-- Index for created_at (analytics queries)
CREATE INDEX idx_audits_created_at ON audits(created_at);

-- ============================================================
-- Lead Captures table
-- ============================================================
CREATE TABLE lead_captures (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  role VARCHAR(255),
  team_size INTEGER,
  audit_id UUID REFERENCES audits(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for email lookups
CREATE INDEX idx_lead_captures_email ON lead_captures(email);

-- Index for audit_id foreign key
CREATE INDEX idx_lead_captures_audit_id ON lead_captures(audit_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS on both tables
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_captures ENABLE ROW LEVEL SECURITY;

-- Audits: Allow anonymous read access for shared reports only
CREATE POLICY "Allow public read of shared audits"
  ON audits FOR SELECT
  USING (share_id IS NOT NULL);

-- Audits: Allow insert from service role (API routes)
CREATE POLICY "Allow service role insert audits"
  ON audits FOR INSERT
  WITH CHECK (true);

-- Audits: Allow update from service role (adding share_id)
CREATE POLICY "Allow service role update audits"
  ON audits FOR UPDATE
  USING (true);

-- Lead captures: No public read access
CREATE POLICY "Allow service role insert leads"
  ON lead_captures FOR INSERT
  WITH CHECK (true);

-- Lead captures: No public select
CREATE POLICY "Deny public read of leads"
  ON lead_captures FOR SELECT
  USING (false);
