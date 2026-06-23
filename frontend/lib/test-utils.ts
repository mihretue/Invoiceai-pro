import type { ApiExtraction, DashboardSummary, CategoryBreakdown, MonthlyTrend, TopVendorsResponse } from './types';

// ── Mock data generators ──────────────────────────────────────────────────────

const CATEGORIES  = ['Software', 'Supplies', 'Meals', 'Travel', 'Equipment', 'Utilities', 'Services'];
const VENDORS     = ['Amazon Business', 'Microsoft', 'Adobe', 'Google Cloud', 'Slack', 'Zoom', 'GitHub'];
let   _nextId     = 1000;

function rand(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function isoDate(daysAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export function generateMockExtraction(overrides: Partial<ApiExtraction> = {}): ApiExtraction {
  const id     = ++_nextId;
  const vendor = pick(VENDORS);
  return {
    id,
    document_id:    id,
    vendor_name:    vendor,
    invoice_number: 'INV-' + id,
    invoice_date:   isoDate(Math.floor(Math.random() * 60)),
    amount:         rand(25, 4000),
    currency:       'USD',
    category:       pick(CATEGORIES),
    description:    'Test extraction',
    extracted_at:   new Date().toISOString(),
    ...overrides,
  };
}

export function generateMockExtractions(count = 10): ApiExtraction[] {
  return Array.from({ length: count }, () => generateMockExtraction());
}

export function generateMockUser(overrides = {}) {
  return {
    id:         1,
    email:      'demo@invoiceai.pro',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

export function generateMockDashboardSummary(): DashboardSummary {
  return {
    total_documents: 24,
    total_amount:    15_234.56,
    by_category: {
      Software:   3_000,
      Travel:     5_000,
      Meals:      2_000,
      Utilities:  4_000,
      Equipment:  1_234.56,
    },
    recent_extractions: Array.from({ length: 5 }, (_, i) => ({
      id:           i + 1,
      vendor_name:  pick(VENDORS),
      amount:       rand(50, 1500),
      category:     pick(CATEGORIES),
      extracted_at: isoDate(i),
    })),
  };
}

export function generateMockCategoryBreakdown(): CategoryBreakdown {
  return {
    data: CATEGORIES.map(category => ({
      category,
      amount: rand(500, 6000),
      count:  Math.floor(rand(1, 10)),
    })),
    total: 15_234.56,
  };
}

export function generateMockMonthlyTrend(): MonthlyTrend {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return {
    data: months.map(month => ({
      month,
      amount: rand(1000, 5000),
      count:  Math.floor(rand(2, 12)),
    })),
    total: 18_000,
  };
}

export function generateMockTopVendors(): TopVendorsResponse {
  return {
    data: VENDORS.slice(0, 5).map(vendor_name => ({
      vendor_name,
      total_amount: rand(500, 4000),
      count:        Math.floor(rand(1, 8)),
    })).sort((a, b) => b.total_amount - a.total_amount),
  };
}
