import { initials } from '@/lib/formatters';

interface VendorLogoProps {
  vendor: string;
  color: string;
  size?: number;
}

export default function VendorLogo({ vendor, color, size = 34 }: VendorLogoProps) {
  return (
    <div
      className="vendor-logo"
      style={{ background: color, width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(vendor)}
    </div>
  );
}
