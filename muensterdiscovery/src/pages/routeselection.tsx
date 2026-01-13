import { useState, useEffect } from "react";
import CompLangHeader from "../components/CompLangHeader";
import { currentLanguage, onCurrentLanguageChange } from "../components/languageSelector";
import type { LanguageType } from "../components/languageSelector";

export default function RouteSelection() {
    const [currentLang, setCurrentLang] = useState<LanguageType>(currentLanguage);

    useEffect(() => {
        const unsubscribe = onCurrentLanguageChange((lang) => {
            setCurrentLang(lang);
        });
        return unsubscribe;
    }, []);
    return (
        <div>
            <CompLangHeader />
            <h1>Select Your Route</h1>
        </div>
    )
}