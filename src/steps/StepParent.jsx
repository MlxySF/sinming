import StepShell from '../components/StepShell';
import { SelectField, TextField } from '../components/Fields';
import { IdCard, Mail, Phone, User } from '../components/Icons';

const RELATIONSHIPS = [
  'Mother',
  'Father',
  'Legal guardian',
  'Grandparent',
  'Sibling',
  'Other family member',
];

export default function StepParent({ data, update, errors, onNext, onBack }) {
  const { parent } = data;
  const set = (key) => (value) => update({ parent: { ...parent, [key]: value } });

  return (
    <StepShell
      index={2}
      title="Parent / guardian details"
      description="We use these details for the agreement, payment verification and all academy communication."
      onBack={onBack}
      onNext={onNext}
      footerHint="Your details are only shared with the academy admin team."
    >
      <div className="grid grid--2">
        <TextField
          label="Full name (as per NRIC)"
          name="parentName"
          value={parent.name}
          onChange={set('name')}
          placeholder="e.g. Tan Wei Ling"
          icon={<User size={16} />}
          autoComplete="name"
          required
          error={errors.parentName}
        />
        <TextField
          label="NRIC / FIN"
          name="parentIc"
          value={parent.ic}
          onChange={(value) => set('ic')(value.toUpperCase())}
          placeholder="e.g. S8012345A"
          icon={<IdCard size={16} />}
          maxLength={12}
          required
          error={errors.parentIc}
        />
        <TextField
          label="Mobile number"
          name="parentPhone"
          value={parent.phone}
          onChange={set('phone')}
          placeholder="8123 4567"
          prefix="+65"
          icon={<Phone size={16} />}
          inputMode="tel"
          autoComplete="tel"
          maxLength={16}
          required
          error={errors.parentPhone}
          hint="WhatsApp number preferred — we send class updates there."
        />
        <TextField
          label="Email address"
          name="parentEmail"
          value={parent.email}
          onChange={set('email')}
          placeholder="you@email.com"
          type="email"
          icon={<Mail size={16} />}
          autoComplete="email"
          required
          error={errors.parentEmail}
          hint="The confirmation email and agreement copy go to this address."
        />
        <SelectField
          label="Relationship with athlete"
          name="parentRelationship"
          value={parent.relationship}
          onChange={set('relationship')}
          options={RELATIONSHIPS.map((r) => ({ value: r, label: r }))}
          required
          error={errors.parentRelationship}
          full
        />
      </div>
    </StepShell>
  );
}
