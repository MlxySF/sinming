import StepShell from '../components/StepShell';
import { SegmentedField, TextField } from '../components/Fields';
import { IdCard, School, User } from '../components/Icons';

const GENDERS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

export default function StepAthlete({ data, update, errors, onNext, onBack }) {
  const { athlete } = data;
  const set = (key) => (value) => update({ athlete: { ...athlete, [key]: value } });

  return (
    <StepShell
      index={3}
      title="Athlete details"
      description="Tell us about the student joining the programme. This information goes on the signed agreement."
      onBack={onBack}
      onNext={onNext}
      footerHint="Please double-check the spelling of the name."
    >
      <div className="grid grid--2">
        <TextField
          label="Full name (as per NRIC / birth certificate)"
          name="athleteName"
          value={athlete.name}
          onChange={set('name')}
          placeholder="e.g. Tan Jia Hao"
          icon={<User size={16} />}
          required
          error={errors.athleteName}
        />
        <TextField
          label="Chinese name"
          name="athleteChineseName"
          value={athlete.chineseName}
          onChange={set('chineseName')}
          placeholder="e.g. 陈家豪"
          required
          error={errors.athleteChineseName}
          hint="Used on competition entry forms and certificates."
        />
        <TextField
          label="NRIC / Birth certificate no."
          name="athleteIc"
          value={athlete.ic}
          onChange={(value) => set('ic')(value.toUpperCase())}
          placeholder="e.g. T1234567A"
          icon={<IdCard size={16} />}
          maxLength={14}
          required
          error={errors.athleteIc}
        />
        <TextField
          label="Age"
          name="athleteAge"
          value={athlete.age}
          onChange={set('age')}
          placeholder="e.g. 9"
          inputMode="numeric"
          maxLength={2}
          required
          error={errors.athleteAge}
          hint="Age as of 1 January of the enrolment year."
        />
        <SegmentedField
          label="Gender"
          value={athlete.gender}
          onChange={set('gender')}
          options={GENDERS}
          required
          error={errors.athleteGender}
        />
        <TextField
          label="Current school"
          name="athleteSchool"
          value={athlete.school}
          onChange={set('school')}
          placeholder="e.g. Ai Tong School"
          icon={<School size={16} />}
          required
          error={errors.athleteSchool}
        />
        <TextField
          label="Class / level"
          name="athleteClass"
          value={athlete.className}
          onChange={set('className')}
          placeholder="e.g. Primary 4 · Joy"
          required
          error={errors.athleteClassName}
          full
        />
      </div>
    </StepShell>
  );
}
