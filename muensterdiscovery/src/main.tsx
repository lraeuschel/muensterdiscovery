import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import React from "react";
import { createRoot } from "react-dom/client";
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
import { IntlProvider } from "react-intl";
import deMessages from "./i18n/de.json";
import enMessages from "./i18n/en.json";

const messages = {
    de: deMessages,
    en: enMessages
}

const language = navigator.language.split(/[-_]/)[0];

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <IntlProvider locale={language} messages={messages[language]}>
            <ChakraProvider value={defaultSystem}>
                <BrowserRouter
                    basename="/muensterdiscovery"
                >
                    <Routes>
                        <Route path="/" element={<Welcome />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/registration" element={<Registration />} />
                        <Route path="/openworld" element={<OpenWorld />} />
                        <Route path="/routeselection" element={<RouteSelection />} />
                        <Route path="/routedisplay" element={<RouteDisplay />} />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                        <Route path="/imprint" element={<Imprint />} />
                        <Route path="/help" element={<Help />} />
                    </Routes>
                </BrowserRouter>
            </ChakraProvider>
        </IntlProvider>
    </React.StrictMode>
);
