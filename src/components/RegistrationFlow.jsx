import { useCallback, useEffect, useState } from 'react';
import { ACADEMY, FORM_TOKEN } from '../config';
import Stepper, { STEPS } from './Stepper';
import StepAgreement from '../steps/StepAgreement';
import StepParent from '../steps/StepParent';
import StepAthlete from '../steps/StepAthlete';
import StepPayment from '../steps/StepPayment';
import { buildAgreementPdf } from '../lib/agreement';
import { submitRegistration } from '../lib/submit';
import { selectedTermsOf, totalOf } from '../lib/terms';
import { isEmail, isPhone, makeReference, onlyDigits } from '../lib/utils';
import { ArrowLeft, Lock, Shield } from './Icons';

const EMPTY_DATA = {
  agreed: false,
  signature: '',
  parent: { name: '', ic: '', phone: '', email: '', relationship: '' },
  athlete: {
    name: '',
    chineseName: '',
    ic: '',
    age: '',
    gender: '',
    school: '',
    className: '',
  },
  terms: [],
  receipt: null,
};

const NAME_RE = /^[a-zA-Z\u4e00-\u9fa5][a-zA-Z\u4e00-\u9fa5 .'’\-/]*$/;

export default function RegistrationFlow({ onComplete, onExit }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(EMPTY_DATA);
  const [errors, setErrors] = useState({});
  const [completed, setCompleted] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const update = useCallback((patch) => {
    setData((prev) => {
      const next = { ...prev, ...patch };
      if (patch.parent) next.parent = { ...prev.parent, ...patch.parent };
      if (patch.athlete) next.athlete = { ...prev.athlete, ...patch.athlete };
      return next;
    });
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((key) => {
        if (key === 'parent') {
          Object.keys(patch.parent).forEach((sub) => {
            delete next[`parent${sub.charAt(0).toUpperCase()}${sub.slice(1)}`];
          });
        } else if (key === 'athlete') {
          Object.keys(patch.athlete).forEach((sub) => {
            delete next[`athlete${sub.charAt(0).toUpperCase()}${sub.slice(1)}`];
          });
        } else {
          delete next[key];
        }
      });
      delete next.submit;
      return next;
    });
  }, []);

  const validate = (index) => {
    const next = {};

    if (index === 0) {
      if (!data.agreed) next.agreed = 'Please tick the consent checkbox to continue.';
      if (!data.signature) next.signature = 'Please sign in the box above.';
    }

    if (index === 1) {
      const { name, ic, phone, email, relationship } = data.parent;
      if (name.trim().length < 3) next.parentName = 'Please enter your full name as per NRIC.';
      else if (!NAME_RE.test(name.trim())) next.parentName = 'Please use letters only.';
      if (ic.trim().length < 4) next.parentIc = 'Please enter your NRIC / FIN number.';
      if (!isPhone(phone)) next.parentPhone = 'Please enter a valid mobile number (at least 8 digits).';
      if (!isEmail(email)) next.parentEmail = 'Please enter a valid email address.';
      if (!relationship) next.parentRelationship = 'Please select your relationship with the athlete.';
    }

    if (index === 2) {
      const { name, chineseName, ic, age, gender, school, className } = data.athlete;
      if (name.trim().length < 2) next.athleteName = 'Please enter the athlete’s full name.';
      else if (!NAME_RE.test(name.trim())) next.athleteName = 'Please use letters only.';
      if (chineseName.trim().length < 1) next.athleteChineseName = 'Please enter the Chinese name.';
      if (ic.trim().length < 4) next.athleteIc = 'Please enter the NRIC / birth certificate number.';
      const ageNum = Number(age);
      if (!age || Number.isNaN(ageNum) || ageNum < 3 || ageNum > 30)
        next.athleteAge = 'Please enter an age between 3 and 30.';
      if (!gender) next.athleteGender = 'Please select a gender.';
      if (school.trim().length < 2) next.athleteSchool = 'Please enter the current school.';
      if (className.trim().length < 1) next.athleteClassName = 'Please enter the class / level.';
    }

    if (index === 3) {
      if (!data.terms.length) next.terms = 'Please select at least one payment term.';
      if (!data.receipt) next.receipt = 'Please upload your payment receipt.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const focusFirstError = () => {
    requestAnimationFrame(() => {
      const el = document.querySelector('.card .input--error, .card .upload--error');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const goTo = (next) => {
    setStep(next);
    setCompleted((prev) => (prev.includes(step) ? prev : [...prev, step]));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = async () => {
    if (!validate(step)) {
      focusFirstError();
      return;
    }

    if (step < STEPS.length - 1) {
      goTo(step + 1);
      return;
    }

    await submit();
  };

  const submit = async () => {
    setSubmitting(true);
    setErrors({});
    const reference = makeReference();
    const submittedAt = new Date();
    const terms = selectedTermsOf(data.terms);
    const total = totalOf(data.terms);
    const phone = `+65${onlyDigits(data.parent.phone).replace(/^65/, '')}`;

    try {
      const agreement = await buildAgreementPdf({
        ref: reference,
        parent: data.parent,
        athlete: data.athlete,
        selectedTerms: terms,
        total,
        signature: data.signature,
        submittedAt,
      });

      const result = await submitRegistration({
        action: 'submit',
        token: FORM_TOKEN,
        ref: reference,
        submittedAt: submittedAt.toISOString(),
        parent: { ...data.parent, phone },
        athlete: { ...data.athlete, age: Number(data.athlete.age) },
        terms: terms.map(({ id, label, period, sessions, price }) => ({
          id,
          label,
          period,
          sessions,
          price,
        })),
        total,
        signature: data.signature,
        receipt: data.receipt
          ? {
              fileName: data.receipt.fileName,
              mimeType: data.receipt.mimeType,
              base64: data.receipt.base64,
              size: data.receipt.size,
            }
          : null,
        agreement: { fileName: agreement.fileName, base64: agreement.base64 },
        meta: {
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          language: typeof navigator !== 'undefined' ? navigator.language : '',
        },
      });

      const pdfUrl = URL.createObjectURL(agreement.doc.output('blob'));

      onComplete?.({
        ref: result.ref || reference,
        demo: Boolean(result.demo),
        submittedAt,
        parent: { ...data.parent, phone },
        athlete: { ...data.athlete, age: Number(data.athlete.age) },
        terms,
        total,
        pdfUrl,
        pdfFileName: agreement.fileName,
        receiptFileName: data.receipt?.fileName || '',
      });
    } catch (error) {
      setErrors({ submit: error.message || 'Something went wrong. Please try again.' });
      focusFirstError();
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    document.title = `${ACADEMY.name} — Registration`;
    return () => {
      document.title = `${ACADEMY.name} — 2027 Student Registration`;
    };
  }, []);

  return (
    <div className="shell">
      <header className="shell__header">
        <div className="shell__header-inner">
          <button type="button" className="shell__back" onClick={onExit}>
            <ArrowLeft size={15} /> Back to home
          </button>

          <div className="brand" aria-label={ACADEMY.name}>
            <span className="brand__seal" style={{ width: 36, height: 36, fontSize: 19 }} aria-hidden="true">
              武
            </span>
            <span className="brand__text">
              <span className="brand__name" style={{ fontSize: 11.5 }}>
                {ACADEMY.name}
              </span>
              <span className="brand__sub" style={{ fontSize: 9 }}>
                Student registration
              </span>
            </span>
          </div>

          <span className="shell__secure">
            <Lock size={12} /> Secure form
          </span>
        </div>
      </header>

      <main className="shell__main">
        <div className="form-intro">
          <span className="eyebrow eyebrow--dark">
            <Shield size={13} /> 2027 Intake
          </span>
          <h1>Student registration</h1>
          <p>
            Four short steps: sign the agreement, tell us about the parent and athlete, then choose
            your term(s) and upload your payment receipt.
          </p>
        </div>

        <Stepper current={step} completed={completed} onJump={(index) => setStep(index)} />

        {step === 0 && (
          <StepAgreement
            data={data}
            update={update}
            errors={errors}
            onNext={handleNext}
            onBack={onExit}
            showBack={false}
          />
        )}

        {step === 1 && (
          <StepParent
            data={data}
            update={update}
            errors={errors}
            onNext={handleNext}
            onBack={() => setStep(0)}
          />
        )}

        {step === 2 && (
          <StepAthlete
            data={data}
            update={update}
            errors={errors}
            onNext={handleNext}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <StepPayment
            data={data}
            update={update}
            errors={errors}
            onNext={handleNext}
            onBack={() => setStep(2)}
            submitting={submitting}
          />
        )}

        <div className="form-footer">
          <span>
            © {new Date().getFullYear()} {ACADEMY.name} · UEN {ACADEMY.uen}
          </span>
          <span>
            Need help? <a href={`mailto:${ACADEMY.email}`}>{ACADEMY.email}</a> ·{' '}
            <a href={`tel:${ACADEMY.phone.replace(/\s/g, '')}`}>{ACADEMY.phone}</a>
          </span>
        </div>
      </main>
    </div>
  );
}
