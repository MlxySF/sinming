import { useEffect, useMemo } from 'react';
import { ACADEMY, formatMoney } from '../config';
import { ArrowRight, Download, Info } from './Icons';

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
      {pieces.map((p) => (
        <i
          key={p.id}
          style={{
            left: `${p.left}%`,
            width: p.width,
            height: p.height,
            borderRadius: p.radius,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Success({ result, onHome, onRegisterAnother }) {
  useEffect(() => {
    document.title = `${ACADEMY.name} — Registration complete`;
  }, []);

  if (!result) return null;

  return (
    <div className="success">
      <div className="success__watermark" aria-hidden="true">
        功
      </div>
      <Confetti />

      <div className="success__card">
        <div className="success__check">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
          </svg>
        </div>

        <h1>
          Registration received
          <em>Welcome to the academy</em>
        </h1>

        <p className="success__lead">
          {result.athlete?.name?.split(' ')[0]}’s place is reserved. A confirmation email with the
          signed agreement attached is on its way to{' '}
          <strong style={{ color: '#fff', fontWeight: 600 }}>{result.parent?.email}</strong>.
        </p>

        <div className="success__ref">
          Reference <b>{result.ref}</b>
        </div>

        <div className="success__summary">
          <div className="success__summary-row">
            <span>Athlete</span>
            <b>{result.athlete?.name}</b>
          </div>
          <div className="success__summary-row">
            <span>Parent</span>
            <b>
              {result.parent?.name} · {result.parent?.relationship}
            </b>
          </div>
          <div className="success__summary-row">
            <span>Term(s)</span>
            <b>{result.terms?.map((t) => t.label).join(', ')}</b>
          </div>
          <div className="success__summary-row">
            <span>Total paid</span>
            <b style={{ color: '#f3d79a', fontFamily: 'var(--font-display)', fontSize: 17, letterSpacing: '0.02em' }}>
              {formatMoney(result.total)}
            </b>
          </div>
          <div className="success__summary-row">
            <span>Receipt</span>
            <b>{result.receiptFileName || 'Uploaded'}</b>
          </div>
        </div>

        <div className="success__actions">
          <button
            type="button"
            className="btn btn--gold"
            onClick={() => {
              const a = document.createElement('a');
              a.href = result.pdfUrl;
              a.download = result.pdfFileName;
              document.body.appendChild(a);
              a.click();
              a.remove();
            }}
          >
            <Download size={16} /> Download agreement
          </button>
          <button type="button" className="btn btn--ghost-light" onClick={onHome}>
            Back to home <span className="btn__arrow"><ArrowRight size={16} /></span>
          </button>
        </div>

        <div className="success__next">
          <b>What happens next</b>
          <ol>
            <li>Our admin verifies your payment receipt — usually within one working day.</li>
            <li>
              You will receive a WhatsApp message with the class venue, timing and first-lesson
              details.
            </li>
            <li>Keep the agreement PDF safe — it is your signed copy of the terms.</li>
          </ol>
        </div>

        {result.demo && (
          <div
            className="alert alert--info"
            style={{ marginTop: 22, textAlign: 'left', background: 'rgba(224,180,92,0.08)', borderColor: 'rgba(224,180,92,0.28)', color: 'rgba(244,239,230,0.72)' }}
          >
            <Info size={15} />
            <span>
              <b>Preview mode:</b> no data was stored and no email was sent. Add your Google Apps
              Script URL to <code>.env</code> to switch the live connection on.
            </span>
          </div>
        )}

        <p style={{ marginTop: 22, fontSize: 11.5, color: 'rgba(244,239,230,0.4)', lineHeight: 1.6 }}>
          Didn’t get the email within 10 minutes? Check spam, or write to{' '}
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
          Register another athlete
        </button>
      </div>
    </div>
  );
}
