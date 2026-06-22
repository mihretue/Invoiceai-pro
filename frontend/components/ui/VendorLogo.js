import { initials } from '@/lib/formatters';

export default function VendorLogo({ vendor, color, size = 34 }) {
  return (
    <div
      className="vendor-logo"
      style={{ background: color, width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(vendor)}
    </div>
  );
}
