import { useState } from "react";
import { IntlProvider } from "react-intl";
import deMessages from "./i18n/de.json";
import enMessages from "./i18n/en.json";
import esMessages from "./i18n/es.json";
import frMessages from "./i18n/fr.json";
import itMessages from "./i18n/it.json";
import nlMessages from "./i18n/nl.json";
import plMessages from "./i18n/pl.json";
import ptMessages from "./i18n/pt.json";
import tkMessages from "./i18n/tk.json";
import ruMessages from "./i18n/ru.json";
import jpMessages from "./i18n/jp.json";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Welcome from "./pages/welcome";
import Login from "./pages/login";
import Registration from "./pages/registration";
import OpenWorld from "./pages/openworld";
import RouteSelection from "./pages/routeselection";
import RouteDisplay from "./pages/routedisplay";
import Leaderboard from "./pages/leaderboard";
import Imprint from "./pages/imprint";
import Help from "./pages/help";
import Profile from "./pages/profile";

const messages = {
    de: deMessages,
    en: enMessages,
    es: esMessages,
    fr: frMessages,
    it: itMessages,
    nl: nlMessages,
    pl: plMessages,
    pt: ptMessages,
    tk: tkMessages,
    ru: ruMessages,
    jp: jpMessages,
};

export default function AppWrapper() {
    const browserLang = navigator.language.split(/[-_]/)[0];
    const [language, setLanguage] = useState<"de" | "en" | "es" | "fr" | "it" | "nl" | "pl" | "pt" | "tk" | "ru" | "jp">(
        browserLang === "en" ? "en" : "de"
    );

    return (
        <IntlProvider locale={language} messages={messages[language as keyof typeof messages]}>
            <ChakraProvider value={defaultSystem}>
                <BrowserRouter basename="/muensterdiscovery">
                    <Routes>
                        <Route path="/" element={<Welcome setLanguage={setLanguage} />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/registration" element={<Registration />} />
                        <Route path="/openworld" element={<OpenWorld />} />
                        <Route path="/routeselection" element={<RouteSelection />} />
                        <Route path="/routedisplay" element={<RouteDisplay setLanguage={setLanguage} />} />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                        <Route path="/imprint" element={<Imprint />} />
                        <Route path="/help" element={<Help />} />
                        <Route path="/profile" element={<Profile />} />
                    </Routes>
                </BrowserRouter>
            </ChakraProvider>
        </IntlProvider>
    );
}
