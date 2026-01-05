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
    description: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [lon, lat]
    };
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