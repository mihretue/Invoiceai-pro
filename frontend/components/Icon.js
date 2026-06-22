'use client';

const PATHS = {
  upload:      'M12 16V4m0 0L8 8m4-4l4 4M4 17v1a3 3 0 003 3h10a3 3 0 003-3v-1',
  doc:         'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z',
  dollar:      'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  trendUp:     'M3 17l6-6 4 4 8-8m0 0h-6m6 0v6',
  trendDown:   'M3 7l6 6 4-4 8 8m0 0h-6m6 0v-6',
  chart:       'M3 3v18h18M8 17V9m5 8V5m5 12v-6',
  search:      'M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z',
  filter:      'M3 5h18M6 12h12M10 19h4',
  sort:        'M7 4v16m0 0l-3-3m3 3l3-3M17 20V4m0 0l3 3m-3-3l-3 3',
  arrowUp:     'M12 19V5m0 0l-6 6m6-6l6 6',
  arrowDown:   'M12 5v14m0 0l6-6m-6 6l-6-6',
  chevL:       'M15 18l-6-6 6-6',
  chevR:       'M9 18l6-6-6-6',
  chevD:       'M6 9l6 6 6-6',
  close:       'M6 6l12 12M18 6L6 18',
  edit:        'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  trash:       'M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z',
  download:    'M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2',
  eye:         'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z M12 15a3 3 0 100-6 3 3 0 000 6z',
  check:       'M20 6L9 17l-5-5',
  checkCircle: 'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3',
  clock:       'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
  alert:       'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  xCircle:     'M12 22a10 10 0 100-20 10 10 0 000 20zM15 9l-6 6m0-6l6 6',
  info:        'M12 22a10 10 0 100-20 10 10 0 000 20zM12 16v-4m0-4h.01',
  moon:        'M21 12.79A9 9 0 1111.21 3 7 9 0 0021 12.79z',
  sun:         'M12 17a5 5 0 100-10 5 5 0 000 10zM12 1v2m0 18v2M4.2 4.2l1.4 1.4m12.8 12.8l1.4 1.4M1 12h2m18 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  menu:        'M3 6h18M3 12h18M3 18h18',
  plus:        'M12 5v14m-7-7h14',
  sliders:     'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  bell:        'M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
  calendar:    'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  tag:         'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01',
  sparkle:     'M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z',
  wallet:      'M21 12V7H5a2 2 0 010-4h14v4M3 5v14a2 2 0 002 2h16v-5M18 12a2 2 0 000 4h4v-4h-4z',
  grid:        'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
};

export default function Icon({ name, size = 20, style, strokeWidth = 2 }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {d.split(' M').map((seg, i) => (
        <path key={i} d={i === 0 ? seg : 'M' + seg} />
      ))}
    </svg>
  );
}
