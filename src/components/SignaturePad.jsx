import { useCallback, useEffect, useRef, useState } from 'react';
import { cx } from '../lib/utils';
import { exportSignature } from '../lib/signature';
import { useI18n } from '../i18n';
import { Check, Pen } from './Icons';

/**
 * Canvas signature box.
 * onChange(dataUrl) fires every time the stroke ends, so the parent form always
 * has the latest cropped PNG of the signature.
 */
export default function SignaturePad({ onChange, error, signedName = '' }) {
  const { m } = useI18n();
  const copy = m.form.signature;
  const canvasRef = useRef(null);
  const strokesRef = useRef([]);
  const activeStroke = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dpr = canvas.width / Math.max(rect.width, 1);
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#131a24';
    ctx.lineWidth = 2.3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokesRef.current.forEach((stroke) => {
      if (stroke.length === 1) {
        const p = stroke[0];
        ctx.beginPath();
        ctx.arc(p.x * rect.width, p.y * rect.height, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = '#131a24';
        ctx.fill();
        return;
      }
      ctx.beginPath();
      ctx.moveTo(stroke[0].x * rect.width, stroke[0].y * rect.height);
      for (let i = 1; i < stroke.length - 1; i += 1) {
        const c = stroke[i];
        const n = stroke[i + 1];
        ctx.quadraticCurveTo(
          c.x * rect.width,
          c.y * rect.height,
          ((c.x + n.x) / 2) * rect.width,
          ((c.y + n.y) / 2) * rect.height
        );
      }
      const last = stroke[stroke.length - 1];
      ctx.lineTo(last.x * rect.width, last.y * rect.height);
      ctx.stroke();
    });
    ctx.restore();
    setIsEmpty(strokesRef.current.length === 0);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      paint();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [paint]);

  const toPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    canvasRef.current.setPointerCapture?.(event.pointerId);
    const stroke = [toPoint(event)];
    strokesRef.current.push(stroke);
    activeStroke.current = stroke;
    setIsDrawing(true);
    setIsEmpty(false);
    paint();
  };

  const handlePointerMove = (event) => {
    if (!activeStroke.current) return;
    event.preventDefault();
    const events =
      typeof event.nativeEvent?.getCoalescedEvents === 'function'
        ? event.nativeEvent.getCoalescedEvents()
        : [event];
    events.forEach((evt) => activeStroke.current?.push(toPoint(evt)));
    paint();
  };

  const finishStroke = () => {
    if (!activeStroke.current) return;
    activeStroke.current = null;
    setIsDrawing(false);
    const dataUrl = exportSignature(strokesRef.current);
    onChange?.(dataUrl);
  };

  const clear = () => {
    strokesRef.current = [];
    activeStroke.current = null;
    onChange?.('');
    paint();
  };

  return (
    <div className="signature">
      <div className="signature__head">
        <span className="signature__label">
          <Pen size={14} />
          {copy.label}
          {signedName ? (
            <em style={{ fontStyle: 'normal', opacity: 0.7 }}>({signedName})</em>
          ) : null}
        </span>
        <div className="signature__tools">
          <span className={cx('signature__status', !isEmpty && 'signature__status--ok')}>
            {isEmpty ? (
              copy.awaiting
            ) : (
              <>
                <Check size={12} /> {copy.signed}
              </>
            )}
          </span>
          <button type="button" className="signature__clear" onClick={clear} disabled={isEmpty}>
            {copy.clear}
          </button>
        </div>
      </div>

      <div
        className={cx(
          'signature__pad',
          isDrawing && 'signature__pad--active',
          !isEmpty && !isDrawing && 'signature__pad--signed',
          error && isEmpty && 'signature__pad--error'
        )}
      >
        <canvas
          ref={canvasRef}
          className="signature__canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishStroke}
          onPointerCancel={finishStroke}
          onPointerLeave={() => {
            if (activeStroke.current) finishStroke();
          }}
          role="img"
          aria-label={copy.placeholder}
        />
        {isEmpty && (
          <div className="signature__placeholder">
            {copy.placeholder}
            <small>{copy.placeholderHint}</small>
          </div>
        )}
        <div className="signature__baseline" aria-hidden="true" />
      </div>

      <div className="signature__meta">
        <span>{copy.note}</span>
        {error && <span className="field__error">{error}</span>}
      </div>
    </div>
  );
}
