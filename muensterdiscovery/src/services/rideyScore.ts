import { supabase } from "../SupabaseClient";

export type Mood = "happy" | "sad" | "neutral";

const strategies: Record<string, (durationMs: number) => number> = {};

const DEFAULT_STRATEGY = "timeDecay";

strategies[DEFAULT_STRATEGY] = (durationMs: number) => {
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = durationMs / msPerDay;
    const decayDays = 1;
    const raw = Math.max(0, (decayDays - days) / decayDays);
    return Math.round(raw * 100);
};

export function registerScoringStrategy(name: string, fn: (durationMs: number) => number) {
    strategies[name] = fn;
}

export async function getLastCompletedRouteDate(userId: string): Promise<Date | null> {
    const { data: routeData, error: routeError } = await supabase
        .from("user_routes")
        .select("completed_at")
        .eq("profile_id", userId)
        .order("completed_at", { ascending: false })
        .limit(1)
        .single();

    if (!routeError && routeData?.completed_at) {
        return new Date(routeData.completed_at);
    }

    const { data, error } = await supabase
        .from("user_POIs")
        .select("created_at")
        .eq("profile_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (error) throw error;
    if (data?.created_at) return new Date(data.created_at);

    return null;
}

export function scoreFromDuration(durationMs: number, strategyName = DEFAULT_STRATEGY): number {
    const fn = strategies[strategyName];
    if (!fn) throw new Error(`Scoring strategy ${strategyName} not registered`);
    return fn(durationMs);
}

export async function getCurrentScore(userId: string, strategyName = DEFAULT_STRATEGY): Promise<number> {
    const lastDate = await getLastCompletedRouteDate(userId);
    if (!lastDate) return 0;
    const durationMs = Date.now() - lastDate.getTime();
    return scoreFromDuration(durationMs, strategyName);
}

export async function getMood(userId: string, thresholds = { happy: 0, sad: 0 }): Promise<Mood> {
    const score = await getCurrentScore(userId);
    if (score >= thresholds.happy) return "happy";
    if (score <= thresholds.sad) return "sad";
    return "neutral";
}
