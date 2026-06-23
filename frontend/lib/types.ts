// ── Auth ──────────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: number;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface SignupResponse extends AuthResponse {
  id: number;
  email: string;
}

// ── Documents / Extractions ───────────────────────────────────────────────────

export interface ApiDocument {
  id: number;
  user_id: number;
  filename: string;
  s3_key: string;
  upload_date: string;
  status: 'processing' | 'completed' | 'failed';
}

export interface ApiExtraction {
  id: number;
  document_id: number;
  vendor_name: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  amount: number | null;
  currency: string;
  category: string | null;
  description: string | null;
  extracted_at: string;
}

export interface ExtractionUpdatePayload {
  vendor_name?: string;
  invoice_number?: string;
  invoice_date?: string;
  amount?: number | null;
  currency?: string;
  category?: string;
  description?: string;
}

export interface UploadResponse {
  document_id: number;
  filename: string;
  status: string;
  message: string;
  task_id: string;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  total_documents: number;
  total_amount: number;
  by_category: Record<string, number>;
  recent_extractions: Array<{
    id: number;
    vendor_name: string | null;
    amount: number | null;
    category: string | null;
    extracted_at: string;
  }>;
}

export interface CategoryBreakdown {
  data: Array<{ category: string; amount: number; count: number }>;
  total: number;
}

export interface MonthlyTrend {
  data: Array<{ month: string; amount: number; count: number }>;
  total: number;
}

export interface TopVendorsResponse {
  data: Array<{ vendor_name: string; total_amount: number; count: number }>;
}
