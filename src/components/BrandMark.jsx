import { ACADEMY } from '../config';

/**
 * Academy logo.
 * Uses ACADEMY.logoUrl when set (remote link or imported file); otherwise it
 * falls back to the built-in gold "武" seal.
 */
export default function BrandMark({ size = 46, className = '' }) {
  if (ACADEMY.logoUrl) {
    return (
      <img
        src={ACADEMY.logoUrl}
        alt={ACADEMY.name}
        className={`brand__logo ${className}`.trim()}
        style={{ width: size, height: size }}
        loading="eager"
        decoding="async"
      />
    );
  }

  return (
    <span
      className={`brand__seal ${className}`.trim()}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.52) }}
      aria-hidden="true"
    >
      武
    </span>
  );
}
