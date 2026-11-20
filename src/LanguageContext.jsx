import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as L from 'lucide-react';
import { API_BASE_URL } from './apiConfig';
import { translations, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  // Read persisted language with valid fallback (defaulting to English)
  const getInitialLanguage = () => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && SUPPORTED_LANGUAGES.some((l) => l.code === urlLang.toLowerCase())) {
          return urlLang.toLowerCase();
        }
      }
      const isExplicit = localStorage.getItem('sa-language-explicit');
      if (isExplicit === 'true') {
        const stored = localStorage.getItem('sa-language');
        if (stored) {
          const parsed = JSON.parse(stored);
          const code = typeof parsed === 'string' ? parsed : parsed?.code;
          const isValid = SUPPORTED_LANGUAGES.some((l) => l.code === code);
          if (isValid) return code;
        }
      }
      return DEFAULT_LANGUAGE;
    } catch {
      return DEFAULT_LANGUAGE;
    }
  };

  const [currentLanguage, setCurrentLanguageState] = useState(getInitialLanguage);
  const [languagesList, setLanguagesList] = useState(SUPPORTED_LANGUAGES);
  const [loadingLanguages, setLoadingLanguages] = useState(false);

  // Fetch languages dynamically from Database via Public Master API
  useEffect(() => {
    let isMounted = true;
    setLoadingLanguages(true);

    async function fetchLanguages() {
      try {
        // Try master languages endpoint first
        let res = await fetch(`${API_BASE_URL}/master/languages`).catch(() => null);
        let json = null;

        if (res && res.ok) {
          json = await res.json();
        } else {
          // Fallback to /languages endpoint
          res = await fetch(`${API_BASE_URL}/languages`).catch(() => null);
          if (res && res.ok) {
            json = await res.json();
          }
        }

        const rawList = Array.isArray(json) ? json : json?.data || json?.languages || [];

        if (isMounted && rawList.length > 0) {
          const nativeMap = {
            te: 'తెలుగు',
            kn: 'ಕನ್ನಡ',
            en: 'English',
            ta: 'தமிழ்',
            hi: 'हिन्दी',
          };

          // Filter to active supported languages and preserve proper ordering
          const mapped = rawList
            .filter((item) => ['te', 'kn', 'en', 'ta', 'hi'].includes(item.code))
            .map((item) => ({
              id: item.id,
              code: item.code,
              name: item.name || item.englishName || item.code,
              nativeName: item.nativeName || nativeMap[item.code] || item.name,
              label: item.label || `${nativeMap[item.code] || item.name} (${item.name})`,
              isDefault: item.code === DEFAULT_LANGUAGE,
            }));

          if (mapped.length >= 5) {
            setLanguagesList(mapped);
          }
        }
      } catch (err) {
        console.warn('[LanguageProvider] Using default database languages fallback:', err);
      } finally {
        if (isMounted) setLoadingLanguages(false);
      }
    }

    fetchLanguages();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update <html lang="..."> attribute and persist selection
  useEffect(() => {
    try {
      document.documentElement.lang = currentLanguage;
      localStorage.setItem('sa-language', JSON.stringify(currentLanguage));
    } catch (e) {
      console.warn('[LanguageProvider] Failed to persist language:', e);
    }
  }, [currentLanguage]);

  // Set Language with validation
  const setLanguage = useCallback((code) => {
    if (!code) return;
    const normalized = String(code).toLowerCase().trim();
    const exists = SUPPORTED_LANGUAGES.some((l) => l.code === normalized);
    const target = exists ? normalized : DEFAULT_LANGUAGE;
    try {
      localStorage.setItem('sa-language-explicit', 'true');
    } catch {}
    setCurrentLanguageState(target);
  }, []);

  // Translation helper function
  const t = useCallback(
    (key, fallback = '') => {
      if (!key) return fallback;
      const langPack = translations[currentLanguage] || translations[DEFAULT_LANGUAGE] || {};
      const enPack = translations.en || {};
      return langPack[key] ?? enPack[key] ?? fallback ?? key;
    },
    [currentLanguage]
  );

  const activeMeta = languagesList.find((l) => l.code === currentLanguage) || languagesList[0];

  const value = {
    currentLanguage,
    setLanguage,
    languages: languagesList,
    loadingLanguages,
    t,
    activeMeta,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback if called outside provider
    return {
      currentLanguage: DEFAULT_LANGUAGE,
      setLanguage: () => {},
      languages: SUPPORTED_LANGUAGES,
      loadingLanguages: false,
      t: (key, fallback) => fallback || key,
      activeMeta: SUPPORTED_LANGUAGES[0],
    };
  }
  return context;
}

/**
 * Responsive Language Selector Component
 * Seamlessly fits in desktop header, tablet action bar, and mobile drawer.
 */
export function LanguageSelector({ variant = 'header', onSelect }) {
  const { currentLanguage, setLanguage, languages, activeMeta } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleChoose = (code) => {
    setLanguage(code);
    setIsOpen(false);
    if (onSelect) onSelect(code);
  };

  if (variant === 'pills') {
    return (
      <div className="language-pills-row" role="radiogroup" aria-label="Select Language">
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            className={`lang-pill ${currentLanguage === lang.code ? 'active' : ''}`}
            onClick={() => handleChoose(lang.code)}
            role="radio"
            aria-checked={currentLanguage === lang.code}
          >
            <span className="lang-pill-native">{lang.nativeName}</span>
            <small className="lang-pill-code">{lang.name}</small>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`language-selector-wrap ${variant}`} ref={dropdownRef}>
      <button
        type="button"
        className="lang-trigger-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Choose Language (భాషను ఎంచుకోండి)"
        aria-label={`Current language: ${activeMeta?.nativeName || 'Telugu'}. Click to change language.`}
      >
        <L.Globe size={16} className="lang-globe-icon" />
        <span className="lang-trigger-text">{activeMeta?.nativeName || 'తెలుగు'}</span>
        <L.ChevronDown size={13} className={`lang-chevron ${isOpen ? 'rotated' : ''}`} />
      </button>

      {isOpen && (
        <div className="lang-dropdown-menu" role="listbox" aria-label="Available Languages">
          <div className="lang-dropdown-header">
            <span>భాష / Language</span>
          </div>
          {languages.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                className={`lang-option-row ${isSelected ? 'selected' : ''}`}
                onClick={() => handleChoose(lang.code)}
                role="option"
                aria-selected={isSelected}
              >
                <div className="lang-option-text">
                  <strong className="lang-native-label">{lang.nativeName}</strong>
                  <span className="lang-english-label">{lang.name}</span>
                </div>
                {isSelected && <L.Check size={16} className="lang-check-icon" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
