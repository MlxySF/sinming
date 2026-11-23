import { useState } from 'react';
import { ACADEMY } from '../config';

/**
 * Second logo beside the academy name (partner / federation / school mark).
 * Renders nothing when ACADEMY.logoRightUrl is empty, or if the image fails to
 * load — a missing file should never leave a broken-image icon in the header.
 */
export default function SecondaryLogo() {
  const [failed, setFailed] = useState(false);

  if (!ACADEMY.logoRightUrl || failed) return null;

  return (
    <img
      className="brand__logo brand__logo--right"
      src={ACADEMY.logoRightUrl}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
