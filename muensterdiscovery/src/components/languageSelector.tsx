import { Menu, Button, Portal, Box, HStack } from "@chakra-ui/react";
import { IoLanguage } from "react-icons/io5";
import { createListCollection } from "@chakra-ui/react"

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
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="subtle" size="md">
          <IoLanguage size={24} />
        </Button>
      </Menu.Trigger>

      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            {languages.items.map((language) => (
              <Menu.Item
                key={language.value}
                value={language.value}
                onClick={() => {
                  setLanguage(language.value);
                  setCurrentLanguage(language.value);
                }}
              >
                <Box>
                  <HStack>
                    {language.label}
                  </HStack>
                </Box>
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
