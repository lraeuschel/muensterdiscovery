import { createListCollection, Box } from "@chakra-ui/react";

export const languageItems = [
  { label: "Deutsch", value: "de" },
  { label: "English", value: "en" },
  { label: "Español", value: "es" },
  { label: "Français", value: "fr" },
  { label: "Italiano", value: "it" },
  { label: "Nederlands", value: "nl" },
  { label: "Polski", value: "pl" },
  { label: "Português", value: "pt" },
  { label: "Türkçe", value: "tk" },
  { label: "Русский", value: "ru" },
  { label: "日本語", value: "jp" },
  { label: "العربية", value: "sa" }
] as const;

export type LanguageType = typeof languageItems[number]["value"];

const languages = createListCollection({
  items: languageItems,
});

export let currentLanguage: LanguageType = languageItems[0].value;

const _languageListeners: Array<(lang: LanguageType) => void> = [];

export function setCurrentLanguage(lang: LanguageType) {
  currentLanguage = lang;
  _languageListeners.forEach((cb) => cb(lang));
}

export function onCurrentLanguageChange(cb: (lang: LanguageType) => void) {
  _languageListeners.push(cb);
  return () => {
    const i = _languageListeners.indexOf(cb);
    if (i >= 0) _languageListeners.splice(i, 1);
  };
}

export default function LanguageSelector({
  currentLang,
  setLanguage,
}: {
  currentLang?: LanguageType;
  setLanguage: (lang: LanguageType) => void;
}) {
  return (
    <>
      {languages.items.map((language) => (
        <Box
          key={language.value}
          onClick={() => {
            setLanguage(language.value);
            setCurrentLanguage(language.value);
          }}
          cursor="pointer"
          fontWeight={currentLang === language.value ? "bold" : "normal"}
          _hover={{ opacity: 0.8 }}
        >
          {language.label}
        </Box>
      ))}
    </>
  );
}
