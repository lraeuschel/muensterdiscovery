import Header from "../components/Header";
import CompLangHeader from "../components/CompLangHeader";
import { currentLanguage, onCurrentLanguageChange } from "../components/languageSelector";
import type { LanguageType } from "../components/languageSelector";
import React from "react";
import { useEffect, useState } from "react";
import { addUserAchievement } from "../services/DatabaseConnection";
import { getCurrentUser } from "../services/DatabaseConnection";
import { getRoutes } from "../services/DatabaseConnection";

export default function Help() {
    const [currentLang, setCurrentLang] = useState<LanguageType>(currentLanguage);

    useEffect(() => {
        const unsubscribe = onCurrentLanguageChange((lang) => {
            setCurrentLang(lang);
        });
        return unsubscribe;
    }, []);
    const [userId, setUserId] = React.useState<string>("");
    const [routes, setRoutes] = React.useState<any[]>([]);

    useEffect(() => {
        const loadUser = async () => {
            const user = await getCurrentUser();
            if (user) {
                setUserId(user.id);
            }
        };
        loadUser();
    }, []);

    addUserAchievement(userId, 1);

    useEffect(() => {
        const fetchRoutes = async () => {
            const fetchedRoutes = await getRoutes();
            setRoutes(fetchedRoutes);
        };
        fetchRoutes();
    }, []);


    console.log("Current user in Help page:", userId);
    return (
        <div>
            <CompLangHeader />
            <h1>Help Page</h1>
        </div>
    );
}
