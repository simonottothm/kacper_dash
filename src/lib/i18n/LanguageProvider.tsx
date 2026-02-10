"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type Locale = 'de' | 'en' | 'pl';

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('de');
    const router = useRouter();

    useEffect(() => {
        // Get locale from cookie
        const cookieLocale = document.cookie
            .split('; ')
            .find(row => row.startsWith('NEXT_LOCALE='))
            ?.split('=')[1] as Locale | undefined;

        if (cookieLocale) {
            setLocaleState(cookieLocale);
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        // Set cookie
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`; // 1 year
        // Refresh to apply new locale
        router.refresh();
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}
