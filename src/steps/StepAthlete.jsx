import StepShell from '../components/StepShell';
import { Field, SegmentedField, TextField } from '../components/Fields';
import { IdCard, School, User } from '../components/Icons';
import { useI18n } from '../i18n';
import { ageFromIc, formatMyIc } from '../lib/utils';

export default function StepAthlete({ data, update, errors, onNext, onBack }) {
  const { m } = useI18n();
  const copy = m.form.athlete;
  const { athlete } = data;
  const set = (key) => (value) => update({ athlete: { ...athlete, [key]: value } });

  const age = ageFromIc(athlete.ic);

  const handleIc = (value) => {
    const ic = formatMyIc(value);
    update({ athlete: { ...athlete, ic, age: ageFromIc(ic) } });
  };

  return (
    <StepShell
      index={3}
      title={copy.title}
      description={copy.description}
      onBack={onBack}
      onNext={onNext}
      footerHint={copy.footerHint}
    >
      <div className="grid grid--2">
        <TextField
          label={copy.name}
          name="athleteName"
          value={athlete.name}
          onChange={set('name')}
          placeholder={copy.namePlaceholder}
          icon={<User size={16} />}
          required
          error={errors.athleteName}
        />
        <TextField
          label={copy.chineseName}
          name="athleteChineseName"
          value={athlete.chineseName}
          onChange={set('chineseName')}
          placeholder={copy.chineseNamePlaceholder}
          required
          error={errors.athleteChineseName}
          hint={copy.chineseNameHint}
        />
        <TextField
          label={copy.ic}
          name="athleteIc"
          value={athlete.ic}
          onChange={handleIc}
          placeholder={copy.icPlaceholder}
          icon={<IdCard size={16} />}
          inputMode="numeric"
          maxLength={14}
          required
          error={errors.athleteIc}
          hint={copy.icHint}
        />
        <Field
          label={copy.ageAuto}
          error={errors.athleteAge}
          hint={age === '' ? copy.ageNote : undefined}
        >
          <div className={`derived${age === '' ? ' derived--empty' : ''}`}>
            {age === '' ? copy.ageEmpty : copy.yearsOld(age)}
            <span className="derived__badge" aria-hidden="true">
              NRIC
            </span>
          </div>
        </Field>
        <SegmentedField
          label={copy.gender}
          value={athlete.gender}
          onChange={set('gender')}
          options={copy.genders}
          required
          error={errors.athleteGender}
        />
        <TextField
          label={copy.school}
          name="athleteSchool"
          value={athlete.school}
          onChange={set('school')}
          placeholder={copy.schoolPlaceholder}
          icon={<School size={16} />}
          required
          error={errors.athleteSchool}
        />
        <TextField
          label={copy.className}
          name="athleteClassName"
          value={athlete.className}
          onChange={set('className')}
          placeholder={copy.classNamePlaceholder}
          required
          error={errors.athleteClassName}
          full
        />
      </div>
    </StepShell>
  );
}
