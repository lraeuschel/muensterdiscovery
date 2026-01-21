import { supabase } from "../SupabaseClient";
import default_profile_image from "../assets/Fxrg3QHWAAcQ7pw.jpg";
import type { User, Achievement, POI, Event, Route, Voronoi, VisitedPOI, LeaderboardEntry, UserRouteWithDistance } from "../types";

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

    // console.log("Fetched user profile:", data);
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

    checkAndUnlockPoiAchievements(profile_id).catch((e) => console.error("Fehler beim Prüfen der Achievements:", e));
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
    
    checkAndUnlockRouteAchievements(profile_id).catch(err => console.error(err));
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
  const pointsColumn =
    timeframe === 'month' ? 'monthly_points' : 'alltime_points';

  // Basis-Leaderboard laden
  const { data: profiles, error } = await supabase
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
  if (!profiles) return [];

  const leaderboardPromises = profiles.map(async (profile, index) => {
    // POI-Anzahl
    const { count: poiCount } = await supabase
      .from("user_POIs")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", profile.id);

    // Routen + Distanz (many-to-one → Objekt!)
    const { data: routeData } = await supabase
      .from("user_routes")
      .select("routes(distance)")
      .eq("profile_id", profile.id)
      .returns<UserRouteWithDistance[]>();

    const totalDistance =
      routeData?.reduce((sum, item) => {
        return sum + (item.routes?.distance ?? 0);
      }, 0) ?? 0;

    // Profilbild
    const { data: profileImage } = supabase.storage
      .from("profile_images")
      .getPublicUrl(`${profile.id}/profile_image.jpg`);

    return {
      rank: index + 1,
      username: profile.username || "Unbekannt",
      points: profile[pointsColumn] ?? 0,
      distanceKm: totalDistance / 1000,
      areasDiscovered: poiCount ?? 0,
      isCurrentUser: currentUserId ? profile.id === currentUserId : false,
      profileImageUrl:
        profileImage?.publicUrl || default_profile_image,
    } as LeaderboardEntry;
  });

  return await Promise.all(leaderboardPromises);
}

// Alle Achievements abrufen
export async function getAllAchievementDefinitions() {
    const { data, error } = await supabase
        .from("achievements")
        .select("id, achievement, description");
    if (error) throw error;
    return data as Achievement[];
}

export async function checkAndUnlockPoiAchievements(userId: string) {
    // 1. Daten abrufen: Welche POI_ids hat der User besucht?
    // WICHTIG: Wir entfernen "head: true", weil wir jetzt die IDs brauchen!
    const { data: visitedData, error: visitedError } = await supabase
        .from("user_POIs")
        .select("POI_id") 
        .eq("profile_id", userId);
    
    if (visitedError) throw visitedError;

    // Erstelle ein Set der IDs für schnellen Zugriff (z.B. visitedIds.has(94))
    const visitedIds = new Set(visitedData?.map((v: any) => v.POI_id));
    const visitedCount = visitedIds.size;

    // Gesamtanzahl POIs holen (für das "Alle POIs" Achievement)
    const { count: totalPoiCount, error: totalError } = await supabase
        .from("POIs")
        .select("*", { count: "exact", head: true });

    if (totalError) throw totalError;

    // 2. Bereits erhaltene Achievements des Users laden
    const { data: userAchievementsData, error: uaError } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("profile_id", userId);

    if (uaError) throw uaError;
    const ownedAchievementIds = new Set(userAchievementsData?.map((ua: any) => ua.achievement_id));

    // 3. Alle Achievement-Definitionen laden
    const allDefinitions = await getAllAchievementDefinitions();

    const newAchievements = [];

    // 4. Logik-Definition: Welches Limit gehört zu welchem Achievement-Namen?
    const rules = [
        { threshold: 5, achievementName: "5 POIs discovered" },
        { threshold: 10, achievementName: "10 POIs discovered" },
        { threshold: 25, achievementName: "25 POIs discovered" },
        { threshold: 60, achievementName: "60 POIs discovered" },
        { threshold: 100, achievementName: "100 POIs discovered" },
        // Spezialfall: Alle POIs (wenn visited >= total und total > 0)
        { threshold: totalPoiCount || 9999, achievementName: "All POIs discovered" } 
    ];

    for (const rule of rules) {
        if (visitedCount >= rule.threshold) {
            const definition = allDefinitions.find(d => d.achievement === rule.achievementName);
            if (definition && !ownedAchievementIds.has(definition.id)) {
                newAchievements.push({
                    profile_id: userId,
                    achievement_id: definition.id,
                    time_achieved: new Date().toISOString()
                });
            }
        }
    }

    // --- TEIL B: Spezifische POI Achievements (Geo 1 / True GI) ---
    
    // Prüfen auf Geo 1 (ID: 94) für Achievement "True GI"
    if (visitedIds.has(94)) {
        const trueGiDef = allDefinitions.find(d => d.achievement === "True GI");
        
        if (trueGiDef) {
            if (!ownedAchievementIds.has(trueGiDef.id)) {
                newAchievements.push({
                    profile_id: userId,
                    achievement_id: trueGiDef.id,
                    time_achieved: new Date().toISOString()
                });
            }
        } else {
            console.warn("Achievement 'True GI' nicht in der DB gefunden.");
        }
    }

    // 4. Speichern, falls es neue Achievements gibt
    if (newAchievements.length > 0) {
        const { error: insertError } = await supabase
            .from("user_achievements")
            .insert(newAchievements);
        
        if (insertError) throw insertError;
        console.log("Neue POI-Achievements freigeschaltet:", newAchievements.length);
    }
}

