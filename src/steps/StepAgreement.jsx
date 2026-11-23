import { ACADEMY, CLASS_DETAILS } from '../config';
import SignaturePad from '../components/SignaturePad';
import StepShell from '../components/StepShell';
import { Alert, Calendar, Check, Clock, Info, Pin, SignatureIcon } from '../components/Icons';
import { cx } from '../lib/utils';
import { useI18n } from '../i18n';

export default function StepAgreement({ data, update, errors, onNext, onBack, showBack }) {
  const { m, lang } = useI18n();
  const { agreed, signature, parent } = data;
  const copy = m.form.agreement;
  const details = [
    { key: 'day', Icon: Calendar, label: copy.classDetails.dayLabel, value: CLASS_DETAILS.day[lang] },
    { key: 'time', Icon: Clock, label: copy.classDetails.timeLabel, value: CLASS_DETAILS.time[lang] },
    { key: 'venue', Icon: Pin, label: copy.classDetails.venueLabel, value: CLASS_DETAILS.venue[lang] },
  ];

  return (
    <StepShell
      index={1}
      title={copy.title}
      description={copy.description}
      onBack={onBack}
      onNext={onNext}
      nextLabel={copy.nextLabel}
      showBack={showBack}
      footerHint={copy.footerHint}
    >
      <div className="class-details">
        <div className="class-details__head">
          <span className="class-details__title">{copy.classDetails.title}</span>
          <span className="class-details__note">{copy.classDetails.note}</span>
        </div>
        <div className="class-details__grid">
          {details.map(({ key, Icon, label, value }) => (
            <div className="class-details__item" key={key}>
              <span className="class-details__icon" aria-hidden="true">
                <Icon size={15} />
              </span>
              <span className="class-details__body">
                <span className="class-details__label">{label}</span>
                <span className="class-details__value">{value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="terms-box" tabIndex={0} aria-label={m.terms.heading}>
        <div className="terms-box__title">
          <SignatureIcon size={15} /> {ACADEMY.name} — {m.terms.heading}
        </div>
        <ol className="terms-list">
          {m.terms.list.map((term) => (
            <li key={term.title}>
              <strong>{term.title}</strong>
              {term.body}
            </li>
          ))}
        </ol>
      </div>

      <div className="terms-scroll-hint">
        <Info size={13} /> {copy.scrollHint}
      </div>

      <label className={cx('checkline', agreed && 'checkline--on')}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => update({ agreed: event.target.checked })}
        />
        <span className="checkbox" aria-hidden="true">
          <Check size={13} />
        </span>
        <span className="checkline__text">
          {copy.consentPre}
          <b>{ACADEMY.name}</b>
          {copy.consentPost}
        </span>
      </label>
      {errors.agreed && <span className="field__error">{errors.agreed}</span>}

      <SignaturePad
        signedName={parent?.name}
        onChange={(dataUrl) => update({ signature: dataUrl })}
        error={errors.signature}
      />

      <div className="alert alert--info">
        <Info size={15} />
        <span>
          {copy.pdfNote}
          <em style={{ display: 'block', marginTop: 6, fontStyle: 'normal', opacity: 0.8 }}>
            {copy.pdfLanguageNote}
          </em>
        </span>
      </div>

      {(errors.agreed || errors.signature) && (
        <div className="alert">
          <Alert size={15} />
          <span>{m.form.errors.agreementAlert}</span>
        </div>
      )}
      {signature ? <span className="sr-only">{m.form.signature.signed}</span> : null}
    </StepShell>
  );
}
