import { Check } from './Icons';
import { cx } from '../lib/utils';
import { useI18n } from '../i18n';

export const STEP_COUNT = 4;

export default function Stepper({ current, completed, onJump }) {
  const { m } = useI18n();
  const steps = m.form.steps;

  return (
    <>
      <div className="stepper" role="list" aria-label={m.form.stepOf(current + 1, steps.length)}>
        {steps.map((step, index) => {
          const state = index === current ? 'active' : completed.includes(index) ? 'done' : 'idle';
          const clickable = index < current && completed.includes(index);
          return (
            <button
              key={step.title}
              type="button"
              role="listitem"
              className={cx(
                'step-pill',
                `step-pill--${state}`,
                clickable && 'step-pill--clickable'
              )}
              onClick={() => clickable && onJump?.(index)}
              disabled={!clickable && index !== current}
              aria-current={index === current ? 'step' : undefined}
            >
              <span className="step-pill__num">
                {state === 'done' ? <Check size={13} /> : index + 1}
              </span>
              <span className="step-pill__label">
                <span className="step-pill__title">{step.title}</span>
                <span className="step-pill__meta">
                  {state === 'done' ? m.form.completed : step.meta}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="progress-track" aria-hidden="true">
        <div
          className="progress-track__fill"
          style={{ width: `${((current + 1) / steps.length) * 100}%` }}
        />
      </div>
      <div className="step-mobile-label">
        <span>{m.form.stepOf(current + 1, steps.length)}</span>
        <span>{steps[current].meta}</span>
      </div>
    </>
  );
}
