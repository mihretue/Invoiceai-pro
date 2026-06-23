export type InvoiceStatus = 'extracted' | 'processing' | 'failed' | 'pending';

export interface Invoice {
  id: string;
  number: string;
  vendor: string;
  color: string;
  date: string;
  amount: number | null;
  category: string;
  status: InvoiceStatus;
  description: string;
  confidence: number | null;
  isNew?: boolean;
  sourceFile?: string;
}

export const CATEGORIES: string[] = ['Software', 'Supplies', 'Meals', 'Travel', 'Equipment', 'Utilities', 'Services'];

export const VENDOR_COLORS: Record<string, string> = {
  'Amazon Business': '#FF9900', 'Microsoft': '#0078D4', 'Slack': '#611f69',
  'UberX': '#000000', 'Dell Technologies': '#0076CE', 'Adobe': '#FF0000',
  'Google Cloud': '#4285F4', 'Notion': '#37352F', 'Figma': '#A259FF',
  'Delta Airlines': '#9E1B32', 'Marriott Hotels': '#A28B55', 'Staples': '#CC0000',
  'Verizon': '#CD040B', 'AT&T': '#00A8E0', 'WeWork': '#0E1F2E',
  'GitHub': '#24292F', 'Zoom': '#2D8CFF', 'Apple': '#555555',
  'Best Buy': '#0046BE', 'Starbucks': '#00704A', 'FedEx': '#4D148C',
  'Linear': '#5E6AD2', 'HubSpot': '#FF7A59', 'Costco': '#005DAA',
};

export const VENDOR_CAT: Record<string, string> = {
  'Amazon Business': 'Supplies', 'Microsoft': 'Software', 'Slack': 'Software',
  'UberX': 'Travel', 'Dell Technologies': 'Equipment', 'Adobe': 'Software',
  'Google Cloud': 'Software', 'Notion': 'Software', 'Figma': 'Software',
  'Delta Airlines': 'Travel', 'Marriott Hotels': 'Travel', 'Staples': 'Supplies',
  'Verizon': 'Utilities', 'AT&T': 'Utilities', 'WeWork': 'Services',
  'GitHub': 'Software', 'Zoom': 'Software', 'Apple': 'Equipment',
  'Best Buy': 'Equipment', 'Starbucks': 'Meals', 'FedEx': 'Services',
  'Linear': 'Software', 'HubSpot': 'Software', 'Costco': 'Supplies',
};

export const DESCS: Record<string, string[]> = {
  Software: ['Annual subscription renewal', 'Monthly team plan', 'Pro license – 12 seats', 'Cloud compute usage', 'API usage overage'],
  Supplies: ['Office supplies bulk order', 'Printer paper & toner', 'Kitchen restock', 'Stationery & desk gear'],
  Meals: ['Team lunch', 'Client dinner', 'Coffee & catering', 'Offsite catering'],
  Travel: ['Round-trip airfare', 'Rideshare to airport', 'Hotel – 3 nights', 'Conference travel'],
  Equipment: ['MacBook Pro 16"', 'Dual 4K monitors', 'Standing desk', 'iPhone – company device'],
  Utilities: ['Monthly mobile plan', 'Internet & data', 'Phone lines – 5 users'],
  Services: ['Co-working membership', 'Shipping & logistics', 'Consulting retainer'],
};

const RANGES: Record<string, [number, number]> = {
  Software: [29, 899], Supplies: [40, 480], Meals: [22, 340],
  Travel: [60, 1450], Equipment: [220, 2600], Utilities: [45, 320], Services: [150, 1200],
};

function pick<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }
function money(min: number, max: number): number { return Math.round((min + Math.random() * (max - min)) * 100) / 100; }

let _n = 1042;

export function generateSeed(): Invoice[] {
  const names = Object.keys(VENDOR_COLORS);
  const inv: Invoice[] = [];
  const today = new Date('2026-06-21');
  for (let i = 0; i < 24; i++) {
    const vendor = names[i % names.length];
    const cat = VENDOR_CAT[vendor];
    const d = new Date(today);
    d.setDate(d.getDate() - Math.floor(Math.random() * 74));
    const r: [number, number] = RANGES[cat] || [40, 600];
    const roll = Math.random();
    const status: InvoiceStatus = roll > 0.92 ? 'failed' : roll > 0.82 ? 'processing' : 'extracted';
    inv.push({
      id: 'inv_' + (_n + i),
      number: 'INV-' + (_n + i),
      vendor,
      color: VENDOR_COLORS[vendor],
      date: d.toISOString().slice(0, 10),
      amount: status === 'failed' ? null : money(r[0], r[1]),
      category: cat,
      status,
      description: pick(DESCS[cat] || ['Business expense']),
      confidence: status === 'extracted' ? Math.round((88 + Math.random() * 11) * 10) / 10 : null,
    });
  }
  inv.sort((a, b) => b.date.localeCompare(a.date));
  return inv;
}

export function fabricateInvoice(fileName: string): Invoice {
  const vendors = Object.keys(VENDOR_COLORS);
  const vendor = vendors[Math.floor(Math.random() * vendors.length)];
  const cat = VENDOR_CAT[vendor];
  const r: [number, number] = RANGES[cat] || [40, 600];
  const descs = DESCS[cat] || ['Business expense'];
  return {
    id: 'inv_' + Date.now(),
    number: 'INV-' + (_n + 24 + Math.floor(Math.random() * 900)),
    vendor,
    color: VENDOR_COLORS[vendor],
    date: new Date('2026-06-21').toISOString().slice(0, 10),
    amount: Math.round((r[0] + Math.random() * (r[1] - r[0])) * 100) / 100,
    category: cat,
    status: 'extracted',
    description: descs[Math.floor(Math.random() * descs.length)],
    confidence: Math.round((90 + Math.random() * 9) * 10) / 10,
    isNew: true,
    sourceFile: fileName,
  };
}
