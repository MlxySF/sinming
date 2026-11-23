import { useCallback, useEffect, useState } from 'react';
import { ACADEMY, FORM_TOKEN, IS_DEMO_MODE, telHref } from '../config';
import Stepper, { STEP_COUNT } from './Stepper';
import StepAgreement from '../steps/StepAgreement';
import StepParent from '../steps/StepParent';
import StepAthlete from '../steps/StepAthlete';
import StepPayment from '../steps/StepPayment';
import LanguageToggle from './LanguageToggle';
import BrandMark from './BrandMark';
import SecondaryLogo from './SecondaryLogo';
import { buildAgreementPdf } from '../lib/agreement';
import { submitRegistration } from '../lib/submit';
import { termOptionsOf, totalOf } from '../lib/terms';
import {
  ageFromIc,
  isEmail,
  isValidMyIc,
  isValidMyPhone,
  makeReference,
  phoneIntl,
} from '../lib/utils';
import { useI18n } from '../i18n';
import { ArrowLeft } from './Icons';

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

/* Letters (incl. Chinese), spaces, hyphens, apostrophes, slashes, dots. */
const NAME_RE = /^[a-zA-Z\u4e00-\u9fa5][a-zA-Z\u4e00-\u9fa5 .'\-/]*$/;
const DRAFT_KEY = 'wsa-registration-draft';

function loadDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return {
      ...EMPTY_DATA,
      ...saved,
      parent: { ...EMPTY_DATA.parent, ...(saved.parent || {}) },
      athlete: { ...EMPTY_DATA.athlete, ...(saved.athlete || {}) },
      receipt: null,
      terms: Array.isArray(saved.terms) ? saved.terms : [],
    };
  } catch (error) {
    return null;
  }
}

export default function RegistrationFlow({ onComplete, onExit }) {
  const { m, lang } = useI18n();
  const copy = m.form;
  const [step, setStep] = useState(0);
  const [data, setData] = useState(() => loadDraft() || EMPTY_DATA);
  const [restored] = useState(() => Boolean(loadDraft()));
  const [errors, setErrors] = useState({});
  const [completed, setCompleted] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const relationshipLabel =
    copy.parent.relationships.find((item) => item.value === data.parent.relationship)?.label ||
    '';

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
    const t = copy.errors;

    if (index === 0) {
      if (!data.agreed) next.agreed = t.agreed;
      if (!data.signature) next.signature = t.signature;
    }

    if (index === 1) {
      const { name, ic, phone, email, relationship } = data.parent;
      if (name.trim().length < 3) next.parentName = t.parentName;
      else if (!NAME_RE.test(name.trim())) next.parentName = t.nameLetters;
      if (!isValidMyIc(ic)) next.parentIc = t.parentIc;
      if (!isValidMyPhone(phone)) next.parentPhone = t.parentPhone;
      if (!isEmail(email)) next.parentEmail = t.parentEmail;
      if (!relationship) next.parentRelationship = t.parentRelationship;
    }

    if (index === 2) {
      const { name, chineseName, ic, gender, school, className } = data.athlete;
      if (name.trim().length < 2) next.athleteName = t.athleteName;
      else if (!NAME_RE.test(name.trim())) next.athleteName = t.nameLetters;
      if (chineseName.trim().length < 1) next.athleteChineseName = t.athleteChineseName;
      if (!isValidMyIc(ic)) next.athleteIc = t.athleteIc;
      else if (ageFromIc(ic) === '') next.athleteAge = t.athleteAge;
      if (!gender) next.athleteGender = t.athleteGender;
      if (school.trim().length < 2) next.athleteSchool = t.athleteSchool;
      if (className.trim().length < 1) next.athleteClassName = t.athleteClass;
    }

    if (index === 3) {
      if (!data.terms.length) next.terms = t.terms;
      if (!data.receipt) next.receipt = t.receipt;
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
    if (step < STEP_COUNT - 1) {
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
    const terms = termOptionsOf(data.terms, m, lang);
    const total = totalOf(data.terms);
    const athleteAge = ageFromIc(data.athlete.ic);
    const intlPhone = phoneIntl(data.parent.phone);

    try {
      const agreement = await buildAgreementPdf({
        ref: reference,
        parent: { ...data.parent, relationship: relationshipLabel },
        athlete: { ...data.athlete, age: athleteAge },
        selectedTerms: terms,
        total,
        signature: data.signature,
        submittedAt,
      });

      const result = await submitRegistration({
        action: 'submit',
        token: FORM_TOKEN,
        lang,
        ref: reference,
        submittedAt: submittedAt.toISOString(),
        parent: {
          ...data.parent,
          relationshipLabel,
          phoneIntl: intlPhone,
        },
        athlete: { ...data.athlete, age: athleteAge },
        terms,
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

      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch (error) {
        /* ignore */
      }
      const pdfUrl = URL.createObjectURL(agreement.doc.output('blob'));

      onComplete?.({
        ref: result.ref || reference,
        demo: Boolean(result.demo),
        submittedAt,
        parent: { ...data.parent, phoneIntl: intlPhone, relationshipLabel },
        athlete: { ...data.athlete, age: athleteAge },
        terms,
        total,
        pdfUrl,
        pdfFileName: agreement.fileName,
        receiptFileName: data.receipt?.fileName || '',
      });
    } catch (error) {
      setErrors({ submit: error.message || copy.errors.submit });
      focusFirstError();
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, receipt: null }));
      } catch (error) {
        /* storage full or blocked — not critical */
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [data]);

  useEffect(() => {
    document.title = m.meta.formTitle;
  }, [m]);

  return (
    <div className="shell">
      <header className="shell__header">
        <div className="shell__header-inner">
          <button type="button" className="shell__back" onClick={onExit}>
            <ArrowLeft size={15} /> {copy.backToHome}
          </button>

          <div className="brand" aria-label={ACADEMY.name}>
            <BrandMark size={36} />
            <span className="brand__text">
              <span className="brand__name">{ACADEMY.name}</span>
            </span>
            <SecondaryLogo />
          </div>

          <LanguageToggle compact />
        </div>
      </header>

      <main className="shell__main">
        <div className="form-intro">
          <span className="eyebrow eyebrow--dark">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
          {restored && (
            <p style={{ marginTop: 8, fontSize: 12, color: '#1c7c4a' }}>✓ {copy.restored}</p>
          )}
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
          <span>{copy.footerRights(new Date().getFullYear(), ACADEMY.name)}</span>
          <span>
            {copy.needHelp}{' '}
            <a href={`tel:${telHref(ACADEMY.phone)}`}>{ACADEMY.phone}</a>
          </span>
        </div>
        {IS_DEMO_MODE && <p className="form-footer form-footer--demo">{copy.previewNote}</p>}
      </main>
    </div>
  );
}
