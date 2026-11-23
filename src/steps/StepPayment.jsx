import { useMemo, useRef, useState } from 'react';
import { BANK, formatMoney } from '../config';
import StepShell from '../components/StepShell';
import { Alert, Bank, Check, Close, Copy, Info, Lock, Upload } from '../components/Icons';
import { compressImage, cx, formatBytes, readFileAsDataUrl } from '../lib/utils';
import { allTermOptions, totalOf } from '../lib/terms';
import { useI18n } from '../i18n';

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_PDF_BYTES = 4 * 1024 * 1024;

function CopyRow({ label, value, mono }) {
  const { m } = useI18n();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      const area = document.createElement('textarea');
      area.value = value;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="bank__row">
      <span>{label}</span>
      <b style={mono ? { fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' } : undefined}>
        {value}
        <button
          type="button"
          className="copy-btn"
          onClick={copy}
          aria-label={m.form.payment.copy(label)}
          title={copied ? m.form.payment.copied : m.form.payment.copy(label)}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </b>
    </div>
  );
}

export default function StepPayment({ data, update, errors, onNext, onBack, submitting }) {
  const { m, lang } = useI18n();
  const copy = m.form.payment;
  const errorsCopy = m.form.errors;
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState('');
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef(null);

  const terms = allTermOptions(m, lang);
  const selected = terms.filter((term) => data.terms.includes(term.id));
  const total = totalOf(data.terms);
  const receipt = data.receipt;

  const toggleTerm = (id) => {
    const next = data.terms.includes(id)
      ? data.terms.filter((term) => term !== id)
      : [...data.terms, id];
    update({ terms: next });
  };

  const handleFile = async (file) => {
    setFileError('');
    if (!file) return;

    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');

    if (!isPdf && !isImage) {
      setFileError(errorsCopy.receiptType);
      return;
    }
    if (isImage && file.size > MAX_IMAGE_BYTES) {
      setFileError(errorsCopy.fileTooLarge(12));
      return;
    }
    if (isPdf && file.size > MAX_PDF_BYTES) {
      setFileError(errorsCopy.fileTooLarge(4));
      return;
    }

    setProcessing(true);
    try {
      if (isPdf) {
        const dataUrl = await readFileAsDataUrl(file);
        update({
          receipt: {
            fileName: file.name,
            mimeType: 'application/pdf',
            base64: dataUrl.split(',')[1],
            size: file.size,
            isPdf: true,
            previewUrl: '',
          },
        });
      } else {
        const { dataUrl } = await compressImage(file);
        update({
          receipt: {
            fileName: `${file.name.replace(/\.[^.]+$/, '')}.jpg`,
            mimeType: 'image/jpeg',
            base64: dataUrl.split(',')[1],
            size: Math.round(dataUrl.length * 0.75),
            isPdf: false,
            previewUrl: dataUrl,
          },
        });
      }
    } catch (error) {
      setFileError(errorsCopy.fileUnreadable);
    } finally {
      setProcessing(false);
    }
  };

  const summary = useMemo(() => {
    if (!selected.length) return copy.noneSelected;
    return copy.summary(
      selected.length,
      selected.reduce((sum, term) => sum + term.sessions, 0)
    );
  }, [selected, copy]);

  return (
    <StepShell
      index={4}
      title={copy.title}
      description={copy.description}
      onBack={onBack}
      onNext={onNext}
      nextLabel={m.form.submit}
      nextLoading={submitting}
      isSubmit
      footerHint={copy.footerHint}
    >
      <div className="section-label">
        {copy.selectTerms} <span className="section-label__count">{summary}</span>
      </div>

      <div className="terms-grid">
        {terms.map((term) => {
          const on = data.terms.includes(term.id);
          return (
            <button
              key={term.id}
              type="button"
              className={cx('term-card', on && 'term-card--on')}
              onClick={() => toggleTerm(term.id)}
              aria-pressed={on}
            >
              <div className="term-card__top">
                <div>
                  <div className="term-card__name">{term.label}</div>
                  <div className="term-card__period">{term.period}</div>
                </div>
                <span className={cx('checkbox', on && 'checkbox--on')} aria-hidden="true">
                  <Check size={13} />
                </span>
              </div>
              <div className="term-card__bottom">
                <span className="term-card__price">{formatMoney(term.price)}</span>
                <span className="term-card__sessions">
                  {term.sessions} {m.fees.classes}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {errors.terms && <span className="field__error">{errors.terms}</span>}

      <div className="bank">
        <div className="bank__head">
          <span className="bank__title">
            <Bank size={15} /> {copy.bankTitle}
          </span>
          <span className="bank__chip">
            <Lock size={11} /> {copy.bankVerified}
          </span>
        </div>
        <div className="bank__rows">
          <CopyRow label={copy.labels.bank} value={BANK.bankName} />
          <CopyRow label={copy.labels.accountName} value={BANK.accountName} />
          <CopyRow label={copy.labels.accountNumber} value={BANK.accountNumber} mono />
        </div>
        <div className="bank__total">
          <div className="bank__total-label">
            {copy.totalDue}
            <small>
              {selected.length
                ? selected.map((term) => term.label).join(' + ')
                : copy.selectAtLeastOne}
            </small>
          </div>
          <div className="bank__total-amount">{formatMoney(total)}</div>
        </div>
      </div>

      <div className="section-label" style={{ marginTop: 28 }}>
        {copy.receipt} <span className="section-label__count">{copy.required}</span>
      </div>

      <p style={{ margin: '0 0 14px', fontSize: 12.5, lineHeight: 1.6, color: 'var(--text-soft)' }}>
        {copy.bankInstructions}
      </p>

      {receipt ? (
        <div className="upload upload--file">
          {receipt.isPdf ? (
            <div className="upload__thumb upload__thumb--pdf">PDF</div>
          ) : (
            <img className="upload__thumb" src={receipt.previewUrl} alt={copy.receiptPreview} />
          )}
          <div className="upload__file">
            <div className="upload__file-name">{receipt.fileName}</div>
            <div className="upload__file-meta">
              {formatBytes(receipt.size)} · {copy.uploadedReady}
            </div>
          </div>
          <button
            type="button"
            className="upload__remove"
            onClick={() => {
              update({ receipt: null });
              setFileError('');
              if (inputRef.current) inputRef.current.value = '';
            }}
            aria-label={copy.removeReceipt}
          >
            <Close size={13} />
          </button>
        </div>
      ) : (
        <label
          className={cx(
            'upload',
            dragActive && 'upload--drag',
            (errors.receipt || fileError) && 'upload--error'
          )}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);
            handleFile(event.dataTransfer.files?.[0]);
          }}
        >
          <span className="upload__icon">
            <Upload size={19} />
          </span>
          <span className="upload__title">{processing ? copy.processing : copy.uploadTitle}</span>
          <span className="upload__hint">{copy.uploadHint}</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={(event) => handleFile(event.target.files?.[0])}
            aria-label={copy.receipt}
          />
        </label>
      )}

      {(fileError || errors.receipt) && (
        <span className="field__error" style={{ marginTop: 8, display: 'inline-flex' }}>
          <Alert size={13} /> {fileError || errors.receipt}
        </span>
      )}

      <div className="submit-area">
        <div className="alert alert--info" style={{ marginTop: 0 }}>
          <Info size={15} />
          <span>{copy.submitAlert}</span>
        </div>
        {errors.submit && (
          <div className="alert">
            <Alert size={15} />
            <span>{errors.submit}</span>
          </div>
        )}
        <p className="submit-note">
          <Lock size={13} /> {copy.submitNote}
        </p>
      </div>
    </StepShell>
  );
}