export async function checkAndUnlockRouteAchievements(userId: string) {
    // 1. Definition: Welcher Routen-NAME (in Tabelle routes) gehört zu welchem Achievement-NAME
    const routeMapping = [
        { routeName: "muenster_history", achievementName: "Route muenster_history completed" },
        { routeName: "muenster_art", achievementName: "Route muenster_art completed" },
        { routeName: "muenster_hiddengems", achievementName: "Route muenster_hiddengems completed" },
        { routeName: "muenster_media", achievementName: "Route muenster_media completed" },
        { routeName: "muenster_kreuzviertel", achievementName: "Route muenster_kreuzviertel completed" },
        { routeName: "muenster_architecture", achievementName: "Route muenster_architecture completed" },
        { routeName: "muenster_fair", achievementName: "Route muenster_fair completed" }
    ];

    // 2. Daten laden
    // a) Alle Routen laden, um Namen zu IDs aufzulösen
    const { data: allRoutes, error: routesError } = await supabase
        .from("routes")
        .select("id, name");
    if (routesError) throw routesError;

    // b) Vom User absolvierte Routen-IDs laden
    const { data: userRouteData, error: userRouteError } = await supabase
        .from("user_routes")
        .select("route_id")
        .eq("profile_id", userId);
    if (userRouteError) throw userRouteError;
    
    // Set mit IDs der erledigten Routen erstellen für schnellen Zugriff
    const completedRouteIds = new Set(userRouteData?.map((ur: any) => ur.route_id));

    // c) Bereits erhaltene Achievements laden
    const { data: userAchievements, error: uaError } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("profile_id", userId);
    if (uaError) throw uaError;
    const ownedAchievementIds = new Set(userAchievements?.map((ua: any) => ua.achievement_id));

    // d) Achievement Definitionen laden (für die IDs)
    const allAchievementDefs = await getAllAchievementDefinitions();

    const newAchievements = [];

    // 3. Prüfung durchführen
    for (const mapping of routeMapping) {
        // Finde die Route-ID in der DB passend zum Namen (z.B. 'muenster_history')
        const routeObj = allRoutes.find((r: any) => r.name === mapping.routeName);
        
        if (!routeObj) {
            console.warn(`Route '${mapping.routeName}' nicht in Tabelle 'routes' gefunden.`);
            continue;
        }

        // Hat der User diese Route absolviert?
        if (completedRouteIds.has(routeObj.id)) {
            // Finde das zugehörige Achievement
            const achDef = allAchievementDefs.find(a => a.achievement === mapping.achievementName);
            
            if (achDef) {
                // Wenn User das Achievement noch nicht hat -> hinzufügen
                if (!ownedAchievementIds.has(achDef.id)) {
                    newAchievements.push({
                        profile_id: userId,
                        achievement_id: achDef.id,
                        time_achieved: new Date().toISOString()
                    });
                }
            } else {
                console.warn(`Achievement '${mapping.achievementName}' nicht in Tabelle 'achievements' gefunden.`);
            }
        }
    }

    // 4. Speichern
    if (newAchievements.length > 0) {
        const { error: insertError } = await supabase
            .from("user_achievements")
            .insert(newAchievements);
        
        if (insertError) throw insertError;
        console.log("Neue Routen-Achievements freigeschaltet:", newAchievements.length);
    }
}