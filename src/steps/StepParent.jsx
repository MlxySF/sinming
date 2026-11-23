import StepShell from '../components/StepShell';
import { SelectField, TextField } from '../components/Fields';
import { IdCard, Mail, Phone, User } from '../components/Icons';
import { useI18n } from '../i18n';
import { formatMyIc, formatMyPhone, isValidMyIc } from '../lib/utils';

export default function StepParent({ data, update, errors, onNext, onBack }) {
  const { m } = useI18n();
  const copy = m.form.parent;
  const { parent } = data;
  const set = (key) => (value) => update({ parent: { ...parent, [key]: value } });

  return (
    <StepShell
      index={2}
      title={copy.title}
      description={copy.description}
      onBack={onBack}
      onNext={onNext}
      footerHint={copy.footerHint}
    >
      <div className="grid grid--2">
        <TextField
          label={copy.name}
          name="parentName"
          value={parent.name}
          onChange={set('name')}
          placeholder={copy.namePlaceholder}
          icon={<User size={16} />}
          autoComplete="name"
          required
          error={errors.parentName}
        />
        <TextField
          label={copy.ic}
          name="parentIc"
          value={parent.ic}
          onChange={(value) => set('ic')(formatMyIc(value))}
          placeholder={copy.icPlaceholder}
          icon={<IdCard size={16} />}
          inputMode="numeric"
          maxLength={14}
          required
          error={errors.parentIc}
          hint={isValidMyIc(parent.ic) ? undefined : copy.icHint}
        />
        <TextField
          label={copy.phone}
          name="parentPhone"
          value={parent.phone}
          onChange={(value) => set('phone')(formatMyPhone(value))}
          placeholder={copy.phonePlaceholder}
          icon={<Phone size={16} />}
          inputMode="tel"
          autoComplete="tel"
          maxLength={14}
          required
          error={errors.parentPhone}
          hint={copy.phoneHint}
        />
        <TextField
          label={copy.email}
          name="parentEmail"
          value={parent.email}
          onChange={set('email')}
          placeholder={copy.emailPlaceholder}
          type="email"
          icon={<Mail size={16} />}
          autoComplete="email"
          required
          error={errors.parentEmail}
          hint={copy.emailHint}
        />
        <SelectField
          label={copy.relationship}
          name="parentRelationship"
          value={parent.relationship}
          onChange={set('relationship')}
          options={copy.relationships}
          placeholder={copy.relationshipPlaceholder}
          required
          error={errors.parentRelationship}
          full
        />
      </div>
    </StepShell>
  );
}
