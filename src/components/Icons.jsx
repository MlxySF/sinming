/* Lightweight inline icon set — no icon library needed. */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const Check = ({ size = 14, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 12.5 9.5 18 20 6.5" />
  </svg>
);

export const ArrowRight = ({ size = 18, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const ArrowLeft = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <path d="M20 12H5" />
    <path d="m11 6-6 6 6 6" />
  </svg>
);

export const Shield = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 3 5 6v6c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const Lock = ({ size = 14, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </svg>
);

export const User = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="8.5" r="3.6" />
    <path d="M4.8 20c.9-3.6 3.7-5.6 7.2-5.6s6.3 2 7.2 5.6" />
  </svg>
);

export const IdCard = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <circle cx="8.8" cy="11" r="2.1" />
    <path d="M5.8 15.8c.5-1.6 1.6-2.4 3-2.4s2.5.8 3 2.4M14.5 10.5h4M14.5 14h2.6" />
  </svg>
);

export const Phone = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <path d="M7.2 3.6h2.3l1.4 3.6-1.9 1.4a11 11 0 0 0 5.4 5.4l1.4-1.9 3.6 1.4v2.3c0 1.6-1.3 2.9-2.9 2.9A14.6 14.6 0 0 1 4.3 6.5c0-1.6 1.3-2.9 2.9-2.9Z" />
  </svg>
);

export const Mail = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="m4 7.5 8 5.5 8-5.5" />
  </svg>
);

export const School = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 3.5 2.8 8 12 12.5 21.2 8 12 3.5Z" />
    <path d="M6.5 10.5v5c0 1.6 2.5 3 5.5 3s5.5-1.4 5.5-3v-5" />
  </svg>
);

export const Upload = ({ size = 18, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 16V4" />
    <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
    <path d="M4.5 15v3.5A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5V15" />
  </svg>
);

export const Download = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 4v12" />
    <path d="m7.5 11.5 4.5 4.5 4.5-4.5" />
    <path d="M4.5 19.5h15" />
  </svg>
);

export const Close = ({ size = 14, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const Copy = ({ size = 13, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2.2" />
    <path d="M15 5.5H6.2A1.7 1.7 0 0 0 4.5 7.2V16" />
  </svg>
);

export const SignatureIcon = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <path d="M3.5 17.5c3.5 0 4.8-11 7.5-11 2 0 1.6 5 .2 8.2-1 2.4.2 3.3 2.3 1.6 1.6-1.3 2.6-2.6 3.2-1 .5 1.3 1.3 2.2 3.8 2.2" />
    <path d="M3.5 20.5h17" />
  </svg>
);

export const Pen = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <path d="M16.2 3.8 20.2 7.8 8.6 19.4l-4.4.8.8-4.4L16.2 3.8Z" />
    <path d="m14.2 5.8 4 4" />
  </svg>
);

export const Info = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M12 11v5.2M12 7.9v.2" />
  </svg>
);

export const Alert = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 4.2 21 19.5H3L12 4.2Z" />
    <path d="M12 9.6v4.6M12 17v.2" />
  </svg>
);

export const Bank = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <path d="M3.5 9.5 12 4l8.5 5.5" />
    <path d="M5.5 10v8M10 10v8M14 10v8M18.5 10v8M3.5 20.5h17" />
  </svg>
);

export const WhatsApp = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.94.55 3.75 1.5 5.29L2 22l4.98-1.65a9.8 9.8 0 0 0 5.06 1.4h.01c5.43 0 9.84-4.4 9.84-9.84C21.89 6.4 17.48 2 12.04 2Zm5.76 14.06c-.24.68-1.4 1.3-1.93 1.35-.5.05-.97.24-3.28-.69-2.77-1.1-4.52-3.94-4.66-4.13-.14-.19-1.1-1.47-1.1-2.8 0-1.33.7-1.98.94-2.25.25-.27.54-.34.72-.34l.53.01c.17 0 .4-.06.62.48.24.57.8 1.96.87 2.1.07.14.12.31.02.5-.1.19-.16.3-.31.47-.15.17-.32.38-.46.51-.15.15-.3.31-.13.6.17.29.75 1.23 1.6 2 1.1.98 1.86 1.28 2.15 1.42.29.14.46.12.63-.07.17-.19.75-.87.95-1.17.19-.29.39-.24.65-.14.27.1 1.7.8 1.99.95.29.14.48.22.55.34.07.12.07.7-.17 1.38Z" />
  </svg>
);

export const Calendar = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <rect x="3.6" y="5.2" width="16.8" height="15" rx="2.4" />
    <path d="M3.6 10h16.8M8.4 3.5v3.4M15.6 3.5v3.4" />
  </svg>
);

export const Sparkle = ({ size = 14, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 2.5l1.6 5.2 5.4 1.6-5.4 1.6L12 16.1l-1.6-5.2L5 9.3l5.4-1.6L12 2.5Z" />
    <path d="M18.6 15.4l.8 2.4 2.4.8-2.4.8-.8 2.4-.8-2.4-2.4-.8 2.4-.8.8-2.4Z" />
  </svg>
);
