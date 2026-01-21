import { supabase } from "../SupabaseClient";
import default_profile_image from "../assets/Fxrg3QHWAAcQ7pw.jpg";
import type { User, Achievement, POI, Event, Route, Voronoi, VisitedPOI, LeaderboardEntry } from "../types";

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
    await updateUserPoints(profile_id, 10); // Beispiel: 10 Punkte pro POI
    return data;
}

export async function addRouteCompletion(
    profile_id: string,
    route_id: number,
) {
    const { data, error } = await supabase
        .from("user_routes")
        .insert([{ profile_id: profile_id, route_id, explored_at: new Date().toISOString() }])
        .select()
        .single();
    if (error) throw error;
    await updateUserPoints(profile_id, 50); // Beispiel: 50 Punkte pro Route
    return data;
}

export async function getVoronoiPolygons() {
    const { data, error } = await supabase
        .from("voronoi_polygons")
        .select("id, geoJSON");
    if (error) throw error;
    return data as Voronoi[];
}
export async function getNumberOfUser() {
    const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
    if (error) throw error;
    return count || 0;
}

export async function getAllDiscoveredPOIs() {
    const { count, error } = await supabase
        .from("user_POIs")
        .select("*", { count: "exact", head: true });
    if (error) throw error;
    return count || 0;
}

// Neue Funktion: Punkte aktualisieren
export async function updateUserPoints(userId: string, pointsToAdd: number) {
    const { data: currentData, error: fetchError } = await supabase
        .from("profiles")
        .select("monthly_points, alltime_points")
        .eq("id", userId)
        .single();

    if (fetchError) throw fetchError;

    const newMonthlyPoints = (currentData.monthly_points || 0) + pointsToAdd;
    const newAlltimePoints = (currentData.alltime_points || 0) + pointsToAdd;

    const { error: updateError } = await supabase
        .from("profiles")
        .update({
            monthly_points: newMonthlyPoints,
            alltime_points: newAlltimePoints
        })
        .eq("id", userId);

    if (updateError) throw updateError;
}

export async function getWalkedKilometers() {
    const { data, error } = await supabase
        .from("user_routes")
        .select(`
            routes (
                distance
            )
        `);
    if (error) throw error;
    return data ?? [];
}

export async function getRoutesCompletedByUser(userId: string) {
    const { data, error } = await supabase
        .from("user_routes")
        .select(`route_id, explored_at, routes(
            distance
        )`)
        .eq("profile_id", userId);
    if (error) throw error;
    return data ?? [];
}

// Neue Funktion: Leaderboard abrufen
export async function getLeaderboard(
    timeframe: 'month' | 'alltime',
    currentUserId?: string,
    limit: number = 100
): Promise<LeaderboardEntry[]> {
    const pointsColumn = timeframe === 'month' ? 'monthly_points' : 'alltime_points';
    
    // Leaderboard-Daten abrufen
    const { data, error } = await supabase
        .from("profiles")
        .select(`
            id,
            username,
            monthly_points,
            alltime_points
        `)
        .order(pointsColumn, { ascending: false })
        .limit(limit);

    if (error) throw error;

    // Für jeden User: POI-Count, Distanz und Profilbild berechnen
    const leaderboardPromises = data.map(async (profile, index) => {
        // Anzahl besuchter POIs
        const { count: poiCount } = await supabase
            .from("user_POIs")
            .select("*", { count: "exact", head: true })
            .eq("profile_id", profile.id);

        // Distanz aus abgeschlossenen Routen
        const { data: routeData } = await supabase
            .from("user_routes")
            .select(`routes(distance)`)
            .eq("profile_id", profile.id);

        const totalDistance = routeData?.reduce((sum, item) => {
            return sum + (item.routes?.[0].distance || 0);
        }, 0) || 0;

        const { data: profileImage } = supabase.storage
            .from('profile_images')
            .getPublicUrl(`${profile.id}/profile_image.jpg`);
            console.log("Fetched profile image URL:", profileImage);

        return {
            rank: index + 1,
            username: profile.username || "Unbekannt",
            points: profile[pointsColumn] || 0,
            distanceKm: totalDistance / 1000, // Meter zu km
            areasDiscovered: poiCount || 0,
            isCurrentUser: currentUserId ? profile.id === currentUserId : false,
            profileImageUrl: profileImage?.publicUrl || default_profile_image,
        } as LeaderboardEntry;
    });

    const leaderboard = await Promise.all(leaderboardPromises);
    
    console.log(`${timeframe} leaderboard:`, leaderboard);
    return leaderboard;
}
