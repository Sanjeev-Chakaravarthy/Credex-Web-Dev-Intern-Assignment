import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Client for browser usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server client for API routes (with service role key for full access)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================
// Database Operations
// ============================================================

export async function saveAudit(data: {
  stack: unknown;
  results: unknown;
  summary?: string;
  shareId?: string;
}) {
  const { data: audit, error } = await supabaseAdmin
    .from("audits")
    .insert({
      stack: data.stack,
      results: data.results,
      summary: data.summary || null,
      share_id: data.shareId || null,
    })
    .select()
    .single();

  if (error) throw error;
  return audit;
}

export async function getAuditByShareId(shareId: string) {
  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .eq("share_id", shareId)
    .single();

  if (error) return null;
  return data;
}

export async function updateAuditShareId(auditId: string, shareId: string) {
  const { error } = await supabaseAdmin
    .from("audits")
    .update({ share_id: shareId })
    .eq("id", auditId);

  if (error) throw error;
}

export async function saveLeadCapture(data: {
  email: string;
  company?: string;
  role?: string;
  teamSize?: number;
  auditId: string;
}) {
  const { data: lead, error } = await supabaseAdmin
    .from("lead_captures")
    .insert({
      email: data.email,
      company: data.company || null,
      role: data.role || null,
      team_size: data.teamSize || null,
      audit_id: data.auditId,
    })
    .select()
    .single();

  if (error) throw error;
  return lead;
}
