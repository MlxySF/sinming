import { useI18n } from '../i18n';
import { cx } from '../lib/utils';

/** EN / 中文 switch — lives in the header on every screen. */
export default function LanguageToggle({ compact = false }) {
  const { lang, setLang, m } = useI18n();

  return (
    <div
      className={cx('lang-toggle', compact && 'lang-toggle--compact')}
      role="group"
      aria-label={m.langToggle.label}
    >
      <button
        type="button"
        className={cx('lang-toggle__opt', lang === 'en' && 'lang-toggle__opt--on')}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        lang="en"
      >
        {m.langToggle.en}
      </button>
      <button
        type="button"
        className={cx('lang-toggle__opt', lang === 'zh' && 'lang-toggle__opt--on')}
        onClick={() => setLang('zh')}
        aria-pressed={lang === 'zh'}
        lang="zh-Hans"
      >
        {m.langToggle.zh}
      </button>
    </div>
  );
}
