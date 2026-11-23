/**
 * Turns the drawn strokes into a cropped, high-resolution PNG signature.
 * Strokes are stored as normalised points (0–1) so they survive canvas resizes.
 */
export function exportSignature(strokes, { targetWidth = 1200, padding = 0.07 } = {}) {
  const points = strokes.flat();
  if (!points.length) return '';

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  points.forEach((p) => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  });

  const contentW = Math.max(maxX - minX, 0.14);
  const contentH = Math.max(maxY - minY, 0.045);
  const padX = contentW * padding + 0.015;
  const padY = contentH * padding + 0.012;

  const boxW = contentW + padX * 2;
  let boxH = contentH + padY * 2;
  // keep a sane signature-ish aspect ratio
  boxH = Math.max(boxH, boxW * 0.26);

  const width = targetWidth;
  const height = Math.round(Math.min(width * (boxH / boxW), width * 0.9));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // white background so the PDF (and email) always shows the ink clearly
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const scaleX = width / boxW;
  const scaleY = height / boxH;
  const offsetX = minX - padX;
  const offsetY = minY - padY + (boxH - (contentH + padY * 2)) / 2;

  ctx.strokeStyle = '#131a24';
  ctx.lineWidth = Math.max(3.2, height * 0.022);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  strokes.forEach((stroke) => {
    if (stroke.length === 1) {
      const p = stroke[0];
      ctx.beginPath();
      ctx.arc((p.x - offsetX) * scaleX, (p.y - offsetY) * scaleY, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#131a24';
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.moveTo((stroke[0].x - offsetX) * scaleX, (stroke[0].y - offsetY) * scaleY);
    for (let i = 1; i < stroke.length - 1; i += 1) {
      const current = stroke[i];
      const next = stroke[i + 1];
      const midX = ((current.x + next.x) / 2 - offsetX) * scaleX;
      const midY = ((current.y + next.y) / 2 - offsetY) * scaleY;
      ctx.quadraticCurveTo(
        (current.x - offsetX) * scaleX,
        (current.y - offsetY) * scaleY,
        midX,
        midY
      );
    }
    const last = stroke[stroke.length - 1];
    ctx.lineTo((last.x - offsetX) * scaleX, (last.y - offsetY) * scaleY);
    ctx.stroke();
  });

  return canvas.toDataURL('image/png');
}
