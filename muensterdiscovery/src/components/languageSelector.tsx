import { Select, Portal, createListCollection } from "@chakra-ui/react"

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
  setLanguage,
}: {
  setLanguage: (lang: LanguageType) => void;
}) {
  return (
    <Select.Root
      collection={languages}
      size="sm"
      width="20%"
      position="fixed"
      variant="subtle"
      top="10px"
      right="10px"
    >
      <Select.Control>
        <Select.Trigger>
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>

      <Portal>
        <Select.Positioner>
          <Select.Content>
            {languages.items.map((language) => (
              <Select.Item
                item={language}
                key={language.value}
                onClick={() => {
                  setLanguage(language.value);
                  setCurrentLanguage(language.value);
                }}
              >
                {language.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
}
