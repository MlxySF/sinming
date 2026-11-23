import { useMemo, useRef, useState } from 'react';
import { BANK, PAYMENT_TERMS, formatMoney } from '../config';
import StepShell from '../components/StepShell';
import { Alert, Bank, Check, Close, Copy, Info, Lock, Upload } from '../components/Icons';
import { compressImage, cx, formatBytes, readFileAsDataUrl } from '../lib/utils';
import { selectedTermsOf, totalOf } from '../lib/terms';

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_PDF_BYTES = 4 * 1024 * 1024;

function CopyRow({ label, value, mono }) {
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
          aria-label={`Copy ${label}`}
          title={copied ? 'Copied' : 'Copy'}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </b>
    </div>
  );
}

export default function StepPayment({
  data,
  update,
  errors,
  onNext,
  onBack,
  submitting,
  onReceiptError,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState('');
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef(null);

  const selected = selectedTermsOf(data.terms);
  const total = totalOf(data.terms);
  const receipt = data.receipt;

  const toggleTerm = (id) => {
    const next = data.terms.includes(id)
      ? data.terms.filter((t) => t !== id)
      : [...data.terms, id];
    update({ terms: next });
  };

  const handleFile = async (file) => {
    setFileError('');
    onReceiptError?.('');
    if (!file) return;

    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');

    if (!isPdf && !isImage) {
      setFileError('Please upload an image (JPG, PNG, HEIC) or a PDF of your payment receipt.');
      return;
    }
    if (isImage && file.size > MAX_IMAGE_BYTES) {
      setFileError('That image is larger than 12 MB. Please upload a smaller screenshot.');
      return;
    }
    if (isPdf && file.size > MAX_PDF_BYTES) {
      setFileError('That PDF is larger than 4 MB. Please upload a smaller file.');
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
      setFileError(error.message || 'That file could not be read. Please try another one.');
    } finally {
      setProcessing(false);
    }
  };

  const summary = useMemo(() => {
    if (!selected.length) return 'No term selected yet';
    return `${selected.length} term${selected.length > 1 ? 's' : ''} · ${selected.reduce(
      (n, t) => n + t.sessions,
      0
    )} classes`;
  }, [selected]);

  return (
    <StepShell
      index={4}
      title="Payment & receipt"
      description="Select every term you are enrolling for. The amount due is added up automatically, then transfer and upload your receipt."
      onBack={onBack}
      onNext={onNext}
      nextLabel="Submit registration"
      nextLoading={submitting}
      footerHint="You will receive a confirmation email with your agreement attached."
    >
      <div className="section-label">
        Select payment term(s) <span className="section-label__count">{summary}</span>
      </div>

      <div className="terms-grid">
        {PAYMENT_TERMS.map((term) => {
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
                <span className="term-card__sessions">{term.sessions} classes</span>
              </div>
            </button>
          );
        })}
      </div>
      {errors.terms && <span className="field__error">{errors.terms}</span>}

      <div className="bank">
        <div className="bank__head">
          <span className="bank__title">
            <Bank size={15} /> Bank transfer details
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(244,239,230,0.45)' }}>
            <Lock size={11} /> Verified
          </span>
        </div>
        <div className="bank__rows">
          <CopyRow label="Bank" value={BANK.bankName} />
          <CopyRow label="Account name" value={BANK.accountName} />
          <CopyRow label="Account number" value={BANK.accountNumber} mono />
          <CopyRow label="PayNow" value={BANK.paynow} mono />
        </div>
        <div className="bank__total">
          <div className="bank__total-label">
            Total amount due
            <small>{selected.length ? selected.map((t) => t.label).join(' + ') : 'Select at least one term'}</small>
          </div>
          <div className="bank__total-amount">{formatMoney(total)}</div>
        </div>
      </div>

      <div className="section-label" style={{ marginTop: 28 }}>
        Upload payment receipt <span className="section-label__count">Required</span>
      </div>

      <p style={{ margin: '0 0 14px', fontSize: 12.5, lineHeight: 1.6, color: 'var(--text-soft)' }}>
        {BANK.instructions}
      </p>

      {receipt ? (
        <div className="upload upload--file">
          {receipt.isPdf ? (
            <div className="upload__thumb upload__thumb--pdf">PDF</div>
          ) : (
            <img className="upload__thumb" src={receipt.previewUrl} alt="Receipt preview" />
          )}
          <div className="upload__file">
            <div className="upload__file-name">{receipt.fileName}</div>
            <div className="upload__file-meta">
              {formatBytes(receipt.size)} · Uploaded and ready
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
            aria-label="Remove receipt"
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
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
        >
          <span className="upload__icon">
            <Upload size={19} />
          </span>
          <span className="upload__title">
            {processing ? 'Processing your receipt…' : 'Tap to upload, or drag your file here'}
          </span>
          <span className="upload__hint">
            Screenshot or photo of your transfer confirmation · JPG, PNG or PDF · max 12 MB
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => handleFile(e.target.files?.[0])}
            aria-label="Upload payment receipt"
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
          <span>
            When you press <b>Submit registration</b>, we save your details to our enrolment records,
            generate your signed agreement PDF and email a copy to you. Our admin team verifies your
            receipt within one working day.
          </span>
        </div>
        {errors.submit && (
          <div className="alert">
            <Alert size={15} />
            <span>{errors.submit}</span>
          </div>
        )}
        <p className="submit-note">
          <Lock size={13} /> Your information and receipt are sent over a secure connection and are
          only accessible to {BANK.accountName.replace(' Pte Ltd', '')} staff.
        </p>
      </div>
    </StepShell>
  );
}
