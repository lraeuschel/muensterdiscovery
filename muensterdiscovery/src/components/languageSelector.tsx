
import { Select, Portal, createListCollection } from "@chakra-ui/react"

export default function LanguageSelector({ setLanguage }: { setLanguage: (lang: "de" | "en") => void }) {

    const languages = createListCollection({
    items: [
        { label: "🇩🇪", value: "de" },
        { label: "🇬🇧", value: "en" },
    ],
    });
    return (
        <Select.Root collection={languages} size="sm" width="20%" position={"fixed"} variant={"subtle"} top={"10px"} right={"10px"}>
            <Select.Control>
                <Select.Trigger>
                    <Select.ValueText placeholder= "🇩🇪 / 🇬🇧" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                    <Select.Indicator />
                </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
                <Select.Positioner>
                    <Select.Content>
                        {languages.items.map((language) => (
                            <Select.Item item={language} key={language.value} onClick={() => setLanguage(language.value === "de" || language.value === "en" ? language.value : "de")}>
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