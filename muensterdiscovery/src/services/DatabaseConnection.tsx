import { supabase } from "../SupabaseClient";
import type { User, Achievement, POI, Event, Route, Voronoi, VisitedPOI } from "../types";

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

export async function getPOIs() {
    const { data, error } = await supabase
        .from("POIs")
        .select(`
            id, 
            name, 
            info, 
            lat, 
            lon, 
            image_path`
        );

    if (error) throw error;

    const pois = data?.map((item: any) => item.POIs) || [];
    console.log("Fetched POIs:", pois);
    return data as POI[];
}

export async function getVisitedPOIs(userId: string) {
    const { data, error } = await supabase
        .from("user_POIs")
        .select(`
            POIs (
                id,
                name,
                lat,
                lon
            )
        `)
        .eq("profile_id", userId);
    
    if (error) throw error;

    const { data: visitedData, error: visitedError } = await supabase
        .from("user_POIs")
        .select("visited")
        .eq("profile_id", userId);
    if (visitedError) throw visitedError;

    const pois = data?.map((item: any, index: number) => ({ ...item.POIs, visited: visitedData?.[index]?.visited })) || [];

    console.log("Fetched visited POIs:", pois);
    return pois as VisitedPOI[];
}

export async function getRoutes() {
    const { data, error } = await supabase
        .from("routes")
        .select("id, name, POIs, geoJSON, description, time_length, distance");

    if (error) throw error;

    return data as Route[];
}

export async function getRouteById(routeId: number) {
    const { data, error } = await supabase
        .from("routes")
        .select("id, name, POIs, geoJSON, description, time_length, distance")
        .eq("id", routeId)
        .single();
    if (error) throw error;

    return data as Route;
}

export async function getPOIsByRoute(routeId: number) {
    const route = await getRouteById(routeId);
    if (!route) return [];
    console.log("Fetched route ID:", routeId);
    console.log("Route POIs IDs:", route.POIs);
    const poiIds = route.POIs;

    const { data, error } = await supabase
        .from("POIs")
        .select("id, name, info, lat, lon, image_path")
        .in("id", poiIds);
    if (error) throw error;

    return data as POI[];
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

export async function addUserAchievement(
    profile_id: string,
    achievement_id: number,
) {
    const { data, error } = await supabase
        .from("user_achievements")
        .insert([{ profile_id, achievement_id}])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function addVisitedPOI(
    profile_id: string,
    POI_id: number,
) {
    const { data, error } = await supabase
        .from("user_POIs")
        .insert([{ profile_id, POI_id }])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function addRouteCompletion(
    profile_id: string,
    route_id: number,
) {
    const { data, error } = await supabase
        .from("user_routes")
        .insert([{ user_id: profile_id, route_id, explored_at: new Date().toISOString() }])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getVoronoiPolygons() {
    const { data, error } = await supabase
        .from("voronoi_polygons")
        .select("id, geoJSON");
    if (error) throw error;
    return data as Voronoi[];
}
