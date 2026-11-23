import { useEffect, useMemo } from 'react';
import { ACADEMY, formatMoney } from '../config';
import { ArrowRight, Download, Info } from './Icons';
import { useI18n } from '../i18n';

const CONFETTI_COLORS = ['#e0b45c', '#f3d79a', '#c8102e', '#e6384c', '#f4efe6'];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2.2,
        duration: 3.4 + Math.random() * 2.6,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        width: 4 + Math.random() * 5,
        height: 8 + Math.random() * 10,
        radius: Math.random() > 0.75 ? '50%' : '2px',
      })),
    []
  );

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((piece) => (
        <i
          key={piece.id}
          style={{
            left: `${piece.left}%`,
            width: piece.width,
            height: piece.height,
            borderRadius: piece.radius,
            background: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Success({ result, onHome, onRegisterAnother }) {
  const { m } = useI18n();
  const copy = m.success;

  useEffect(() => {
    document.title = m.meta.successTitle;
  }, [m]);

  if (!result) return null;

  const firstName = (result.athlete?.name || '').split(' ')[0];

  return (
    <div className="success">
      <div className="success__watermark" aria-hidden="true">
        功
      </div>
      <Confetti />

      <div className="success__card">
        <div className="success__check">
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
          </svg>
        </div>

        <h1>
          {copy.title}
          <em>{copy.subtitle}</em>
        </h1>

        <p className="success__lead">
          {copy.leadBefore(firstName)}
          <strong style={{ color: '#fff', fontWeight: 600 }}>{result.parent?.email}</strong>
          {copy.leadAfter}
        </p>

        <div className="success__ref">
          {copy.reference} <b>{result.ref}</b>
        </div>

        <div className="success__summary">
          <div className="success__summary-row">
            <span>{copy.rows.athlete}</span>
            <b>{result.athlete?.name}</b>
          </div>
          <div className="success__summary-row">
            <span>{copy.rows.parent}</span>
            <b>
              {result.parent?.name} · {result.parent?.relationshipLabel}
            </b>
          </div>
          <div className="success__summary-row">
            <span>{copy.rows.terms}</span>
            <b>{result.terms?.map((term) => term.label).join(', ')}</b>
          </div>
          <div className="success__summary-row">
            <span>{copy.rows.total}</span>
            <b
              style={{
                color: '#f3d79a',
                fontFamily: 'var(--font-display)',
                fontSize: 17,
                letterSpacing: '0.02em',
              }}
            >
              {formatMoney(result.total)}
            </b>
          </div>
          <div className="success__summary-row">
            <span>{copy.rows.receipt}</span>
            <b>{result.receiptFileName || copy.receiptUploaded}</b>
          </div>
        </div>

        <div className="success__actions">
          <button
            type="button"
            className="btn btn--gold"
            onClick={() => {
              const link = document.createElement('a');
              link.href = result.pdfUrl;
              link.download = result.pdfFileName;
              document.body.appendChild(link);
              link.click();
              link.remove();
            }}
          >
            <Download size={16} /> {copy.download}
          </button>
          <button type="button" className="btn btn--ghost-light" onClick={onHome}>
            {copy.backHome}
            <span className="btn__arrow">
              <ArrowRight size={16} />
            </span>
          </button>
        </div>

        <div className="success__next">
          <b>{copy.nextTitle}</b>
          <ol>
            {copy.nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        {result.demo && (
          <div
            className="alert alert--info"
            style={{
              marginTop: 22,
              textAlign: 'left',
              background: 'rgba(224,180,92,0.08)',
              borderColor: 'rgba(224,180,92,0.28)',
              color: 'rgba(244,239,230,0.72)',
            }}
          >
            <Info size={15} />
            <span>
              <b>{copy.demoTitle}</b>
              {copy.demoBody}
            </span>
          </div>
        )}

        <p style={{ marginTop: 22, fontSize: 11.5, color: 'rgba(244,239,230,0.4)', lineHeight: 1.6 }}>
          {copy.noEmail}
          <a href={`mailto:${ACADEMY.email}`} style={{ color: 'rgba(243,215,154,0.9)' }}>
            {ACADEMY.email}
          </a>
          .
        </p>

        <button
          type="button"
          onClick={onRegisterAnother}
          style={{
            marginTop: 14,
            border: 0,
            background: 'none',
            color: 'rgba(244,239,230,0.45)',
            fontSize: 11.5,
            letterSpacing: '0.06em',
            textDecoration: 'underline',
            textUnderlineOffset: 4,
          }}
        >
          {copy.another}
        </button>
      </div>
    </div>
  );
}
