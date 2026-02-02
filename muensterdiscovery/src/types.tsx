export type User = {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
}

export type Achievement = {
    id: number;
    achievement: string;
    description: string;
}

export type POI = {
    id: number;
    name: string;
    info: string;
    lat: number;
    lon: number;
    image_path: string;
}

export type Route = {
    id: number;
    name: string;
    POIs: number[]; // Array of POI IDs
    geoJSON: any; // GeoJSON object representing the route
    description: string;
    time_length: number; // in minutes
    distance: number; // in meters
}

export type Event = {
    id: number;
    name: string;
    description: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [lon, lat]
    };
    start_date: string; // ISO 8601 datetime
    end_date?: string; // Optional end date
    category?: string; // z.B. "Konzert", "Festival", "Theater"
}

export type Voronoi = {
    id: number;
    geoJSON: any; // GeoJSON object representing the Voronoi polygon
}

export type VisitedPOI = {
    id: number;
    name: string;
    lat: number;
    lon: number;
    visited: string; // ISO 8601 datetime
}
export type LeaderboardEntry = {
    rank: number;
    username: string;
    points: number;
    distanceKm: number;
    areasDiscovered: number;
    isCurrentUser?: boolean;
    profileImageUrl?: string;
};

export type UserRouteWithDistance = {
  routes: {
    distance: number;
  } | null;
};

export type WalkedKmRow = {
  routes: {
    distance: number;
  }[];
};