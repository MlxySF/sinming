import { ArrowLeft, ArrowRight, Lock } from './Icons';
import { useI18n } from '../i18n';

export default function StepShell({
  index,
  title,
  description,
  children,
  onBack,
  onNext,
  nextLabel,
  backLabel,
  nextDisabled = false,
  nextLoading = false,
  footerHint,
  showBack = true,
  isSubmit = false,
}) {
  const { m } = useI18n();

  return (
    <section className="card">
      <header className="card__head">
        <span className="card__index">{String(index).padStart(2, '0')}</span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </header>

      {children}

      <footer className="card__foot">
        {footerHint ? <span className="card__foot-hint">{footerHint}</span> : <span />}
        <div className="card__foot-actions">
          {showBack && (
            <button
              type="button"
              className="btn btn--outline"
              onClick={onBack}
              disabled={nextLoading}
            >
              <ArrowLeft size={16} /> {backLabel || m.form.back}
            </button>
          )}
          <button
            type="button"
            className="btn"
            onClick={onNext}
            disabled={nextDisabled || nextLoading}
          >
            {nextLoading ? (
              <>
                <span className="spinner" /> {m.form.submitting}
              </>
            ) : (
              <>
                {nextLabel || m.form.continue}
                {isSubmit ? (
                  <Lock size={15} />
                ) : (
                  <span className="btn__arrow">
                    <ArrowRight size={17} />
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </footer>
    </section>
  );
}
