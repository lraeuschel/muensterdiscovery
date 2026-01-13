import Header from "../components/Header";
import React from "react";
import { useEffect } from "react";
import { addUserAchievement } from "../services/DatabaseConnection";
import { getCurrentUser } from "../services/DatabaseConnection";
import { getRoutes } from "../services/DatabaseConnection";

export default function Help() {
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
            <Header />
            <h1>Help Page</h1>
        </div>
    );
}
