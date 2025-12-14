import { supabase } from "../SupabaseClient";

export function getUsers() {
    return supabase.from("users").select("*");
}

export function getProfileData() {
    return supabase.from("profiles").select("*");
}

export function getAchievements() {
    return supabase.from("achievements").select("*");
}

export function getUserAchievements() {
    return supabase.from("user_achievements").select("*");
}

export function getRoutes() {
    return supabase.from("routes").select("*");
}

export function getUserRoutes() {
    return supabase.from("user_routes").select("*");
}

export function getPOIs() {
    return supabase.from("POIs").select("*");
}

export function getUserPOIs() {
    return supabase.from("user_POIs").select("*");
}



