import { Select, Portal, createListCollection } from "@chakra-ui/react"

export const languageItems = [
  { label: "🇩🇪", value: "de" },
  { label: "🇬🇧", value: "en" },
  { label: "🇪🇸", value: "es" },
  { label: "🇫🇷", value: "fr" },
  { label: "🇮🇹", value: "it" },
  { label: "🇳🇱", value: "nl" },
  { label: "🇵🇱", value: "pl" },
  { label: "🇵🇹", value: "pt" },
  { label: "🇹🇷", value: "tk" },
  { label: "🇷🇺", value: "ru" },
  { label: "🇯🇵", value: "jp" },
  { label: "🇸🇦", value: "sa" }
] as const;

export type LanguageType = typeof languageItems[number]["value"];

const languages = createListCollection({
  items: languageItems,
});

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
          <Select.ValueText placeholder="🇩🇪 / 🇬🇧" />
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
                onClick={() => setLanguage(language.value)}
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
