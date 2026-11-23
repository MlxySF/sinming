import { Check } from './Icons';
import { cx } from '../lib/utils';

export const STEPS = [
  { id: 0, title: 'Agreement', meta: 'Terms & signature' },
  { id: 1, title: 'Parent', meta: 'Your details' },
  { id: 2, title: 'Athlete', meta: 'Student details' },
  { id: 3, title: 'Payment', meta: 'Fees & receipt' },
];

export default function Stepper({ current, completed, onJump }) {
  return (
    <>
      <div className="stepper" role="list" aria-label="Registration progress">
        {STEPS.map((step, index) => {
          const state =
            index === current ? 'active' : completed.includes(index) ? 'done' : 'idle';
          const clickable = index < current && completed.includes(index);
          return (
            <button
              key={step.id}
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
                  {state === 'done' ? 'Completed' : step.meta}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="progress-track" aria-hidden="true">
        <div
          className="progress-track__fill"
          style={{ width: `${((current + 1) / STEPS.length) * 100}%` }}
        />
      </div>
      <div className="step-mobile-label">
        <span>
          Step {current + 1} of {STEPS.length} · {STEPS[current].title}
        </span>
        <span>{STEPS[current].meta}</span>
      </div>
    </>
  );
}
