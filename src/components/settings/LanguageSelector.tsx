"use client";

import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { useTranslations } from 'next-intl';

export default function LanguageSelector() {
    const { locale, setLocale } = useLanguage();
    const t = useTranslations('settings');

    const languages = [
        { code: 'de' as const, label: t('german'), flag: '🇩🇪' },
        { code: 'en' as const, label: t('english'), flag: '🇬🇧' },
        { code: 'pl' as const, label: t('polish'), flag: '🇵🇱' },
    ];

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-[var(--text)]">
                {t('language')}
            </label>
            <div className="grid grid-cols-3 gap-3">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => setLocale(lang.code)}
                        className={`
              flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
              ${locale === lang.code
                                ? 'border-accent bg-accent-light text-accent'
                                : 'border-app bg-card text-muted hover:border-accent/30'
                            }
            `}
                    >
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="text-sm font-medium">{lang.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
