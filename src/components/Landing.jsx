import { useEffect, useState } from 'react';
import { ACADEMY, formatMoney, telHref } from '../config';
import { useI18n } from '../i18n';
import { allTermOptions } from '../lib/terms';
import { ArrowRight, Check } from './Icons';
import LanguageToggle from './LanguageToggle';
import BrandMark from './BrandMark';
import heroImage from '../assets/hero-wushu.jpg';

function FeeDialog({ open, onClose, onStart }) {
  const { m, lang } = useI18n();
  const terms = allTermOptions(m, lang);
  const { fees } = m;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && onClose();
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
    <div className="dialog" role="dialog" aria-modal="true" aria-label={fees.title} onClick={onClose}>
      <div className="dialog__panel" onClick={(event) => event.stopPropagation()}>
        <span className="eyebrow">{fees.eyebrow}</span>
        <h2 className="dialog__title">{fees.title}</h2>
        <p className="dialog__intro">{fees.intro}</p>

        <div className="dialog__terms">
          {terms.map((term) => (
            <div className="dialog__term" key={term.id}>
              <div>
                <div className="dialog__term-name">{term.label}</div>
                <div className="dialog__term-meta">
                  {term.period} · {fees.classesCount(term.sessions)}
                </div>
              </div>
              <div className="dialog__term-price">{formatMoney(term.price)}</div>
            </div>
          ))}
        </div>

        <div className="dialog__note">
          <b>{fees.goodToKnow}</b> {fees.note}
        </div>

        <div className="dialog__actions">
          <button type="button" className="btn btn--gold" onClick={onStart}>
            {fees.cta}
            <span className="btn__arrow">
              <ArrowRight size={16} />
            </span>
          </button>
          <button type="button" className="btn btn--ghost-light" onClick={onClose}>
            {fees.close}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Landing({ onStart }) {
  const { m, lang } = useI18n();
  const [feeOpen, setFeeOpen] = useState(false);

  useEffect(() => {
    document.title = m.meta.title;
  }, [m]);

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
        {m.hero.watermark}
      </div>

      <header className="nav">
        <div className="brand">
          <BrandMark size={46} />
          <span className="brand__text">
            <span className="brand__name">{ACADEMY.name}</span>
            <span className="brand__sub">{m.brand.sub}</span>
          </span>
          {ACADEMY.logoRightUrl ? (
            <img
              className="brand__logo brand__logo--right"
              src={ACADEMY.logoRightUrl}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
            />
          ) : null}
        </div>

        <LanguageToggle />
      </header>

      <main className="hero">
        <div className="hero__inner" key={lang}>
          <div className="hero__badge reveal">
            <span className="hero__dot" />
            {m.hero.intake}
          </div>

          <h1 className="hero__title reveal reveal-2">
            <span>{m.hero.headlineTop}</span>
            <em>{m.hero.headlineAccent}</em>
          </h1>

          <span className="hero__rule reveal reveal-3" aria-hidden="true" />

          <p className="hero__sub reveal reveal-3">{m.hero.subhead}</p>

          <div className="hero__actions reveal reveal-4">
            <button type="button" className="btn btn--lg" onClick={onStart}>
              {m.hero.start}
              <span className="btn__arrow">
                <ArrowRight size={18} />
              </span>
            </button>
            <button
              type="button"
              className="btn btn--ghost-light btn--lg"
              onClick={() => setFeeOpen(true)}
            >
              {m.hero.viewFees}
            </button>
          </div>

          <ul className="hero__highlights reveal reveal-5">
            {m.hero.highlights.map((item) => (
              <li key={item}>
                <Check size={13} /> {item}
              </li>
            ))}
          </ul>
        </div>
      </main>

      <a className="hero__contact" href={`tel:${telHref(ACADEMY.phone)}`}>
        {ACADEMY.phone}
      </a>

      <FeeDialog
        open={feeOpen}
        onClose={() => setFeeOpen(false)}
        onStart={() => {
          setFeeOpen(false);
          onStart();
        }}
      />
    </div>
  );
}
