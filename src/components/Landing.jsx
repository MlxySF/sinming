import { useEffect, useState } from 'react';
import {
  ACADEMY,
  LANDING,
  PAYMENT_TERMS,
  formatMoney,
  AGREEMENT_TERMS,
} from '../config';
import { ArrowRight, Check, Lock } from './Icons';
import heroImage from '../assets/hero-wushu.jpg';

function FeeDialog({ open, onClose, onRegister }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="2027 term fees"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        display: 'grid',
        placeItems: 'center',
        padding: 20,
        background: 'rgba(4,5,7,0.78)',
        backdropFilter: 'blur(8px)',
        animation: 'cardIn .25s ease both',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(560px, 100%)',
          maxHeight: '86vh',
          overflowY: 'auto',
          padding: '32px 30px 28px',
          borderRadius: 26,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'linear-gradient(165deg, #14181f, #0a0c10)',
          boxShadow: '0 40px 90px -40px #000',
          color: 'var(--text-on-dark)',
        }}
      >
        <span className="eyebrow">2027 Season</span>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: 30,
            textTransform: 'uppercase',
            margin: '12px 0 6px',
            letterSpacing: '-0.01em',
          }}
        >
          Term fees
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-on-dark-soft)', lineHeight: 1.6 }}>
          Fees are billed per month and payable at the start of each month. Tick one or more terms
          during registration — the total is calculated for you.
        </p>

        <div style={{ display: 'grid', gap: 10 }}>
          {PAYMENT_TERMS.map((term) => (
            <div
              key={term.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
                padding: '13px 16px',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.035)',
              }}
            >
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{term.label}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-on-dark-soft)', marginTop: 2 }}>
                  {term.period} · {term.sessions} classes
                </div>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 20,
                  color: 'var(--gold-soft)',
                }}
              >
                {formatMoney(term.price)}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 20,
            padding: '14px 16px',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)',
            fontSize: 12,
            lineHeight: 1.65,
            color: 'var(--text-on-dark-soft)',
          }}
        >
          <b style={{ color: 'var(--gold-soft)', fontWeight: 600 }}>Good to know:</b>{' '}
          {AGREEMENT_TERMS[2].body}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button type="button" className="btn btn--gold" onClick={onRegister} style={{ flex: 1 }}>
            Register now <span className="btn__arrow"><ArrowRight size={16} /></span>
          </button>
          <button type="button" className="btn btn--ghost-light" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Landing({ onStart }) {
  const [feeOpen, setFeeOpen] = useState(false);
  const featured = PAYMENT_TERMS[0];

  return (
    <div className="landing dark-ui">
      <div
        className="landing__bg"
        aria-hidden="true"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="landing__scrim" aria-hidden="true" />
      <div className="landing__grain" aria-hidden="true" />
      <div className="landing__watermark" aria-hidden="true">
        武
      </div>

      <header className="nav">
        <div className="brand">
          <span className="brand__seal" aria-hidden="true">
            武
          </span>
          <span className="brand__text">
            <span className="brand__name">{ACADEMY.name}</span>
            <span className="brand__sub">Martial Arts · Singapore</span>
          </span>
        </div>

        <nav className="nav__links" aria-label="Main">
          <button type="button" className="nav__link" onClick={() => setFeeOpen(true)}>
            Fees
          </button>
          <a className="nav__link" href={`mailto:${ACADEMY.email}`}>
            Contact
          </a>
          <a className="nav__link" href={`tel:${ACADEMY.phone.replace(/\s/g, '')}`}>
            {ACADEMY.phone}
          </a>
          <button type="button" className="btn nav__cta" onClick={onStart}>
            Register
          </button>
        </nav>
      </header>

      <main className="hero">
        <div className="hero__inner">
          <div className="hero__badge reveal">
            <span className="hero__dot" />
            {LANDING.intake}
          </div>

          <h1 className="hero__title reveal reveal-2">
            <span>{LANDING.headlineTop}</span>
            <em>{LANDING.headlineAccent}</em>
          </h1>

          <span className="hero__rule reveal reveal-3" aria-hidden="true" />

          <p className="hero__sub reveal reveal-3">{LANDING.subhead}</p>

          <div className="hero__actions reveal reveal-4">
            <button type="button" className="btn btn--lg" onClick={onStart}>
              Start registration
              <span className="btn__arrow">
                <ArrowRight size={18} />
              </span>
            </button>
            <button
              type="button"
              className="btn btn--ghost-light btn--lg"
              onClick={() => setFeeOpen(true)}
            >
              View 2027 fees
            </button>
          </div>

          <ul className="hero__highlights reveal reveal-5">
            {LANDING.highlights.map((item) => (
              <li key={item}>
                <Check size={13} /> {item}
              </li>
            ))}
          </ul>
        </div>

        <aside className="hero__card reveal reveal-6" aria-label="Fee summary">
          <div className="hero__card-label">Term fees from</div>
          <div className="hero__card-price">
            {formatMoney(featured.price)} <small>/ term</small>
          </div>
          <div className="hero__card-divider" />
          <div className="hero__card-row">
            <span>{featured.label}</span>
            <b>{featured.sessions} classes</b>
          </div>
          <div className="hero__card-row">
            <span>Sign-up time</span>
            <b>~4 minutes</b>
          </div>
          <div className="hero__card-row">
            <span>Contract</span>
            <b>Signed online</b>
          </div>
          <div className="hero__card-divider" />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 10.5,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(244,239,230,0.55)',
            }}
          >
            <Lock size={12} /> Secure registration
          </div>
        </aside>
      </main>

      <footer className="hero__stats">
        <div className="hero__stats-inner">
          {LANDING.stats.map((stat) => (
            <div className="stat" key={stat.label}>
              <span className="stat__value">{stat.value}</span>
              <span className="stat__label">{stat.label}</span>
            </div>
          ))}
        </div>
      </footer>

      <FeeDialog
        open={feeOpen}
        onClose={() => setFeeOpen(false)}
        onRegister={() => {
          setFeeOpen(false);
          onStart();
        }}
      />
    </div>
  );
}
