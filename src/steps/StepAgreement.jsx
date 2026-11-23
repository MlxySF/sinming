import { ACADEMY, AGREEMENT_TERMS } from '../config';
import SignaturePad from '../components/SignaturePad';
import StepShell from '../components/StepShell';
import { Alert, Check, Info, SignatureIcon } from '../components/Icons';
import { cx } from '../lib/utils';

export default function StepAgreement({ data, update, errors, onNext, onBack, showBack }) {
  const { agreed, signature, parent } = data;

  return (
    <StepShell
      index={1}
      title="Registration agreement & consent"
      description="Please read the agreement in full, then sign at the bottom of the card. Your signature is turned into an image and attached to a PDF copy of this agreement."
      onBack={onBack}
      onNext={onNext}
      nextLabel="I agree, continue"
      showBack={showBack}
      footerHint="Steps 2–4 take about 3 minutes."
    >
      <div className="terms-box" tabIndex={0} aria-label="Terms and conditions">
        <div className="terms-box__title">
          <SignatureIcon size={15} /> {ACADEMY.name} — Terms &amp; Conditions
        </div>
        <ol className="terms-list">
          {AGREEMENT_TERMS.map((term) => (
            <li key={term.title}>
              <strong>{term.title}</strong>
              {term.body}
            </li>
          ))}
        </ol>
      </div>

      <div className="terms-scroll-hint">
        <Info size={13} /> Scroll inside the box above to read every clause.
      </div>

      <label className={cx('checkline', agreed && 'checkline--on')}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => update({ agreed: e.target.checked })}
        />
        <span className="checkbox" aria-hidden="true">
          <Check size={13} />
        </span>
        <span className="checkline__text">
          I have read and understood the terms above. I agree to enrol my child at{' '}
          <b>{ACADEMY.name}</b>, to pay the class fees every month for the term(s) selected, and to
          the academy’s arrangement for competitions, performances and events.
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
          A PDF agreement containing these terms, your details and this signature is generated
          automatically and saved to our records. A copy is emailed to you after submission.
        </span>
      </div>

      {signature ? (
        <span className="sr-only">Signature captured.</span>
      ) : null}

      {errors.agreed || errors.signature ? (
        <div className="alert">
          <Alert size={15} />
          <span>Please tick the consent box and sign in the box before continuing.</span>
        </div>
      ) : null}
    </StepShell>
  );
}
