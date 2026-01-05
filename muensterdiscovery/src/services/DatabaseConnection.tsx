import { supabase } from "../SupabaseClient";
import type { User, Achievement, POI, Event } from "../types";

export async function getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
}

export async function getCurrentUserProfile(userId: string) {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, username, email")
        .eq("id", userId)
        .single();
    if (error) throw error;

    console.log("Fetched user profile:", data);
    return data as User;
}

export async function getUserAchievements(userId: string) {
    const { data, error } = await supabase
        .from("user_achievements")
        .select(`
            achievements (
                id,
                achievement,
                description
            )
        `)
        .eq("profile_id", userId);

    if (error) throw error;
    const achievements = data?.map((item: any) => item.achievements) || [];

    console.log("Fetched achievements:", achievements);
    return achievements as Achievement[];
}


export async function getVisitedPOIs(userId: string) {
    const { data, error } = await supabase
        .from("user_POIs")
        .select(`
            POIs (
                id,
                name,
                description,
                location
            )
        `)
        .eq("profile_id", userId);

    if (error) throw error;

    const pois = data?.map((item: any) => item.POIs) || [];
    console.log("Fetched POIs:", pois);
    return pois as POI[];
}

// Events aus der Datenbank laden (aktuell + kommende)
// Falls die Tabelle nicht existiert, wird ein leeres Array zurückgegeben
export async function getUpcomingEvents(limit = 50) {
    try {
        const now = new Date().toISOString();
        
        const { data, error } = await supabase
            .from("events")
            .select("id, name, description, location, start_date, end_date, category")
            .gte("start_date", now) // Nur Events in der Zukunft
            .order("start_date", { ascending: true })
            .limit(limit);

        if (error) {
            // Tabelle existiert nicht oder anderer Fehler
            if (error.code === 'PGRST205') {
                console.info("Events-Tabelle existiert noch nicht in der Datenbank.");
            } else {
                console.error("Error fetching events:", error);
            }
            return [];
        }

        console.log("Fetched events:", data);
        return (data || []) as Event[];
    } catch (err) {
        console.error("Unexpected error loading events:", err);
        return [];
    }
}
