import { cx } from '../lib/utils';
import { Alert } from './Icons';

export function Field({ label, htmlFor, required, error, hint, children, full }) {
  return (
    <div className={cx('field', full && 'field--full')}>
      {label && (
        <label className="field__label" htmlFor={htmlFor}>
          {label} {required && <span>*</span>}
        </label>
      )}
      {children}
      {error ? (
        <span className="field__error">
          <Alert size={13} /> {error}
        </span>
      ) : (
        hint && <span className="field__hint">{hint}</span>
      )}
    </div>
  );
}

export function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  hint,
  icon,
  prefix,
  required,
  full,
  maxLength,
  inputMode,
  autoComplete,
  min,
  max,
}) {
  return (
    <Field
      label={label}
      htmlFor={name}
      required={required}
      error={error}
      hint={hint}
      full={full}
    >
      <div className={cx('input-wrap', prefix && 'input-wrap--prefix')}>
        {icon && !prefix && <span className="input-wrap__icon">{icon}</span>}
        {prefix && <span className="input-wrap__prefix">{prefix}</span>}
        <input
          id={name}
          name={name}
          className={cx('input', error && 'input--error')}
          style={icon || prefix ? undefined : undefined}
          value={value}
          onChange={(e) => onChange?.(e.target.value, e)}
          placeholder={placeholder}
          type={type}
          maxLength={maxLength}
          inputMode={inputMode}
          autoComplete={autoComplete}
          min={min}
          max={max}
          aria-invalid={Boolean(error)}
        />
      </div>
    </Field>
  );
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  error,
  hint,
  required,
  full,
  placeholder = 'Please select…',
}) {
  return (
    <Field
      label={label}
      htmlFor={name}
      required={required}
      error={error}
      hint={hint}
      full={full}
    >
      <select
        id={name}
        name={name}
        className={cx('select', error && 'select--error')}
        value={value}
        onChange={(e) => onChange?.(e.target.value, e)}
        aria-invalid={Boolean(error)}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function SegmentedField({ label, value, onChange, options, error, required }) {
  return (
    <Field label={label} required={required} error={error}>
      <div className="segmented" role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={cx('segmented__opt', value === opt.value && 'segmented__opt--on')}
            onClick={() => onChange?.(opt.value)}
            aria-pressed={value === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </Field>
  );
}
